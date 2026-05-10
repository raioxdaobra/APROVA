import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { ResetCountdown } from './_components/countdown';
import { PublicLeaderboardToggle } from './_components/public-toggle';

export const metadata = {
  title: 'Ranking — APROVA',
};

export const dynamic = 'force-dynamic';

const FORTALEZA_TZ = 'America/Fortaleza';

function weekStartInFortaleza(iso: string): string {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: FORTALEZA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = fmt.formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const offset = map[weekday] ?? 0;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

/**
 * Próxima segunda-feira 00:00 em America/Fortaleza, retornado como ISO UTC.
 */
function nextMondayMidnightFortalezaIso(): string {
  const currentWeekStart = weekStartInFortaleza(new Date().toISOString());
  const nextMonday = new Date(`${currentWeekStart}T00:00:00Z`);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  // currentWeekStart é a segunda corrente em horário local de Fortaleza, mas a string
  // foi serializada com sufixo Z. Para corrigir, somamos o offset de Fortaleza (UTC-3).
  // America/Fortaleza não observa horário de verão, sempre UTC-3.
  return new Date(nextMonday.getTime() + 3 * 60 * 60 * 1000).toISOString();
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Codinomes animais pra anonimizar usuarios no ranking. User pediu pra
 * nao identificar concorrentes — pontuacoes ficam visiveis (compete
 * funciona) mas sem expor quem e quem.
 *
 * 30 animais brasileiros/universais associados a virtudes de estudo
 * (foco, resistencia, esperteza, paciencia). Alfa mantida estavel via
 * hash determinístico do username — mesmo user sempre vê mesmo codinome.
 */
const CODINOMES_ANIMAIS = [
  'Águia',
  'Falcão',
  'Coruja',
  'Tigre',
  'Leão',
  'Pantera',
  'Lobo',
  'Lince',
  'Tubarão',
  'Orca',
  'Cervo',
  'Raposa',
  'Elefante',
  'Tartaruga',
  'Beija-flor',
  'Touro',
  'Urso',
  'Onça',
  'Capivara',
  'Tatu',
  'Jaguar',
  'Tucano',
  'Boto',
  'Polvo',
  'Pinguim',
  'Golfinho',
  'Pavão',
  'Camaleão',
  'Andorinha',
  'Falcão-peregrino',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function codinomeFor(username: string): string {
  const idx = hashString(username) % CODINOMES_ANIMAIS.length;
  return CODINOMES_ANIMAIS[idx] ?? 'Vestibulando';
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

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const currentWeekStart = weekStartInFortaleza(new Date().toISOString());

  const [{ data: profile }, { data: top50 }, { data: myRow }] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, is_public_in_leaderboard, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('weekly_leaderboard')
      .select('username, display_name, position, xp, questions_answered, week_start')
      .eq('week_start', currentWeekStart)
      .order('position', { ascending: true })
      .limit(50),
    supabase
      .from('weekly_xp')
      .select('xp, questions_answered')
      .eq('user_id', user.id)
      .eq('week_start', currentWeekStart)
      .maybeSingle(),
  ]);

  const username = profile?.username ?? '';
  const displayName = profile?.display_name ?? username ?? 'estudante';
  const isPublic = profile?.is_public_in_leaderboard === true;

  const top50Rows = top50 ?? [];
  const userInTop50 = top50Rows.some((r) => r.username === username);

  // Posição do usuário (se público e fora do top 50, descobrir paginando)
  let myPosition: number | null = null;
  if (isPublic && !userInTop50 && (myRow?.xp ?? 0) > 0) {
    const { data: myLeaderboardRow } = await supabase
      .from('weekly_leaderboard')
      .select('position')
      .eq('week_start', currentWeekStart)
      .eq('username', username)
      .maybeSingle();
    if (myLeaderboardRow?.position) {
      myPosition = myLeaderboardRow.position;
    }
  }

  const resetIso = nextMondayMidnightFortalezaIso();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Ranking de Fortaleza
          </h1>
          <p className="text-sm text-muted-foreground">esta semana · top 50</p>
          <ResetCountdown targetIso={resetIso} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-10">
        <nav aria-label="Atalhos" className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/estatisticas"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Minhas estatísticas
          </Link>
        </nav>

        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <PublicLeaderboardToggle initial={isPublic} />
          <span className="text-xs text-muted-foreground">
            Sempre como <span className="font-mono">{username || 'seu_username'}</span>
          </span>
        </Card>

        {!isPublic && (
          <div
            role="status"
            className="rounded-lg border border-border bg-warning-bg px-4 py-3 text-sm text-warning"
          >
            Você está com perfil oculto. Ative no toggle acima para aparecer.
          </div>
        )}

        {/* Card "Você" — sempre renderizado, mostra o usuario no topo
            independente de status (publico/privado, com/sem XP, no/fora
            top 50). User pediu pra pessoa SEMPRE se enxergar no ranking
            com o proprio nome. Os 4 estados:
              1. Esta no top 50 publico → so destaca a linha na tabela
                 (este card NAO renderiza pra evitar duplicidade)
              2. Publico + fora top 50 + tem XP → mostra posicao real #N
              3. Privado + tem XP → mostra XP + aviso "outros nao veem"
              4. Sem XP esta semana → CTA "comece a resolver" */}
        {!userInTop50 && (
          <Card className="border-l-4 border-l-primary p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
                {(displayName[0] ?? '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Você — {displayName}
                </p>
                {(myRow?.xp ?? 0) > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {isPublic && myPosition
                      ? `Posição #${myPosition} · `
                      : isPublic
                        ? 'Calculando posição… · '
                        : 'Perfil oculto pra outros · '}
                    {formatNumber(myRow?.questions_answered ?? 0)}{' '}
                    {(myRow?.questions_answered ?? 0) === 1 ? 'questão' : 'questões'}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Você ainda não pontuou esta semana — resolva questões pra
                    entrar no ranking
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className="text-xl font-bold tabular-nums text-primary"
                  aria-label={`${myRow?.xp ?? 0} XP`}
                >
                  {formatNumber(myRow?.xp ?? 0)}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  XP
                </p>
              </div>
            </div>
          </Card>
        )}

        {top50Rows.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ninguém pontuou esta semana ainda. Resolva questões para entrar no
              ranking.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-16 px-4 py-2 font-semibold">Pos.</th>
                  <th className="px-4 py-2 font-semibold">Estudante</th>
                  <th className="w-24 px-4 py-2 text-right font-semibold">XP</th>
                  <th className="hidden w-28 px-4 py-2 text-right font-semibold sm:table-cell">
                    Questões
                  </th>
                </tr>
              </thead>
              <tbody>
                {top50Rows.map((row) => {
                  const isMe = row.username === username;
                  // Anonimiza concorrentes via codinome animal estavel.
                  // Self continua vendo o proprio nome + badge "você".
                  const displayLabel = isMe
                    ? row.display_name
                    : codinomeFor(row.username);
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
                        {displayLabel}
                        {isMe ? (
                          <span className="ml-2 text-xs font-normal text-primary">
                            você
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                        {formatNumber(row.xp ?? 0)}
                      </td>
                      <td className="hidden px-4 py-2.5 text-right tabular-nums text-muted-foreground sm:table-cell">
                        {formatNumber(row.questions_answered ?? 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        <BackButton fallbackHref="/dashboard" className="self-start" />
      </main>
    </div>
  );
}
