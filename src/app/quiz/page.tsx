import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizSelectionShell } from '@/components/quiz/quiz-selection-shell';
import { QuizTopicDrilldown } from '@/components/quiz-topic-drilldown';
import { getTopicFrequency, getYears, startQuizSession } from './actions';

export const metadata = {
  title: 'Quiz — APROVA',
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

  const [years, topicFreq] = await Promise.all([getYears(), getTopicFrequency()]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <QuizSelectionShell data={topicFreq} years={years} />
      <QuizTopicDrilldown data={topicFreq} />
    </main>
  );
}
