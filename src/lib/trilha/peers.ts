/**
 * PR 27 — Multiplayer assíncrono.
 *
 * Helpers para buscar a "estação atual" dos peers (top XP semanal).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TrilhaPeer {
  peerId: string;
  username: string;
  displayName: string;
  currentStationId: string;
  currentRank: number;
  currentPosition: number;
  completedCount: number;
}

interface PeerRow {
  peer_id: string;
  peer_username: string | null;
  peer_display_name: string | null;
  current_station_id: string | null;
  current_rank: number | null;
  current_position: number | null;
  completed_count: number | null;
}

/** Chama RPC `trilha_peers_progress` e normaliza o retorno. */
export async function getTrilhaPeers(
  supabase: SupabaseClient,
  userId: string,
): Promise<TrilhaPeer[]> {
  const { data, error } = await supabase.rpc('trilha_peers_progress', {
    p_user_id: userId,
  });
  if (error) {
    console.error('[trilha/peers] rpc failed', error);
    return [];
  }
  if (!Array.isArray(data)) return [];

  return (data as PeerRow[])
    .filter((r) => r && r.peer_id && r.current_station_id)
    .map<TrilhaPeer>((r) => ({
      peerId: r.peer_id,
      username: r.peer_username ?? '???',
      displayName: r.peer_display_name ?? r.peer_username ?? '???',
      currentStationId: r.current_station_id as string,
      currentRank: r.current_rank ?? 0,
      currentPosition: r.current_position ?? 0,
      completedCount: r.completed_count ?? 0,
    }));
}

/** Devolve as iniciais do display_name (até 2 letras). */
export function peerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((p) => p.charAt(0).toUpperCase()).join('');
}

/** Cor estável a partir do peerId (paleta APROVA-friendly). */
const AVATAR_COLORS = [
  '#2563EB', // blue
  '#16A34A', // green
  '#9333EA', // purple
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
  '#DB2777', // pink
  '#CA8A04', // amber
];

export function peerAvatarColor(peerId: string): string {
  let hash = 0;
  for (let i = 0; i < peerId.length; i++) {
    hash = (hash * 31 + peerId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!;
}

/** Agrupa peers por estação atual. */
export function groupPeersByStation(peers: TrilhaPeer[]): Map<string, TrilhaPeer[]> {
  const map = new Map<string, TrilhaPeer[]>();
  for (const p of peers) {
    const arr = map.get(p.currentStationId) ?? [];
    arr.push(p);
    map.set(p.currentStationId, arr);
  }
  return map;
}
