'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { AnswerLetter, Discipline, Json } from '@/lib/supabase/types';
import { SIMULADO_DISCIPLINE_OPTIONS } from './config';
import {
  checkSimuladoCap,
  incrementUsageCounter,
} from '@/lib/billing/caps';
import { classifyLanguage, classifySubject } from '@/lib/stats/sub-filters';

const startSchema = z.object({
  total: z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(90)]),
  time_limit_min: z.union([
    z.literal(45),
    z.literal(90),
    z.literal(180),
    z.literal(240),
  ]),
  discipline: z.enum(SIMULADO_DISCIPLINE_OPTIONS),
});

export type StartSimuladoInput = z.infer<typeof startSchema>;

// Proporção quando "todas". Soma = 1.0 (mat 0.375, hum 0.25, bio/fis/qui 0.125 cada).
const PROPORTIONS: Array<{ discipline: Discipline; weight: number }> = [
  { discipline: 'matematica', weight: 0.375 },
  { discipline: 'humanas', weight: 0.25 },
  { discipline: 'biologia', weight: 0.125 },
  { discipline: 'fisica', weight: 0.125 },
  { discipline: 'quimica', weight: 0.125 },
];

function distributeProportional(total: number): Map<Discipline, number> {
  // Aloca pisos pela proporção e distribui o restante para as maiores frações.
  const items = PROPORTIONS.map((p) => {
    const exact = total * p.weight;
    return { discipline: p.discipline, exact, floor: Math.floor(exact) };
  });
  let allocated = items.reduce((s, it) => s + it.floor, 0);
  let remaining = total - allocated;
  // Ordena por maior fração — quem mais "merece" um arredondamento pra cima.
  const byFraction = [...items].sort(
    (a, b) => b.exact - b.floor - (a.exact - a.floor),
  );
  const result = new Map<Discipline, number>();
  for (const it of items) result.set(it.discipline, it.floor);
  let idx = 0;
  while (remaining > 0 && idx < byFraction.length) {
    const item = byFraction[idx];
    if (item) {
      result.set(item.discipline, (result.get(item.discipline) ?? 0) + 1);
      remaining -= 1;
    }
    idx += 1;
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

type SamplePool = { id: string; discipline: string };

async function pickRandomFromDiscipline(
  pool: SamplePool[],
  discipline: Discipline,
  n: number,
): Promise<string[]> {
  const subset = pool.filter((q) => q.discipline === discipline);
  return shuffle(subset).slice(0, n).map((q) => q.id);
}

export async function startSimulado(input: StartSimuladoInput): Promise<void> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Configuração inválida do simulado.');
  }
  const { total, time_limit_min, discipline } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Cap check (free tier = 1 simulado lifetime).
  const cap = await checkSimuladoCap(supabase, user.id);
  if (!cap.allowed) {
    throw new Error('Limite de simulados grátis atingido. Assine o Pro.');
  }

  // Carrega pool de questões não anuladas (apenas id + discipline).
  let poolQuery = supabase
    .from('questions')
    .select('id, discipline')
    .or('annulled.is.null,annulled.eq.false');
  if (discipline !== 'todas') {
    poolQuery = poolQuery.eq('discipline', discipline);
  }
  const { data: pool, error: poolErr } = await poolQuery;
  if (poolErr || !pool || pool.length === 0) {
    throw new Error('Não foi possível montar o simulado: banco vazio.');
  }

  let questionIds: string[] = [];
  if (discipline === 'todas') {
    const distribution = distributeProportional(total);
    for (const [d, n] of distribution.entries()) {
      if (n <= 0) continue;
      const picked = await pickRandomFromDiscipline(pool, d, n);
      questionIds.push(...picked);
    }
    // Se alguma disciplina tiver pool insuficiente, completa com qualquer outra.
    if (questionIds.length < total) {
      const have = new Set(questionIds);
      const fill = shuffle(pool.filter((q) => !have.has(q.id))).slice(
        0,
        total - questionIds.length,
      );
      questionIds.push(...fill.map((q) => q.id));
    }
    questionIds = shuffle(questionIds).slice(0, total);
  } else {
    questionIds = shuffle(pool).slice(0, total).map((q) => q.id);
  }

  if (questionIds.length === 0) {
    throw new Error('Nenhuma questão disponível para o filtro selecionado.');
  }

  const filters: Json = {
    total: questionIds.length,
    time_limit_sec: time_limit_min * 60,
    question_ids: questionIds,
    discipline_filter: discipline,
  };

  const { data: created, error: insertErr } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      type: 'simulado',
      filters,
    })
    .select('id')
    .single();

  if (insertErr || !created) {
    throw new Error('Falha ao iniciar simulado.');
  }

  // Incrementa contador de simulados usados (free tier).
  await incrementUsageCounter(supabase, user.id, 'simulados_used_count');

  redirect(`/simulado/sessao/${created.id}`);
}

