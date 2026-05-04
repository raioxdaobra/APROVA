// Quebra-cabeça lógico tipo Einstein — versão 4x4.
// 4 casas, 4 categorias com 4 valores cada.
// Geramos uma solução e dicas declarativas.

export interface LogicaPuzzle {
  categories: string[]; // e.g. ['Cor', 'Nação', 'Bebida', 'Pet']
  values: Record<string, string[]>; // category -> 4 values
  /** solution[house][category] = value. Houses are 0..3. */
  solution: Record<string, string>[];
  clues: string[];
}

const PRESET = {
  categories: ['Cor', 'Nação', 'Bebida', 'Pet'],
  values: {
    Cor: ['Vermelha', 'Verde', 'Azul', 'Amarela'],
    Nação: ['Brasileira', 'Japonesa', 'Italiana', 'Norueguesa'],
    Bebida: ['Café', 'Chá', 'Leite', 'Água'],
    Pet: ['Cachorro', 'Gato', 'Pássaro', 'Peixe'],
  } as Record<string, string[]>,
};

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

function buildSolution(): Record<string, string>[] {
  const sol: Record<string, string>[] = Array.from({ length: 4 }, () => ({}));
  for (const cat of PRESET.categories) {
    const vals = shuffle(PRESET.values[cat]!);
    for (let i = 0; i < 4; i++) {
      sol[i]![cat] = vals[i]!;
    }
  }
  return sol;
}

function buildClues(sol: Record<string, string>[]): string[] {
  const clues: string[] = [];
  // Direct positional clues (e.g. "A casa 1 é Vermelha"). Limit to a few.
  const cats = PRESET.categories;
  // Pick 3 direct positional facts.
  for (let k = 0; k < 3; k++) {
    const house = Math.floor(Math.random() * 4);
    const cat = cats[Math.floor(Math.random() * cats.length)]!;
    const val = sol[house]![cat]!;
    clues.push(`A casa ${house + 1} tem ${val.toLowerCase()}.`);
  }
  // Pair-equivalence clues (same house). 4 of these.
  for (let k = 0; k < 4; k++) {
    const house = Math.floor(Math.random() * 4);
    const c1 = cats[Math.floor(Math.random() * cats.length)]!;
    let c2 = cats[Math.floor(Math.random() * cats.length)]!;
    while (c2 === c1) c2 = cats[Math.floor(Math.random() * cats.length)]!;
    clues.push(
      `Quem tem ${sol[house]![c1]!.toLowerCase()} também tem ${sol[house]![c2]!.toLowerCase()}.`,
    );
  }
  // Adjacency clues. 4 of these.
  for (let k = 0; k < 4; k++) {
    const a = Math.floor(Math.random() * 3); // 0..2 ensures b=a+1 valid
    const b = a + 1;
    const c1 = cats[Math.floor(Math.random() * cats.length)]!;
    const c2 = cats[Math.floor(Math.random() * cats.length)]!;
    clues.push(
      `${sol[a]![c1]!} mora ao lado de quem tem ${sol[b]![c2]!.toLowerCase()}.`,
    );
  }
  // Negative position clues. 4 of these.
  for (let k = 0; k < 4; k++) {
    const house = Math.floor(Math.random() * 4);
    const cat = cats[Math.floor(Math.random() * cats.length)]!;
    const realVal = sol[house]![cat]!;
    let fakeVal = PRESET.values[cat]![Math.floor(Math.random() * 4)]!;
    while (fakeVal === realVal) {
      fakeVal = PRESET.values[cat]![Math.floor(Math.random() * 4)]!;
    }
    clues.push(`Na casa ${house + 1} NÃO há ${fakeVal.toLowerCase()}.`);
  }
  return clues.slice(0, 15); // 15 clues per spec
}

export function generateLogica(): LogicaPuzzle {
  const solution = buildSolution();
  return {
    categories: PRESET.categories,
    values: PRESET.values,
    solution,
    clues: buildClues(solution),
  };
}

export function isSolved(
  guess: Record<string, string>[],
  solution: Record<string, string>[],
): boolean {
  for (let i = 0; i < 4; i++) {
    for (const cat of Object.keys(solution[i]!)) {
      if (guess[i]?.[cat] !== solution[i]![cat]) return false;
    }
  }
  return true;
}

/** Score = base 2000 - tempo_seg * 5 - dicas usadas * 100. */
export function calcLogicaScore(durationMs: number, hintsUsed: number): number {
  const sec = durationMs / 1000;
  return Math.max(0, Math.floor(2000 - sec * 5 - hintsUsed * 100));
}
