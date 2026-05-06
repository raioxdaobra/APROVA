'use client';

/**
 * <TrilhaMapRPG> — mapa visual estilo RPG épico (PR 26).
 *
 * Estrutura:
 *   - Lista de "ranks" empilhados verticalmente, cada um com seu tema visual
 *     (gradiente, label, ícone).
 *   - Em cada rank, 5 estações dispostas em zigzag (S-curve), conectadas por
 *     paths SVG curvos que representam a "estrada".
 *   - Estações: 4 normais + 1 boss (maior, com coroa).
 *
 * Estados visuais:
 *   completed     — concluída, círculo cor da disciplina, check + medalha
 *   next          — próxima a fazer, animate-pulse + glow
 *   available     — desbloqueada, hover destaca
 *   locked        — bloqueada, cinza + cadeado
 *   boss-*        — variantes maiores com Crown
 *
 * Mobile: scroll vertical natural; estações com tap target ≥ 60px.
 */
import { useMemo, useState } from 'react';
import {
  Atom,
  BookOpen,
  BookOpenText,
  Building2,
  Calculator,
  CheckCircle2,
  Crown,
  Flame,
  FlaskConical,
  Landmark,
  Leaf,
  Lock,
  Mountain,
  Sprout,
  Sword,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DISCIPLINE_COLOR_HEX,
  TRILHA_RANK_THEMES,
  findNextStationId,
  getRankTheme,
  getStationVisualState,
  groupByRank,
  type StationVisualState,
  type TrilhaRankTheme,
  type TrilhaStationRPG,
} from '@/lib/trilha/stations';
import { TrilhaStationRPGModal } from './trilha-station-rpg-modal';
import type { Discipline } from '@/lib/supabase/types';

const RANK_ICONS: Record<TrilhaRankTheme['iconName'], LucideIcon> = {
  Sprout,
  Mountain,
  BookOpen,
  Building2,
  Flame,
  Waves,
  FlaskConical,
  Crown,
};

const DISCIPLINE_ICONS: Record<Discipline, LucideIcon> = {
  matematica: Calculator,
  fisica: Atom,
  quimica: FlaskConical,
  biologia: Leaf,
  humanas: Landmark,
  linguagens: BookOpenText,
};

export interface TrilhaMapRPGProps {
  stations: TrilhaStationRPG[];
}

