import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DiagnosticRunner, type DiagnosticQuestion } from '@/components/diagnostic-runner';

export const metadata = {
  title: 'Diagnóstico — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function DiagnosticoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Recuperar (ou criar) a sessão de diagnóstico mais recente do usuário.
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('study_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'diagnostic')
    .is('ended_at', null)
    .gt('started_at', tenMinutesAgo)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let sessionId: string | null = existing?.id ?? null;
  if (!sessionId) {
    const { data: created, error: insertErr } = await supabase
      .from('study_sessions')
      .insert({ user_id: user.id, type: 'diagnostic' })
      .select('id')
      .single();
    if (insertErr || !created) {
      throw new Error('Falha ao criar sessão de diagnóstico.');
    }
    sessionId = created.id;
  }

  const { data: questions, error: rpcErr } = await supabase.rpc('get_diagnostic_questions');
  if (rpcErr || !questions || questions.length === 0) {
    throw new Error('Não foi possível carregar as questões do diagnóstico.');
  }

  const typedQuestions: DiagnosticQuestion[] = questions.map((q) => ({
    id: q.id,
    discipline: q.discipline,
    subtopic: q.subtopic,
    subtopic_short: q.subtopic_short,
    year: q.year,
    semester: q.semester,
    question_num: q.question_num,
    image_url: q.image_url,
  }));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <DiagnosticRunner sessionId={sessionId} questions={typedQuestions} />
    </main>
  );
}
