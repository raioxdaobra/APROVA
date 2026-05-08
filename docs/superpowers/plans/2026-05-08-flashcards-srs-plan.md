# Anki/SRS Flashcards — Implementation Plan

**Goal:** Implementar revisão espaçada (SM-2) usando as 990 questões oficiais já cadastradas. Nova rota `/revisao`, card no dashboard, item na sidebar.

**Architecture:** Tabela `flashcard_reviews` (user_id, question_id, ease_factor, interval_days, due_at) + view `flashcards_available` filtrando anuladas + lib pura `src/lib/srs/sm2.ts` com algoritmo SM-2. Server Actions em `src/app/revisao/actions.ts`. UI client `<FlashcardSession>` consome a fila via action.

**Tech Stack:** Next.js 14 App Router + Supabase Postgres/RLS + TypeScript estrito + Tailwind + lucide-react `Brain` icon.

---

## File Structure

**Created:**
- `supabase/migrations/0035_flashcards_srs.sql` — tabela + view + RLS
- `src/lib/srs/sm2.ts` — algoritmo puro, sem deps DB
- `src/lib/srs/sm2.test.ts` — 4+ unit tests (vitest se já configurado, senão node:test)
- `src/lib/srs/types.ts` — tipos compartilhados (`Quality`, `ReviewState`, `FlashcardCard`)
- `src/app/revisao/actions.ts` — `getDueQueue`, `submitReview`, `getFlashcardCounts`
- `src/app/revisao/page.tsx` — Server Component
- `src/components/revisao/flashcard-session.tsx` — Client (fila + flip + grading)
- `src/components/revisao/flashcard-card.tsx` — Componente do card (front/back)
- `src/components/dashboard/revisao-card.tsx` — Card pro dashboard

**Modified:**
- `src/components/layout/app-sidebar.tsx` — adicionar item "Revisão" entre `/trilha` e `/jogos`
- `src/app/dashboard/page.tsx` — incluir `<RevisaoCard>` na grid

---

## Parallelization Plan

Tasks **M e P** podem rodar 100% paralelas (sem deps cruzadas).
Task **N** depende de M (precisa do tipo `Quality` e SM-2).
Task **O** depende de N (consome as actions).

Por isso: dispatch M+P em paralelo, depois N, depois O. Total esperado ~30 min com paralelismo.

```
M: Migration + SM-2 lib + tests          ─┐
P: Sidebar entry + dashboard card         │  paralelos
                                          ─┘
                                          ↓
N: Server Actions (depende de SM-2)       
                                          ↓
O: UI /revisao + components (depende N)
```

---

## Task M — Migration + SM-2 lib + tests

**Files:**
- Create: `supabase/migrations/0035_flashcards_srs.sql`
- Create: `src/lib/srs/sm2.ts`
- Create: `src/lib/srs/types.ts`
- Create: `src/lib/srs/sm2.test.ts`

### Steps

- [ ] **Step 1: Criar tipos** em `src/lib/srs/types.ts`

```typescript
/**
 * Tipos compartilhados do sistema SRS (SM-2).
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

export interface FlashcardCard {
  questionId: string;
  discipline: string;
  subtopic: string;
  description: string | null;
  imageUrl: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  year: number;
  isNew: boolean;
}

export interface FlashcardCounts {
  dueToday: number;
  overdue: number;
  newAvailable: number;
  totalReviewed: number;
}
```

- [ ] **Step 2: Criar SM-2 puro** em `src/lib/srs/sm2.ts`

```typescript
/**
 * SM-2 algorithm (SuperMemo 2 — base do Anki).
 *
 * Função pura. Recebe estado anterior + quality, retorna próximo estado.
 * Cards "novos" (sem estado anterior) entram com EF=2.5, reps=0, interval=0.
 *
 * Regras:
 *   quality < 3 → reset reps, interval = 1
 *   reps == 1 → interval = 1
 *   reps == 2 → interval = 6
 *   reps > 2 → interval = round(interval_prev * EF_prev)
 *   EF' = EF + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
 *   EF mínimo = 1.3
 */
import type { Quality, ReviewState } from './types';

export function nextReview(
  prev: ReviewState | null,
  quality: Quality,
  now: Date = new Date(),
): ReviewState {
  const efPrev = prev?.ease_factor ?? 2.5;
  const repsPrev = prev?.repetitions ?? 0;
  const intervalPrev = prev?.interval_days ?? 0;

  let nextReps: number;
  let nextInterval: number;
  let nextEf: number;

  if (quality < 3) {
    nextReps = 0;
    nextInterval = 1;
    nextEf = efPrev;
  } else {
    nextReps = repsPrev + 1;
    if (nextReps === 1) {
      nextInterval = 1;
    } else if (nextReps === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.max(1, Math.round(intervalPrev * efPrev));
    }
    nextEf = efPrev + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  }

  if (nextEf < 1.3) nextEf = 1.3;

  const due = new Date(now.getTime());
  due.setUTCDate(due.getUTCDate() + nextInterval);

  return {
    ease_factor: Math.round(nextEf * 100) / 100,
    interval_days: nextInterval,
    repetitions: nextReps,
    due_at: due,
  };
}

export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return state.due_at.getTime() <= now.getTime();
}
```

