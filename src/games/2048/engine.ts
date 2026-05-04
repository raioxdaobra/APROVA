/**
 * 2048 — engine puro.
 *
 * Grid 4×4. Score = highest tile achievement (maior tile na grade ao final).
 * Cada movimento que muda o board adiciona um novo tile (90% 2, 10% 4).
 *
 * Movimento implementado por rotação: sempre "compactar pra esquerda" e
 * rotacionar para os outros sentidos.
 */

export const SIZE = 4;

export type Board = number[][]; // SIZE×SIZE; 0 = vazio.

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface MoveResult {
  board: Board;
  changed: boolean;
  /** Soma dos pares formados nesse movimento (XP-style; opcional pro display). */
  gained: number;
}

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function clone(board: Board): Board {
  return board.map((row) => [...row]);
}

function emptyCells(board: Board): Array<{ r: number; c: number }> {
  const out: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if ((board[r] as number[])[c] === 0) out.push({ r, c });
    }
  }
  return out;
}

export function addRandomTile(board: Board, rand: () => number = Math.random): Board {
  const empties = emptyCells(board);
  if (empties.length === 0) return board;
  const pick = empties[Math.floor(rand() * empties.length)] as { r: number; c: number };
  const value = rand() < 0.9 ? 2 : 4;
  const next = clone(board);
  (next[pick.r] as number[])[pick.c] = value;
  return next;
}

export function newGame(rand: () => number = Math.random): Board {
  let b = emptyBoard();
  b = addRandomTile(b, rand);
  b = addRandomTile(b, rand);
  return b;
}

/** Compacta uma linha pra esquerda. Retorna nova linha + ganho. */
function compactLeft(row: number[]): { row: number[]; gained: number } {
  const filtered = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  let i = 0;
  while (i < filtered.length) {
    const cur = filtered[i] as number;
    const nxt = filtered[i + 1];
    if (nxt !== undefined && nxt === cur) {
      const merged = cur * 2;
      out.push(merged);
      gained += merged;
      i += 2;
    } else {
      out.push(cur);
      i += 1;
    }
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

function rotateCW(board: Board): Board {
  const out = emptyBoard();
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      (out[c] as number[])[SIZE - 1 - r] = (board[r] as number[])[c] as number;
    }
  }
  return out;
}

function rotateCCW(board: Board): Board {
  const out = emptyBoard();
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      (out[SIZE - 1 - c] as number[])[r] = (board[r] as number[])[c] as number;
    }
  }
  return out;
}

function flipH(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

export function move(board: Board, dir: Direction): MoveResult {
  let work = clone(board);
  if (dir === 'right') work = flipH(work);
  else if (dir === 'up') work = rotateCCW(work);
  else if (dir === 'down') work = rotateCW(work);

  let gained = 0;
  const compacted = work.map((row) => {
    const r = compactLeft(row);
    gained += r.gained;
    return r.row;
  });

  let result = compacted;
  if (dir === 'right') result = flipH(result);
  else if (dir === 'up') result = rotateCW(result);
  else if (dir === 'down') result = rotateCCW(result);

  const changed = JSON.stringify(result) !== JSON.stringify(board);
  return { board: result, changed, gained };
}

export function isGameOver(board: Board): boolean {
  if (emptyCells(board).length > 0) return false;
  for (const dir of ['left', 'right', 'up', 'down'] as const) {
    if (move(board, dir).changed) return false;
  }
  return true;
}

export function highestTile(board: Board): number {
  let max = 0;
  for (const row of board) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
  return max;
}

/** Score do jogo: highest tile achievement. */
export function calcScore(board: Board): number {
  return highestTile(board);
}
