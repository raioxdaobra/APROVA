import { notFound, redirect } from 'next/navigation';
import { SimuladoRunner, type SimuladoQuestion } from '@/components/simulado-runner';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Simulado em andamento — APROVA',
};

export const dynamic = 'force-dynamic';

interface PageParams {
  id: string;
}

interface FiltersShape {
  total?: number;
  time_limit_sec?: number;
  question_ids?: string[];
  discipline_filter?: string;
}

function parseFilters(raw: unknown): FiltersShape | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const f = raw as Record<string, unknown>;
  const total = typeof f.total === 'number' ? f.total : undefined;
  const time_limit_sec =
    typeof f.time_limit_sec === 'number' ? f.time_limit_sec : undefined;
  const question_ids = Array.isArray(f.question_ids)
    ? f.question_ids.filter((x): x is string => typeof x === 'string')
    : undefined;
  const discipline_filter =
    typeof f.discipline_filter === 'string' ? f.discipline_filter : undefined;
  return { total, time_limit_sec, question_ids, discipline_filter };
}

export default async function SimuladoSessionPage({
  params,
}: {
  params: PageParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: session, error: sErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, started_at, ended_at, filters')
    .eq('id', params.id)
    .maybeSingle();

  if (sErr || !session) notFound();
  if (session.user_id !== user.id || session.type !== 'simulado') notFound();

  // Se já terminou, manda para resultado.
  if (session.ended_at) {
    redirect(`/simulado/sessao/${session.id}/resultado`);
  }

  const filters = parseFilters(session.filters);
  if (!filters || !filters.question_ids || filters.question_ids.length === 0) {
    throw new Error('Simulado sem questões: filtros corrompidos.');
  }
  const timeLimitSec = filters.time_limit_sec ?? 0;
  if (timeLimitSec <= 0) {
    throw new Error('Simulado sem tempo configurado.');
  }

  const { data: questionRows, error: qErr } = await supabase
    .from('questions')
    .select(
      'id, discipline, subtopic, subtopic_short, year, semester, question_num, image_url',
    )
    .in('id', filters.question_ids);
  if (qErr || !questionRows) {
    throw new Error('Falha ao carregar questões do simulado.');
  }

  // Reordenar para preservar a ordem definida em filters.question_ids.
  const byId = new Map<string, (typeof questionRows)[number]>();
  for (const q of questionRows) byId.set(q.id, q);
  const ordered: SimuladoQuestion[] = [];
  for (const id of filters.question_ids) {
    const q = byId.get(id);
    if (q) {
      ordered.push({
        id: q.id,
        discipline: q.discipline,
        subtopic: q.subtopic,
        subtopic_short: q.subtopic_short,
        year: q.year,
        semester: q.semester,
        question_num: q.question_num,
        image_url: q.image_url,
      });
    }
  }

  const startedAtIso = session.started_at ?? new Date().toISOString();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
      <SimuladoRunner
        sessionId={session.id}
        questions={ordered}
        timeLimitSec={timeLimitSec}
        startedAtIso={startedAtIso}
      />
    </main>
  );
}
