import { redirect } from 'next/navigation';
import { Brain } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { FlashcardSession } from '@/components/revisao/flashcard-session';
import { getDueQueue, getFlashcardCounts } from './actions';

export const metadata = {
  title: 'Revisão — APROVA',
  description:
    'Revise as questões oficiais com repetição espaçada (SRS). Cada card é uma questão real do vestibular.',
};

export const dynamic = 'force-dynamic';

export default async function RevisaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [counts, initialQueue] = await Promise.all([
    getFlashcardCounts(),
    getDueQueue(20),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 pb-24 md:pb-6">
      <header className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <Brain className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revisão</h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground tabular-nums">{counts.overdue}</strong>{' '}
            atrasados ·{' '}
            <strong className="text-foreground tabular-nums">{counts.dueToday}</strong>{' '}
            pra hoje ·{' '}
            <strong className="text-foreground tabular-nums">
              {counts.newAvailable}
            </strong>{' '}
            novos
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Como funciona:</strong> cada card é uma
          questão real do vestibular Unifor. Pense na resposta, virar pra ver o gabarito,
          e classifique como{' '}
          <span className="font-medium text-red-700 dark:text-red-300">Errei</span>,{' '}
          <span className="font-medium text-orange-700 dark:text-orange-300">
            Difícil
          </span>
          ,{' '}
          <span className="font-medium text-emerald-700 dark:text-emerald-300">Bom</span>{' '}
          ou{' '}
          <span className="font-medium text-sky-700 dark:text-sky-300">Fácil</span>. O
          algoritmo SM-2 (mesmo do Anki) decide quando o card volta.
        </p>
      </section>

      <FlashcardSession initialQueue={initialQueue} />
    </div>
  );
}
