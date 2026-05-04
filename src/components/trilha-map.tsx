'use client';

/**
 * Mapa vertical estilo Duolingo. Renderiza as 40 estações em 8 grupos
 * (ranks). Cada estação é um nó alternando esquerda/direita; uma linha
 * curva (SVG path) conecta o nó anterior ao próximo.
 *
 * Estados de cada nó:
 *   - completa  (✓) — bg-success
 *   - atual     (pulse)  — bg-primary com ring animado
 *   - futura    (cadeado) — bg-muted
 *
 * "Atual" = primeira estação não completa. Tudo depois fica bloqueado.
 */
import { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  Check,
  GraduationCap,
  Lock,
  Notebook,
  Sprout,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listTrilhaRanks,
  trilhaRankById,
  TRILHA_RANK_ORDER,
  type TrilhaRank,
} from '@/lib/trilha/ranks';
import type { TrilhaRankId, Views } from '@/lib/supabase/types';
import { TrilhaStationModal } from './trilha-station-modal';

const RANK_ICONS: Record<string, LucideIcon> = {
  Sprout,
  BookOpen,
  Notebook,
  Target,
  GraduationCap,
  Star,
  Brain,
  Trophy,
};

type StationView = Views<'user_trilha_full'>;
type NodeState = 'completed' | 'current' | 'future';

interface NodeViewModel {
  station: StationView;
  state: NodeState;
  side: 'left' | 'right' | 'center';
}

function rankIndex(id: TrilhaRankId): number {
  return TRILHA_RANK_ORDER.indexOf(id);
}

function sortStations(stations: StationView[]): StationView[] {
  return [...stations].sort((a, b) => {
    const ra = rankIndex(a.rank_id);
    const rb = rankIndex(b.rank_id);
    if (ra !== rb) return ra - rb;
    return a.position - b.position;
  });
}

function buildNodes(stations: StationView[]): NodeViewModel[] {
  const sorted = sortStations(stations);
  let foundCurrent = false;
  return sorted.map((station, idx) => {
    let state: NodeState;
    if (station.user_completed) {
      state = 'completed';
    } else if (!foundCurrent) {
      state = 'current';
      foundCurrent = true;
    } else {
      state = 'future';
    }
    const mod = idx % 4;
    let side: 'left' | 'right' | 'center';
    if (mod === 0) side = 'center';
    else if (mod === 1) side = 'right';
    else if (mod === 2) side = 'center';
    else side = 'left';
    return { station, state, side };
  });
}

interface RankGroup {
  rank: TrilhaRank;
  nodes: NodeViewModel[];
}

function groupByRank(nodes: NodeViewModel[]): RankGroup[] {
  const ranks = listTrilhaRanks();
  return ranks
    .map((rank) => ({
      rank,
      nodes: nodes.filter((n) => n.station.rank_id === rank.id),
    }))
    .filter((g) => g.nodes.length > 0);
}

export interface TrilhaMapProps {
  stations: StationView[];
  weeklyXp: number;
}

