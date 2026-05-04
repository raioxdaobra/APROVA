import {
  TRUNFO_ATTRIBUTES,
  type TrunfoAttribute,
  type TrunfoCard,
} from './engine';

export type TrunfoBotDifficulty = 'easy' | 'hard';

export class TrunfoBot {
  difficulty: TrunfoBotDifficulty;

  constructor(difficulty: TrunfoBotDifficulty = 'easy') {
    this.difficulty = difficulty;
  }

  /**
   * Choose an attribute from the bot's hand.
   *  - easy: random.
   *  - hard: pick the attribute with the highest mean across the hand
   *    (poor man's minimax: globally best attribute on average).
   */
  chooseAttribute(hand: readonly TrunfoCard[]): TrunfoAttribute {
    if (hand.length === 0) return 'dificuldade';
    if (this.difficulty === 'easy') {
      const idx = Math.floor(Math.random() * TRUNFO_ATTRIBUTES.length);
      return TRUNFO_ATTRIBUTES[idx] as TrunfoAttribute;
    }
    // hard: maximize mean of attribute across own hand and weight by top-card value.
    let bestAttr: TrunfoAttribute = 'dificuldade';
    let bestScore = -Infinity;
    const top = hand[0]!;
    for (const attr of TRUNFO_ATTRIBUTES) {
      const sum = hand.reduce((acc, c) => acc + c.attrs[attr], 0);
      const mean = sum / hand.length;
      const score = mean * 0.7 + top.attrs[attr] * 0.3;
      if (score > bestScore) {
        bestScore = score;
        bestAttr = attr;
      }
    }
    return bestAttr;
  }
}
