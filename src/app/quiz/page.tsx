import { redirect } from 'next/navigation';
import { BackButton } from '@/components/back-button';
import { createClient } from '@/lib/supabase/server';
import { QuizSelectionShell } from '@/components/quiz/quiz-selection-shell';
import { getTopicFrequency, startQuizSession } from './actions';

export const metadata = {
  title: 'Resolver questões — APROVA',
};

export const dynamic = 'force-dynamic';

interface QuizPageProps {
  searchParams?: { random?: string };
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Atalho do dashboard: ?random=true cria sessão aleatória sem filtros
  if (searchParams?.random === 'true') {
    const res = await startQuizSession({
      filters: { hide_annulled: true, status: 'todas' },
      mode: 'aleatorio',
    });
    if (res.ok) {
      redirect(`/quiz/sessao/${res.sessionId}`);
    }
  }

  const topicFreq = await getTopicFrequency();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <QuizSelectionShell data={topicFreq} />
      <BackButton fallbackHref="/dashboard" className="self-start" />
    </main>
  );
}