export type SimuladoCapResult = {
  allowed: boolean;
  used: number;
  limit: number;
  plan: 'free' | 'pro' | 'admin';
};

const MULTI_TOPIC_DISCIPLINE = z.enum([
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
]);

const multiTopicSchema = z.object({
  topics: z
    .array(
      z.object({
        discipline: MULTI_TOPIC_DISCIPLINE,
        subtopic: z.string().min(1),
      }),
    )
    .min(1)
    .max(120),
  /** Tempo total opcional em minutos. Default = ~2.5 min/q (ajustado pra MIN/MAX). */
  time_limit_min: z.number().int().min(15).max(360).optional(),
  /** Sub-filtro opcional aplicado só sobre tópicos de Linguagens. */
  language: z.enum(['portugues', 'ingles', 'espanhol']).nullable().optional(),
  /** Sub-filtro opcional aplicado só sobre tópicos de Humanas. */
  subject: z
    .enum(['historia', 'geografia', 'filosofia', 'sociologia'])
    .nullable()
    .optional(),
});

export type StartMultiTopicSimuladoInput = z.infer<typeof multiTopicSchema>;

const SIMULADO_MAX = 90;
const SIMULADO_MIN = 5;

/**
 * Cria um simulado a partir de um conjunto arbitrário de pares (discipline, subtopic).
 * Sample aleatório (sem proporcionalidade), limita ao SIMULADO_MAX, valida cap.
 * Em sucesso, faz redirect pra `/simulado/sessao/[id]`.
 */
export async function startMultiTopicSimuladoAndRedirect(
  input: StartMultiTopicSimuladoInput,
): Promise<void> {
  const parsed = multiTopicSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Tópicos inválidos.');
  }
  const { topics, time_limit_min } = parsed.data;
  const language = parsed.data.language ?? null;
  const subject = parsed.data.subject ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const cap = await checkSimuladoCap(supabase, user.id);
  if (!cap.allowed) {
    throw new Error('Limite de simulados grátis atingido. Assine o Pro.');
  }

  // Agrupa subtópicos por disciplina (1 round-trip por disciplina)
  const byDiscipline = new Map<string, string[]>();
  for (const p of topics) {
    const list = byDiscipline.get(p.discipline) ?? [];
    list.push(p.subtopic);
    byDiscipline.set(p.discipline, list);
  }

  const pool: SamplePool[] = [];
  for (const [discipline, subs] of byDiscipline) {
    const { data: rows, error } = await supabase
      .from('questions')
      .select('id, discipline, subtopic, annulled')
      .eq('exam', 'unifor-medicina')
      .eq('discipline', discipline)
      .in('subtopic', subs)
      .or('annulled.is.null,annulled.eq.false');
    if (error || !rows) continue;
    for (const r of rows) {
      // Sub-filtro: só aplica na disciplina pertinente.
      if (
        discipline === 'linguagens' &&
        language &&
        classifyLanguage(r.subtopic as string) !== language
      ) {
        continue;
      }
      if (
        discipline === 'humanas' &&
        subject &&
        classifySubject(r.subtopic as string) !== subject
      ) {
        continue;
      }
      pool.push({ id: r.id, discipline: r.discipline as string });
    }
  }

  if (pool.length < SIMULADO_MIN) {
    throw new Error(
      `Tópicos selecionados têm menos de ${SIMULADO_MIN} questões.`,
    );
  }

  const questionIds = shuffle(pool).slice(0, SIMULADO_MAX).map((q) => q.id);
  const total = questionIds.length;

  // Default: ~2.5 min/q arredondado para 15+ min, capado em 360
  const computedTime =
    time_limit_min ?? Math.min(360, Math.max(15, Math.round(total * 2.5)));

  const filters: Json = {
    total,
    time_limit_sec: computedTime * 60,
    question_ids: questionIds,
    discipline_filter: 'todas',
    multi_topic: true,
    topics,
    language,
    subject,
  };

  const { data: created, error: insertErr } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      type: 'simulado',
      filters,
    })
    .select('id')
    .single();
  if (insertErr || !created) {
    throw new Error('Falha ao iniciar simulado.');
  }

  await incrementUsageCounter(supabase, user.id, 'simulados_used_count');

  redirect(`/simulado/sessao/${created.id}`);
}

