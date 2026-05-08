'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { QuestionImageLightbox } from '@/components/question-image-lightbox';
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
  const [zoomOpen, setZoomOpen] = useState(false);
  const disciplineLabel = DISCIPLINE_LABEL[card.discipline] ?? card.discipline;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
          {disciplineLabel}
        </span>
        <span className="truncate">{card.subtopic}</span>
        <span className="shrink-0 tabular-nums">{card.year}</span>
      </div>

      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted"
        aria-label="Ampliar imagem da questão"
      >
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={`Questão de ${disciplineLabel}`}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-contain"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Imagem indisponível
          </div>
        )}
        <span className="absolute right-2 top-2 inline-flex items-center justify-center rounded-md bg-background/80 p-1.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {card.description ? (
        <p className="text-sm leading-relaxed text-foreground">{card.description}</p>
      ) : null}

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
      ) : (
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Resposta correta
          </p>
          <p className="mt-1 text-4xl font-bold text-primary">{card.correctAnswer}</p>
        </div>
      )}

      <QuestionImageLightbox
        open={zoomOpen}
        src={card.imageUrl}
        alt={`Questão de ${disciplineLabel}`}
        onClose={() => setZoomOpen(false)}
      />
    </article>
  );
}
