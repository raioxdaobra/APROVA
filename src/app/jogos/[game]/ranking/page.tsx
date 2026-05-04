import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { GAMES, getGameMeta } from '../../_lib/games-config';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { game: string };
}

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const meta = getGameMeta(params.game);
  return {
    title: meta ? `Ranking ${meta.name} — APROVA` : 'Ranking — APROVA',
  };
}

function PositionCell({ position }: { position: number }) {
  if (position <= 3) {
    const colors: Record<number, string> = {
      1: 'text-warning',
      2: 'text-muted-foreground',
      3: 'text-primary',
    };
    return (
      <span className={cn('inline-flex items-center gap-1.5 font-semibold', colors[position])}>
        <Trophy className="h-4 w-4" aria-hidden />
        <span className="tabular-nums">#{position}</span>
      </span>
    );
  }
  return <span className="tabular-nums text-muted-foreground">#{position}</span>;
}

export default async function GameRankingPage({ params }: PageProps) {
  const meta = getGameMeta(params.game);
  if (!meta) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const [{ data: profile }, { data: top50 }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('game_leaderboard')
      .select('username, display_name, best_score, plays, position')
      .eq('game_id', meta.id)
      .order('position', { ascending: true })
      .limit(50),
  ]);

  const username = profile?.username ?? '';
  const displayName = profile?.display_name ?? username ?? 'estudante';
  const top50Rows = top50 ?? [];
  const userInTop50 = top50Rows.some((r) => r.username === username);

  // Posição do user fora do top 50 — busca direta na view.
  let myPosition: number | null = null;
  let myBest: number | null = null;
  if (username && !userInTop50) {
    const { data: myRow } = await supabase
      .from('game_leaderboard')
      .select('position, best_score')
      .eq('game_id', meta.id)
      .eq('username', username)
      .maybeSingle();
    if (myRow?.position) {
      myPosition = myRow.position;
      myBest = myRow.best_score ?? null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Ranking — {meta.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Top 50 melhores pontuações de todos os tempos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-10">
        <nav aria-label="Navegação" className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/jogos"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Voltar pro lobby
          </Link>
          <Link
            href={`/jogos/${meta.id}`}
            className="rounded border border-primary/40 bg-primary-light px-3 py-1.5 text-primary hover:bg-primary-light/80"
          >
            Jogar agora
          </Link>
        </nav>

        {top50Rows.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ninguém pontuou em {meta.name} ainda. Seja o primeiro.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            {!userInTop50 && myPosition !== null && username && (
              <div
                className={cn(
                  'sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-3 backdrop-blur',
                  'border-l-2 border-l-primary',
                )}
              >
                <span className="w-12 text-sm font-semibold tabular-nums text-foreground">
                  #{myPosition}
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">
                  Você — {displayName}
                </span>
                <span className="w-20 text-right text-sm tabular-nums text-foreground">
                  {myBest ?? 0}
                </span>
              </div>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-16 px-4 py-2 font-semibold">Pos.</th>
                  <th className="px-4 py-2 font-semibold">Estudante</th>
                  <th className="w-24 px-4 py-2 text-right font-semibold">Score</th>
                  <th className="hidden w-24 px-4 py-2 text-right font-semibold sm:table-cell">
                    Partidas
                  </th>
                </tr>
              </thead>
              <tbody>
                {top50Rows.map((row) => {
                  const isMe = row.username === username;
                  return (
                    <tr
                      key={`${row.username}-${row.position}`}
                      className={cn(
                        'border-b border-border last:border-0',
                        isMe && 'border-l-2 border-l-primary bg-primary/5',
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <PositionCell position={row.position} />
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {row.display_name}
                        {isMe ? (
                          <span className="ml-2 text-xs font-normal text-primary">
                            você
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                        {row.best_score}
                      </td>
                      <td className="hidden px-4 py-2.5 text-right tabular-nums text-muted-foreground sm:table-cell">
                        {row.plays}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
