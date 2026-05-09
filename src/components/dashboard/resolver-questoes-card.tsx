'use client';

/**
 * Card "Resolver questões" do dashboard que abre um bottom-sheet com 3
 * modos de estudo (em vez de navegar direto pra /quiz). Inspiração:
 * respostaCerta.
 *
 * É um wrapper client-side que recebe os dados via props (renderizados
 * pelo server component <StudyModeCards>). Isso preserva SSR pros números
 * (totalQuestions, totalAnswered, accuracyPct) sem forçar a página
 * inteira a virar client.
 */
import { useState } from 'react';
import { CheckCircle2, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StudyModeSheet } from './study-mode-sheet';

interface Props {
  totalQuestions: number;
  /** Total de questões já respondidas pelo user (excluindo diagnóstico). */
  totalAnswered: number;
  /** % de acerto sobre as respondidas. null se nunca respondeu. */
  accuracyPct: number | null;
}

export function ResolverQuestoesCard({
  totalQuestions,
  totalAnswered,
  accuracyPct,
}: Props) {
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

          {/* Stats inline — % acerto + barra de progresso. Visivel
              direto no card sem precisar ir pra /estatisticas. */}
          {totalAnswered > 0 && accuracyPct !== null ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <strong className="text-foreground tabular-nums">
                    {totalAnswered}
                  </strong>{' '}
                  respondidas
                </span>
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: 'hsl(var(--accent-quiz))' }}
                >
                  {accuracyPct}% acerto
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={accuracyPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Taxa de acerto: ${accuracyPct}%`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${accuracyPct}%`,
                    backgroundColor: 'hsl(var(--accent-quiz))',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Você ainda não respondeu nenhuma questão
            </div>
          )}

          <span
            className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: 'hsl(var(--accent-quiz) / 0.16)',
              color: 'hsl(var(--accent-quiz))',
            }}
          >
            Treinar
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
