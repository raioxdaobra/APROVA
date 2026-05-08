'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { fetchAll } from '@/lib/supabase/fetch-all';
import type { AnswerLetter, Json } from '@/lib/supabase/types';
import {
  checkQuestionsCap,
  incrementUsageCounter,
} from '@/lib/billing/caps';
import { classifyLanguage, classifySubject } from '@/lib/stats/sub-filters';

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
const languageSchema = z.enum(['portugues', 'ingles', 'espanhol']);
const subjectSchema = z.enum(['historia', 'geografia', 'filosofia', 'sociologia']);

const filtersSchema = z.object({
  discipline: disciplineSchema.nullable().optional(),
  subtopic: z.string().min(1).nullable().optional(),
  year: z.number().int().min(1900).max(3000).nullable().optional(),
  status: statusSchema.optional(),
  hide_annulled: z.boolean().optional(),
  /** Sub-filtro só aplicado quando discipline === 'linguagens'. */
  language: languageSchema.nullable().optional(),
  /** Sub-filtro só aplicado quando discipline === 'humanas'. */
  subject: subjectSchema.nullable().optional(),
});

export type QuizFilters = z.infer<typeof filtersSchema>;

interface NormalizedFilters {
  discipline: string | null;
  subtopic: string | null;
  year: number | null;
  status: 'todas' | 'correct' | 'wrong' | 'toreview';
  hide_annulled: boolean;
  language: 'portugues' | 'ingles' | 'espanhol' | null;
  subject: 'historia' | 'geografia' | 'filosofia' | 'sociologia' | null;
}

function normalizeFilters(input: QuizFilters): NormalizedFilters {
  return {
    discipline: input.discipline ?? null,
    subtopic: input.subtopic ?? null,
    year: input.year ?? null,
    status: input.status ?? 'todas',
    hide_annulled: input.hide_annulled ?? true,
    language: input.language ?? null,
    subject: input.subject ?? null,
  };
}

interface QuestionMetaRow {
  id: string;
  discipline: string;
  subtopic: string;
}

/**
 * Aplica sub-filtros (language/subject) usando a mesma classificação do
 * helper `sub-filters.ts`. Roda no client/server pra evitar dependência
 * da view SQL `questions_classified`.
 */
function filterBySubFilter<T extends QuestionMetaRow>(
  rows: T[],
  f: Pick<NormalizedFilters, 'discipline' | 'language' | 'subject'>,
): T[] {
  if (f.discipline === 'linguagens' && f.language) {
    return rows.filter((r) => classifyLanguage(r.subtopic) === f.language);
  }
  if (f.discipline === 'humanas' && f.subject) {
    return rows.filter((r) => classifySubject(r.subtopic) === f.subject);
  }
  return rows;
}

