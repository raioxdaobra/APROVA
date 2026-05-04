// Trunfo Vestibular — engine pure (no React).
// Cards = vestibular topics with 4 numeric attributes (1-10 scale).

export type TrunfoAttribute = 'dificuldade' | 'frequencia' | 'importancia' | 'rendimento';

export const ATTRIBUTE_LABEL: Record<TrunfoAttribute, string> = {
  dificuldade: 'Dificuldade',
  frequencia: 'Frequência',
  importancia: 'Importância',
  rendimento: 'Rendimento',
};

export interface TrunfoCard {
  id: string;
  topic: string;
  discipline:
    | 'matematica'
    | 'fisica'
    | 'quimica'
    | 'biologia'
    | 'humanas'
    | 'linguagens';
  attrs: Record<TrunfoAttribute, number>;
  emoji: string;
}

export interface TrunfoState {
  userHand: TrunfoCard[];
  botHand: TrunfoCard[];
  /** Index 0 of each hand is the "top" / current card. */
  turn: 'user' | 'bot';
  round: number;
  lastRound: null | {
    attribute: TrunfoAttribute;
    userValue: number;
    botValue: number;
    winner: 'user' | 'bot' | 'draw';
    userCard: TrunfoCard;
    botCard: TrunfoCard;
  };
  finished: boolean;
}

const RAW_TOPICS: Array<Omit<TrunfoCard, 'id'>> = [
  { topic: 'Equação de 2º grau', discipline: 'matematica', emoji: '📐', attrs: { dificuldade: 6, frequencia: 9, importancia: 9, rendimento: 7 } },
  { topic: 'Funções trigonométricas', discipline: 'matematica', emoji: '📐', attrs: { dificuldade: 8, frequencia: 7, importancia: 8, rendimento: 6 } },
  { topic: 'Logaritmos', discipline: 'matematica', emoji: '📐', attrs: { dificuldade: 7, frequencia: 6, importancia: 7, rendimento: 7 } },
  { topic: 'Probabilidade', discipline: 'matematica', emoji: '📊', attrs: { dificuldade: 7, frequencia: 8, importancia: 8, rendimento: 6 } },
  { topic: 'Geometria espacial', discipline: 'matematica', emoji: '🧊', attrs: { dificuldade: 8, frequencia: 7, importancia: 7, rendimento: 5 } },
  { topic: 'Cinemática', discipline: 'fisica', emoji: '🚀', attrs: { dificuldade: 6, frequencia: 9, importancia: 9, rendimento: 8 } },
  { topic: 'Leis de Newton', discipline: 'fisica', emoji: '🍎', attrs: { dificuldade: 7, frequencia: 9, importancia: 10, rendimento: 8 } },
  { topic: 'Eletromagnetismo', discipline: 'fisica', emoji: '⚡', attrs: { dificuldade: 9, frequencia: 7, importancia: 8, rendimento: 5 } },
  { topic: 'Termodinâmica', discipline: 'fisica', emoji: '🔥', attrs: { dificuldade: 7, frequencia: 6, importancia: 7, rendimento: 6 } },
  { topic: 'Óptica geométrica', discipline: 'fisica', emoji: '🔬', attrs: { dificuldade: 6, frequencia: 7, importancia: 7, rendimento: 7 } },
  { topic: 'Estequiometria', discipline: 'quimica', emoji: '⚗️', attrs: { dificuldade: 8, frequencia: 9, importancia: 9, rendimento: 6 } },
  { topic: 'Química orgânica', discipline: 'quimica', emoji: '🧪', attrs: { dificuldade: 8, frequencia: 9, importancia: 9, rendimento: 6 } },
  { topic: 'Soluções', discipline: 'quimica', emoji: '🧪', attrs: { dificuldade: 6, frequencia: 7, importancia: 7, rendimento: 7 } },
  { topic: 'Eletroquímica', discipline: 'quimica', emoji: '🔋', attrs: { dificuldade: 8, frequencia: 6, importancia: 7, rendimento: 5 } },
  { topic: 'Atomística', discipline: 'quimica', emoji: '⚛️', attrs: { dificuldade: 5, frequencia: 8, importancia: 8, rendimento: 8 } },
  { topic: 'Citologia', discipline: 'biologia', emoji: '🔬', attrs: { dificuldade: 6, frequencia: 9, importancia: 9, rendimento: 8 } },
  { topic: 'Genética', discipline: 'biologia', emoji: '🧬', attrs: { dificuldade: 8, frequencia: 9, importancia: 10, rendimento: 7 } },
  { topic: 'Ecologia', discipline: 'biologia', emoji: '🌱', attrs: { dificuldade: 5, frequencia: 9, importancia: 8, rendimento: 9 } },
  { topic: 'Fisiologia humana', discipline: 'biologia', emoji: '🫀', attrs: { dificuldade: 7, frequencia: 9, importancia: 10, rendimento: 7 } },
  { topic: 'Evolução', discipline: 'biologia', emoji: '🦴', attrs: { dificuldade: 6, frequencia: 7, importancia: 8, rendimento: 8 } },
  { topic: 'Brasil colonial', discipline: 'humanas', emoji: '⛵', attrs: { dificuldade: 5, frequencia: 8, importancia: 8, rendimento: 8 } },
  { topic: 'Era Vargas', discipline: 'humanas', emoji: '📜', attrs: { dificuldade: 6, frequencia: 8, importancia: 9, rendimento: 8 } },
  { topic: 'Geopolítica', discipline: 'humanas', emoji: '🌍', attrs: { dificuldade: 7, frequencia: 8, importancia: 8, rendimento: 7 } },
  { topic: 'Filosofia clássica', discipline: 'humanas', emoji: '🏛️', attrs: { dificuldade: 7, frequencia: 6, importancia: 7, rendimento: 7 } },
  { topic: 'Sociologia clássica', discipline: 'humanas', emoji: '👥', attrs: { dificuldade: 7, frequencia: 7, importancia: 8, rendimento: 7 } },
  { topic: 'Realismo', discipline: 'linguagens', emoji: '✒️', attrs: { dificuldade: 6, frequencia: 8, importancia: 8, rendimento: 8 } },
  { topic: 'Modernismo', discipline: 'linguagens', emoji: '🎨', attrs: { dificuldade: 6, frequencia: 9, importancia: 9, rendimento: 8 } },
  { topic: 'Sintaxe', discipline: 'linguagens', emoji: '📝', attrs: { dificuldade: 7, frequencia: 8, importancia: 8, rendimento: 6 } },
  { topic: 'Figuras de linguagem', discipline: 'linguagens', emoji: '🗣️', attrs: { dificuldade: 5, frequencia: 9, importancia: 8, rendimento: 9 } },
  { topic: 'Interpretação textual', discipline: 'linguagens', emoji: '📖', attrs: { dificuldade: 6, frequencia: 10, importancia: 10, rendimento: 8 } },
];

