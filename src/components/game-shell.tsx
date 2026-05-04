'use client';

// TODO(W5-merge): Reconcile with W5's authoritative GameShell when available.
// W6 stub used by complex games (trunfo, corrida, sudoku, lógica, hanói).

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GameShellProps {
  title: string;
  subtitle?: string;
  /** Lobby route. Defaults to /jogos. */
  backHref?: string;
  /** Render the live HUD (score, timer, etc.) above the playfield. */
  hud?: ReactNode;
  /** Restart handler — when provided, a Restart button shows in the toolbar. */
  onRestart?: () => void;
  /** Final score banner shown when present. */
  finalScore?: number | null;
  /** Optional accent class for the gradient background (Tailwind utility). */
  accentClassName?: string;
  children: ReactNode;
}

/**
 * Lightweight chrome for a mini-game: title + back link + optional HUD/restart
 * + gradient backdrop.
 */
export function GameShell({
  title,
  subtitle,
  backHref = '/jogos',
  hud,
  onRestart,
  finalScore,
  accentClassName,
  children,
}: GameShellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn(
        'relative min-h-[calc(100dvh-4rem)] w-full overflow-hidden bg-background text-foreground',
        accentClassName,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href={backHref} aria-label="Voltar para jogos">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Jogos
            </Link>
          </Button>
          <div className="leading-tight">
            <h1 className="text-base font-bold sm:text-lg">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mounted && hud ? <div className="text-sm">{hud}</div> : null}
          {onRestart ? (
            <Button size="sm" variant="secondary" onClick={onRestart}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Reiniciar
            </Button>
          ) : null}
        </div>
      </header>

      {finalScore !== null && finalScore !== undefined ? (
        <div className="border-b border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/10 to-amber-500/10 px-4 py-2 text-center text-sm font-semibold">
          <Trophy className="mr-2 inline h-4 w-4 text-amber-500" />
          Pontuação final:{' '}
          <span className="text-primary">{finalScore.toLocaleString('pt-BR')}</span>
        </div>
      ) : null}

      <main className="px-3 py-5 sm:px-6">{children}</main>
    </div>
  );
}
