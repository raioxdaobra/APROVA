'use client';

/**
 * GameShell — wrapper visual comum aos mini-games (PR 13 / W5).
 *
 * Fornece:
 *  - Header com botão "Voltar" + título/ícone + HUD (score/timer) + Reiniciar.
 *  - Banner opcional de pontuação final.
 *  - GameOverModal exportado: score gigante + ranking top 10 + ações.
 *
 * Estilo: gradientes cobre/amber + glow effects. Sem libs externas além das
 * já presentes no projeto (lucide-react, @radix-ui/slot via Button).
 */

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LeaderboardRow } from '@/lib/games/score-action';
import {
  HowToPlayModal,
  type HowToPlayInstructions,
} from '@/components/jogos/how-to-play-modal';

export interface GameShellProps {
  title: string;
  subtitle?: string;
  /** Ícone à esquerda do título (emoji ou ReactNode). */
  icon?: ReactNode;
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
  /** Classes extras pra área principal (main). */
  className?: string;
  /**
   * Instruções "Como jogar". Quando fornecido, exibe modal automaticamente na
   * primeira partida e renderiza botão "Ver regras" no header.
   */
  instructions?: HowToPlayInstructions;
  children: ReactNode;
}

export function GameShell({
  title,
  subtitle,
  icon,
  backHref = '/jogos',
  hud,
  onRestart,
  finalScore,
  accentClassName,
  className,
  instructions,
  children,
}: GameShellProps) {
  // Mark client mount so we can render dynamic widgets lazily without hydration noise.
  const [mounted, setMounted] = useState(false);
  const [rulesOpen, setRulesOpen] = useState<boolean | undefined>(undefined);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn(
        'relative min-h-[calc(100dvh-4rem)] w-full overflow-hidden bg-background text-foreground',
        accentClassName,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href={backHref} aria-label="Voltar para jogos">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Jogos
            </Link>
          </Button>
          <div className="flex items-center gap-2 leading-tight">
            {icon ? (
              <span aria-hidden className="text-2xl">
                {icon}
              </span>
            ) : null}
            <div>
              <h1 className="bg-gradient-to-r from-primary via-primary-dark to-amber-500 bg-clip-text text-base font-bold text-transparent sm:text-lg">
                {title}
              </h1>
              {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mounted && hud ? <div className="text-sm">{hud}</div> : null}
          {instructions ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRulesOpen(true)}
              aria-label="Ver regras"
              title="Ver regras"
            >
              <BookOpen className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Regras</span>
            </Button>
          ) : null}
          {onRestart ? (
            <Button size="sm" variant="secondary" onClick={onRestart}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Reiniciar
            </Button>
          ) : null}
        </div>
      </header>

      {instructions ? (
        <HowToPlayModal
          instructions={instructions}
          open={rulesOpen}
          onClose={() => setRulesOpen(false)}
        />
      ) : null}

      {finalScore !== null && finalScore !== undefined ? (
        <div className="border-b border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 px-4 py-2 text-center text-sm font-semibold">
          <Trophy className="mr-2 inline h-4 w-4 text-amber-500" />
          Pontuação final:{' '}
          <span className="text-primary">{finalScore.toLocaleString('pt-BR')}</span>
        </div>
      ) : null}

      <main className={cn('px-3 py-5 sm:px-6', className)}>{children}</main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game Over Modal
// ---------------------------------------------------------------------------

export interface GameOverModalProps {
  open: boolean;
  title: string;
  score: number;
  scoreLabel?: string;
  /** Texto/ícone livre acima do score (ex: "Você venceu!" ou "Game over"). */
  headline?: ReactNode;
  /** Detalhes opcionais (ex: "Tempo: 42s · Acertos: 7/10"). */
  details?: ReactNode;
  isNewBest?: boolean;
  loading?: boolean;
  leaderboard?: LeaderboardRow[];
  onPlayAgain: () => void;
  backHref?: string;
}

export function GameOverModal({
  open,
  title,
  score,
  scoreLabel = 'Pontuação',
  headline,
  details,
  isNewBest = false,
  loading = false,
  leaderboard = [],
  onPlayAgain,
  backHref = '/jogos',
}: GameOverModalProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/40 bg-card p-6 shadow-[0_0_60px_rgba(196,99,59,0.35)]">
        <h2
          id="game-over-title"
          className="bg-gradient-to-r from-primary via-primary-dark to-amber-500 bg-clip-text text-center text-xl font-bold text-transparent"
        >
          {title}
        </h2>
        {headline ? (
          <p className="mt-1 text-center text-sm text-muted-foreground">{headline}</p>
        ) : null}

        <div className="mt-4 flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {scoreLabel}
          </span>
          <div
            className={cn(
              'text-5xl font-extrabold tabular-nums',
              isNewBest
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(245,158,11,0.55)]'
                : 'text-foreground',
            )}
          >
            {score.toLocaleString('pt-BR')}
          </div>
          {isNewBest ? (
            <span className="mt-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">
              Novo recorde pessoal
            </span>
          ) : null}
          {details ? <div className="mt-2 text-sm text-muted-foreground">{details}</div> : null}
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ranking
          </h3>
          <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-muted/30">
            {loading ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">Carregando…</p>
            ) : leaderboard.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                Sem pontuações públicas ainda. Seja o primeiro!
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {leaderboard.map((row) => (
                  <li
                    key={`${row.position}-${row.username}`}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={cn(
                          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                          row.position === 1
                            ? 'bg-amber-400 text-amber-950'
                            : row.position === 2
                              ? 'bg-amber-200 text-amber-950'
                              : row.position === 3
                                ? 'bg-orange-400 text-amber-950'
                                : 'bg-muted text-foreground',
                        )}
                      >
                        {row.position}
                      </span>
                      <span className="truncate font-medium">
                        {row.display_name || row.username}
                      </span>
                    </span>
                    <span className="font-mono tabular-nums text-primary">
                      {row.best_score.toLocaleString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild variant="secondary">
            <Link href={backHref}>Sair</Link>
          </Button>
          <Button onClick={onPlayAgain}>Jogar de novo</Button>
        </div>
      </div>
    </div>
  );
}
