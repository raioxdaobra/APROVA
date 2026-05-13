import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizRunner, type QuizQuestion } from '@/components/quiz-runner';

export const metadata = {
  title: 'Resolvendo questões — APROVA',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function QuizSessionPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: session, error: sessionErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, filters, ended_at')
    .eq('id', params.id)
    .single();
  if (sessionErr || !session) {
    redirect('/quiz');
  }
  if (session.user_id !== user.id || session.type !== 'quiz') {
    redirect('/quiz');
  }
  if (session.ended_at) {
    redirect(`/quiz/sessao/${params.id}/fim`);
  }

  const filters = (session.filters as { question_ids?: unknown } | null) ?? null;
  const questionIds = Array.isArray(filters?.question_ids)
    ? (filters!.question_ids.filter((v): v is string => typeof v === 'string'))
    : [];

  if (questionIds.length === 0) {
    throw new Error('Sessão sem questões.');
  }

  const { data: questionRows, error: qErr } = await supabase
    .from('questions')
    .select(
      'id, discipline, subtopic, subtopic_short, year, semester, question_num, image_url, description, annulled',
    )
    .in('id', questionIds);
  if (qErr || !questionRows) {
    throw new Error('Falha ao carregar questões.');
  }

  // Estatísticas globais por questão (% de acerto). View criada em worktree A;
  // tolera ausência (chip não renderiza). Tipagem da DB ainda não conhece
  // a view, então castamos via unknown.
  const statsById = new Map<string, number>();
  try {
    type StatsRow = { question_id: string; correct_pct: number | null };
    type StatsQuery = {
      from: (table: 'question_stats') => {
        select: (cols: string) => {
          in: (col: string, vals: string[]) => Promise<{ data: StatsRow[] | null }>;
        };
      };
    };
    const sb = supabase as unknown as StatsQuery;
    const { data: statsRows } = await sb
      .from('question_stats')
      .select('question_id, correct_pct')
      .in('question_id', questionIds);
    for (const row of statsRows ?? []) {
      if (typeof row.correct_pct === 'number') {
        statsById.set(row.question_id, row.correct_pct);
      }
    }
  } catch {
    // View pode ainda não existir — ignora.
  }

  // Preserva ordem do filters.question_ids
  const byId = new Map(questionRows.map((q) => [q.id, q]));
  const ordered: QuizQuestion[] = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({
      id: q.id,
      discipline: q.discipline,
      subtopic: q.subtopic,
      subtopic_short: q.subtopic_short,
      year: q.year,
      semester: q.semester,
      question_num: q.question_num,
      image_url: q.image_url,
      description: (q as { description?: string | null }).description ?? '',
      annulled: q.annulled === true,
      correct_pct: statsById.has(q.id) ? statsById.get(q.id)! : null,
    }));

  // Marcação prévia "toreview"
  const { data: statusRows } = await supabase
    .from('user_question_status')
    .select('question_id, status')
    .eq('user_id', user.id)
    .in('question_id', questionIds);
  const initialReviewMarked: Record<string, boolean> = {};
  for (const row of statusRows ?? []) {
    if (row.status === 'toreview') {
      initialReviewMarked[row.question_id] = true;
    }
  }

  // Tentativas já feitas nesta sessão — pré-popula respostas no runner pra que
  // o usuário não precise responder de novo questões que já completou e cai
  // direto na próxima questão não-respondida ao retomar a sessão.
  const { data: attemptRows } = await supabase
    .from('attempts')
    .select('question_id, answer, is_correct')
    .eq('user_id', user.id)
    .eq('session_id', params.id);
  const initialAnswers: Record<
    string,
    { answer: string | null; is_correct: boolean | null }
  > = {};
  for (const row of attemptRows ?? []) {
    if (typeof row.question_id === 'string') {
      initialAnswers[row.question_id] = {
        answer: (row.answer as string | null) ?? null,
        is_correct: row.is_correct ?? null,
      };
    }
  }

  // XP semanal inicial — para detectar rank-up no client.
  const TZ = 'America/Fortaleza';
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [yy, mm, dd] = todayIso.split('-').map(Number);
  let weekStartIso = todayIso;
  if (yy && mm && dd) {
    const utc = new Date(Date.UTC(yy, mm - 1, dd));
    const dow = utc.getUTCDay();
    utc.setUTCDate(utc.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
    weekStartIso = utc.toISOString().slice(0, 10);
  }
  const { data: weeklyXpRow } = await supabase
    .from('weekly_xp')
    .select('xp')
    .eq('user_id', user.id)
    .eq('week_start', weekStartIso)
    .maybeSingle();
  const initialWeeklyXp = weeklyXpRow?.xp ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6 lg:max-w-5xl xl:max-w-6xl">
      <QuizRunner
        sessionId={session.id}
        questions={ordered}
        initialReviewMarked={initialReviewMarked}
        initialAnswers={initialAnswers}
        initialWeeklyXp={initialWeeklyXp}
      />
    </main>
  );
}
