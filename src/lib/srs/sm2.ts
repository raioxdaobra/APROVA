/**
 * SM-2 algorithm (SuperMemo 2 — base do Anki).
 *
 * Função pura: recebe estado anterior + quality, retorna próximo estado.
 * Cards "novos" (sem estado anterior) começam com EF=2.5, reps=0, interval=0.
 *
 * Regras:
 *   quality < 3 → reset reps, interval = 1, EF preservado (mas mín 1.3)
 *   reps == 1   → interval = 1
 *   reps == 2   → interval = 6
 *   reps > 2    → interval = max(1, round(interval_prev * EF_prev))
 *   EF' = EF + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
 *   EF mínimo = 1.3
 *
 * Não acessa DB. Toda persistência é responsabilidade do caller.
 */
import type { Quality, ReviewState } from './types';

const DEFAULT_EF = 2.5;
const MIN_EF = 1.3;

export function nextReview(
  prev: ReviewState | null,
  quality: Quality,
  now: Date = new Date(),
): ReviewState {
  const efPrev = prev?.ease_factor ?? DEFAULT_EF;
  const repsPrev = prev?.repetitions ?? 0;
  const intervalPrev = prev?.interval_days ?? 0;

  let nextReps: number;
  let nextInterval: number;
  let nextEf: number;

  if (quality < 3) {
    nextReps = 0;
    nextInterval = 1;
    nextEf = efPrev;
  } else {
    nextReps = repsPrev + 1;
    if (nextReps === 1) {
      nextInterval = 1;
    } else if (nextReps === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.max(1, Math.round(intervalPrev * efPrev));
    }
    nextEf = efPrev + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  }

  if (nextEf < MIN_EF) nextEf = MIN_EF;

  const due = new Date(now.getTime());
  due.setUTCDate(due.getUTCDate() + nextInterval);

  return {
    ease_factor: Math.round(nextEf * 100) / 100,
    interval_days: nextInterval,
    repetitions: nextReps,
    due_at: due,
  };
}

export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return state.due_at.getTime() <= now.getTime();
}
