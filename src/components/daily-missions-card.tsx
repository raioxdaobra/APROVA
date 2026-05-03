/**
 * Card de missões diárias. Server Component que carrega/gera as 3 missões
 * para o user atual e renderiza progresso por barra. Botão "Recompensa
 * disponível" aparece quando completed && !claimed (claim é gerenciado
 * via server action / migration A — futuro).
 *
 * Se o user não estiver autenticado, retorna null.
 */

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export async function DailyMissionsCard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const day = fortalezaIsoDay();
  // Cast para tipo mais permissivo já que tabelas são criadas pela worktree A.
  const { missions } = await generateForUser(
    supabase as unknown as Parameters<typeof generateForUser>[0],
    user.id,
    day,
  );

  if (missions.length === 0) return null;

  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <CardTitle className="text-base">Missões diárias</CardTitle>
        <span className="text-xs text-muted-foreground">
          {completedCount} / {missions.length}
        </span>
      </div>
      <CardDescription>Reseta às 00h (Fortaleza). XP extra a cada concluída.</CardDescription>
      <ul className="flex flex-col gap-3">
        {missions.map((m) => {
          const pct = progressPct(m);
          return (
            <li key={m.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{m.label}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.min(m.progress, m.goal)} / {m.goal}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={
                    m.completed
                      ? 'h-full rounded-full bg-success transition-[width] duration-500'
                      : 'h-full rounded-full bg-primary transition-[width] duration-500'
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">+{m.xpReward} XP</span>
                {m.completed && !m.claimed ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    disabled
                  >
                    Recompensa creditada
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
