// Constantes compartilhadas entre o Server Component da setup e o
// Client Component do formulário. Mantido fora de actions.ts porque
// arquivos `'use server'` só podem exportar funções async.

export const SIMULADO_TOTAL_OPTIONS = [15, 30, 60, 90] as const;
export const SIMULADO_TIME_OPTIONS = [45, 90, 180, 240] as const;
export const SIMULADO_DISCIPLINE_OPTIONS = [
  'todas',
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
] as const;

export type SimuladoTotalOption = (typeof SIMULADO_TOTAL_OPTIONS)[number];
export type SimuladoTimeOption = (typeof SIMULADO_TIME_OPTIONS)[number];
export type SimuladoDisciplineOption =
  (typeof SIMULADO_DISCIPLINE_OPTIONS)[number];

export const SIMULADO_DEFAULT_TOTAL: SimuladoTotalOption = 60;
export const SIMULADO_DEFAULT_TIME: SimuladoTimeOption = 180;
export const SIMULADO_DEFAULT_DISCIPLINE: SimuladoDisciplineOption = 'todas';

export const DISCIPLINE_LABEL_PT: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

export const DISCIPLINE_BG_BY_SLUG: Record<string, string> = {
  matematica: 'bg-discipline-matematica',
  fisica: 'bg-discipline-fisica',
  quimica: 'bg-discipline-quimica',
  biologia: 'bg-discipline-biologia',
  humanas: 'bg-discipline-humanas',
  linguagens: 'bg-discipline-linguagens',
};

export function disciplineLabel(slug: string): string {
  return DISCIPLINE_LABEL_PT[slug] ?? slug;
}

export function disciplineBg(slug: string): string {
  return DISCIPLINE_BG_BY_SLUG[slug] ?? 'bg-secondary';
}