- [ ] **Step 3: Criar testes** em `src/lib/srs/sm2.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { nextReview } from './sm2';

const NOW = new Date('2026-05-08T00:00:00Z');

describe('nextReview', () => {
  it('novo card com Bom (4) → reps=1, interval=1, EF~2.5', () => {
    const r = nextReview(null, 4, NOW);
    expect(r.repetitions).toBe(1);
    expect(r.interval_days).toBe(1);
    expect(r.ease_factor).toBeCloseTo(2.5, 2);
  });

  it('3 acertos seguidos com Bom (4) → reps=3, interval=6, depois ~15', () => {
    const r1 = nextReview(null, 4, NOW);
    const r2 = nextReview(r1, 4, NOW);
    expect(r2.repetitions).toBe(2);
    expect(r2.interval_days).toBe(6);
    const r3 = nextReview(r2, 4, NOW);
    expect(r3.repetitions).toBe(3);
    expect(r3.interval_days).toBe(15); // round(6 * 2.5)
  });

  it('Errei (0) reseta reps e interval=1, EF preservado', () => {
    const r1 = nextReview(null, 5, NOW); // EF sobe pra 2.6
    const r2 = nextReview(r1, 0, NOW);
    expect(r2.repetitions).toBe(0);
    expect(r2.interval_days).toBe(1);
    expect(r2.ease_factor).toBeCloseTo(2.6, 2);
  });

  it('EF nunca cai abaixo de 1.3', () => {
    let state = nextReview(null, 4, NOW);
    for (let i = 0; i < 30; i++) state = nextReview(state, 3, NOW);
    expect(state.ease_factor).toBeGreaterThanOrEqual(1.3);
  });

  it('Fácil (5) sobe EF', () => {
    const r = nextReview(null, 5, NOW);
    expect(r.ease_factor).toBeCloseTo(2.6, 2);
  });

  it('due_at é now + interval_days em UTC', () => {
    const r = nextReview(null, 4, NOW);
    expect(r.due_at.toISOString()).toBe('2026-05-09T00:00:00.000Z');
  });
});
```

- [ ] **Step 4: Verificar test runner** — checar `package.json` por `vitest` ou `jest`. Se nenhum existir, usar `node:test` (nativo) e adaptar imports. Se vitest: `pnpm vitest run src/lib/srs`. Se jest: `pnpm jest src/lib/srs`.

- [ ] **Step 5: Rodar testes** — Expected: 6/6 PASS.

- [ ] **Step 6: Criar migration** em `supabase/migrations/0035_flashcards_srs.sql` (conteúdo na seção 4 do spec). Idempotente (`if not exists`, `drop policy if exists`).

- [ ] **Step 7: Aplicar migration via Supabase CLI** (ou via SQL direto no painel se CLI ausente):
```bash
supabase db push --db-url "$SUPABASE_DB_URL"
```
Expected: "Migration 0035 applied".

- [ ] **Step 8: Validar schema na DB** rodando SQL no painel:
```sql
select count(*) from flashcards_available;  -- deve dar ~990
select * from flashcard_reviews limit 1;     -- deve estar vazia
```

- [ ] **Step 9: Commit**

```bash
git add supabase/migrations/0035_flashcards_srs.sql src/lib/srs/
git commit -m "feat(srs): SM-2 algorithm + flashcard_reviews table for spaced repetition"
```

---

## Task N — Server Actions

**Depende de:** Task M (tipos + SM-2).

**Files:**
- Create: `src/app/revisao/actions.ts`

### Steps

- [ ] **Step 1: Criar `src/app/revisao/actions.ts`**

