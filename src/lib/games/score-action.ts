// TODO(W5-merge): Reconcile with W5's authoritative submitGameScore implementation.
// Stub created in W6 so the 5 complex games compile without W5 merged.
'use server';

export type GameId =
  | 'mate_speed'
  | 'wordle'
  | 'memory_periodic'
  | 'snake_anatomy'
  | '2048'
  | 'trunfo'
  | 'corrida'
  | 'sudoku'
  | 'logica'
  | 'hanoi';

export interface SubmitScoreInput {
  gameId: GameId;
  score: number;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export interface SubmitScoreResult {
  ok: boolean;
  rank?: number;
  error?: string;
}

/**
 * Submit a score for a mini-game. Stub returns ok:true; real impl (W5) will
 * write to `game_scores` (migration 0019) via Supabase and return rank.
 */
export async function submitScore(input: SubmitScoreInput): Promise<SubmitScoreResult> {
  void input;
  return { ok: true };
}
