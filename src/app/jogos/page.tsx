import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { FOCUS_GATE_MINUTES, GAMES } from './_lib/games-config';

export const metadata = {
  title: 'Jogos — APROVA',
};

export const dynamic = 'force-dynamic';

const TZ = 'America/Fortaleza';

function fortalezaIsoDay(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
}

interface LeaderboardRow {
  username: string;
  display_name: string;
  best_score: number;
  position: number;
}

export default async function JogosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const day = fortalezaIsoDay();

  // Profile (para UserMenu/admin) + foco hoje + top5 de cada jogo em paralelo.
  const profilePromise = supabase
    .from('profiles')
    .select('display_name, username, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  const focusPromise = supabase
    .from('daily_focus_minutes')
    .select('minutes')
    .eq('user_id', user.id)
    .eq('day', day)
    .maybeSingle();

  const leaderboardPromises = GAMES.map((g) =>
    supabase
      .from('game_leaderboard')
      .select('username, display_name, best_score, position')
      .eq('game_id', g.id)
      .order('position', { ascending: true })
      .limit(5),
  );

  const [profileRes, focusRes, ...leaderboardResults] = await Promise.all([
    profilePromise,
    focusPromise,
    ...leaderboardPromises,
  ]);

  const profile = profileRes.data;
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';
  const focusMinutes = focusRes.data?.minutes ?? 0;
  const unlocked = focusMinutes >= FOCUS_GATE_MINUTES;
  const remaining = Math.max(0, FOCUS_GATE_MINUTES - focusMinutes);

  const leaderboardsByGame = new Map<string, LeaderboardRow[]>();
  GAMES.forEach((g, idx) => {
    const result = leaderboardResults[idx];
    leaderboardsByGame.set(g.id, (result?.data as LeaderboardRow[] | null) ?? []);
  });

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-primary/5">
      <header className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Jogos</h1>
          <p className="text-sm text-muted-foreground">
            10 mini-games pra descansar a mente sem sair do clima de estudo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-10">
        <nav aria-label="Navegação" className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/dashboard"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Início
          </Link>
          <Link
            href="/estatisticas"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Estatísticas
          </Link>
          <Link
            href="/ranking"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Ranking
          </Link>
        </nav>

        {!unlocked ? (
          <Card className="flex flex-col gap-3 border-warning/40 bg-warning-bg/40">
            <h2 className="text-base font-semibold text-warning">
              Estude {FOCUS_GATE_MINUTES} min hoje pra desbloquear
            </h2>
            <p className="text-sm text-foreground">
              Você focou {focusMinutes} min hoje. Faltam <strong>{remaining}</strong>{' '}
              {remaining === 1 ? 'minuto' : 'minutos'}. Que tal mais umas 10 questões?
            </p>
            <div>
              <Button asChild size="sm">
                <Link href="/quiz">Resolver questões</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div
            role="status"
            className="rounded-lg border border-success/40 bg-success-bg/40 px-4 py-3 text-sm text-success"
          >
            Você focou {focusMinutes} min hoje. Aproveita pra relaxar com um joguinho.
          </div>
        )}

        <section
          aria-label="Mini-games disponíveis"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {GAMES.map((game) => {
            const top = leaderboardsByGame.get(game.id) ?? [];
            return (
              <Card
                key={game.id}
                className={cn(
                  'flex flex-col gap-4 overflow-hidden p-0',
                  !unlocked && 'opacity-70',
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-3 bg-gradient-to-br p-4 text-white',
                    game.gradient,
                  )}
                >
                  <span aria-hidden className="text-3xl drop-shadow-sm">
                    {game.cover}
                  </span>
                  <div className="flex flex-col">
                    <h3 className="text-base font-semibold">{game.name}</h3>
                    <p className="text-xs opacity-90">{game.description}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Trophy className="h-3.5 w-3.5" aria-hidden /> Top 5
                    </span>
                    <Link
                      href={`/jogos/${game.id}/ranking`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      ver ranking
                    </Link>
                  </div>

                  {top.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Ainda sem pontuação. Seja o primeiro.
                    </p>
                  ) : (
                    <ol className="flex flex-col gap-1 text-xs">
                      {top.map((row) => (
                        <li
                          key={`${game.id}-${row.position}-${row.username}`}
                          className="flex items-center justify-between rounded px-2 py-1 hover:bg-muted/40"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 font-mono text-muted-foreground">
                              {row.position}.
                            </span>
                            <span className="font-medium text-foreground">
                              @{row.username}
                            </span>
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {row.best_score}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="pt-1">
                    {unlocked ? (
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/jogos/${game.id}`}>Jogar</Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        disabled
                        aria-disabled
                      >
                        Bloqueado
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
