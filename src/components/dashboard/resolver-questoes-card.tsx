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
import Link from 'next/link';
import { BarChart3, Target, Trophy } from 'lucide-react';
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

        {/* Stats line — fora do button. Mostra % de acerto + 2 icones
            grandes coloridos (Estatisticas + Ranking) que substituem
            esses itens da sidebar. Icones h-12 w-12 com background SOLIDO
            da cor accent + icone branco — bem visiveis e harmoniosos
            com o card. */}
        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          {totalAnswered > 0 && accuracyPct !== null ? (
            <span className="text-sm">
              <strong
                className="font-bold tabular-nums"
                style={{ color: 'hsl(var(--accent-quiz))' }}
              >
                {accuracyPct}%
              </strong>{' '}
              <span className="text-muted-foreground">de acerto</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Sem questões respondidas ainda
            </span>
          )}
          <div className="flex items-center gap-2">
            <Link
              href="/estatisticas"
              aria-label="Ver estatísticas detalhadas"
              title="Estatísticas"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                backgroundColor: 'hsl(var(--accent-quiz))',
                color: 'white',
              }}
            >
              <BarChart3 className="h-6 w-6" aria-hidden="true" strokeWidth={2.25} />
            </Link>
            <Link
              href="/ranking"
              aria-label="Ver ranking semanal"
              title="Ranking"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                backgroundColor: 'hsl(var(--accent-ranking))',
                color: 'white',
              }}
            >
              <Trophy className="h-6 w-6" aria-hidden="true" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </Card>

      <StudyModeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        totalQuestions={totalQuestions}
      />
    </>
  );
}
