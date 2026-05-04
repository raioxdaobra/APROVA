// Sudoku 9x9 — generator via backtracking + level-based prunning.

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export interface SudokuPuzzle {
  /** 9x9 grid; 0 means empty. */
  given: number[][];
  solution: number[][];
  difficulty: SudokuDifficulty;
}

const N = 9;
const BOX = 3;

function emptyGrid(): number[][] {
  return Array.from({ length: N }, () => Array<number>(N).fill(0));
}

function cloneGrid(g: number[][]): number[][] {
  return g.map((r) => r.slice());
}

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < N; i++) {
    if (grid[row]![i] === num) return false;
    if (grid[i]![col] === num) return false;
  }
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) {
      if (grid[r]![c] === num) return false;
    }
  }
  return true;
}

function solve(grid: number[][], randomize = false): boolean {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r]![c] === 0) {
        const candidates = randomize
          ? shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])
          : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (const num of candidates) {
          if (isValid(grid, r, c, num)) {
            grid[r]![c] = num;
            if (solve(grid, randomize)) return true;
            grid[r]![c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateFullGrid(): number[][] {
  const g = emptyGrid();
  solve(g, true);
  return g;
}

const GIVEN_BY_DIFFICULTY: Record<SudokuDifficulty, number> = {
  easy: 40,
  medium: 30,
  hard: 24,
};

export function generatePuzzle(difficulty: SudokuDifficulty = 'easy'): SudokuPuzzle {
  const solution = generateFullGrid();
  const given = cloneGrid(solution);
  const totalCells = N * N;
  const targetGiven = GIVEN_BY_DIFFICULTY[difficulty];
  const toRemove = totalCells - targetGiven;

  const positions = shuffled(
    Array.from({ length: totalCells }, (_, i) => i),
  );
  let removed = 0;
  for (const p of positions) {
    if (removed >= toRemove) break;
    const r = Math.floor(p / N);
    const c = p % N;
    if (given[r]![c] === 0) continue;
    given[r]![c] = 0;
    removed++;
  }
  return { given, solution, difficulty };
}

export function isComplete(grid: number[][]): boolean {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r]![c] === 0) return false;
    }
  }
  return true;
}

export function checkSolution(grid: number[][], solution: number[][]): boolean {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r]![c] !== solution[r]![c]) return false;
    }
  }
  return true;
}

const FACTOR: Record<SudokuDifficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
};

/** Score = (1000 / duration_sec) * factor (clamped). */
export function calcSudokuScore(durationMs: number, difficulty: SudokuDifficulty): number {
  const sec = Math.max(30, durationMs / 1000);
  const base = (1000 / sec) * FACTOR[difficulty];
  return Math.round(base * 10);
}
