/**
 * PR 27 — Caminhos paralelos personalizáveis.
 *
 * Helpers para ler/escrever a ordem dos ranks 2-5 customizada por user.
 * Ranks 1, 6, 7, 8 são fixos.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TrilhaStationRPG } from './stations';

/** Tupla com 4 picks: [após-rank-1, depois, depois, depois]. Permutação de {2,3,4,5}. */
export type TrilhaOrderPicks = [number, number, number, number];

export const DEFAULT_TRILHA_ORDER: TrilhaOrderPicks = [2, 3, 4, 5];

/** Valida que picks são uma permutação distinta de {2,3,4,5}. */
export function isValidTrilhaOrder(picks: number[]): picks is TrilhaOrderPicks {
  if (picks.length !== 4) return false;
  const set = new Set(picks);
  if (set.size !== 4) return false;
  for (const p of picks) {
    if (![2, 3, 4, 5].includes(p)) return false;
  }
  return true;
}

interface UserOrderRow {
  rank_2_pick: number;
  rank_3_pick: number;
  rank_4_pick: number;
  rank_5_pick: number;
}

/** Lê a ordem do user. Se não houver registro, retorna o default. */
export async function getUserTrilhaOrder(
  supabase: SupabaseClient,
  userId: string,
): Promise<TrilhaOrderPicks> {
  const { data } = await (supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (
          col: string,
          val: string,
        ) => {
          maybeSingle: () => Promise<{ data: UserOrderRow | null }>;
        };
      };
    };
  })
    .from('user_trilha_order')
    .select('rank_2_pick, rank_3_pick, rank_4_pick, rank_5_pick')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return DEFAULT_TRILHA_ORDER;
  const picks: number[] = [
    data.rank_2_pick,
    data.rank_3_pick,
    data.rank_4_pick,
    data.rank_5_pick,
  ];
  if (!isValidTrilhaOrder(picks)) return DEFAULT_TRILHA_ORDER;
  return picks;
}

/** Persiste a ordem do user (upsert). */
export async function setUserTrilhaOrder(
  supabase: SupabaseClient,
  userId: string,
  picks: TrilhaOrderPicks,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidTrilhaOrder(picks)) {
    return { ok: false, error: 'Picks inválidos: precisa ser permutação de {2,3,4,5}.' };
  }

  const { error } = await supabase.from('user_trilha_order').upsert(
    {
      user_id: userId,
      rank_2_pick: picks[0],
      rank_3_pick: picks[1],
      rank_4_pick: picks[2],
      rank_5_pick: picks[3],
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: 'user_id' } as never,
  );
  if (error) {
    console.error('[trilha/order] upsert failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Aplica a ordem customizada às estações.
 *
 * As estações ficam em rank "lógico" 1-8, mas como o user customizou a
 * ordem dos ranks 2-5, reordenamos a sequência exibida. Para isso,
 * mantemos as estações originais (rank/position_in_rank no DB), mas
 * ajustamos o "rank de exibição" e o `unlocks_after` lógico não muda no
 * DB — apenas a apresentação visual reflete a nova ordem.
 *
 * Implementação simples: ordenamos por `displayRank` antes de renderizar.
 * Para cada estação, calcula displayRank = posição do seu rank original
 * na nova ordem.
 *
 * Ranks 1 e 6-8 ficam fixos (1 sempre primeiro; 6-8 sempre depois dos
 * intermediários).
 */
export interface TrilhaStationWithDisplayRank extends TrilhaStationRPG {
  displayRank: number;
}

export function applyOrderToStations(
  stations: TrilhaStationRPG[],
  picks: TrilhaOrderPicks,
): TrilhaStationWithDisplayRank[] {
  // Mapeia rank original (2..5) -> sua posição na nova ordem (também 2..5).
  // Ex: picks = [3, 2, 5, 4] significa: após rank 1 vem o rank original 3,
  // depois 2, depois 5, depois 4. Logo: original 3 vira display 2,
  // original 2 vira display 3, original 5 vira display 4, original 4 vira display 5.
  const originalToDisplay = new Map<number, number>();
  originalToDisplay.set(1, 1);
  picks.forEach((originalRank, idx) => {
    originalToDisplay.set(originalRank, idx + 2);
  });
  originalToDisplay.set(6, 6);
  originalToDisplay.set(7, 7);
  originalToDisplay.set(8, 8);

  return stations.map((s) => ({
    ...s,
    displayRank: originalToDisplay.get(s.rank) ?? s.rank,
  }));
}
