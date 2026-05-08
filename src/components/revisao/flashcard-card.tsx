'use client';

import type { FlashcardCardData } from '@/lib/srs/types';

interface Props {
  card: FlashcardCardData;
  flipped: boolean;
  onFlip: () => void;
}

const DISCIPLINE_LABEL: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

export function FlashcardCard({ card, flipped, onFlip }: Props) {
  const disciplineLabel = DISCIPLINE_LABEL[card.discipline] ?? card.discipline;

  return (
    <article className="flex min-h-[20rem] flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
          {disciplineLabel}
        </span>
        <span className="truncate text-right">{card.subtopic}</span>
        <span className="shrink-0 tabular-nums">{card.year}</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3">
        <p className="text-base leading-relaxed text-foreground sm:text-lg">
          {card.frontText}
        </p>

        {flipped ? (
          <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Resposta
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground sm:text-base">
              {card.backText}
            </p>
          </div>
        ) : null}
      </div>

      {!flipped ? (
        <button
          type="button"
          onClick={onFlip}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Mostrar resposta
          <span className="ml-2 hidden rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-mono sm:inline">
            Espaço
          </span>
        </button>
      ) : null}
    </article>
  );
}
