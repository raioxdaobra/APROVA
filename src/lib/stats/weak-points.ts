/**
 * Gap-finder pessoal: calcula "pontos fracos" reais do usuário a partir do
 * histórico de tentativas (`attempts`) cruzado com a frequência global de
 * cobrança (`questions` por discipline+subtopic). Consumido pela aba
 * "Meus pontos fracos" em /estatisticas?tab=fracos.
 *
 * Definição de ponto fraco:
 *   - User tem ao menos MIN_ANSWERS_FOR_GAP respostas no tópico
 *   - Acerto% < WEAK_THRESHOLD
 *   - Score = globalFrequency * (1 - accuracy) ordena em desc
 *
 * Tópicos sem dados suficientes ficam em `undiagnosed` (top tópicos com
 * 0 attempts ordenados por frequência), pra UI sugerir "diagnostique aqui".
 */
import type { Discipline } from '@/lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { getActiveExam } from '@/lib/exam/active-exam';

export const MIN_ANSWERS_FOR_GAP = 3;
export const WEAK_THRESHOLD = 0.6;
export const TOP_WEAK_LIMIT = 12;
export const TOP_UNDIAGNOSED_LIMIT = 12;

const DISCIPLINES: Discipline[] = [
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
];

export interface WeakPoint {
  discipline: Discipline;
  topic: string; // subtopic name
  topicShort: string; // subtopic_short (legível)
  attempts: number;
  correct: number;
  accuracyPct: number; // 0-100
  globalFrequency: number; // count de questões disponíveis com esse topic
  globalFrequencyPct: number; // % do pool global da disciplina
  weight: number; // score = frequency * (1 - accuracy)
}

export interface UndiagnosedTopic {
  discipline: Discipline;
  topic: string;
  topicShort: string;
  globalFrequency: number;
}

export interface WeakPointsResult {
  weak: WeakPoint[];
  undiagnosed: UndiagnosedTopic[];
  totalAttemptsConsidered: number;
}

interface FetchOpts {
  minAnswers?: number;
  threshold?: number;
  topLimit?: number;
}

type SupabaseLike = SupabaseClient<Database> | Awaited<
  ReturnType<typeof import('@/lib/supabase/server').createClient>
>;

function isDiscipline(value: string): value is Discipline {
  return (DISCIPLINES as string[]).includes(value);
}

/**
 * Busca pontos fracos do usuário. Sem crash quando user não tem nenhuma
 * tentativa: retorna `weak: []` + `undiagnosed` populado com top tópicos.
 */
