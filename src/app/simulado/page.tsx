import { redirect } from 'next/navigation';
import { BackButton } from '@/components/back-button';
import { Card } from '@/components/ui/card';
import { SimuladoSetupForm } from '@/components/simulado-setup-form';
import { TopicMultiSelector } from '@/components/simulado/topic-multi-selector';
import { CustomDistributionForm } from '@/components/simulado/custom-distribution-form';
import { createClient } from '@/lib/supabase/server';
import { getTopicFrequency } from '@/app/quiz/actions';

type Discipline =
  | 'matematica'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'humanas'
  | 'linguagens';

function emptyPool(): Record<Discipline, number> {
  return {
    matematica: 0,
    fisica: 0,
    quimica: 0,
    biologia: 0,
    humanas: 0,
    linguagens: 0,
  };
}

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

  // Conta questões por disciplina a partir do TopicFrequency (já agrega tudo).
  const poolByDiscipline = emptyPool();
  for (const node of topicFreq) {
    const d = node.discipline as Discipline;
    if (d in poolByDiscipline) {
      poolByDiscipline[d] = node.count;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
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

      <section
        aria-labelledby="custom-distribution-section"
        className="rounded-lg border border-border bg-card p-4"
      >
        <h2
          id="custom-distribution-section"
          className="mb-3 text-base font-semibold text-foreground"
        >
          Personalizado por disciplina
        </h2>
        <CustomDistributionForm poolByDiscipline={poolByDiscipline} />
      </section>

      <details className="rounded-lg border border-border bg-card">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-foreground">
          Ou use o formato clássico (60q em 180 min, etc.)
        </summary>
        <Card className="rounded-none border-0 p-6">
          <SimuladoSetupForm />
        </Card>
      </details>

      <BackButton fallbackHref="/dashboard" className="self-start" />
    </main>
  );
}
