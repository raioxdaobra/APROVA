/**
 * Atualização de progresso das missões diárias após cada attempt.
 *
 * Para cada missão ativa do dia, recalcula o progresso considerando:
 *  - questions_total: incrementa em 1
 *  - questions_discipline: incrementa em 1 se discipline bate
 *  - streak_consecutive: incrementa apenas se acerto na discipline; reseta se erro
 *  - simulado_finished: tratado pelo flow de simulado (não aqui)
 *  - subtopic_mastery: tratado por trigger DB / out-of-scope desta função
 *  - focus_minutes: tratado pelo timer pomodoro (worktree D)
 *
 * Quando uma missão atinge `goal`, marca `completed=true` e concede XP via
 * upsert em `weekly_xp` (incrementando o XP da semana atual).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MissionState } from './generator';

type UntypedClient = SupabaseClient;

const TZ = 'America/Fortaleza';

export interface AttemptForMission {
  is_correct: boolean | null;
  discipline: string | null;
}

function fortalezaIsoDay(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
}

function fortalezaWeekStartIso(d = new Date()): string {
  const dayIso = fortalezaIsoDay(d);
  const [y, m, day] = dayIso.split('-').map(Number);
  if (!y || !m || !day) return dayIso;
  const utc = new Date(Date.UTC(y, m - 1, day));
  // segunda-feira como início da semana (alinhado com Postgres date_trunc('week', ..))
  const dow = utc.getUTCDay(); // 0=Dom..6=Sab
  const offset = dow === 0 ? -6 : 1 - dow;
  utc.setUTCDate(utc.getUTCDate() + offset);
  return utc.toISOString().slice(0, 10);
}

function applyDelta(m: MissionState, attempt: AttemptForMission): MissionState {
  if (m.completed) return m;
  switch (m.goalType) {
    case 'questions_total': {
      const progress = Math.min(m.goal, m.progress + 1);
      return { ...m, progress, completed: progress >= m.goal };
    }
    case 'questions_discipline': {
      if (attempt.discipline && m.discipline === attempt.discipline) {
        const progress = Math.min(m.goal, m.progress + 1);
        return { ...m, progress, completed: progress >= m.goal };
      }
      return m;
    }
    case 'streak_consecutive': {
      if (attempt.discipline === m.discipline) {
        if (attempt.is_correct === true) {
          const progress = Math.min(m.goal, m.progress + 1);
          return { ...m, progress, completed: progress >= m.goal };
        }
        // erro reseta sequência
        return { ...m, progress: 0 };
      }
      return m;
    }
    default:
      return m;
  }
}

export async function updateOnAttempt(
  supabase: UntypedClient,
  userId: string,
  attempt: AttemptForMission,
): Promise<{ completedNow: MissionState[] }> {
  const day = fortalezaIsoDay();

  let row: { missions: unknown } | null = null;
  try {
    const r = await supabase
      .from('daily_missions')
      .select('missions')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    row = (r.data as { missions: unknown } | null) ?? null;
  } catch {
    return { completedNow: [] };
  }
  if (!row || !Array.isArray(row.missions)) return { completedNow: [] };

  const before = row.missions as MissionState[];
  const after = before.map((m) => applyDelta(m, attempt));

  // Detecta o que ficou completed agora
  const completedNow: MissionState[] = [];
  for (let i = 0; i < before.length; i++) {
    const b = before[i]!;
    const a = after[i]!;
    if (!b.completed && a.completed) completedNow.push(a);
  }

  // Persiste estado novo
  try {
    await supabase
      .from('daily_missions')
      .update({ missions: after })
      .eq('user_id', userId)
      .eq('day', day);
  } catch {
    return { completedNow: [] };
  }

  // Para cada mission concluída, incrementa weekly_xp
  if (completedNow.length > 0) {
    const week = fortalezaWeekStartIso();
    const totalReward = completedNow.reduce((s, m) => s + (m.xpReward ?? 0), 0);
    if (totalReward > 0) {
      try {
        const { data: existing } = await supabase
          .from('weekly_xp')
          .select('xp, questions_answered')
          .eq('user_id', userId)
          .eq('week_start', week)
          .maybeSingle();
        const existingRow =
          (existing as { xp: number | null; questions_answered: number | null } | null) ?? null;
        const nextXp = (existingRow?.xp ?? 0) + totalReward;
        await supabase
          .from('weekly_xp')
          .upsert(
            {
              user_id: userId,
              week_start: week,
              xp: nextXp,
              questions_answered: existingRow?.questions_answered ?? 0,
            },
            { onConflict: 'user_id,week_start' },
          );
      } catch {
        /* noop — graceful */
      }
    }
  }

  return { completedNow };
}