async function loadCandidateQuestionIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  f: NormalizedFilters,
): Promise<string[]> {
  // Pagina pra contornar cap de 1000 do PostgREST.
  const questionRows = await fetchAll<{ id: string; discipline: string; subtopic: string }>(
    ({ from, to }) => {
      let q = supabase
        .from('questions')
        .select('id, discipline, subtopic')
        .eq('exam', EXAM)
        .eq('annulled', false);
      if (f.discipline) q = q.eq('discipline', f.discipline);
      if (f.subtopic) q = q.eq('subtopic', f.subtopic);
      if (f.year !== null) q = q.eq('year', f.year);
      return q.range(from, to);
    },
  );
  if (questionRows.length === 0) return [];

  // Sub-filtro de Linguagens (PT/ING/ESP) ou Humanas (Hist/Geo/Filo/Soc).
  const filteredRows = filterBySubFilter(questionRows, f);
  let ids = filteredRows.map((q) => q.id);
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
  let parsedDiscipline: string | null = null;
  if (discipline) {
    const parsed = disciplineSchema.safeParse(discipline);
    if (!parsed.success) return [];
    parsedDiscipline = parsed.data;
  }
  const data = await fetchAll<{ subtopic: string | null }>(({ from, to }) => {
    let q = supabase
      .from('questions')
      .select('subtopic')
      .eq('exam', EXAM)
      .eq('annulled', false);
    if (parsedDiscipline) q = q.eq('discipline', parsedDiscipline);
    return q.range(from, to);
  });
  if (data.length === 0) return [];
  const set = new Set<string>();
  for (const row of data) {
    if (row.subtopic) set.add(row.subtopic);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export async function getYears(): Promise<number[]> {
  const supabase = await createClient();
  const data = await fetchAll<{ year: number | null }>(({ from, to }) =>
    supabase
      .from('questions')
      .select('year')
      .eq('exam', EXAM)
      .eq('annulled', false)
      .range(from, to),
  );
  if (data.length === 0) return [];
  const set = new Set<number>();
  for (const row of data) {
    if (typeof row.year === 'number') set.add(row.year);
  }
  return [...set].sort((a, b) => b - a);
}

export interface TopicFrequencyNode {
  discipline: string;
  count: number;
  topics: Array<{ topic: string; count: number }>;
}

export async function getTopicFrequency(): Promise<TopicFrequencyNode[]> {
  const supabase = await createClient();
  // Supabase enforça hard cap de 1000 rows (db-max-rows). Pagina via fetchAll.
  const data = await fetchAll<{ discipline: string | null; subtopic: string | null; annulled: boolean | null }>(
    ({ from, to }) =>
      supabase
        .from('questions')
        .select('discipline, subtopic, annulled')
        .eq('exam', EXAM)
        .range(from, to),
  );
  if (data.length === 0) return [];
  const byDiscipline = new Map<string, Map<string, number>>();
  for (const row of data) {
    if (row.annulled) continue;
    const d = (row.discipline as string | null) ?? null;
    if (!d) continue;
    const t = ((row.subtopic as string | null) ?? '').trim() || 'Sem tópico';
    if (!byDiscipline.has(d)) byDiscipline.set(d, new Map());
    const inner = byDiscipline.get(d) ?? new Map<string, number>();
    inner.set(t, (inner.get(t) ?? 0) + 1);
  }
  return [...byDiscipline.entries()]
    .map(([discipline, topicsMap]) => {
      const topics = [...topicsMap.entries()]
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count);
      const count = topics.reduce((acc, t) => acc + t.count, 0);
      return { discipline, count, topics };
    })
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
  // PR 33: anuladas sempre escondidas (independente do filtro).
  // Pagina pra contornar cap de 1000 do PostgREST.
  const rows = await fetchAll<{
    id: string;
    year: number;
    semester: number;
    question_num: number;
    discipline: string;
    subtopic: string;
    annulled: boolean | null;
  }>(({ from, to }) => {
    let q = supabase
      .from('questions')
      .select('id, year, semester, question_num, discipline, subtopic, annulled')
      .eq('exam', EXAM)
      .eq('annulled', false);
    if (f.discipline) q = q.eq('discipline', f.discipline);
    if (f.subtopic) q = q.eq('subtopic', f.subtopic);
    if (f.year !== null) q = q.eq('year', f.year);
    return q.range(from, to);
  });
  if (rows.length === 0) {
    return { ok: false, error: 'Falha ao carregar questões.' };
  }

  // Sub-filtro de Linguagens/Humanas (mesma regex que a view 0024).
  const subFiltered = filterBySubFilter(rows, f);
  let pool = subFiltered;
  if (f.status !== 'todas') {
    const { data: statusRows } = await supabase
      .from('user_question_status')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('status', f.status)
      .in('question_id', subFiltered.map((r) => r.id));
    const allowed = new Set((statusRows ?? []).map((r) => r.question_id));
    pool = subFiltered.filter((r) => allowed.has(r.id));
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
    // Trial weighting: durante trial, prioriza questões fáceis (correct_pct >= 60).
    // Mantém proporção 70% easy / 30% mix pra deixar novos users felizes.
    const isTrial = await isUserInTrial(supabase, user.id);
    if (isTrial && pool.length > 5) {
      pool = await applyTrialEasyBias(supabase, pool);
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
    language: f.language,
    subject: f.subject,
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

const topicsQuizSchema = z.object({
  topics: z
    .array(
      z.object({
        discipline: disciplineSchema,
        subtopic: z.string().min(1),
      }),
    )
    .min(1)
    .max(50),
  mode: z.enum(['sequencial', 'aleatorio']).optional(),
  /** Sub-filtros opcionais aplicados sobre os tópicos selecionados. */
  language: languageSchema.nullable().optional(),
  subject: subjectSchema.nullable().optional(),
});

export type StartTopicsQuizInput = z.infer<typeof topicsQuizSchema>;

/**
 * Inicia uma sessão de quiz cobrindo um conjunto de pares (discipline,subtopic).
 * Usado pelo CTA "Estudar o que MAIS CAI" no `<TopicMapMatrix mode='quiz'>`.
 * Faz amostra aleatória do pool combinado (até MAX_QUIZ_QUESTIONS).
 */
export async function startTopicsQuizAndRedirect(
  input: StartTopicsQuizInput,
): Promise<void> {
  const parsed = topicsQuizSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Tópicos inválidos.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Sessão expirada.');
  }

  const mode = parsed.data.mode ?? 'aleatorio';
  const pairs = parsed.data.topics;
  const language = parsed.data.language ?? null;
  const subject = parsed.data.subject ?? null;

  // Busca ids para cada disciplina, filtrando subtópicos no cliente — uma round-trip por disciplina.
  const byDiscipline = new Map<string, string[]>();
  for (const p of pairs) {
    const list = byDiscipline.get(p.discipline) ?? [];
    list.push(p.subtopic);
    byDiscipline.set(p.discipline, list);
  }

  const idChunks: Array<{ id: string; year: number; semester: number; question_num: number }> = [];
  for (const [discipline, subs] of byDiscipline) {
    // Pagina (caso uma disciplina passe de 1000 — defesa).
    const rows = await fetchAll<{
      id: string;
      year: number;
      semester: number;
      question_num: number;
      discipline: string;
      subtopic: string;
      annulled: boolean | null;
    }>(({ from, to }) =>
      supabase
        .from('questions')
        .select('id, year, semester, question_num, discipline, subtopic, annulled')
        .eq('exam', EXAM)
        .eq('discipline', discipline)
        .in('subtopic', subs)
        .eq('annulled', false)
        .range(from, to),
    );
    if (rows.length === 0) continue;
    // Aplica sub-filtro só na disciplina relevante.
    const filtered = filterBySubFilter(rows, {
      discipline,
      language,
      subject,
    });
    for (const r of filtered) {
      idChunks.push({
        id: r.id,
        year: r.year,
        semester: r.semester,
        question_num: r.question_num,
      });
    }
  }

  if (idChunks.length === 0) {
    throw new Error('Nenhuma questão corresponde aos tópicos.');
  }

  if (mode === 'sequencial') {
    idChunks.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.question_num - b.question_num;
    });
  } else {
    for (let i = idChunks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = idChunks[i];
      const b = idChunks[j];
      if (a && b) {
        idChunks[i] = b;
        idChunks[j] = a;
      }
    }
  }

  const limited = idChunks.slice(0, MAX_QUIZ_QUESTIONS);
  const questionIds = limited.map((r) => r.id);

  const filtersJson: Json = {
    discipline: null,
    subtopic: null,
    year: null,
    status: 'todas',
    hide_annulled: true,
    language,
    subject,
    mode,
    question_ids: questionIds,
    topics: pairs,
    source: 'mais-cai',
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
    throw new Error('Falha ao criar sessão.');
  }

  redirect(`/quiz/sessao/${created.id}`);
}

export type QuizCapResult =
  | { allowed: true; used: number; limit: number; plan: 'free' | 'pro' | 'admin' | 'trial' }
  | { allowed: false; used: number; limit: number; plan: 'free' | 'pro' | 'admin' | 'trial' };

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

// -----------------------------------------------------------------------------
// Trial weighted-easy: durante o trial (7 dias) o user vê majoritariamente
// questões fáceis (correct_pct >= 60% baseado em ≥3 tentativas no banco).
// Objetivo: maximizar a sensação de progresso pro novo user. Quando trial
// expira (ou plan vira pro), volta ao random uniforme.
// -----------------------------------------------------------------------------

const TRIAL_EASY_PCT = 70;
const TRIAL_EASY_THRESHOLD = 60;
const TRIAL_EASY_MIN_ATTEMPTS = 3;

async function isUserInTrial(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('plan, trial_ends_at')
    .eq('id', userId)
    .maybeSingle();
  if (!data) return false;
  const plan = (data as { plan?: string | null }).plan ?? 'free';
  if (plan !== 'free') return false;
  const trialRaw = (data as { trial_ends_at?: string | null }).trial_ends_at;
  if (!trialRaw) return false;
  const trialEnds = new Date(trialRaw);
  if (Number.isNaN(trialEnds.getTime())) return false;
  return trialEnds.getTime() > Date.now();
}

interface PoolItem {
  id: string;
  year: number;
  semester: number;
  question_num: number;
  discipline: string;
  subtopic: string;
}

async function applyTrialEasyBias<T extends PoolItem>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pool: T[],
): Promise<T[]> {
  const ids = pool.map((p) => p.id);
  const { data: stats } = await supabase
    .from('question_stats')
    .select('question_id, correct_pct, total_attempts')
    .in('question_id', ids);

  const easySet = new Set(
    (stats ?? [])
      .filter(
        (s) =>
          (s.total_attempts ?? 0) >= TRIAL_EASY_MIN_ATTEMPTS &&
          (s.correct_pct ?? 0) >= TRIAL_EASY_THRESHOLD,
      )
      .map((s) => s.question_id as string),
  );

  if (easySet.size < 5) return pool; // não tem dados suficientes pra bias

  const easy = pool.filter((p) => easySet.has(p.id));
  const rest = pool.filter((p) => !easySet.has(p.id));

  // Reordena: 70% das primeiras posições vai pro easy.
  const total = pool.length;
  const easyCount = Math.min(easy.length, Math.round((total * TRIAL_EASY_PCT) / 100));
  const restCount = total - easyCount;

  return [...easy.slice(0, easyCount), ...rest.slice(0, restCount)];
}
