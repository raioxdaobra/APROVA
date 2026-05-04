/**
 * Wordle Vestibular — engine puro.
 *
 * Lista de palavras de 5 letras (ASCII A-Z, sem acentos), todas relacionadas a
 * Bio/Quim/Hist/Geo. 6 tentativas. Score = (7 - tentativas) * 100 + bonus_tempo.
 *
 * Comparações são feitas em maiúsculas e sem acentos (normalize()).
 */

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type CellStatus = 'absent' | 'present' | 'correct';

export interface GuessRow {
  letters: string[];
  statuses: CellStatus[];
}

/**
 * 80 palavras curadas, todas com 5 letras ASCII. Foco em conteúdo de
 * vestibular (sem ser arbitrário demais). Sem acentos — para que o jogador
 * possa digitar em qualquer teclado.
 */
export const WORDLE_WORDS: ReadonlyArray<string> = [
  // Biologia / corpo / natureza (20)
  'GENES',
  'DEDOS',
  'FOLHA',
  'FUNGO',
  'OSSOS',
  'PELES',
  'ALGAS',
  'CARNE',
  'NERVO',
  'MUSGO',
  'CACTO',
  'BICOS',
  'CALOR',
  'CISTO',
  'TUMOR',
  'GERME',
  'LARVA',
  'OVULO',
  'CILIO',
  'CLONE',
  // Química (20)
  'ATOMO',
  'PRATA',
  'FERRO',
  'SODIO',
  'OZONO',
  'GASES',
  'ACIDO',
  'BASES',
  'METAL',
  'NEONS',
  'COBRE',
  'ARGON',
  'XENON',
  'BORON',
  'IODOS',
  'LITIO',
  'PLOMO',
  'OLEOS',
  'AMINO',
  'NITRO',
  // História (20)
  'POVOS',
  'PARIS',
  'TROPA',
  'PESTE',
  'NAVIO',
  'TRONO',
  'FORCA',
  'PAPAS',
  'CASTA',
  'NOBRE',
  'LANCA',
  'ROUBO',
  'TRIBO',
  'CRIME',
  'TRATO',
  'ORDEM',
  'EXILO',
  'PRESO',
  'COROA',
  'DUQUE',
  // Geografia (20)
  'CHILE',
  'NEPAL',
  'JAPAO',
  'CHINA',
  'INDIA',
  'EGITO',
  'KENYA',
  'CONGO',
  'SERRA',
  'COSTA',
  'CLIMA',
  'MARES',
  'NORTE',
  'OASIS',
  'PORTO',
  'PRADO',
  'CANAL',
  'TUNEL',
  'MONTE',
  'PAMPA',
];

/** Sanitiza a lista para conter só palavras com 5 letras A-Z. */
export const VALID_WORDS: ReadonlyArray<string> = WORDLE_WORDS.filter((w) =>
  /^[A-Z]{5}$/.test(w),
);

/** Remove diacríticos e mantém só A-Z maiúsculas. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export function pickWord(rand: () => number = Math.random): string {
  if (VALID_WORDS.length === 0) return 'GENES';
  return VALID_WORDS[Math.floor(rand() * VALID_WORDS.length)] as string;
}

/**
 * Compara `guess` contra `target` (ambos do mesmo tamanho, normalizados).
 * Algoritmo padrão de Wordle: primeiro marca verdes; depois conta letras
 * restantes pra dar amarelos sem repetir indevidamente.
 */
export function evaluateGuess(guess: string, target: string): CellStatus[] {
  const g = guess.split('');
  const t = target.split('');
  const status: CellStatus[] = Array.from({ length: g.length }, () => 'absent');
  const remaining: Record<string, number> = {};

  for (let i = 0; i < g.length; i += 1) {
    if (g[i] === t[i]) {
      status[i] = 'correct';
    } else {
      const ch = t[i] as string;
      remaining[ch] = (remaining[ch] ?? 0) + 1;
    }
  }
  for (let i = 0; i < g.length; i += 1) {
    if (status[i] === 'correct') continue;
    const ch = g[i] as string;
    if ((remaining[ch] ?? 0) > 0) {
      status[i] = 'present';
      remaining[ch] = (remaining[ch] ?? 0) - 1;
    }
  }
  return status;
}

/**
 * Score:
 *  - vencendo: base = (MAX_GUESSES + 1 - tentativas) * 100
 *              bonus = max(0, 240 − duration_sec)
 *  - perdendo: 0
 */
export function calcScore(triesUsed: number, durationSec: number, won: boolean): number {
  if (!won) return 0;
  const base = Math.max(0, (MAX_GUESSES + 1 - triesUsed) * 100);
  const bonus = Math.max(0, 240 - Math.max(0, Math.floor(durationSec)));
  return base + bonus;
}
