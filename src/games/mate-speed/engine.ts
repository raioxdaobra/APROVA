/**
 * Mate-Speed engine — geração de operações aritméticas e cálculo de score.
 * Lógica pura, sem React, testável de forma isolada.
 *
 * Regras:
 *  - 10 contas aleatórias dos operadores +, −, ×, ÷.
 *  - 60 segundos no total.
 *  - Score = acertos × 10.
 */

export type Operator = '+' | '-' | '×' | '÷';

export interface MateProblem {
  id: string;
  a: number;
  b: number;
  op: Operator;
  /** Resposta exata (sempre inteira). */
  answer: number;
  /** Texto pra exibição (sem o resultado). */
  prompt: string;
}

export const MATE_TOTAL_QUESTIONS = 10;
export const MATE_TIME_LIMIT_SEC = 60;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Cria um problema com resposta inteira garantida.
 *  +  : a in [10..99],  b in [2..49]
 *  −  : a >= b,          ambos em [2..99]
 *  ×  : a in [2..12],    b in [2..12]
 *  ÷  : gera b e quociente; a = b * quociente
 */
export function makeProblem(rand: () => number = Math.random): MateProblem {
  const ops: Operator[] = ['+', '-', '×', '÷'];
  const op = ops[Math.floor(rand() * ops.length)] as Operator;
  let a = 0;
  let b = 0;
  let answer = 0;

  switch (op) {
    case '+': {
      a = 10 + Math.floor(rand() * 90);
      b = 2 + Math.floor(rand() * 48);
      answer = a + b;
      break;
    }
    case '-': {
      const x = 10 + Math.floor(rand() * 90);
      const y = 2 + Math.floor(rand() * 48);
      a = Math.max(x, y);
      b = Math.min(x, y);
      answer = a - b;
      break;
    }
    case '×': {
      a = 2 + Math.floor(rand() * 11);
      b = 2 + Math.floor(rand() * 11);
      answer = a * b;
      break;
    }
    case '÷': {
      b = 2 + Math.floor(rand() * 11);
      const q = 2 + Math.floor(rand() * 11);
      a = b * q;
      answer = q;
      break;
    }
  }

  return {
    id: makeId(),
    a,
    b,
    op,
    answer,
    prompt: `${a} ${op} ${b}`,
  };
}

export function makeProblems(
  count: number = MATE_TOTAL_QUESTIONS,
  rand: () => number = Math.random,
): MateProblem[] {
  return Array.from({ length: count }, () => makeProblem(rand));
}

export function calcScore(correctCount: number): number {
  return Math.max(0, Math.floor(correctCount)) * 10;
}

// Convenience for randInt re-export (used by tests in the future).
export const _internals = { randInt };