export function TrilhaMapRPG({ stations }: TrilhaMapRPGProps) {
  const [selected, setSelected] = useState<TrilhaStationRPG | null>(null);

  const groups = useMemo(() => groupByRank(stations), [stations]);
  const nextId = useMemo(() => findNextStationId(stations), [stations]);

  // Renderiza ranks em ordem 1..8.
  const sortedRanks = useMemo(
    () =>
      [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([rank, list]) => ({
        rank,
        theme: getRankTheme(rank),
        stations: list,
      })),
    [groups],
  );

  return (
    <>
      <div className="flex flex-col gap-12 pb-12">
        {sortedRanks.map(({ rank, theme, stations: rankStations }) => {
          const completedInRank = rankStations.filter((s) => s.is_passed).length;
          return (
            <RankSection
              key={rank}
              theme={theme}
              completed={completedInRank}
              total={rankStations.length}
            >
              <StationStrip
                stations={rankStations}
                nextId={nextId}
                onSelect={(s) => setSelected(s)}
              />
            </RankSection>
          );
        })}
      </div>

      <TrilhaStationRPGModal
        open={selected !== null}
        station={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

interface RankSectionProps {
  theme: TrilhaRankTheme;
  completed: number;
  total: number;
  children: React.ReactNode;
}

function RankSection({ theme, completed, total, children }: RankSectionProps) {
  const Icon = RANK_ICONS[theme.iconName];
  return (
    <section
      aria-labelledby={`rpg-rank-${theme.rank}`}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b px-3 py-6 sm:px-6',
        theme.bgClass,
      )}
    >
      <header className="mb-6 flex items-center gap-3">
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border-2 border-current bg-card/80 backdrop-blur',
            theme.accentClass,
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rank {theme.rank}
          </span>
          <h2
            id={`rpg-rank-${theme.rank}`}
            className={cn('text-lg font-bold', theme.accentClass)}
          >
            {theme.label}
          </h2>
          <span className="text-xs text-muted-foreground">
            {theme.subtitle} · {completed}/{total} estações
          </span>
        </div>
      </header>
      {children}
    </section>
  );
}

// -----------------------------------------------------------------------------
// StationStrip — layout zigzag dos 5 nodes do rank com SVG paths conectando.
// -----------------------------------------------------------------------------
interface StationStripProps {
  stations: TrilhaStationRPG[];
  nextId: string | null;
  onSelect: (s: TrilhaStationRPG) => void;
}

const NODE_SIZE = 64;
const BOSS_SIZE = 80;
const ROW_HEIGHT = 130;
const VIEW_WIDTH = 320;

function xForPos(pos: number): number {
  // 5 estações em zigzag: pos 1=center-left, 2=right, 3=left, 4=right, 5=center
  switch (pos) {
    case 1:
      return VIEW_WIDTH * 0.3;
    case 2:
      return VIEW_WIDTH * 0.78;
    case 3:
      return VIEW_WIDTH * 0.22;
    case 4:
      return VIEW_WIDTH * 0.78;
    case 5:
    default:
      return VIEW_WIDTH * 0.5;
  }
}

function StationStrip({ stations, nextId, onSelect }: StationStripProps) {
  const height = ROW_HEIGHT * stations.length + 40;

  return (
    <div className="relative mx-auto" style={{ width: VIEW_WIDTH, height }}>
      {/* SVG conexões (estradas) */}
      <svg
        width={VIEW_WIDTH}
        height={height}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        focusable="false"
      >
        {stations.slice(0, -1).map((s, i) => {
          const next = stations[i + 1];
          if (!next) return null;
          const x1 = xForPos(s.position_in_rank);
          const y1 = ROW_HEIGHT * i + ROW_HEIGHT / 2;
          const x2 = xForPos(next.position_in_rank);
          const y2 = ROW_HEIGHT * (i + 1) + ROW_HEIGHT / 2;
          const midY = (y1 + y2) / 2;
          const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
          const isCompleted = s.is_passed && next.is_unlocked;
          const stroke = isCompleted ? '#F59E0B' : 'currentColor';
          return (
            <path
              key={`${s.id}-link`}
              d={path}
              fill="none"
              stroke={stroke}
              strokeOpacity={isCompleted ? 1 : 0.4}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={isCompleted ? undefined : '8 8'}
              className={isCompleted ? '' : 'text-muted-foreground'}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {stations.map((station, i) => {
        const cx = xForPos(station.position_in_rank);
        const cy = ROW_HEIGHT * i + ROW_HEIGHT / 2;
        const size = station.is_boss ? BOSS_SIZE : NODE_SIZE;
        const isNext = station.id === nextId;
        const state = getStationVisualState(station, isNext);
        return (
          <TrilhaStationNode
            key={station.id}
            station={station}
            state={state}
            style={{
              position: 'absolute',
              left: cx - size / 2,
              top: cy - size / 2,
              width: size,
              height: size,
            }}
            onSelect={() => onSelect(station)}
          />
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Single Node
// -----------------------------------------------------------------------------
interface TrilhaStationNodeProps {
  station: TrilhaStationRPG;
  state: StationVisualState;
  style: React.CSSProperties;
  onSelect: () => void;
}

function TrilhaStationNode({
  station,
  state,
  style,
  onSelect,
}: TrilhaStationNodeProps) {
  const DiscIcon = DISCIPLINE_ICONS[station.discipline] ?? Calculator;
  const color = DISCIPLINE_COLOR_HEX[station.discipline] ?? '#2563EB';
  const isLocked = state === 'locked' || state === 'boss-locked';
  const isCompleted = state === 'completed' || state === 'boss-completed';
  const isNext = state === 'next';
  const isBoss = station.is_boss;

  let bgStyle: React.CSSProperties = {};
  let borderClass = 'border-2';
  let extraWrap = '';

  if (isLocked) {
    bgStyle = { backgroundColor: '#9CA3AF' };
    borderClass = 'border-2 border-stone-400';
  } else if (isCompleted) {
    bgStyle = { backgroundColor: color };
    borderClass = 'border-2 border-yellow-400';
  } else if (isNext) {
    bgStyle = { backgroundColor: color };
    borderClass = 'border-4 border-yellow-400';
    extraWrap = 'animate-pulse shadow-[0_0_24px_rgba(251,191,36,0.6)]';
  } else if (state === 'boss-available') {
    bgStyle = { backgroundColor: color };
    borderClass = 'border-4 border-amber-500';
    extraWrap = 'shadow-[0_0_20px_rgba(245,158,11,0.45)]';
  } else {
    // available
    bgStyle = { backgroundColor: color, opacity: 0.85 };
    borderClass = 'border-2 border-white/40';
  }

  const ariaLabel = `Estação ${station.position_in_rank} do rank ${station.rank}: ${station.title} — ${
    isCompleted ? 'concluída' : isLocked ? 'bloqueada' : isNext ? 'próxima a fazer' : 'disponível'
  }`;

  return (
    <div style={style} className="flex flex-col items-center">
      <button
        type="button"
        onClick={onSelect}
        aria-label={ariaLabel}
        style={{ width: '100%', height: '100%', ...bgStyle }}
        className={cn(
          'group relative flex items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2',
          borderClass,
          extraWrap,
        )}
      >
        {/* Ícone central */}
        {isLocked ? (
          <Lock className="h-6 w-6 text-white" aria-hidden="true" />
        ) : isBoss ? (
          isCompleted ? (
            <Crown className="h-9 w-9 text-yellow-100" aria-hidden="true" />
          ) : (
            <Sword className="h-8 w-8 text-white" aria-hidden="true" />
          )
        ) : (
          <DiscIcon
            className={cn('h-7 w-7', isCompleted ? 'text-white' : 'text-white')}
            aria-hidden="true"
          />
        )}

        {/* Medalha em cima quando concluída */}
        {isCompleted && (
          <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 ring-2 ring-card">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
        )}

        {/* Mini-progress ring se attempts > 0 e não passed */}
        {!isCompleted && !isLocked && station.attempts_count > 0 && (
          <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-card px-1.5 text-[10px] font-bold text-foreground ring-2 ring-yellow-400">
            {station.best_score_pct}%
          </span>
        )}
      </button>

      {/* Título embaixo */}
      <span
        className={cn(
          'mt-2 max-w-[120px] truncate text-center text-[11px] font-medium',
          isLocked ? 'text-muted-foreground' : 'text-foreground',
        )}
        title={station.title}
      >
        {station.title}
      </span>
    </div>
  );
}

// Export para reuso (se necessário em testes ou outro mapa).
export { TrilhaStationNode };

// Reutiliza TRILHA_RANK_THEMES re-export pra eventual breadcrumb.
export { TRILHA_RANK_THEMES };
