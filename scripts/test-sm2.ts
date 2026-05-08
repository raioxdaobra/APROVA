/**
 * Smoke test do SM-2 (sem framework de teste — projeto não tem vitest/jest).
 * Rodar com: pnpm tsx scripts/test-sm2.ts
 *
 * Valida casos críticos do algoritmo. Falha = process.exit(1).
 */
import { nextReview } from '../src/lib/srs/sm2';
import type { ReviewState } from '../src/lib/srs/types';

const NOW = new Date('2026-05-08T00:00:00Z');

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name} ${detail}`);
    failures++;
  }
}

// 1. Novo card com Bom (4) → reps=1, interval=1, EF=2.5
const r1 = nextReview(null, 4, NOW);
check('novo card + Bom: reps=1', r1.repetitions === 1);
check('novo card + Bom: interval=1', r1.interval_days === 1);
check('novo card + Bom: EF=2.5', Math.abs(r1.ease_factor - 2.5) < 0.01, `got ${r1.ease_factor}`);
check('novo card + Bom: due_at=now+1d', r1.due_at.toISOString() === '2026-05-09T00:00:00.000Z', `got ${r1.due_at.toISOString()}`);

// 2. 3 acertos seguidos com Bom (4)
const r2 = nextReview(r1, 4, NOW);
check('2x Bom: reps=2', r2.repetitions === 2);
check('2x Bom: interval=6', r2.interval_days === 6);
const r3 = nextReview(r2, 4, NOW);
check('3x Bom: reps=3', r3.repetitions === 3);
check('3x Bom: interval=15', r3.interval_days === 15, `expected 15 (round(6*2.5)), got ${r3.interval_days}`);

// 3. Errei (0) reseta
const r5 = nextReview(null, 5, NOW);
const r5Errei = nextReview(r5, 0, NOW);
check('Errei: reps reset to 0', r5Errei.repetitions === 0);
check('Errei: interval=1', r5Errei.interval_days === 1);
check('Errei: EF preservado', Math.abs(r5Errei.ease_factor - r5.ease_factor) < 0.01, `expected ${r5.ease_factor}, got ${r5Errei.ease_factor}`);

// 4. EF nunca cai abaixo de 1.3
let state: ReviewState = nextReview(null, 4, NOW);
for (let i = 0; i < 30; i++) state = nextReview(state, 3, NOW);
check('EF >= 1.3 após 30 Difícils', state.ease_factor >= 1.3, `got ${state.ease_factor}`);

// 5. Fácil (5) sobe EF
const r6 = nextReview(null, 5, NOW);
check('Fácil sobe EF acima de 2.5', r6.ease_factor > 2.5, `got ${r6.ease_factor}`);

if (failures === 0) {
  console.log('\nAll SM-2 tests passed.');
  process.exit(0);
} else {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
