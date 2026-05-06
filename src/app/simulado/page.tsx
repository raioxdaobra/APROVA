import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { SimuladoSetupForm } from '@/components/simulado-setup-form';
import { TopicMultiSelector } from '@/components/simulado/topic-multi-selector';
import { createClient } from '@/lib/supabase/server';
import { getTopicFrequency } from '@/app/quiz/actions';

export const metadata = {
  title: 'Simulado — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function SimuladoSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const topicFreq = await getTopicFrequency();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-muted-foreground hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Simulado</h1>
        <p className="text-sm text-muted-foreground">
          Reproduz o formato da prova: tempo cronometrado, sem feedback durante a
          execução. O gabarito aparece só no final.
        </p>
      </header>

      <section
        aria-labelledby="multi-topic-section"
        className="rounded-lg border border-border bg-card p-4"
      >
        <h2
          id="multi-topic-section"
          className="mb-3 text-base font-semibold text-foreground"
        >
          Monte seu simulado por tópicos
        </h2>
        <TopicMultiSelector data={topicFreq} />
      </section>

      <details className="rounded-lg border border-border bg-card">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-foreground">
          Ou use o formato clássico (60q em 180 min, etc.)
        </summary>
        <Card className="rounded-none border-0 p-6">
          <SimuladoSetupForm />
        </Card>
      </details>
    </main>
  );
}
