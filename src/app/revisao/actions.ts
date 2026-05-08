'use server';

/**
 * Server Actions da Revisão (SRS / SM-2).
 *
 * Toda persistência é por user (auth.uid()), via RLS na tabela
 * `flashcard_reviews`. Cards "novos" (sem linha) são selecionados
 * dinamicamente da view `flashcards_available` (anuladas filtradas).
 */
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nextReview } from '@/lib/srs/sm2';
import type {
  AnswerLetter,
  FlashcardCardData,
  FlashcardCounts,
  Quality,
  ReviewState,
} from '@/lib/srs/types';

const qualitySchema = z.union([
  z.literal(0),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const submitSchema = z.object({
  questionId: z.string().min(1).max(120),
  quality: qualitySchema,
});

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * Retorna a fila de cards a revisar agora:
 *  1. Cards já em flashcard_reviews com due_at <= now (atrasados primeiro).
 *  2. Cards novos (sem review) preenchem o restante até `limit`.
 */
export async function getDueQueue(limit = DEFAULT_LIMIT): Promise<FlashcardCardData[]> {
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const nowIso = new Date().toISOString();

  // 1. Cards devidos
  const { data: dueRows } = await supabase
    .from('flashcard_reviews')
    .select('question_id, due_at')
    .eq('user_id', user.id)
    .lte('due_at', nowIso)
    .order('due_at', { ascending: true })
    .limit(safeLimit);

  const dueIds = (dueRows ?? []).map((r) => r.question_id);
  const dueSet = new Set(dueIds);

  // 2. Slots restantes → cards novos (sem linha em flashcard_reviews)
  const remaining = Math.max(0, safeLimit - dueIds.length);
  let newIds: string[] = [];
  if (remaining > 0) {
    const { data: reviewedRows } = await supabase
      .from('flashcard_reviews')
      .select('question_id')
      .eq('user_id', user.id);
    const reviewedSet = new Set((reviewedRows ?? []).map((r) => r.question_id));

    const { data: availableRows } = await supabase
      .from('flashcards_available')
      .select('question_id')
      .limit(2000);

    const candidates = (availableRows ?? [])
      .map((r) => r.question_id)
      .filter((id) => !reviewedSet.has(id));

    // Shuffle determinístico do dia (mesma ordem dentro do mesmo dia)
    const seed = nowIso.slice(0, 10);
    candidates.sort((a, b) => simpleHash(a + seed).localeCompare(simpleHash(b + seed)));
    newIds = candidates.slice(0, remaining);
  }

  const ids = [...dueIds, ...newIds];
  if (ids.length === 0) return [];

  // 3. Carrega dados completos da view
  const { data: cards } = await supabase
    .from('flashcards_available')
    .select(
      'question_id, discipline, subtopic, description, image_url, correct_answer, year',
    )
    .in('question_id', ids);

  if (!cards) return [];

  const byId = new Map(cards.map((c) => [c.question_id, c]));

  return ids
    .map((id) => {
      const c = byId.get(id);
      if (!c) return null;
      return {
        questionId: c.question_id,
        discipline: c.discipline ?? '',
        subtopic: c.subtopic ?? '',
        description: c.description ?? null,
        imageUrl: c.image_url ?? '',
        correctAnswer: ((c.correct_answer ?? 'A') as AnswerLetter),
        year: c.year ?? 0,
        isNew: !dueSet.has(id),
      } satisfies FlashcardCardData;
    })
    .filter((c): c is FlashcardCardData => c !== null);
}

/**
 * Aplica o SM-2 e upsert no estado da revisão.
 */
export async function submitReview(input: {
  questionId: string;
  quality: Quality;
}): Promise<{ ok: boolean; nextDueAt?: string; error?: string }> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { data: existing } = await supabase
    .from('flashcard_reviews')
    .select('ease_factor, interval_days, repetitions, due_at, total_reviews')
    .eq('user_id', user.id)
    .eq('question_id', parsed.data.questionId)
    .maybeSingle();

  const prev: ReviewState | null = existing
    ? {
        ease_factor: Number(existing.ease_factor),
        interval_days: existing.interval_days,
        repetitions: existing.repetitions,
        due_at: new Date(existing.due_at),
      }
    : null;

  const next = nextReview(prev, parsed.data.quality);
  const totalReviews = (existing?.total_reviews ?? 0) + 1;

  const { error } = await supabase
    .from('flashcard_reviews')
    .upsert(
      {
        user_id: user.id,
        question_id: parsed.data.questionId,
        ease_factor: next.ease_factor,
        interval_days: next.interval_days,
        repetitions: next.repetitions,
        due_at: next.due_at.toISOString(),
        last_quality: parsed.data.quality,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,question_id' },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true, nextDueAt: next.due_at.toISOString() };
}

/**
 * Conta:
 *  - overdue: due_at < agora
 *  - dueToday: agora <= due_at < amanhã
 *  - newAvailable: total questões - já revisadas
 *  - totalReviewed: linhas em flashcard_reviews
 */
export async function getFlashcardCounts(): Promise<FlashcardCounts> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { dueToday: 0, overdue: 0, newAvailable: 0, totalReviewed: 0 };

  const now = new Date();
  const nowIso = now.toISOString();
  const tomorrow = new Date(now.getTime() + 24 * 3600_000).toISOString();

  const [
    overdueRes,
    dueTodayRes,
    totalReviewedRes,
    totalAvailableRes,
  ] = await Promise.all([
    supabase
      .from('flashcard_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lt('due_at', nowIso),
    supabase
      .from('flashcard_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('due_at', nowIso)
      .lt('due_at', tomorrow),
    supabase
      .from('flashcard_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase.from('flashcards_available').select('*', { count: 'exact', head: true }),
  ]);

  const totalReviewed = totalReviewedRes.count ?? 0;
  const totalAvailable = totalAvailableRes.count ?? 0;

  return {
    dueToday: dueTodayRes.count ?? 0,
    overdue: overdueRes.count ?? 0,
    newAvailable: Math.max(0, totalAvailable - totalReviewed),
    totalReviewed,
  };
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
