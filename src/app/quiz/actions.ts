'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { AnswerLetter, Json } from '@/lib/supabase/types';
import {
  checkQuestionsCap,
  incrementUsageCounter,
} from '@/lib/billing/caps';

const EXAM = 'unifor-medicina';
const MAX_QUIZ_QUESTIONS = 60;

const disciplineSchema = z.enum([
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
]);

const statusSchema = z.enum(['todas', 'correct', 'wrong', 'toreview']);

const filtersSchema = z.object({
  discipline: disciplineSchema.nullable().optional(),
  subtopic: z.string().min(1).nullable().optional(),
  year: z.number().int().min(1900).max(3000).nullable().optional(),
  status: statusSchema.optional(),
  hide_annulled: z.boolean().optional(),
});

export type QuizFilters = z.infer<typeof filtersSchema>;

interface NormalizedFilters {
  discipline: string | null;
  subtopic: string | null;
  year: number | null;
  status: 'todas' | 'correct' | 'wrong' | 'toreview';
  hide_annulled: boolean;
}

function normalizeFilters(input: QuizFilters): NormalizedFilters {
  return {
    discipline: input.discipline ?? null,
    subtopic: input.subtopic ?? null,
    year: input.year ?? null,
    status: input.status ?? 'todas',
    hide_annulled: input.hide_annulled ?? true,
  };
}

async function loadCandidateQuestionIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  f: NormalizedFilters,
): Promise<string[]> {
  let query = supabase
    .from('questions')
    .select('id')
    .eq('exam', EXAM);

  if (f.discipline) query = query.eq('discipline', f.discipline);
  if (f.subtopic) query = query.eq('subtopic', f.subtopic);
  if (f.year !== null) query = query.eq('year', f.year);
  if (f.hide_annulled) query = query.eq('annulled', false);

  const { data: questionRows, error } = await query;
  if (error || !questionRows) return [];
  let ids = questionRows.map((q) => q.id);
  if (ids.length === 0) return [];

  if (f.status !== 'todas') {
    const { data: statusRows } = await supabase
      .from('user_question_status')
      .select('question_id, status')
      .eq('user_id', userId)
      .eq('status', f.status)
      .in('question_id', ids);
    const allowed = new Set((statusRows ?? []).map((r) => r.question_id));
    ids = ids.filter((id) => allowed.has(id));
  }

  return ids;
}

