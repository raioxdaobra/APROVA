import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizSetupForm } from '@/components/quiz-setup-form';
import { QuizTopicDrilldown } from '@/components/quiz-topic-drilldown';
import { TopicMapMatrix } from '@/components/topic-map-matrix';
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
      <section
        aria-labelledby="topic-map-quiz"
        className="rounded-lg border border-border bg-card p-4"
      >
        <h2 id="topic-map-quiz" className="sr-only">
          Mapa de tópicos
        </h2>
        <TopicMapMatrix data={topicFreq} mode="quiz" />
      </section>
      <QuizSetupForm years={years} />
      <QuizTopicDrilldown data={topicFreq} />
    </main>
  );
}