```typescript
'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nextReview } from '@/lib/srs/sm2';
import type {
  FlashcardCard,
  FlashcardCounts,
  Quality,
  ReviewState,
} from '@/lib/srs/types';

const qualitySchema = z.union([z.literal(0), z.literal(3), z.literal(4), z.literal(5)]);
const submitSchema = z.object({
  questionId: z.string().min(1).max(120),
  quality: qualitySchema,
});

export async function getDueQueue(limit = 20): Promise<FlashcardCard[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Cards devidos (já em flashcard_reviews com due_at <= now)
  const { data: dueRows } = await supabase
    .from('flashcard_reviews')
    .select('question_id, due_at')
    .eq('user_id', user.id)
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(limit);

  const dueIds = (dueRows ?? []).map((r) => r.question_id);

  // 2. Se ainda há slot, busca cards "novos" (sem linha em flashcard_reviews).
  const remaining = Math.max(0, limit - dueIds.length);
  let newIds: string[] = [];
  if (remaining > 0) {
    const { data: reviewedRows } = await supabase
      .from('flashcard_reviews')
      .select('question_id')
      .eq('user_id', user.id);
    const reviewedSet = new Set((reviewedRows ?? []).map((r) => r.question_id));

    const { data: availableRows } = await supabase
      .from('flashcards_available')
      .select('question_id')
      .limit(2000); // cap defensivo
    const candidates = (availableRows ?? [])
      .map((r) => r.question_id as string)
      .filter((id) => !reviewedSet.has(id));

    // shuffle determinístico do dia
    const seed = new Date().toISOString().slice(0, 10);
    candidates.sort((a, b) => hash(a + seed).localeCompare(hash(b + seed)));
    newIds = candidates.slice(0, remaining);
  }

  const ids = [...dueIds, ...newIds];
  if (ids.length === 0) return [];

  // 3. Carrega dados completos da view
  const { data: cards } = await supabase
    .from('flashcards_available')
    .select('question_id, discipline, subtopic, description, image_url, correct_answer, year')
    .in('question_id', ids);

  if (!cards) return [];

  const dueSet = new Set(dueIds);
  const cardMap = new Map(cards.map((c) => [c.question_id, c]));

  return ids
    .map((id) => {
      const c = cardMap.get(id);
      if (!c) return null;
      return {
        questionId: c.question_id,
        discipline: c.discipline ?? '',
        subtopic: c.subtopic ?? '',
        description: c.description ?? null,
        imageUrl: c.image_url ?? '',
        correctAnswer: (c.correct_answer ?? 'A') as 'A' | 'B' | 'C' | 'D' | 'E',
        year: c.year ?? 0,
        isNew: !dueSet.has(id),
      } satisfies FlashcardCard;
    })
    .filter((c): c is FlashcardCard => c !== null);
}

export async function submitReview(input: {
  questionId: string;
  quality: Quality;
}): Promise<{ ok: boolean; nextDueAt?: string; error?: string }> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { data: existing } = await supabase
    .from('flashcard_reviews')
    .select('ease_factor, interval_days, repetitions, due_at, total_reviews')
    .eq('user_id', user.id)
    .eq('question_id', parsed.data.questionId)
    .maybeSingle();

  const prev: ReviewState | null = existing
    ? {
        ease_factor: Number(existing.ease_factor),
        interval_days: existing.interval_days,
        repetitions: existing.repetitions,
        due_at: new Date(existing.due_at),
      }
    : null;

  const next = nextReview(prev, parsed.data.quality);
  const totalReviews = (existing?.total_reviews ?? 0) + 1;

  const { error } = await supabase
    .from('flashcard_reviews')
    .upsert(
      {
        user_id: user.id,
        question_id: parsed.data.questionId,
        ease_factor: next.ease_factor,
        interval_days: next.interval_days,
        repetitions: next.repetitions,
        due_at: next.due_at.toISOString(),
        last_quality: parsed.data.quality,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,question_id' },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true, nextDueAt: next.due_at.toISOString() };
}

export async function getFlashcardCounts(): Promise<FlashcardCounts> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { dueToday: 0, overdue: 0, newAvailable: 0, totalReviewed: 0 };

  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 3600_000).toISOString();

  const [{ count: overdue }, { count: dueToday }, { count: totalReviewed }, { count: totalAvailable }] =
    await Promise.all([
      supabase
        .from('flashcard_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lt('due_at', now),
      supabase
        .from('flashcard_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('due_at', now)
        .lt('due_at', tomorrow),
      supabase
        .from('flashcard_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase.from('flashcards_available').select('*', { count: 'exact', head: true }),
    ]);

  return {
    dueToday: dueToday ?? 0,
    overdue: overdue ?? 0,
    newAvailable: Math.max(0, (totalAvailable ?? 0) - (totalReviewed ?? 0)),
    totalReviewed: totalReviewed ?? 0,
  };
}

// Hash simples pra shuffle determinístico
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
```