export async function fetchWeakPoints(
  supabase: SupabaseLike,
  userId: string,
  opts: FetchOpts = {},
): Promise<WeakPointsResult> {
  const minAnswers = opts.minAnswers ?? MIN_ANSWERS_FOR_GAP;
  const threshold = opts.threshold ?? WEAK_THRESHOLD;
  const topLimit = opts.topLimit ?? TOP_WEAK_LIMIT;
  const exam = await getActiveExam(supabase, userId);

  // 1) Carrega catálogo (questions não-anuladas) — fonte da verdade pra
  //    discipline/subtopic e frequência global.
  const { data: questionsRows } = await supabase
    .from('questions')
    .select('id, discipline, subtopic, subtopic_short, annulled')
    .eq('exam', exam);

  const validQuestions = (questionsRows ?? []).filter((q) => !q.annulled);
  const questionsById = new Map<
    string,
    { discipline: string; subtopic: string; subtopic_short: string }
  >();
  const globalCountByKey = new Map<string, number>();
  const subtopicShortByKey = new Map<string, string>();
  const totalsByDiscipline = new Map<string, number>();
  for (const q of validQuestions) {
    if (!q.discipline || !q.subtopic) continue;
    questionsById.set(q.id, {
      discipline: q.discipline,
      subtopic: q.subtopic,
      subtopic_short: q.subtopic_short ?? q.subtopic,
    });
    const key = `${q.discipline}::${q.subtopic}`;
    globalCountByKey.set(key, (globalCountByKey.get(key) ?? 0) + 1);
    subtopicShortByKey.set(key, q.subtopic_short ?? q.subtopic);
    totalsByDiscipline.set(q.discipline, (totalsByDiscipline.get(q.discipline) ?? 0) + 1);
  }

  // 2) Carrega tentativas do user (excluindo diagnostic) e tira a "última por
  //    questão" pra evitar contar a mesma questão duas vezes. Mesmo critério
  //    da tabela "Por subtópico" da página de estatísticas.
  const { data: attemptRows } = await supabase
    .from('attempts')
    .select('question_id, is_correct, context, created_at')
    .eq('user_id', userId)
    .neq('context', 'diagnostic');

  const latestByQuestion = new Map<
    string,
    { is_correct: boolean | null; created_at: string | null }
  >();
  for (const a of attemptRows ?? []) {
    if (!a.question_id) continue;
    const prev = latestByQuestion.get(a.question_id);
    if (!prev) {
      latestByQuestion.set(a.question_id, {
        is_correct: a.is_correct,
        created_at: a.created_at,
      });
      continue;
    }
    const prevTs = prev.created_at ? Date.parse(prev.created_at) : 0;
    const currTs = a.created_at ? Date.parse(a.created_at) : 0;
    if (currTs >= prevTs) {
      latestByQuestion.set(a.question_id, {
        is_correct: a.is_correct,
        created_at: a.created_at,
      });
    }
  }

  // 3) Agrega por (discipline, subtopic).
  const aggByKey = new Map<string, { attempts: number; correct: number }>();
  for (const [questionId, attempt] of latestByQuestion) {
    const meta = questionsById.get(questionId);
    if (!meta) continue;
    const key = `${meta.discipline}::${meta.subtopic}`;
    const row = aggByKey.get(key) ?? { attempts: 0, correct: 0 };
    row.attempts += 1;
    if (attempt.is_correct === true) row.correct += 1;
    aggByKey.set(key, row);
  }

  // 4) Aplica filtros e gera lista weak.
  const weak: WeakPoint[] = [];
  for (const [key, agg] of aggByKey) {
    if (agg.attempts < minAnswers) continue;
    const accuracy = agg.correct / agg.attempts;
    if (accuracy >= threshold) continue;
    const [discipline, subtopic] = key.split('::') as [string, string];
    if (!isDiscipline(discipline)) continue;
    const globalFrequency = globalCountByKey.get(key) ?? 0;
    if (globalFrequency === 0) continue; // tópico sumiu do catálogo? não recomenda
    const disciplineTotal = totalsByDiscipline.get(discipline) ?? 0;
    const globalFrequencyPct =
      disciplineTotal === 0 ? 0 : (globalFrequency / disciplineTotal) * 100;
    weak.push({
      discipline,
      topic: subtopic,
      topicShort: subtopicShortByKey.get(key) ?? subtopic,
      attempts: agg.attempts,
      correct: agg.correct,
      accuracyPct: Math.round(accuracy * 100),
      globalFrequency,
      globalFrequencyPct: Math.round(globalFrequencyPct),
      weight: globalFrequency * (1 - accuracy),
    });
  }

  weak.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    // empate: ordem alfabética estável pra UI determinística
    return a.topicShort.localeCompare(b.topicShort, 'pt-BR');
  });

  const weakTop = weak.slice(0, topLimit);

  // 5) Tópicos não diagnosticados: têm questões disponíveis mas user nunca
  //    respondeu (ou respondeu menos que minAnswers). Ordenados por frequência.
  const undiagnosed: UndiagnosedTopic[] = [];
  for (const [key, globalFrequency] of globalCountByKey) {
    const agg = aggByKey.get(key);
    if (agg && agg.attempts >= minAnswers) continue; // já considerado weak/strong
    const [discipline, subtopic] = key.split('::') as [string, string];
    if (!isDiscipline(discipline)) continue;
    undiagnosed.push({
      discipline,
      topic: subtopic,
      topicShort: subtopicShortByKey.get(key) ?? subtopic,
      globalFrequency,
    });
  }

  undiagnosed.sort((a, b) => {
    if (b.globalFrequency !== a.globalFrequency)
      return b.globalFrequency - a.globalFrequency;
    return a.topicShort.localeCompare(b.topicShort, 'pt-BR');
  });

  const totalAttemptsConsidered = latestByQuestion.size;

  return {
    weak: weakTop,
    undiagnosed: undiagnosed.slice(0, TOP_UNDIAGNOSED_LIMIT),
    totalAttemptsConsidered,
  };
}