export const ALL_CARDS: TrunfoCard[] = RAW_TOPICS.map((c, i) => ({ ...c, id: `c${i + 1}` }));

export const TRUNFO_ATTRIBUTES: TrunfoAttribute[] = [
  'dificuldade',
  'frequencia',
  'importancia',
  'rendimento',
];

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export function createDeck(seed?: number): TrunfoCard[] {
  let s = seed ?? Math.floor(Math.random() * 1e9);
  const rng = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return shuffle(ALL_CARDS, rng);
}

export function createInitialState(seed?: number): TrunfoState {
  const deck = createDeck(seed);
  const half = Math.floor(deck.length / 2);
  return {
    userHand: deck.slice(0, half),
    botHand: deck.slice(half),
    turn: 'user',
    round: 1,
    lastRound: null,
    finished: false,
  };
}

export function compareRound(
  state: TrunfoState,
  attribute: TrunfoAttribute,
): TrunfoState {
  if (state.finished) return state;
  if (state.userHand.length === 0 || state.botHand.length === 0) {
    return { ...state, finished: true };
  }
  const userCard = state.userHand[0]!;
  const botCard = state.botHand[0]!;
  const userValue = userCard.attrs[attribute];
  const botValue = botCard.attrs[attribute];
  let winner: 'user' | 'bot' | 'draw';
  if (userValue > botValue) winner = 'user';
  else if (botValue > userValue) winner = 'bot';
  else winner = 'draw';

  const userRest = state.userHand.slice(1);
  const botRest = state.botHand.slice(1);
  let userHand: TrunfoCard[];
  let botHand: TrunfoCard[];
  if (winner === 'user') {
    userHand = [...userRest, userCard, botCard];
    botHand = botRest;
  } else if (winner === 'bot') {
    botHand = [...botRest, userCard, botCard];
    userHand = userRest;
  } else {
    userHand = [...userRest, userCard];
    botHand = [...botRest, botCard];
  }

  const finished = userHand.length === 0 || botHand.length === 0;
  const nextTurn: 'user' | 'bot' = winner === 'bot' ? 'bot' : winner === 'user' ? 'user' : state.turn;

  return {
    userHand,
    botHand,
    turn: nextTurn,
    round: state.round + 1,
    lastRound: { attribute, userValue, botValue, winner, userCard, botCard },
    finished,
  };
}

/** Score = cards conquered * 100 + time bonus. */
export function calcScore(state: TrunfoState, durationMs: number): number {
  const cards = state.userHand.length;
  const base = cards * 100;
  const timeBonus = Math.max(0, 1500 - Math.floor(durationMs / 1000) * 5);
  return base + timeBonus;
}
