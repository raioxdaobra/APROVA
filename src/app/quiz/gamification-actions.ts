'use server';

/**
 * Server actions de gamificação invocadas pelo quiz-runner após o submit
 * de um attempt. Encapsula:
 *  - evaluateAfterAttempt → retorna badges desbloqueados nesta call
 *  - updateOnAttempt (missions) → atualiza progresso das missões
 *  - leitura do XP semanal cumulativo (para ranks)
 *
 * Toda a fronteira aqui é fail-soft: erros viram resposta neutra para
 * que o fluxo do quiz nunca quebre.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { evaluateAfterAttempt, type UnlockedBadge } from '@/lib/achievements/check';
import { updateOnAttempt, type AttemptForMission } from '@/lib/missions/progress';

export interface AfterAttemptInput {
  question_id: string;
  is_correct: boolean | null;
  discipline?: string | null;
}

export interface AfterAttemptResult {
  badges: UnlockedBadge[];
  weeklyXp: number;
  missionsCompleted: number;
}

const TZ = 'America/Fortaleza';

function fortalezaWeekStartIso(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const isoDay = fmt.format(new Date());
  const [y, m, d] = isoDay.split('-').map(Number);
  if (!y || !m || !d) return isoDay;
  const utc = new Date(Date.UTC(y, m - 1, d));
  const dow = utc.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  utc.setUTCDate(utc.getUTCDate() + offset);
  return utc.toISOString().slice(0, 10);
}

export async function evaluateAfterAttemptAction(
  input: AfterAttemptInput,
): Promise<AfterAttemptResult> {
  const empty: AfterAttemptResult = { badges: [], weeklyXp: 0, missionsCompleted: 0 };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const untyped = supabase as unknown as SupabaseClient;

    // 1) Avalia badges
    const badges = await evaluateAfterAttempt(untyped, user.id);

    // 2) Atualiza missões
    const attempt: AttemptForMission = {
      is_correct: input.is_correct,
      discipline: input.discipline ?? null,
    };
    let missionsCompleted = 0;
    try {
      const r = await updateOnAttempt(untyped, user.id, attempt);
      missionsCompleted = r.completedNow.length;
    } catch {
      missionsCompleted = 0;
    }

    // 3) Lê XP semanal (para o cliente decidir se subiu de rank)
    let weeklyXp = 0;
    try {
      const week = fortalezaWeekStartIso();
      const { data } = await supabase
        .from('weekly_xp')
        .select('xp')
        .eq('user_id', user.id)
        .eq('week_start', week)
        .maybeSingle();
      const row = (data as { xp: number | null } | null) ?? null;
      weeklyXp = row?.xp ?? 0;
    } catch {
      weeklyXp = 0;
    }

    return { badges, weeklyXp, missionsCompleted };
  } catch {
    return empty;
  }
}
