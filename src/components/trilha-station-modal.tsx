'use client';

/**
 * Modal de detalhes de uma estação da trilha. Usa <dialog> nativo (mesmo
 * pattern do rank-up-modal). Foco é movido para o botão de fechar quando
 * abre; a esc fecha o modal.
 *
 * O CTA leva para o caminho que faz mais sentido pra completar a estação
 * (quiz com filtro de disciplina, simulado, jogos, diagnóstico, etc.).
 */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { TrilhaGoalType, Views, Json } from '@/lib/supabase/types';

type StationView = Views<'user_trilha_full'>;
type NodeState = 'completed' | 'current' | 'future';

export interface TrilhaStationModalProps {
  open: boolean;
  station: StationView | null;
  state: NodeState;
  onClose: () => void;
}

function readDisciplineFilter(filter: Json | null | undefined): string | null {
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) return null;
  const obj = filter as { [key: string]: Json | undefined };
  const d = obj.discipline;
  return typeof d === 'string' ? d : null;
}

function ctaLabelFor(goalType: TrilhaGoalType, state: NodeState): string {
  if (state === 'completed') return 'Praticar mais';
  switch (goalType) {
    case 'complete_simulado':
      return 'Iniciar simulado';
    case 'complete_diagnostic':
      return 'Fazer diagnóstico';
    case 'play_game':
      return 'Abrir jogos';
    case 'focus_minutes':
      return 'Iniciar foco';
    case 'master_subtopics':
      return 'Praticar para domínio';
    case 'reach_streak':
      return 'Estudar agora';
    default:
      return 'Ir agora';
  }
}

function ctaHrefFor(station: StationView): string {
  const disc = readDisciplineFilter(station.goal_filter);
  switch (station.goal_type) {
    case 'complete_simulado':
      return '/simulado';
    case 'complete_diagnostic':
      return '/diagnostico';
    case 'play_game':
      return '/jogos';
    case 'focus_minutes':
      return '/dashboard';
    default:
      if (disc) return `/quiz?disciplina=${encodeURIComponent(disc)}`;
      return '/quiz';
  }
}

export function TrilhaStationModal({
  open,
  station,
  state,
  onClose,
}: TrilhaStationModalProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      // Move foco para o botão de fechar para focus trap razoável.
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  if (!station) return null;

  const target = station.goal_target;
  const progress = Math.min(station.user_progress, target);
  const pct = target > 0 ? Math.round((progress / target) * 100) : 0;
  const ctaHref = ctaHrefFor(station);
  const ctaLabel = ctaLabelFor(station.goal_type, state);

  const stateLabel =
    state === 'completed' ? 'Concluída' : state === 'current' ? 'Em andamento' : 'Bloqueada';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="trilha-station-title"
      className="m-auto w-full max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-foreground/40"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estação {station.position} · {stateLabel}
            </span>
            <h2 id="trilha-station-title" className="text-lg font-semibold">
              {station.title}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Fechar"
            className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-muted-foreground">{station.description}</p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span className="font-mono">
              {progress} / {target}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={progress}
            aria-label={`${progress} de ${target}`}
          >
            <div
              className={
                state === 'completed' ? 'h-full bg-success transition-all' : 'h-full bg-primary transition-all'
              }
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Recompensa</span>
          <span className="font-semibold text-foreground">
            {station.xp_reward} XP
            {station.badge_reward ? ` · badge ${station.badge_reward}` : ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => ref.current?.close()}
          >
            Fechar
          </Button>
          {state === 'future' ? (
            <Button type="button" size="md" disabled>
              Bloqueada
            </Button>
          ) : (
            <Button asChild size="md">
              <Link href={ctaHref} onClick={() => ref.current?.close()}>
                {ctaLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
