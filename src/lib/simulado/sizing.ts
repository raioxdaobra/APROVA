/**
 * Constantes de dimensionamento do simulado multi-tópico (PR 20).
 * Mantidas isoladas pra ficar fácil ajustar sem caçar mágico número no JSX.
 */

/** Tempo médio estimado por questão (em minutos). */
export const MINUTES_PER_QUESTION = 2.5;

/** Mínimo de questões disponíveis pra liberar o botão "Iniciar simulado". */
export const MIN_QUESTIONS_TO_START = 5;

/** Alvo padrão usado pelo "Balancear automático". */
export const TARGET_DEFAULT = 60;

/**
 * Limite máximo de questões em uma sessão de simulado multi-tópico.
 * Espelha o cap implícito da página `/simulado` clássica (90).
 */
export const SIMULADO_MAX_QUESTIONS = 90;

/** Calcula minutos estimados a partir do número de questões. */
export function estimatedMinutes(numQuestions: number): number {
  return Math.round(numQuestions * MINUTES_PER_QUESTION);
}