- [ ] **Step 2: Verificar tipo Database tem `flashcard_reviews` e `flashcards_available`**

Provável que `src/lib/supabase/types.ts` esteja desatualizado. Se queries quebrarem com TS, regenerar:
```bash
supabase gen types typescript --project-id udajthekofnfewuxxdcq > src/lib/supabase/types.ts
```
Se sem CLI: usar cast `as any` temporário. Migrar pra tipo gerado em PR futuro.

- [ ] **Step 3: Rodar typecheck local**

```bash
pnpm typecheck
```
Expected: PASS (ou só warnings).

- [ ] **Step 4: Commit**

```bash
git add src/app/revisao/actions.ts src/lib/supabase/types.ts
git commit -m "feat(srs): server actions getDueQueue/submitReview/getFlashcardCounts"
```

---

## Task O — UI /revisao

**Depende de:** Task N (actions disponíveis).

**Files:**
- Create: `src/app/revisao/page.tsx`
- Create: `src/components/revisao/flashcard-session.tsx`
- Create: `src/components/revisao/flashcard-card.tsx`

### Steps

- [ ] **Step 1: Criar página** `src/app/revisao/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { Brain } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { FlashcardSession } from '@/components/revisao/flashcard-session';
import { getDueQueue, getFlashcardCounts } from './actions';

export const metadata = { title: 'Revisão — APROVA' };
export const dynamic = 'force-dynamic';

export default async function RevisaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [counts, initialQueue] = await Promise.all([
    getFlashcardCounts(),
    getDueQueue(20),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Brain className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revisão</h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{counts.overdue}</strong> atrasados ·{' '}
            <strong className="text-foreground">{counts.dueToday}</strong> pra hoje ·{' '}
            <strong className="text-foreground">{counts.newAvailable}</strong> novos
          </p>
        </div>
      </header>

      <FlashcardSession initialQueue={initialQueue} />
    </div>
  );
}
```

- [ ] **Step 2: Criar `<FlashcardCard>`** (apresentação) em `src/components/revisao/flashcard-card.tsx`

```typescript
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { FlashcardCard as FlashcardData } from '@/lib/srs/types';

interface Props {
  card: FlashcardData;
  flipped: boolean;
  onFlip: () => void;
}

export function FlashcardCard({ card, flipped, onFlip }: Props) {
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 capitalize">
          {card.discipline}
        </span>
        <span className="truncate">{card.subtopic}</span>
        <span>{card.year}</span>
      </div>

      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted"
        aria-label="Ampliar imagem"
      >
        <Image
          src={card.imageUrl}
          alt={`Questão de ${card.discipline}`}
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-contain"
        />
      </button>

      {card.description ? (
        <p className="text-sm text-foreground">{card.description}</p>
      ) : null}

      {!flipped ? (
        <button
          type="button"
          onClick={onFlip}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Mostrar resposta (Espaço)
        </button>
      ) : (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Resposta correta
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">{card.correctAnswer}</p>
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Criar `<FlashcardSession>`** (orquestrador) em `src/components/revisao/flashcard-session.tsx`

```typescript
'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { FlashcardCard } from './flashcard-card';
import { submitReview } from '@/app/revisao/actions';
import type { FlashcardCard as FlashcardData, Quality } from '@/lib/srs/types';

interface Props {
  initialQueue: FlashcardData[];
}