export async function getSubtopics(discipline: string | null): Promise<string[]> {
  const supabase = await createClient();
  let query = supabase
    .from('questions')
    .select('subtopic')
    .eq('exam', EXAM);
  if (discipline) {
    const parsed = disciplineSchema.safeParse(discipline);
    if (!parsed.success) return [];
    query = query.eq('discipline', parsed.data);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data) {
    if (row.subtopic) set.add(row.subtopic);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export async function getYears(): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .select('year')
    .eq('exam', EXAM);
  if (error || !data) return [];
  const set = new Set<number>();
  for (const row of data) {
    if (typeof row.year === 'number') set.add(row.year);
  }
  return [...set].sort((a, b) => b - a);
}

export interface DisciplineFrequency {
  discipline: string;
  count: number;
}

export async function getDisciplineFrequency(): Promise<DisciplineFrequency[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .select('discipline, annulled')
    .eq('exam', EXAM);
  if (error || !data) return [];
  const counts = new Map<string, number>();
  for (const row of data) {
    if (row.annulled) continue;
    const d = row.discipline as string | null;
    if (!d) continue;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([discipline, count]) => ({ discipline, count }))
    .sort((a, b) => b.count - a.count);
}

export async function countQuestions(input: QuizFilters): Promise<number> {
  const parsed = filtersSchema.safeParse(input);
  if (!parsed.success) return 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const f = normalizeFilters(parsed.data);
  const ids = await loadCandidateQuestionIds(supabase, user.id, f);
  return ids.length;
}

const startSchema = z.object({
  filters: filtersSchema,
  mode: z.enum(['sequencial', 'aleatorio']),
});

export type StartQuizInput = z.infer<typeof startSchema>;
export type StartQuizResult = { ok: true; sessionId: string } | { ok: false; error: string };

export async function startQuizSession(input: StartQuizInput): Promise<StartQuizResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Filtros inválidos.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  const f = normalizeFilters(parsed.data.filters);
  const mode = parsed.data.mode;

  // Carrega ids elegíveis com metadados para ordenar quando 'sequencial'.
  let metaQuery = supabase
    .from('questions')
    .select('id, year, semester, question_num, discipline, subtopic, annulled')
    .eq('exam', EXAM);
  if (f.discipline) metaQuery = metaQuery.eq('discipline', f.discipline);
  if (f.subtopic) metaQuery = metaQuery.eq('subtopic', f.subtopic);
  if (f.year !== null) metaQuery = metaQuery.eq('year', f.year);
  if (f.hide_annulled) metaQuery = metaQuery.eq('annulled', false);

  const { data: rows, error: qErr } = await metaQuery;
  if (qErr || !rows) {
    return { ok: false, error: 'Falha ao carregar questões.' };
  }

  let pool = rows;
  if (f.status !== 'todas') {
    const { data: statusRows } = await supabase
      .from('user_question_status')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('status', f.status)
      .in('question_id', rows.map((r) => r.id));
    const allowed = new Set((statusRows ?? []).map((r) => r.question_id));
    pool = rows.filter((r) => allowed.has(r.id));
  }

  if (pool.length === 0) {
    return { ok: false, error: 'Nenhuma questão corresponde aos filtros.' };
  }

  // Ordenação
  if (mode === 'sequencial') {
    pool.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.question_num - b.question_num;
    });
  } else {
    // Fisher-Yates
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = pool[i];
      const b = pool[j];
      if (a && b) {
        pool[i] = b;
        pool[j] = a;
      }
    }
  }

  const limited = pool.slice(0, MAX_QUIZ_QUESTIONS);
  const questionIds = limited.map((r) => r.id);

  const filtersJson: Json = {
    discipline: f.discipline,
    subtopic: f.subtopic,
    year: f.year,
    status: f.status,
    hide_annulled: f.hide_annulled,
    mode,
    question_ids: questionIds,
  };

  const { data: created, error: insertErr } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      type: 'quiz',
      filters: filtersJson,
    })
    .select('id')
    .single();
  if (insertErr || !created) {
    return { ok: false, error: 'Falha ao criar sessão.' };
  }

  return { ok: true, sessionId: created.id };
}

export async function startQuizSessionAndRedirect(input: StartQuizInput): Promise<void> {
  const res = await startQuizSession(input);
  if (!res.ok) {
    throw new Error(res.error);
  }
  redirect(`/quiz/sessao/${res.sessionId}`);
}

export type QuizCapResult =
  | { allowed: true; used: number; limit: number; plan: 'free' | 'pro' | 'admin' }
  | { allowed: false; used: number; limit: number; plan: 'free' | 'pro' | 'admin' };

export async function checkQuestionsCapAction(
  options: { previewFreeMode?: boolean } = {},
): Promise<QuizCapResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, used: 0, limit: 0, plan: 'free' };
  }
  const cap = await checkQuestionsCap(supabase, user.id, options);
  return {
    allowed: cap.allowed,
    used: cap.used,
    limit: Number.isFinite(cap.limit) ? cap.limit : 0,
    plan: cap.plan,
  };
}

