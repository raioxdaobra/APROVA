/**
 * Registry de mini-games.
 *
 * Contrato compartilhado entre W7 (lobby/ranking, este worktree) e W5/W6
 * (componentes de jogos individuais). Cada entrada aponta pra um loader
 * `() => import('@/games/<id>/Game')` ou `null` (placeholder enquanto o jogo
 * não foi implementado — o lobby mostra "em construção").
 *
 * Vive sob `src/app/jogos/_lib/` pra não invadir `src/games/*`, que é dono
 * de W5/W6.
 */

import type { ComponentType } from 'react';
import type { GameId } from '@/lib/supabase/types';

type GameLoader = () => Promise<{ default: ComponentType }>;

// Registry: cada jogo aponta para um loader OU null (placeholder).
// W5/W6 substitui null por `() => import('./<id>/Game')` quando o jogo
// estiver pronto. Mantemos o map pra que webpack consiga gerar os chunks.
const REGISTRY: Record<GameId, GameLoader | null> = {
  mate_speed: () => import('@/games/mate-speed/Game'),
  wordle: () => import('@/games/wordle/Game'),
  memory_periodic: () => import('@/games/memory-periodic/Game'),
  snake_anatomy: () => import('@/games/snake-anatomy/Game'),
  '2048': () => import('@/games/2048/Game'),
  trunfo: () => import('@/games/trunfo/Game'),
  corrida: () => import('@/games/corrida/Game'),
  sudoku: () => import('@/games/sudoku/Game'),
  logica: () => import('@/games/logica/Game'),
  hanoi: () => import('@/games/hanoi/Game'),
};

export async function getGameComponent(
  gameId: string,
): Promise<ComponentType | null> {
  const loader = REGISTRY[gameId as GameId];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default ?? null;
  } catch {
    return null;
  }
}