export function TrilhaMap({ stations, weeklyXp }: TrilhaMapProps) {
  const [selected, setSelected] = useState<StationView | null>(null);
  const [selectedState, setSelectedState] = useState<NodeState>('future');

  const nodes = useMemo(() => buildNodes(stations), [stations]);
  const groups = useMemo(() => groupByRank(nodes), [nodes]);

  function handleNodeClick(node: NodeViewModel) {
    setSelected(node.station);
    setSelectedState(node.state);
  }

  return (
    <>
      <div className="flex flex-col gap-10">
        {groups.map((group) => {
          const completedInGroup = group.nodes.filter(
            (n) => n.state === 'completed',
          ).length;
          return (
            <RankSection
              key={group.rank.id}
              rank={group.rank}
              completed={completedInGroup}
              total={group.nodes.length}
              weeklyXp={weeklyXp}
            >
              <NodeColumn nodes={group.nodes} onSelect={handleNodeClick} />
            </RankSection>
          );
        })}
      </div>
      <TrilhaStationModal
        open={selected !== null}
        station={selected}
        state={selectedState}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

interface RankSectionProps {
  rank: TrilhaRank;
  completed: number;
  total: number;
  weeklyXp: number;
  children: React.ReactNode;
}

function RankSection({ rank, completed, total, weeklyXp, children }: RankSectionProps) {
  const Icon = RANK_ICONS[rank.icon] ?? Sprout;
  const reachedXp = weeklyXp >= rank.minXp;
  return (
    <section aria-labelledby={`rank-${rank.id}`} className="flex flex-col gap-4">
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-xs',
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-muted',
              rank.color,
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <h2 id={`rank-${rank.id}`} className={cn('text-base font-semibold', rank.color)}>
              {rank.label}
            </h2>
            <span className="text-xs text-muted-foreground">
              {Number.isFinite(rank.maxXp)
                ? `${rank.minXp}–${rank.maxXp} XP`
                : `${rank.minXp}+ XP`}
              {' · '}
              {completed}/{total} concluídas
              {reachedXp ? ' · alcançado' : ''}
            </span>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

interface NodeColumnProps {
  nodes: NodeViewModel[];
  onSelect: (n: NodeViewModel) => void;
}

const NODE_SIZE = 64; // px
const ROW_HEIGHT = 110; // px entre linhas
const COLUMN_WIDTH = 280; // px área util (com folga)

function xForSide(side: 'left' | 'right' | 'center'): number {
  // Coordenadas relativas dentro de COLUMN_WIDTH
  if (side === 'left') return COLUMN_WIDTH * 0.18;
  if (side === 'right') return COLUMN_WIDTH * 0.82;
  return COLUMN_WIDTH * 0.5;
}

function NodeColumn({ nodes, onSelect }: NodeColumnProps) {
  const height = ROW_HEIGHT * nodes.length + NODE_SIZE;
  return (
    <div className="relative mx-auto" style={{ width: COLUMN_WIDTH, height }}>
      <svg
        width={COLUMN_WIDTH}
        height={height}
        className="absolute inset-0"
        aria-hidden="true"
        focusable="false"
      >
        {nodes.slice(0, -1).map((n, i) => {
          const next = nodes[i + 1];
          if (!next) return null;
          const x1 = xForSide(n.side);
          const y1 = ROW_HEIGHT * i + NODE_SIZE / 2 + NODE_SIZE / 2;
          const x2 = xForSide(next.side);
          const y2 = ROW_HEIGHT * (i + 1) + NODE_SIZE / 2 + NODE_SIZE / 2;
          const midY = (y1 + y2) / 2;
          const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
          const stroke =
            n.state === 'completed' ? 'var(--success, #15803D)' : 'var(--border, #E7E5E4)';
          return (
            <path
              key={`${n.station.id}-link`}
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={n.state === 'completed' ? undefined : '6 6'}
            />
          );
        })}
      </svg>
      {nodes.map((node, i) => {
        const x = xForSide(node.side);
        const y = ROW_HEIGHT * i + NODE_SIZE / 2;
        return (
          <NodeButton
            key={node.station.id}
            node={node}
            style={{
              position: 'absolute',
              left: x - NODE_SIZE / 2,
              top: y,
              width: NODE_SIZE,
              height: NODE_SIZE,
            }}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

interface NodeButtonProps {
  node: NodeViewModel;
  style: React.CSSProperties;
  onSelect: (n: NodeViewModel) => void;
}

function NodeButton({ node, style, onSelect }: NodeButtonProps) {
  const { station, state } = node;
  const rank = trilhaRankById(station.rank_id);
  const Icon = rank ? (RANK_ICONS[rank.icon] ?? Sprout) : Sprout;

  const stateClass =
    state === 'completed'
      ? 'bg-success text-white border-success'
      : state === 'current'
        ? 'bg-primary text-primary-foreground border-primary animate-pulse'
        : 'bg-muted text-muted-foreground border-border';

  const ariaLabel =
    state === 'completed'
      ? `Estação ${station.position}: ${station.title} — concluída`
      : state === 'current'
        ? `Estação ${station.position}: ${station.title} — atual, ${station.user_progress} de ${station.goal_target}`
        : `Estação ${station.position}: ${station.title} — bloqueada`;

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      style={style}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center justify-center rounded-full border-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        stateClass,
      )}
    >
      {state === 'completed' ? (
        <Check className="h-7 w-7" aria-hidden="true" />
      ) : state === 'future' ? (
        <Lock className="h-6 w-6" aria-hidden="true" />
      ) : (
        <Icon className="h-7 w-7" aria-hidden="true" />
      )}
    </button>
  );
}
