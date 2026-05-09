'use client';

/**
 * Card "Resolver questões" do dashboard que abre um bottom-sheet com 3
 * modos de estudo (em vez de navegar direto pra /quiz). Inspiração:
 * respostaCerta.
 *
 * É um wrapper client-side que recebe os dados via props (renderizados
 * pelo server component <StudyModeCards>). Isso preserva SSR pros números
 * (totalQuestions) sem forçar a página inteira a virar client.
 */
import { useState } from 'react';
import { Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StudyModeSheet } from './study-mode-sheet';

interface Props {
  totalQuestions: number;
}

export function ResolverQuestoesCard({ totalQuestions }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Card
        className="flex h-full flex-col gap-3 border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{
          borderLeftColor: 'hsl(var(--accent-quiz))',
          backgroundColor: 'hsl(var(--accent-quiz) / 0.04)',
        }}
      >
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex flex-1 flex-col gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          aria-label="Resolver questões — escolher modo de treino"
        >
          <div className="flex w-full items-center justify-between">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'hsl(var(--accent-quiz) / 0.16)',
                color: 'hsl(var(--accent-quiz))',
              }}
              aria-hidden="true"
            >
              <Target className="h-5 w-5" />
            </span>
            <span
              className="text-xl font-bold tabular-nums"
              style={{ color: 'hsl(var(--accent-quiz))' }}
            >
              {totalQuestions}q
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold text-foreground">
              Resolver questões
            </span>
            <span className="text-xs text-muted-foreground">
              Resolva questões por área de interesse
            </span>
          </div>
          <span
            className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: 'hsl(var(--accent-quiz) / 0.16)',
              color: 'hsl(var(--accent-quiz))',
            }}
          >
            Começar agora
          </span>
        </button>
      </Card>

      <StudyModeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        totalQuestions={totalQuestions}
      />
    </>
  );
}
