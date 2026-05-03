'use client';

import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePomodoro } from '@/hooks/use-pomodoro';

function formatMmSs(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

/**
 * Pequeno widget Pomodoro fixo no canto superior direito.
 * 25min foco / 5min pausa, persiste em localStorage.
 *
 * Integrado apenas no quiz-runner (NÃO no simulado, pra não conflitar com o
 * cronômetro do simulado).
 */
export function PomodoroTimer({ className }: { className?: string }) {
  const { phase, running, remainingSec, cycles, toggle, reset } = usePomodoro();

  const phaseLabel = phase === 'focus' ? 'Foco' : 'Pausa';
  const phaseTone =
    phase === 'focus'
      ? 'text-primary'
      : 'text-success';

  return (
    <div
      className={cn(
        'pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-2.5 py-1.5 shadow-md backdrop-blur',
        className,
      )}
      role="group"
      aria-label="Pomodoro"
    >
      <Timer className={cn('h-4 w-4', phaseTone)} aria-hidden />
      <span
        className={cn('text-xs font-semibold uppercase tracking-wide', phaseTone)}
      >
        {phaseLabel}
      </span>
      <span
        className="font-mono text-sm font-semibold tabular-nums text-foreground"
        aria-live="polite"
        aria-label="Tempo restante"
      >
        {formatMmSs(remainingSec)}
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={running ? 'Pausar pomodoro' : 'Iniciar pomodoro'}
        className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground hover:bg-muted"
      >
        {running ? (
          <Pause className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Play className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Reiniciar pomodoro"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      </button>
      {cycles > 0 ? (
        <span
          className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground"
          title={`${cycles} ${cycles === 1 ? 'ciclo' : 'ciclos'} concluídos`}
        >
          {cycles}
        </span>
      ) : null}
    </div>
  );
}
