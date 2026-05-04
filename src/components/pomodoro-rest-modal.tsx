'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FOCUS_COMPLETE_EVENT,
  type FocusCompleteDetail,
} from '@/hooks/use-pomodoro';

/**
 * Escuta o evento global `aprova:focus-complete` (disparado pelo hook
 * usePomodoro quando um ciclo de foco termina) e mostra um modal sugerindo
 * "hora do descanso, quer jogar?".
 *
 * Renderiza em qualquer página que monte este componente (hoje: dashboard).
 */
export function PomodoroRestModal() {
  const [open, setOpen] = useState(false);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    function onFocusComplete(ev: Event) {
      const detail = (ev as CustomEvent<FocusCompleteDetail>).detail;
      setTotalToday(detail?.totalToday ?? 0);
      setOpen(true);
    }
    window.addEventListener(FOCUS_COMPLETE_EVENT, onFocusComplete);
    return () => window.removeEventListener(FOCUS_COMPLETE_EVENT, onFocusComplete);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-rest-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Fechar modal"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
        onClick={() => setOpen(false)}
      />
      <div className="relative flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary"
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <h2
              id="pomodoro-rest-title"
              className="text-base font-semibold text-foreground"
            >
              Hora do descanso!
            </h2>
            <p className="text-xs text-muted-foreground">
              Você focou {totalToday} min hoje. Que tal um joguinho rápido?
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground">
          Cinco minutinhos pra recarregar — depois a gente volta pro estudo.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Continuar estudando
          </Button>
          <Button asChild size="sm" onClick={() => setOpen(false)}>
            <Link href="/jogos">Jogar agora</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
