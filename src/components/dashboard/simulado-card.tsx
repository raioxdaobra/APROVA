import Link from 'next/link';
import { BarChart3, Brain, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
  /** Total de simulados FINALIZADOS pelo user. */
  simuladosFeitos: number;
  /** % de acerto sobre tentativas em context='simulado'. null se nunca fez. */
  simuladoAccuracyPct: number | null;
}

/**
 * Card "Simulado" do dashboard. Espelha o ResolverQuestoesCard:
 * - Mesmos 3 icones (Estatisticas, Ranking, Revisao) com mesma cor
 *   por icone (consistencia visual entre os 2 cards)
 * - Stats inerentes ao card (so contam attempts/sessoes de simulado)
 * - Card border-l-4 com accent-simulado (azul) — diferencia do quiz
 *
 * Diferente do ResolverQuestoesCard, NAO abre bottom-sheet — vai direto
 * pra /simulado (tela de setup do simulado). Server-friendly: e um
 * componente puro com Link, sem state.
 */
export function SimuladoCard({ simuladosFeitos, simuladoAccuracyPct }: Props) {
  return (
    <Card
      className="flex h-full flex-col gap-3 border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderLeftColor: 'hsl(var(--accent-simulado))',
        backgroundColor: 'hsl(var(--accent-simulado) / 0.04)',
      }}
    >
      {/* Click target principal: leva pra /simulado (setup) */}
      <Link
        href="/simulado"
        className="flex flex-1 flex-col gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
      >
        <div className="flex w-full items-center justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: 'hsl(var(--accent-simulado) / 0.16)',
              color: 'hsl(var(--accent-simulado))',
            }}
            aria-hidden="true"
          >
            <BarChart3 className="h-5 w-5" />
          </span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: 'hsl(var(--accent-simulado))' }}
          >
            Real
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground">Simulado</span>
          <span className="text-xs text-muted-foreground">
            Preparamos um simulado pra você com base no que mais cai
          </span>
        </div>

        <span
          className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: 'hsl(var(--accent-simulado) / 0.16)',
            color: 'hsl(var(--accent-simulado))',
          }}
        >
          Iniciar simulado
        </span>
      </Link>

      {/* Stats line — fora do Link principal pra que os 3 icones sejam
          links proprios (HTML invalido <a> dentro de <a>). Mostra
          stats INERENTES AO SIMULADO: # simulados feitos + % acerto
          em context='simulado'. */}
      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        {simuladosFeitos > 0 && simuladoAccuracyPct !== null ? (
          <span className="text-sm">
            <strong
              className="font-bold tabular-nums"
              style={{ color: 'hsl(var(--accent-simulado))' }}
            >
              {simuladoAccuracyPct}%
            </strong>{' '}
            <span className="text-muted-foreground">
              em {simuladosFeitos} {simuladosFeitos === 1 ? 'simulado' : 'simulados'}
            </span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Você ainda não fez nenhum simulado
          </span>
        )}
        {/* Icones com ?context=simulado pra mostrar dados FILTRADOS so
            de tentativas em context='simulado'. Permite ao user comparar
            seu desempenho em simulado vs quiz separadamente. */}
        <div className="flex items-center gap-2">
          <Link
            href="/estatisticas?context=simulado"
            aria-label="Ver estatísticas de simulado"
            title="Estatísticas (simulado)"
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              backgroundColor: 'hsl(var(--accent-quiz))',
              color: 'white',
            }}
          >
            <BarChart3 className="h-6 w-6" aria-hidden="true" strokeWidth={2.25} />
          </Link>
          <Link
            href="/ranking?context=simulado"
            aria-label="Ver ranking semanal de simulado"
            title="Ranking (simulado)"
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              backgroundColor: 'hsl(var(--accent-ranking))',
              color: 'white',
            }}
          >
            <Trophy className="h-6 w-6" aria-hidden="true" strokeWidth={2.25} />
          </Link>
          <Link
            href="/revisar-erros?context=simulado"
            aria-label="Revisar erros de simulado"
            title="Revisar erros (simulado)"
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              backgroundColor: 'hsl(var(--accent-chat))',
              color: 'white',
            }}
          >
            <Brain className="h-6 w-6" aria-hidden="true" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
