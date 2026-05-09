/**
 * Top bar stats — chips compactos com 🔥 streak + ⭐ XP da semana, sempre
 * visíveis no topo do /dashboard.
 *
 * Inspiração: respostaCerta. Usa as mesmas tabelas de gamificação que já
 * temos (streaks, weekly_xp). Server component pra renderizar SSR junto
 * com o resto do dashboard, sem layout shift.
 */
import { Flame, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const TZ = 'America/Fortaleza';

function fortalezaToday(): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.format(new Date()).split('-').map(Number);
  return new Date(Date.UTC(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1));
}

function startOfWeekIso(): string {
  const today = fortalezaToday();
  const day = today.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  today.setUTCDate(today.getUTCDate() + offset);
  return today.toISOString().slice(0, 10);
}

export async function TopBarStats({ userId }: { userId: string }) {
  const supabase = await createClient();
  const weekStart = startOfWeekIso();

  const [streakRes, weeklyXpRes] = await Promise.all([
    supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('weekly_xp')
      .select('xp')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle(),
  ]);

  const streak = streakRes.data?.current_streak ?? 0;
  const xp = weeklyXpRes.data?.xp ?? 0;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Streak — laranja sempre que > 0; cinza se 0 (incentivo a começar) */}
      <span
        className={
          streak > 0
            ? 'inline-flex items-center gap-1.5 text-sm font-semibold text-warning'
            : 'inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground'
        }
        aria-label={
          streak > 0
            ? `${streak} ${streak === 1 ? 'dia' : 'dias'} de streak`
            : 'Sem streak ativa'
        }
      >
        <Flame className="h-4 w-4" aria-hidden="true" />
        <span className="tabular-nums">{streak}</span>
      </span>

      {/* XP semanal — primário sempre que > 0 */}
      <span
        className={
          xp > 0
            ? 'inline-flex items-center gap-1.5 text-sm font-semibold text-primary'
            : 'inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground'
        }
        aria-label={`${xp} XP esta semana`}
      >
        <Star className="h-4 w-4" aria-hidden="true" />
        <span className="tabular-nums">{xp}</span>
      </span>
    </div>
  );
}
