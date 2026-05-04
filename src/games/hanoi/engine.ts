// Torre de Hanói — engine simples.

export type Tower = number[]; // bottom..top, larger numbers are bigger discs (1..n)

export interface HanoiState {
  towers: [Tower, Tower, Tower];
  moves: number;
  selected: 0 | 1 | 2 | null;
  discCount: number;
  finished: boolean;
}

export function initialHanoi(discCount: number): HanoiState {
  const start: Tower = [];
  for (let i = discCount; i >= 1; i--) start.push(i);
  return {
    towers: [start, [], []],
    moves: 0,
    selected: null,
    discCount,
    finished: false,
  };
}

export function tryMove(
  state: HanoiState,
  from: 0 | 1 | 2,
  to: 0 | 1 | 2,
): HanoiState {
  if (state.finished) return state;
  if (from === to) return state;
  const fromTower = state.towers[from];
  if (fromTower.length === 0) return state;
  const top = fromTower[fromTower.length - 1]!;
  const toTower = state.towers[to];
  const dest = toTower[toTower.length - 1];
  if (dest !== undefined && dest < top) return state; // invalid
  const newTowers: [Tower, Tower, Tower] = [
    state.towers[0].slice(),
    state.towers[1].slice(),
    state.towers[2].slice(),
  ];
  newTowers[from].pop();
  newTowers[to].push(top);
  const finished = newTowers[2].length === state.discCount;
  return {
    ...state,
    towers: newTowers,
    moves: state.moves + 1,
    selected: null,
    finished,
  };
}

/** Score = (2^n - 1)/movimentos * 1000 (clamped). */
export function calcHanoiScore(discCount: number, moves: number): number {
  if (moves <= 0) return 0;
  const optimal = Math.pow(2, discCount) - 1;
  const ratio = optimal / moves;
  return Math.round(Math.min(1, ratio) * 1000);
}
