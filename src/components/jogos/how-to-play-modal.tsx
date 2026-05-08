'use client';

/**
 * Modal "Como jogar" compartilhado entre todos os mini-games.
 *
 * Comportamento:
 *  - Renderiza um overlay com regras curtas + botão "Começar".
 *  - Persiste em localStorage `aprova:game-instructions-shown:<gameId>` para
 *    não abrir automaticamente em partidas futuras.
 *  - Pode ser reaberto manualmente (botão "Ver regras" no header do GameShell).
 */

import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_PREFIX = 'aprova:game-instructions-shown:';

export interface HowToPlayInstructions {
  /** ID do jogo, usado pra chave do localStorage. */
  gameId: string;
  /** Título exibido no header do modal. Ex: "Mate-Speed". */
  title: string;
  /** Subtítulo opcional, ex: "Contas rápidas no cronômetro". */
  subtitle?: string;
  /** Emoji/ícone exibido no topo. */
  icon?: ReactNode;
  /** 3-5 bullets curtos de regra. */
  rules: ReactNode[];
  /** Texto opcional do botão de iniciar (default "Começar"). */
  startLabel?: string;
}

export interface HowToPlayModalProps {
  instructions: HowToPlayInstructions;
  /**
   * Controle externo de abertura. Se `null`/undefined, o modal usa o estado
   * automático (abre na primeira partida com base no localStorage).
   */
  open?: boolean;
  /** Callback quando o modal fecha (clique em "Começar" ou X). */
  onClose?: () => void;
  /** Quando true, força o modal aberto mesmo se localStorage indicar visto. */
  forceOpen?: boolean;
}

export function getInstructionsSeen(gameId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + gameId) === '1';
  } catch {
    return true;
  }
}

export function markInstructionsSeen(gameId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + gameId, '1');
  } catch {
    /* ignore */
  }
}

export function HowToPlayModal({
  instructions,
  open: controlledOpen,
  onClose,
  forceOpen = false,
}: HowToPlayModalProps) {
  const [autoOpen, setAutoOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Auto-abre na 1a partida (depois do mount pra evitar SSR mismatch).
  useEffect(() => {
    setHydrated(true);
    if (controlledOpen !== undefined) return;
    if (forceOpen || !getInstructionsSeen(instructions.gameId)) {
      setAutoOpen(true);
    }
  }, [controlledOpen, forceOpen, instructions.gameId]);

  const isOpen = controlledOpen ?? autoOpen;

  function handleClose() {
    markInstructionsSeen(instructions.gameId);
    setAutoOpen(false);
    onClose?.();
  }

  if (!hydrated || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
      className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-center"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/40 bg-card p-6 shadow-[0_0_60px_rgba(196,99,59,0.35)]">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          {instructions.icon ? (
            <span aria-hidden className="text-3xl">
              {instructions.icon}
            </span>
          ) : (
            <BookOpen className="h-6 w-6 text-primary" aria-hidden />
          )}
          <div>
            <h2
              id="how-to-play-title"
              className="bg-gradient-to-r from-primary via-primary-dark to-amber-500 bg-clip-text text-lg font-bold text-transparent"
            >
              Como jogar — {instructions.title}
            </h2>
            {instructions.subtitle ? (
              <p className="text-xs text-muted-foreground">{instructions.subtitle}</p>
            ) : null}
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {instructions.rules.map((rule, i) => (
            <li
              key={i}
              className={cn(
                'flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2',
              )}
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-foreground">{rule}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleClose}>
            {instructions.startLabel ?? 'Começar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
