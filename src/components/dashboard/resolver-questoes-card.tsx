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
import { Target } from 'lucide-react';
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
        {/* Click target principal: abre o bottom-sheet com modos de estudo.
            Stats ficam FORA do button pra que o icone "ver estatisticas"
            possa ser um <Link> proprio (HTML invalido pra <a> dentro de
            <button>). */}
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
            Treinar
          </span>
        </button>

        {/* Stats line — apenas % de acerto. Icones de Estatisticas/Ranking/
            Revisao foram movidos pra barra horizontal acima do card (em
            <StudyModeCards>) por decisao do user: unificar atalhos numa
            barra so e nao duplicar icones por card. */}
        {totalAnswered > 0 && accuracyPct !== null ? (
          <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
            <span className="text-sm">
              <strong
                className="font-bold tabular-nums"
                style={{ color: 'hsl(var(--accent-quiz))' }}
              >
                {accuracyPct}%
              </strong>{' '}
              <span className="text-muted-foreground">de acerto</span>
            </span>
          </div>
        ) : null}
      </Card>

      <StudyModeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        totalQuestions={totalQuestions}
      />
    </>
  );
}
