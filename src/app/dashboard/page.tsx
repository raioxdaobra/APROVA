import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard — APROVA',
};

export const dynamic = 'force-dynamic';

const TZ = 'America/Fortaleza';
const DAY_MS = 86_400_000;
const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Retorna a data atual (ano-mes-dia) no fuso de Fortaleza, alinhada à DB
// (aprova_today). Convertemos a partir do UTC para nao depender do TZ do node.
function fortalezaToday(): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.format(new Date()).split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(Date.UTC(y, m - 1, d));
}

function startOfWeek(d: Date): Date {
  // Postgres date_trunc('week', x) usa segunda-feira como inicio.
  const day = d.getUTCDay(); // 0=Dom, 1=Seg, ... 6=Sab
  const offset = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + offset);
  r.setUTCHours(0, 0, 0, 0);
  return r;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface DayBucket {
  iso: string;
  label: string;
  count: number;
}

function buildDailyBuckets(today: Date, attempts: Array<{ created_at: string | null }>): DayBucket[] {
  const buckets = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(isoDate(d), 0);
  }
  for (const a of attempts) {
    if (!a.created_at) continue;
    // Reduz para o dia local (Fortaleza) para alinhar com aprova_today()
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const iso = fmt.format(new Date(a.created_at));
    if (buckets.has(iso)) {
      buckets.set(iso, (buckets.get(iso) ?? 0) + 1);
    }
  }
  return Array.from(buckets.entries()).map(([iso, count], idx) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (6 - idx));
    const label = WEEK_LABELS[(d.getUTCDay() + 6) % 7] ?? '';
    return { iso, label, count };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const today = fortalezaToday();
  const weekStart = startOfWeek(today);
  const weekStartIso = isoDate(weekStart);
  const todayIso = isoDate(today);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  const sevenDaysAgoIso = isoDate(sevenDaysAgo);

  const [
    profileRes,
    streakRes,
    attemptsTodayRes,
    attempts7dRes,
    weeklyXpRes,
    lastAttemptRes,
    pendingWrongsRes,
    leaderboardRes,
    userPosRes,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username, daily_goal_questions')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('context', 'diagnostic')
      .gte('created_at', `${todayIso}T00:00:00-03:00`),
    supabase
      .from('attempts')
      .select('created_at')
      .eq('user_id', user.id)
      .neq('context', 'diagnostic')
      .gte('created_at', `${sevenDaysAgoIso}T00:00:00-03:00`),
    supabase
      .from('weekly_xp')
      .select('questions_answered')
      .eq('user_id', user.id)
      .eq('week_start', weekStartIso)
      .maybeSingle(),
    supabase
      .from('attempts')
      .select('session_id, context, created_at')
      .eq('user_id', user.id)
      .neq('context', 'diagnostic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('user_question_status')
      .select('question_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'wrong'),
    supabase
      .from('weekly_leaderboard')
      .select('username, display_name, xp, questions_answered, position')
      .eq('week_start', weekStartIso)
      .order('position', { ascending: true })
      .limit(5),
    supabase
      .from('weekly_leaderboard')
      .select('username, display_name, xp, questions_answered, position')
      .eq('week_start', weekStartIso)
      .eq('username', '__placeholder__')
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';
  const username = profile?.username ?? '';
  const dailyGoal = profile?.daily_goal_questions ?? 20;
  const currentStreak = streakRes.data?.current_streak ?? 0;
  const attemptsToday = attemptsTodayRes.count ?? 0;
  const attempts7d = attempts7dRes.data ?? [];
  const weeklyAnswered = weeklyXpRes.data?.questions_answered ?? 0;
  const weeklyGoal = dailyGoal * 7;
  const pendingWrongs = pendingWrongsRes.count ?? 0;

  // Posicao do usuario no ranking — buscamos manualmente porque a view aplica
  // RLS apenas para perfis publicos; usuarios ocultos nao aparecem na view.
  let myPosition: number | null = null;
  let myWeeklyXp: number | null = null;
  if (username) {
    const { data: myRow } = await supabase
      .from('weekly_leaderboard')
      .select('position, xp')
      .eq('week_start', weekStartIso)
      .eq('username', username)
      .maybeSingle();
    myPosition = myRow?.position ?? null;
    myWeeklyXp = myRow?.xp ?? null;
  }
  // userPosRes serve apenas como fallback / typecheck; ignoramos.
  void userPosRes;

  const buckets = buildDailyBuckets(today, attempts7d);
  const maxBarValue = Math.max(dailyGoal, ...buckets.map((b) => b.count), 1);

  // CTA principal — sessao recente nas ultimas 24h.
  const lastAttempt = lastAttemptRes.data;
  let primaryCta: { label: string; href: string };
  if (
    lastAttempt &&
    lastAttempt.session_id &&
    lastAttempt.created_at &&
    Date.now() - new Date(lastAttempt.created_at).getTime() < 24 * 60 * 60 * 1000
  ) {
    const ctx = lastAttempt.context;
    const sid = lastAttempt.session_id;
    const href =
      ctx === 'simulado'
        ? `/simulado/sessao/${sid}`
        : ctx === 'revisao' || ctx === 'review'
          ? `/quiz/sessao/${sid}?modo=revisao`
          : `/quiz/sessao/${sid}`;
    primaryCta = { label: 'Continuar de onde parou', href };
  } else {
    primaryCta = { label: 'Começar a estudar', href: '/quiz' };
  }

  // Comparacao com meta semanal
  const weeklyDiff = weeklyAnswered - weeklyGoal;
  const weeklyPct = weeklyGoal > 0 ? Math.round((weeklyDiff / weeklyGoal) * 100) : 0;

  const leaderboard = leaderboardRes.data ?? [];
  const userInTop5 = leaderboard.some((row) => row.username === username);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Olá, {displayName}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {currentStreak > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                {currentStreak} {currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Comece sua sequência hoje
              </span>
            )}
            <p className="text-sm text-muted-foreground">
              {attemptsToday > 0
                ? `Hoje você já fez ${attemptsToday} ${attemptsToday === 1 ? 'questão' : 'questões'}`
                : 'Hoje você ainda não estudou'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-10">
        <Button asChild size="lg" className="w-full">
          <Link href={primaryCta.href}>{primaryCta.label}</Link>
        </Button>

        <section aria-label="Modos de estudo" className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            <Card className="flex min-w-[14rem] shrink-0 flex-col gap-2 sm:min-w-0">
              <CardTitle className="text-base">Quiz por disciplina</CardTitle>
              <CardDescription>Escolha a matéria e treine focado.</CardDescription>
              <Button asChild variant="secondary" size="sm" className="mt-2">
                <Link href="/quiz?modo=disciplina">Começar</Link>
              </Button>
            </Card>
            <Card className="flex min-w-[14rem] shrink-0 flex-col gap-2 sm:min-w-0">
              <CardTitle className="text-base">Simulado completo</CardTitle>
              <CardDescription>Cronômetro, formato real, bônus por tempo.</CardDescription>
              <Button asChild variant="secondary" size="sm" className="mt-2">
                <Link href="/simulado">Iniciar</Link>
              </Button>
            </Card>
            <Card className="flex min-w-[14rem] shrink-0 flex-col gap-2 sm:min-w-0">
              <CardTitle className="text-base">Revisar erros</CardTitle>
              <CardDescription>
                {pendingWrongs > 0
                  ? `${pendingWrongs} ${pendingWrongs === 1 ? 'questão' : 'questões'} para revisar`
                  : 'Nada pendente. Continue estudando.'}
              </CardDescription>
              <Button asChild variant="secondary" size="sm" className="mt-2">
                <Link href="/quiz?status=wrong">Revisar</Link>
              </Button>
            </Card>
          </div>
        </section>

        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-base">Progresso da semana</CardTitle>
            <span className="text-xs text-muted-foreground">
              {weeklyAnswered} / {weeklyGoal}
            </span>
          </div>
          <div className="relative h-32" aria-label="Questões resolvidas por dia nos últimos 7 dias">
            {/* Linha tracejada da meta diaria */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-dashed border-primary/60"
              style={{ top: `${100 - (dailyGoal / maxBarValue) * 100}%` }}
            />
            <div className="flex h-full items-end gap-2">
              {buckets.map((b) => {
                const heightPct = Math.max((b.count / maxBarValue) * 100, b.count > 0 ? 4 : 0);
                return (
                  <div key={b.iso} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t bg-primary transition-all"
                        style={{ height: `${heightPct}%` }}
                        aria-label={`${b.label}: ${b.count} ${b.count === 1 ? 'questão' : 'questões'}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className={weeklyDiff >= 0 ? 'text-sm text-success' : 'text-sm text-foreground'}>
            {weeklyDiff >= 0
              ? `Você está ${weeklyPct}% acima da sua meta semanal.`
              : `Faltam ${-weeklyDiff} ${-weeklyDiff === 1 ? 'questão' : 'questões'} pra bater sua meta semanal.`}
          </p>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-base">Ranking semanal</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/ranking">Ver ranking completo</Link>
            </Button>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda sem ranking nesta semana.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {leaderboard.map((row) => {
                const isMe = row.username === username;
                return (
                  <li
                    key={row.username}
                    className={
                      isMe
                        ? 'flex items-center justify-between rounded border border-primary/40 bg-primary-light px-3 py-2 text-sm'
                        : 'flex items-center justify-between rounded px-3 py-2 text-sm'
                    }
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 font-mono text-xs text-muted-foreground">
                        {row.position}.
                      </span>
                      <span className="font-medium text-foreground">@{row.username}</span>
                      {isMe && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                          você
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.xp ?? 0} XP
                    </span>
                  </li>
                );
              })}
              {!userInTop5 && myPosition !== null && (
                <li className="mt-1 flex items-center justify-between rounded border border-primary/40 bg-primary-light px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-6 font-mono text-xs text-muted-foreground">
                      {myPosition}.
                    </span>
                    <span className="font-medium text-foreground">@{username}</span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                      você
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {myWeeklyXp ?? 0} XP
                  </span>
                </li>
              )}
            </ol>
          )}
        </Card>
      </main>

      <footer className="mx-auto flex w-full max-w-2xl items-center justify-center gap-4 px-4 pb-6 text-xs text-muted-foreground">
        <Link href="/sobre" className="hover:underline">
          Sobre
        </Link>
        <Link href="/privacidade" className="hover:underline">
          Privacidade
        </Link>
        <Link href="/termos" className="hover:underline">
          Termos
        </Link>
      </footer>
    </div>
  );
}
