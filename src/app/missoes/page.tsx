import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DailyMissionsCard } from '@/components/daily-missions-card';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Missões — APROVA',
};

export const dynamic = 'force-dynamic';

/**
 * Página dedicada de missões diárias. Ganhou rota própria depois que o
 * user removeu o card de missões compacto do dashboard pra avaliar onde
 * encaixa melhor. Por enquanto: link na sidebar + página com o card
 * detalhado (`DailyMissionsCard`).
 *
 * Spec/decisão: vai ser revisitado depois — pode virar parte do dashboard
 * de novo, virar drawer, ou ganhar mais features (semanais, etc).
 */
export default async function MissoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Missões diárias</h1>
        <p className="text-sm text-muted-foreground">
          Resetam às 00h (Fortaleza). Cada missão concluída dá XP extra.
        </p>
      </header>

      <DailyMissionsCard />

      <div className="flex justify-end">
        <Button asChild variant="secondary">
          <Link href="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