export async function checkSimuladoCapAction(
  options: { previewFreeMode?: boolean } = {},
): Promise<SimuladoCapResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, used: 0, limit: 0, plan: 'free' };
  }
  const cap = await checkSimuladoCap(supabase, user.id, options);
  return {
    allowed: cap.allowed,
    used: cap.used,
    limit: Number.isFinite(cap.limit) ? cap.limit : 0,
    plan: cap.plan,
  };
}

const finalizeAnswerSchema = z.object({
  question_id: z.string().min(1),
  answer: z.enum(['A', 'B', 'C', 'D', 'E']).nullable(),
});

const finalizeSchema = z.object({
  session_id: z.string().uuid(),
  answers: z.array(finalizeAnswerSchema).min(1).max(120),
});

export type FinalizeSimuladoInput = z.infer<typeof finalizeSchema>;
export type FinalizeSimuladoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function finalizeSimulado(
  input: FinalizeSimuladoInput,
): Promise<FinalizeSimuladoResult> {
  const parsed = finalizeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Payload inválido.' };
  }
  const { session_id, answers } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  const { data: session, error: sessionErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, started_at, ended_at, filters')
    .eq('id', session_id)
    .single();
  if (sessionErr || !session) {
    return { ok: false, error: 'Simulado não encontrado.' };
  }
  if (session.user_id !== user.id || session.type !== 'simulado') {
    return { ok: false, error: 'Sessão inválida.' };
  }
  if (session.ended_at) {
    // Já finalizado — idempotência soft: só retorna ok.
    return { ok: true };
  }

  const startedAtMs = session.started_at
    ? new Date(session.started_at).getTime()
    : Date.now();
  const totalDurationSec = Math.max(
    1,
    Math.round((Date.now() - startedAtMs) / 1000),
  );
  const perQuestionSec = Math.max(
    1,
    Math.round(totalDurationSec / answers.length),
  );

  const answeredIds = answers
    .filter((a) => a.answer !== null)
    .map((a) => a.question_id);

  type CorrectMap = Map<string, AnswerLetter | null>;
  const correctById: CorrectMap = new Map();
  if (answeredIds.length > 0) {
    const { data: questionRows, error: qErr } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .in('id', answeredIds);
    if (qErr || !questionRows) {
      return { ok: false, error: 'Falha ao validar respostas.' };
    }
    for (const q of questionRows) correctById.set(q.id, q.correct_answer);
  }

  let correctCount = 0;
  const attemptRows = answers.map((a) => {
    let isCorrect: boolean | null = null;
    if (a.answer !== null) {
      const correct = correctById.get(a.question_id) ?? null;
      isCorrect = correct !== null && correct === a.answer;
      if (isCorrect) correctCount += 1;
    }
    return {
      user_id: user.id,
      question_id: a.question_id,
      answer: a.answer,
      is_correct: isCorrect,
      time_spent_sec: perQuestionSec,
      context: 'simulado' as const,
      session_id,
    };
  });

  const { error: insertAttemptsErr } = await supabase
    .from('attempts')
    .insert(attemptRows);
  if (insertAttemptsErr) {
    return { ok: false, error: 'Falha ao salvar respostas.' };
  }

  const { error: updateErr } = await supabase
    .from('study_sessions')
    .update({
      ended_at: new Date().toISOString(),
      total_questions: answers.length,
      correct_count: correctCount,
      duration_sec: totalDurationSec,
    })
    .eq('id', session_id);
  if (updateErr) {
    return { ok: false, error: 'Falha ao encerrar simulado.' };
  }

  // Bônus de XP — idempotente via simulado_bonuses (PR 2).
  const { error: rpcErr } = await supabase.rpc('award_simulado_xp', {
    p_session_id: session_id,
  });
  if (rpcErr) {
    // Não derruba o simulado por causa do bônus; só registra.
    return { ok: true };
  }

  return { ok: true };
}
