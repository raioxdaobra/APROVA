/**
 * Memory Periódica — engine puro.
 *
 * 16 cards (8 pares: símbolo ↔ nome) de 8 elementos da tabela periódica.
 * Score = max(0, 1000 - tries*50 - duration_sec*2).
 */

export const PAIRS = 8;
export const TOTAL_CARDS = PAIRS * 2;

export interface Element {
  symbol: string;
  name: string;
}

export const ELEMENTS: ReadonlyArray<Element> = [
  { symbol: 'H', name: 'Hidrogênio' },
  { symbol: 'O', name: 'Oxigênio' },
  { symbol: 'C', name: 'Carbono' },
  { symbol: 'N', name: 'Nitrogênio' },
  { symbol: 'Na', name: 'Sódio' },
  { symbol: 'Fe', name: 'Ferro' },
  { symbol: 'Au', name: 'Ouro' },
  { symbol: 'Cu', name: 'Cobre' },
  { symbol: 'Ag', name: 'Prata' },
  { symbol: 'Pb', name: 'Chumbo' },
  { symbol: 'Hg', name: 'Mercúrio' },
  { symbol: 'K', name: 'Potássio' },
  { symbol: 'Ca', name: 'Cálcio' },
  { symbol: 'Cl', name: 'Cloro' },
  { symbol: 'S', name: 'Enxofre' },
  { symbol: 'P', name: 'Fósforo' },
];

export type CardKind = 'symbol' | 'name';

export interface MemoryCard {
  id: string; // único por carta
  pairKey: string; // símbolo do elemento (chave de pareamento)
  kind: CardKind;
  label: string; // texto exibido quando virado
}

function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/**
 * Cria 16 cards a partir de 8 elementos sorteados, embaralhados.
 */
export function makeBoard(rand: () => number = Math.random): MemoryCard[] {
  const picked = shuffle([...ELEMENTS], rand).slice(0, PAIRS);
  const cards: MemoryCard[] = [];
  for (const el of picked) {
    cards.push({
      id: `${el.symbol}-sym`,
      pairKey: el.symbol,
      kind: 'symbol',
      label: el.symbol,
    });
    cards.push({
      id: `${el.symbol}-name`,
      pairKey: el.symbol,
      kind: 'name',
      label: el.name,
    });
  }
  return shuffle(cards, rand);
}

export function calcScore(tries: number, durationSec: number): number {
  const t = Math.max(0, Math.floor(tries));
  const d = Math.max(0, Math.floor(durationSec));
  return Math.max(0, 1000 - t * 50 - d * 2);
}