const QUALITY_BUTTONS: Array<{ key: '1' | '2' | '3' | '4'; quality: Quality; label: string; cls: string }> = [
  { key: '1', quality: 0, label: 'Errei', cls: 'bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20' },
  { key: '2', quality: 3, label: 'Difícil', cls: 'bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20' },
  { key: '3', quality: 4, label: 'Bom', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20' },
  { key: '4', quality: 5, label: 'Fácil', cls: 'bg-sky-500/10 text-sky-600 border-sky-500/30 hover:bg-sky-500/20' },
];

export function FlashcardSession({ initialQueue }: Props) {
  const [queue] = useState<FlashcardData[]>(initialQueue);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(0);

  const current = queue[index] ?? null;

  const handleGrade = useCallback(
    (quality: Quality) => {
      if (!current || isPending) return;
      startTransition(async () => {
        await submitReview({ questionId: current.questionId, quality });
        setDone((d) => d + 1);
        setIndex((i) => i + 1);
        setFlipped(false);
      });
    },
    [current, isPending],
  );

  // Atalhos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === ' ' && !flipped) {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (flipped) {
        const btn = QUALITY_BUTTONS.find((b) => b.key === e.key);
        if (btn) {
          e.preventDefault();
          handleGrade(btn.quality);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, flipped, handleGrade]);

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold">Em dia!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sem cards pra revisar agora. Volte mais tarde — ou resolva mais questões pra gerar pool de revisão.
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Revisão concluída! 🎉</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Você revisou <strong>{done}</strong> cards. Volte amanhã pra próxima leva.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Card <strong className="text-foreground">{index + 1}</strong> de {queue.length}
          {current.isNew ? ' · novo' : ''}
        </span>
        <span className="text-muted-foreground">{done} feitos</span>
      </div>

      <FlashcardCard card={current} flipped={flipped} onFlip={() => setFlipped(true)} />

      {flipped ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUALITY_BUTTONS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => handleGrade(b.quality)}
              disabled={isPending}
              className={`inline-flex h-12 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${b.cls}`}
            >
              <span>{b.label}</span>
              <span className="text-[10px] opacity-70">[{b.key}]</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Build local**

```bash
pnpm build
```
Expected: PASS, sem erros TS.

- [ ] **Step 5: Commit**

```bash
git add src/app/revisao/ src/components/revisao/
git commit -m "feat(srs): rota /revisao com flashcard session, flip e grading"
```

---

## Task P — Sidebar entry + dashboard card

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/dashboard/revisao-card.tsx`
- Modify: `src/app/dashboard/page.tsx`

### Steps

- [ ] **Step 1: Adicionar item "Revisão" no sidebar** entre `/trilha` e `/jogos` em `src/components/layout/app-sidebar.tsx`. Importar `Brain` de `lucide-react`. Trecho a inserir após o objeto de `/trilha` no array `ITEMS`:

```typescript
  {
    href: '/revisao',
    label: 'Revisão',
    Icon: Brain,
    match: (p) => p === '/revisao' || p.startsWith('/revisao/'),
    accentVar: '--accent-trilha',
  },
```

- [ ] **Step 2: Criar dashboard card** `src/components/dashboard/revisao-card.tsx`

```typescript
import Link from 'next/link';
import { Brain, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getFlashcardCounts } from '@/app/revisao/actions';

export async function RevisaoCard() {
  const counts = await getFlashcardCounts();
  const total = counts.overdue + counts.dueToday;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Brain className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="font-semibold">Revisão</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          <>Em dia! ✓</>
        ) : (
          <>
            <strong className="text-foreground">{total}</strong> {total === 1 ? 'card' : 'cards'} pra revisar
          </>
        )}
      </p>
      <Link
        href="/revisao"
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Revisar
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </Card>
  );
}
```

- [ ] **Step 3: Incluir `<RevisaoCard>` em `/dashboard`**

Encontrar a primeira grid de cards no `src/app/dashboard/page.tsx` (perto de `<DailyMissionsCard />` ou `<VestibularCountdown />`) e inserir `<RevisaoCard />` após. Ler o page.tsx primeiro pra achar lugar certo.

```typescript
import { RevisaoCard } from '@/components/dashboard/revisao-card';
// ...
{/* dentro da grid existente: */}
<RevisaoCard />
```

- [ ] **Step 4: Build local**

```bash
pnpm build
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/app-sidebar.tsx src/components/dashboard/revisao-card.tsx src/app/dashboard/page.tsx
git commit -m "feat(srs): sidebar entry + dashboard card pra Revisão"
```

---

## Final Integration

- [ ] **Push final**: `git push origin main`. CI faz deploy automático.
- [ ] **Smoke test prod via Chrome MCP**:
  1. Login como `eng.arocha@gmail.com`
  2. Navegar pra `/revisao`
  3. Confirmar que `newAvailable` ~= 990
  4. Iniciar revisão, mostrar resposta (Espaço), marcar Bom (3)
  5. Verificar próxima carta
  6. Após 3 cards, fechar
  7. SQL no Supabase: `select * from flashcard_reviews where user_id = '3b55d45a-...'` — confirma 3 linhas com due_at = hoje+1.

- [ ] **Atualizar `aprova_state.md`** com a sessão.

---

## Self-Review

- [x] Spec coverage: Migration ✓, SM-2 lib ✓, Actions ✓, UI ✓, Sidebar ✓, Dashboard card ✓.
- [x] Sem placeholders TBD/TODO.
- [x] Tipos consistentes (`FlashcardCard`, `Quality`, `ReviewState`).
- [x] Cada task tem commit isolado.
- [x] Test runner verificado (vitest fallback ok).
- [x] RLS ✓.
- [x] Idempotência da migration ✓.
