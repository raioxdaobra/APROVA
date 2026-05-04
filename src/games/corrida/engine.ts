// Corrida do Conhecimento — engine.

export interface CorridaQuiz {
  id: string;
  question: string;
  options: string[];
  correct: number; // index
}

export const TRACK_LENGTH = 1000; // arbitrary units
export const QUIZ_COUNT = 6;

export const QUIZZES: CorridaQuiz[] = [
  {
    id: 'q1',
    question: 'Qual a fórmula da velocidade média?',
    options: ['v = Δs/Δt', 'v = a·t', 'v = m·g', 'v = F/a'],
    correct: 0,
  },
  {
    id: 'q2',
    question: 'Quantos cromossomos tem uma célula humana somática?',
    options: ['23', '46', '48', '92'],
    correct: 1,
  },
  {
    id: 'q3',
    question: 'O pH de uma solução neutra a 25 °C é:',
    options: ['0', '7', '14', '1'],
    correct: 1,
  },
  {
    id: 'q4',
    question: 'A integral indefinida de 2x dx é:',
    options: ['x²', '2', 'x² + C', 'ln(x) + C'],
    correct: 2,
  },
  {
    id: 'q5',
    question: 'Quem proclamou a República no Brasil?',
    options: ['D. Pedro II', 'Marechal Deodoro', 'Getúlio Vargas', 'Floriano Peixoto'],
    correct: 1,
  },
  {
    id: 'q6',
    question: 'Qual escola literária Machado de Assis representa?',
    options: ['Romantismo', 'Realismo', 'Simbolismo', 'Modernismo'],
    correct: 1,
  },
];

export type CorridaSpeed = 'slow' | 'fast';

export interface CorridaState {
  userPos: number;
  botPos: number;
  startedAt: number;
  finishedAt: number | null;
  /** Average user speed in units/sec — used by bot. */
  userAvgSpeed: number;
  correct: number;
  wrong: number;
  finishedQuizIds: string[];
}

export function initialCorridaState(): CorridaState {
  return {
    userPos: 0,
    botPos: 0,
    startedAt: Date.now(),
    finishedAt: null,
    userAvgSpeed: 60, // baseline 60 units/sec
    correct: 0,
    wrong: 0,
    finishedQuizIds: [],
  };
}

/** Score = (Tempo total ms inverso) + bonus por chegar em primeiro. */
export function calcCorridaScore(
  state: CorridaState,
  position: 'first' | 'second',
): number {
  const ms = (state.finishedAt ?? Date.now()) - state.startedAt;
  const seconds = ms / 1000;
  const timeScore = Math.max(0, Math.floor(2000 - seconds * 5));
  const positionBonus = position === 'first' ? 500 : 100;
  const accBonus = state.correct * 50;
  return timeScore + positionBonus + accBonus;
}
