/**
 * Tipos compartilhados do sistema SRS (SM-2 / Anki).
 *
 * Quality: nota do user pra um card (mapeada Anki):
 *   0 = Errei (reset)
 *   3 = Difícil
 *   4 = Bom
 *   5 = Fácil
 */
export type Quality = 0 | 3 | 4 | 5;

export interface ReviewState {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: Date;
}

export type AnswerLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface FlashcardCardData {
  questionId: string;
  discipline: string;
  subtopic: string;
  description: string | null;
  imageUrl: string;
  correctAnswer: AnswerLetter;
  year: number;
  isNew: boolean;
}

export interface FlashcardCounts {
  dueToday: number;
  overdue: number;
  newAvailable: number;
  totalReviewed: number;
}
