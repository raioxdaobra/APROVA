import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { TrilhaMapRPG } from '@/components/trilha/trilha-map-rpg';
import { createClient } from '@/lib/supabase/server';
import {
  TRILHA_RANK_THEMES,
  calcOverallProgress,
  type TrilhaStationRPG,
} from '@/lib/trilha/stations';

export const metadata = {
  title: 'Trilha — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function TrilhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const [profileRes, stationsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    // View nova v2 — usa cast porque types.ts ainda não foi regenerado.
    (supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => Promise<{ data: unknown[] | null }>;
      };
    })
      .from('user_trilha_full_v2')
      .select('*'),
  ]);

  const profile = profileRes.data;
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';
  const stations = ((stationsRes.data ?? []) as unknown[]).filter(
    (s): s is TrilhaStationRPG => {
      if (!s || typeof s !== 'object') return false;
      const r = s as { rank?: unknown; id?: unknown };
      return typeof r.id === 'string' && typeof r.rank === 'number';
    },
  );

  const progress = calcOverallProgress(stations);
  const ranksCompletedSet = new Set<number>();
  for (const st of stations) {
    if (st.is_passed && st.is_boss) {
      ranksCompletedSet.add(st.rank);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 mx-auto flex w-full max-w-3xl items-start justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao dashboard
          </Link>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Trilha de evolução
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Olá, <strong>{displayName}</strong> · {progress.completed}/{progress.total} estações
            concluídas ({progress.pct}%) · {progress.xpEarned} XP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-10 pt-6">
        {/* Breadcrumb visual de ranks */}
        <nav
          aria-label="Ranks da trilha"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {TRILHA_RANK_THEMES.map((t) => {
            const done = ranksCompletedSet.has(t.rank);
            return (
              <span
                key={t.rank}
                className={
                  'flex h-7 min-w-7 flex-shrink-0 items-center justify-center rounded-full border px-2 text-[11px] font-bold ' +
                  (done
                    ? 'border-amber-400 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-border bg-card text-muted-foreground')
                }
                title={t.label}
              >
                R{t.rank}
              </span>
            );
          })}
        </nav>

        {stations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Trilha ainda não populada. Aplique a migration{' '}
              <code className="font-mono text-xs">0027_trilha_stations.sql</code> no Supabase.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard">Voltar</Link>
            </Button>
          </div>
        ) : (
          <TrilhaMapRPG stations={stations} />
        )}
      </main>
    </div>
  );
}
