/**
 * Snake Anatomia — engine puro.
 *
 * Cobrinha clássica em grid 20×20. As "frutas" são órgãos do corpo humano,
 * mostrados com nome ao serem comidos. Score = comprimento da cobra ao morrer.
 */

export const GRID = 20;

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface Organ {
  pos: Point;
  name: string;
  emoji: string;
}

export interface SnakeState {
  snake: Point[]; // [head, ..., tail]
  dir: Dir;
  pendingDir: Dir;
  organ: Organ;
  alive: boolean;
  score: number;
  lastEaten: { name: string; emoji: string } | null;
  /** Nome do órgão atualmente "à vista". */
}

export const ORGANS: ReadonlyArray<{ name: string; emoji: string }> = [
  { name: 'Coração', emoji: '❤️' },
  { name: 'Cérebro', emoji: '🧠' },
  { name: 'Pulmão', emoji: '🫁' },
  { name: 'Fígado', emoji: '🫀' },
  { name: 'Rim', emoji: '🫘' },
  { name: 'Estômago', emoji: '🌭' },
  { name: 'Intestino', emoji: '🌀' },
  { name: 'Olho', emoji: '👁️' },
];

function eq(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function pickPoint(rand: () => number, exclude: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(rand() * GRID), y: Math.floor(rand() * GRID) };
  } while (exclude.some((e) => eq(e, p)));
  return p;
}

function pickOrgan(rand: () => number, exclude: Point[]): Organ {
  const meta = ORGANS[Math.floor(rand() * ORGANS.length)] as (typeof ORGANS)[number];
  return { pos: pickPoint(rand, exclude), name: meta.name, emoji: meta.emoji };
}

export function initialState(rand: () => number = Math.random): SnakeState {
  const snake: Point[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  return {
    snake,
    dir: 'right',
    pendingDir: 'right',
    organ: pickOrgan(rand, snake),
    alive: true,
    score: snake.length,
    lastEaten: null,
  };
}

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/** Aplica nova direção se não for oposta direta da atual. */
export function setDirection(state: SnakeState, dir: Dir): SnakeState {
  if (OPPOSITE[state.dir] === dir) return state;
  return { ...state, pendingDir: dir };
}

const DELTA: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** Avança um tick. Determinístico dado `rand`. */
export function step(state: SnakeState, rand: () => number = Math.random): SnakeState {
  if (!state.alive) return state;
  const dir = state.pendingDir;
  const head = state.snake[0] as Point;
  const d = DELTA[dir];
  const newHead: Point = { x: head.x + d.x, y: head.y + d.y };

  // colisão paredes
  if (newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID || newHead.y >= GRID) {
    return { ...state, alive: false, dir };
  }
  // colisão corpo (excluindo cauda que vai sair se não comer)
  const ate = eq(newHead, state.organ.pos);
  const body = ate ? state.snake : state.snake.slice(0, -1);
  if (body.some((p) => eq(p, newHead))) {
    return { ...state, alive: false, dir };
  }

  const nextSnake: Point[] = ate ? [newHead, ...state.snake] : [newHead, ...state.snake.slice(0, -1)];

  let nextOrgan = state.organ;
  let lastEaten = state.lastEaten;
  if (ate) {
    nextOrgan = pickOrgan(rand, nextSnake);
    lastEaten = { name: state.organ.name, emoji: state.organ.emoji };
  }

  return {
    ...state,
    dir,
    snake: nextSnake,
    organ: nextOrgan,
    score: nextSnake.length,
    lastEaten,
  };
}
