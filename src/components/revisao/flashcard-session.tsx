'use client';

/**
 * Sessão de revisão (Anki-style). Recebe fila inicial do server e roda
 * client-side: mostrar → flip → grade → próximo. Atalhos teclado:
 *  - Espaço: flip
 *  - 1: Errei (0)
 *  - 2: Difícil (3)
 *  - 3: Bom (4)
 *  - 4: Fácil (5)
 */
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { FlashcardCard } from './flashcard-card';
import { submitReview } from '@/app/revisao/actions';
import type { FlashcardCardData, Quality } from '@/lib/srs/types';

interface Props {
  initialQueue: FlashcardCardData[];
}

interface QualityButton {
  key: '1' | '2' | '3' | '4';
  quality: Quality;
  label: string;
  cls: string;
}

const QUALITY_BUTTONS: QualityButton[] = [
  {
    key: '1',
    quality: 0,
    label: 'Errei',
    cls: 'border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300',
  },
  {
    key: '2',
    quality: 3,
    label: 'Difícil',
    cls: 'border-orange-500/30 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-300',
  },
  {
    key: '3',
    quality: 4,
    label: 'Bom',
    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300',
  },
  {
    key: '4',
    quality: 5,
    label: 'Fácil',
    cls: 'border-sky-500/30 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 dark:text-sky-300',
  },
];

export function FlashcardSession({ initialQueue }: Props) {
  const [queue] = useState<FlashcardCardData[]>(initialQueue);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(0);

  const current = queue[index] ?? null;

  const handleFlip = useCallback(() => {
    if (!flipped && current) setFlipped(true);
  }, [flipped, current]);

  const handleGrade = useCallback(
    (quality: Quality) => {
      if (!current || isPending || !flipped) return;
      startTransition(async () => {
        await submitReview({ questionId: current.questionId, quality });
        setDone((d) => d + 1);
        setIndex((i) => i + 1);
        setFlipped(false);
      });
    },
    [current, isPending, flipped],
  );

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!current) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

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
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, flipped, handleGrade]);

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold">Em dia! ✓</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Sem cards pra revisar agora. Volte mais tarde — ou resolva mais questões pra
          gerar pool de revisão.
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <span className="text-4xl" role="img" aria-label="Festa">
          🎉
        </span>
        <h2 className="mt-2 text-lg font-semibold">Revisão concluída!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Você revisou <strong className="text-foreground">{done}</strong>{' '}
          {done === 1 ? 'card' : 'cards'}. Volte amanhã pra próxima leva.
        </p>
      </div>
    );
  }

  const progressPct = Math.round((index / queue.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Card <strong className="text-foreground tabular-nums">{index + 1}</strong> de{' '}
          <span className="tabular-nums">{queue.length}</span>
          {current.isNew ? (
            <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              Novo
            </span>
          ) : null}
        </span>
        <span className="tabular-nums text-muted-foreground">{done} feitos</span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
          aria-hidden="true"
        />
      </div>

      <FlashcardCard card={current} flipped={flipped} onFlip={handleFlip} />

      {flipped ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUALITY_BUTTONS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => handleGrade(b.quality)}
              disabled={isPending}
              className={`inline-flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${b.cls}`}
              aria-label={`${b.label} (atalho ${b.key})`}
            >
              <span>{b.label}</span>
              <span className="font-mono text-[10px] opacity-70">[{b.key}]</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Pense na resposta primeiro, depois clique pra ver o gabarito.
        </p>
      )}
    </div>
  );
}
