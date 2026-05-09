/**
 * Versão compacta das missões diárias — linha por missão sem cards individuais.
 * Mais discreta que `<DailyMissionsCard>`. Reusa `generateForUser`.
 */
import { createClient } from '@/lib/supabase/server';
import { generateForUser, type MissionState } from '@/lib/missions/generator';

const TZ = 'America/Fortaleza';

function fortalezaIsoDay(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function progressPct(m: MissionState): number {
  if (m.goal <= 0) return 0;
  return Math.min(100, Math.round((m.progress / m.goal) * 100));
}

export async function MissionsCompact() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const day = fortalezaIsoDay();
  const { missions } = await generateForUser(
    supabase as unknown as Parameters<typeof generateForUser>[0],
    user.id,
    day,
  );
  if (missions.length === 0) return null;

  const completedCount = missions.filter((m) => m.completed).length;
  const totalXp = missions.reduce((acc, m) => acc + (m.xpReward ?? 0), 0);
  const allDone = completedCount === missions.length;

  return (
    <section
      aria-labelledby="missions-compact-title"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="missions-compact-title"
          className="text-sm font-semibold text-foreground"
        >
          Missões hoje{' '}
          <span className="font-normal text-muted-foreground">
            · {completedCount} de {missions.length}
          </span>
        </h2>
        {!allDone ? (
          <span className="text-xs font-medium text-primary">+{totalXp} XP no total</span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success">
            ✓ Tudo feito hoje
          </span>
        )}
      </div>

      {!allDone ? (
        <ul className="flex flex-col gap-2">
          {missions.map((m) => {
            const pct = progressPct(m);
            return (
              <li key={m.id ?? m.label} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span
                    className={
                      m.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }
                  >
                    {m.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {m.progress}/{m.goal}
                    <span className="ml-1.5 font-medium text-primary/70">+{m.xpReward ?? 0}XP</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Volte amanhã às 00h pras próximas. Aproveita pra fazer revisão livre!
        </p>
      )}
    </section>
  );
}
