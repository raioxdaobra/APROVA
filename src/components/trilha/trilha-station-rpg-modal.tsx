'use client';

/**
 * Modal de detalhes de estação RPG (PR 26).
 *
 * Mostra título, disciplina, subtopic, descrição, passing %, histórico de
 * tentativas (best score, last attempt) e CTA "Iniciar quiz" / "Tentar
 * novamente". Para boss, exibe pré-aviso de questão count + passing pct.
 *
 * Mobile: <dialog> nativo; em viewports pequenos esticamos pra fullscreen
 * via classe responsive (Tailwind sm:).
 */
import { useEffect, useRef, useTransition } from 'react';
import { Crown, Lock, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startStationAndRedirect } from '@/app/trilha/actions';
import type { TrilhaStationRPG } from '@/lib/trilha/stations';

export interface TrilhaStationRPGModalProps {
  open: boolean;
  station: TrilhaStationRPG | null;
  onClose: () => void;
}

const DISC_LABEL: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function TrilhaStationRPGModal({
  open,
  station,
  onClose,
}: TrilhaStationRPGModalProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  if (!station) return null;

  const discLabel = DISC_LABEL[station.discipline] ?? station.discipline;
  const isPassed = station.is_passed;
  const isLocked = !station.is_unlocked;
  const isBoss = station.is_boss;
  const ctaLabel = isPassed
    ? 'Tentar novamente'
    : station.attempts_count > 0
      ? 'Continuar tentando'
      : 'Iniciar quiz';

  function handleStart() {
    if (!station) return;
    startTransition(async () => {
      try {
        await startStationAndRedirect(station.id);
      } catch (err) {
        console.error('[trilha] falha ao iniciar estação', err);
      }
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="trilha-rpg-station-title"
      className="m-auto w-full max-w-md rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/50 sm:max-w-lg"
    >
      <div className="flex flex-col gap-4 p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isBoss && <Crown className="h-4 w-4 text-amber-500" aria-hidden="true" />}
              Rank {station.rank} · Estação {station.position_in_rank}
              {isBoss ? ' · BOSS' : ''}
            </span>
            <h2 id="trilha-rpg-station-title" className="text-xl font-bold">
              {station.title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {discLabel}
              {station.subtopic ? ` · ${station.subtopic}` : ''}
            </span>
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
        </header>

        <p className="text-sm text-muted-foreground">{station.description}</p>

        {/* Pré-aviso para boss */}
        {isBoss && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              Desafio especial: <strong>{station.question_count} questões mistas</strong>,{' '}
              <strong>{station.passing_pct}%</strong> de acerto pra vencer.
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Questões" value={String(station.question_count)} />
          <Stat label="Aprovação" value={`${station.passing_pct}%`} />
          <Stat label="XP" value={`+${station.xp_reward}`} />
        </div>

        {/* Histórico */}
        {station.attempts_count > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Melhor pontuação</span>
              <span className="text-base font-bold text-foreground">
                {station.best_score_pct}%
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Tentativas</span>
              <span className="font-mono">{station.attempts_count}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Última</span>
              <span className="font-mono">{formatDate(station.last_attempt_at)}</span>
            </div>
          </div>
        )}

        {isPassed && (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-xs text-green-800 dark:bg-green-950/50 dark:text-green-200">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span>Estação concluída. Tente de novo pra melhorar a pontuação!</span>
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => ref.current?.close()}
          >
            Fechar
          </Button>
          {isLocked ? (
            <Button type="button" size="md" disabled>
              <Lock className="mr-1 h-4 w-4" />
              Bloqueada
            </Button>
          ) : (
            <Button
              type="button"
              size="md"
              onClick={handleStart}
              disabled={isPending}
            >
              {isPending ? 'Iniciando…' : ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
