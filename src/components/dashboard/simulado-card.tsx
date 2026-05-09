import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
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

      {/* Stats line — apenas info inerente ao simulado (# simulados +
          % acerto). Icones de Estatisticas/Ranking/Revisao saíram daqui
          e foram pra barra horizontal acima dos cards (StudyModeCards),
          unificados pros dois cards numa unica linha de atalhos. */}
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
      </div>
    </Card>
  );
}
