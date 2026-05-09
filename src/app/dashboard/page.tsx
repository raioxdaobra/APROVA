import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Flame } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { RankBadge } from '@/components/rank-badge';
import { PomodoroRestModal } from '@/components/pomodoro-rest-modal';
import { HeroGreeting } from '@/components/dashboard/hero-greeting';
import { ContinueSessionCard } from '@/components/dashboard/continue-session-card';
import { StudyModeCards } from '@/components/dashboard/study-mode-cards';
import { MissionsCompact } from '@/components/dashboard/missions-compact';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard — APROVA',
};

export const dynamic = 'force-dynamic';

const TZ = 'America/Fortaleza';
const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

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
  const day = d.getUTCDay();
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
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username, daily_goal_questions, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle(),
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
      .select('questions_answered, xp')
      .eq('user_id', user.id)
      .eq('week_start', weekStartIso)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';
  const dailyGoal = profile?.daily_goal_questions ?? 20;
  const currentStreak = streakRes.data?.current_streak ?? 0;
  const longestStreak =
    (streakRes.data as { longest_streak?: number | null } | null)?.longest_streak ?? 0;
  const attemptsToday = attemptsTodayRes.count ?? 0;
  const attempts7d = attempts7dRes.data ?? [];
  const weeklyAnswered = weeklyXpRes.data?.questions_answered ?? 0;
  const weeklyXpVal = weeklyXpRes.data?.xp ?? 0;
  const weeklyGoal = dailyGoal * 7;

  const buckets = buildDailyBuckets(today, attempts7d);
  const maxBarValue = Math.max(dailyGoal, ...buckets.map((b) => b.count), 1);

  const weeklyDiff = weeklyAnswered - weeklyGoal;
  const weeklyPct = weeklyGoal > 0 ? Math.round((weeklyDiff / weeklyGoal) * 100) : 0;

  // Heurística pro contexto da frase motivacional
  const hadHigherStreak = currentStreak === 0 && longestStreak > 3;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-start justify-between gap-3 px-4 py-6">
        <HeroGreeting
          userId={user.id}
          displayName={displayName}
          streakDays={currentStreak}
          hadHigherStreak={hadHigherStreak}
          questionsToday={attemptsToday}
        />
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 pb-10">
        {/* Linha de chips: streak + rank + atividade hoje */}
        <div className="flex flex-wrap items-center gap-2">
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
          <RankBadge xp={weeklyXpVal} />
          <span className="text-xs text-muted-foreground">
            {attemptsToday > 0
              ? `Hoje: ${attemptsToday} ${attemptsToday === 1 ? 'questão' : 'questões'}`
              : 'Hoje você ainda não estudou'}
          </span>
        </div>

        {/* Continuar de onde parou — condicional: só aparece se houver sessão aberta < 24h */}
        <ContinueSessionCard userId={user.id} />

        {/* 4 cards grandes coloridos — modos de estudo principais */}
        <StudyModeCards userId={user.id} />

        {/* Missões em linha compacta */}
        <MissionsCompact />

        {/* Progresso semanal — gráfico (mantido) */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-base">Progresso da semana</CardTitle>
            <span className="text-xs text-muted-foreground">
              {weeklyAnswered} / {weeklyGoal}
            </span>
          </div>
          <div
            className="relative h-32"
            aria-label="Questões resolvidas por dia nos últimos 7 dias"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-dashed border-primary/60"
              style={{ top: `${100 - (dailyGoal / maxBarValue) * 100}%` }}
            />
            <div className="flex h-full items-end gap-2">
              {buckets.map((b) => {
                const heightPct = Math.max(
                  (b.count / maxBarValue) * 100,
                  b.count > 0 ? 4 : 0,
                );
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

      <PomodoroRestModal />
    </div>
  );
}