const submitAttemptSchema = z.object({
  session_id: z.string().uuid(),
  question_id: z.string().min(1),
  answer: z.enum(['A', 'B', 'C', 'D', 'E']),
  time_spent_sec: z.number().int().nonnegative().max(60 * 60),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
export type SubmitAttemptResult =
  | { ok: true; is_correct: boolean; correct_answer: AnswerLetter | null; annulled: boolean }
  | { ok: false; error: string };

export async function submitAttempt(input: SubmitAttemptInput): Promise<SubmitAttemptResult> {
  const parsed = submitAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Resposta inválida.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  const { session_id, question_id, answer, time_spent_sec } = parsed.data;

  const { data: session, error: sessionErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, ended_at')
    .eq('id', session_id)
    .single();
  if (sessionErr || !session) {
    return { ok: false, error: 'Sessão não encontrada.' };
  }
  if (session.user_id !== user.id || session.type !== 'quiz') {
    return { ok: false, error: 'Sessão inválida.' };
  }
  if (session.ended_at) {
    return { ok: false, error: 'Sessão já encerrada.' };
  }

  const { data: question, error: qErr } = await supabase
    .from('questions')
    .select('id, correct_answer, annulled')
    .eq('id', question_id)
    .single();
  if (qErr || !question) {
    return { ok: false, error: 'Questão não encontrada.' };
  }

  const annulled = question.annulled === true;
  const isCorrect = !annulled && question.correct_answer === answer;

  const { error: insertErr } = await supabase.from('attempts').insert({
    user_id: user.id,
    question_id,
    answer,
    is_correct: isCorrect,
    time_spent_sec,
    context: 'quiz',
    session_id,
  });
  if (insertErr) {
    return { ok: false, error: 'Falha ao salvar resposta.' };
  }

  // Incrementa contador de uso (free tier — pro skip via helper).
  await incrementUsageCounter(supabase, user.id, 'questions_used_count');

  // Atualiza status pessoal (correct/wrong) — não sobrescreve 'toreview' implicitamente
  if (!annulled) {
    const newStatus = isCorrect ? 'correct' : 'wrong';
    const { data: existing } = await supabase
      .from('user_question_status')
      .select('status')
      .eq('user_id', user.id)
      .eq('question_id', question_id)
      .maybeSingle();
    if (!existing || existing.status !== 'toreview') {
      await supabase
        .from('user_question_status')
        .upsert(
          {
            user_id: user.id,
            question_id,
            status: newStatus,
          },
          { onConflict: 'user_id,question_id' },
        );
    }
  }

  return {
    ok: true,
    is_correct: isCorrect,
    correct_answer: question.correct_answer,
    annulled,
  };
}

const toggleReviewSchema = z.object({
  question_id: z.string().min(1),
  toreview: z.boolean(),
});

export type ToggleReviewResult = { ok: true; toreview: boolean } | { ok: false; error: string };

export async function toggleReviewStatus(input: {
  question_id: string;
  toreview: boolean;
}): Promise<ToggleReviewResult> {
  const parsed = toggleReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Entrada inválida.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sessão expirada.' };

  if (parsed.data.toreview) {
    const { error } = await supabase
      .from('user_question_status')
      .upsert(
        {
          user_id: user.id,
          question_id: parsed.data.question_id,
          status: 'toreview',
        },
        { onConflict: 'user_id,question_id' },
      );
    if (error) return { ok: false, error: 'Falha ao marcar para revisar.' };
    return { ok: true, toreview: true };
  }

  // Desmarcar: remove a linha (volta para neutro)
  const { error } = await supabase
    .from('user_question_status')
    .delete()
    .eq('user_id', user.id)
    .eq('question_id', parsed.data.question_id);
  if (error) return { ok: false, error: 'Falha ao desmarcar.' };
  return { ok: true, toreview: false };
}

const finishSchema = z.object({ sessionId: z.string().uuid() });

export type FinishQuizResult = { ok: true } | { ok: false; error: string };

export async function finishQuizSession(sessionId: string): Promise<FinishQuizResult> {
  const parsed = finishSchema.safeParse({ sessionId });
  if (!parsed.success) {
    return { ok: false, error: 'Sessão inválida.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sessão expirada.' };

  const { data: session, error: sessionErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, started_at, ended_at, filters')
    .eq('id', sessionId)
    .single();
  if (sessionErr || !session) return { ok: false, error: 'Sessão não encontrada.' };
  if (session.user_id !== user.id || session.type !== 'quiz') {
    return { ok: false, error: 'Sessão inválida.' };
  }
  if (session.ended_at) return { ok: true };

  const { data: attempts } = await supabase
    .from('attempts')
    .select('is_correct, time_spent_sec')
    .eq('session_id', sessionId)
    .eq('user_id', user.id);

  const totalAnswered = attempts?.length ?? 0;
  const correctCount = (attempts ?? []).filter((a) => a.is_correct === true).length;
  const durationSec = (attempts ?? []).reduce((sum, a) => sum + (a.time_spent_sec ?? 0), 0);

  const filtersObj = (session.filters as { question_ids?: unknown } | null) ?? null;
  const totalQuestions =
    filtersObj && Array.isArray(filtersObj.question_ids)
      ? filtersObj.question_ids.length
      : totalAnswered;

  const { error: updateErr } = await supabase
    .from('study_sessions')
    .update({
      ended_at: new Date().toISOString(),
      total_questions: totalQuestions,
      correct_count: correctCount,
      duration_sec: durationSec,
    })
    .eq('id', sessionId);
  if (updateErr) return { ok: false, error: 'Falha ao encerrar sessão.' };

  return { ok: true };
}
