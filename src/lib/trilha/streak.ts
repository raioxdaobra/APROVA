/**
 * PR 27 — Helpers de streak da trilha.
 *
 * O DB faz o "bump" de fato; aqui fornecemos:
 *   - tipo TrilhaStreakInfo (snapshot lido do profiles)
 *   - cálculo do multiplier de XP a partir do streak
 *   - chamada do RPC `bump_trilha_streak`
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TrilhaStreakInfo {
  streakDays: number;
  lastActive: string | null;
}

export type TrilhaStreakMultiplier = 1.0 | 1.25 | 1.5;

/** Multiplier de XP em função do streak. */
export function streakMultiplier(streakDays: number): TrilhaStreakMultiplier {
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.25;
  return 1.0;
}

/** Label curto pra exibir no badge / tooltip. */
export function streakBadgeLabel(streakDays: number): string {
  if (streakDays <= 0) return 'Sem streak';
  return `${streakDays} dia${streakDays > 1 ? 's' : ''} seguido${streakDays > 1 ? 's' : ''}`;
}

/** Texto de tooltip explicando os tiers. */
export const STREAK_TOOLTIP =
  'Faça pelo menos 1 estação por dia. 3 dias seguidos = 1.25x XP, 7+ dias = 1.5x XP.';

/** Bump streak via RPC. Retorna o novo streak; em caso de erro, retorna 0. */
export async function bumpTrilhaStreak(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('bump_trilha_streak', {
    p_user_id: userId,
  });
  if (error) {
    console.error('[trilha/streak] bump failed', error);
    return 0;
  }
  if (typeof data === 'number') return data;
  return 0;
}

/** Lê snapshot atual do profile. */
export async function getTrilhaStreakInfo(
  supabase: SupabaseClient,
  userId: string,
): Promise<TrilhaStreakInfo> {
  const { data } = await (supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (
          col: string,
          val: string,
        ) => {
          maybeSingle: () => Promise<{
            data: { trilha_streak_days: number | null; trilha_last_active: string | null } | null;
          }>;
        };
      };
    };
  })
    .from('profiles')
    .select('trilha_streak_days, trilha_last_active')
    .eq('id', userId)
    .maybeSingle();

  return {
    streakDays: data?.trilha_streak_days ?? 0,
    lastActive: data?.trilha_last_active ?? null,
  };
}
