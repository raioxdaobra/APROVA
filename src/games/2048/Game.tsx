'use client';

/**
 * 2048 — combine tiles iguais. Score = highest tile achievement.
 * Suporta setas (desktop), swipe (mobile) e botões direcionais.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameShell, GameOverModal } from '@/components/game-shell';
import {
  type Board,
  type Direction,
  SIZE,
  addRandomTile,
  calcScore,
  highestTile,
  isGameOver,
  move,
  newGame,
} from './engine';
import { submitGameScore, type LeaderboardRow } from '@/lib/games/score-action';

const TILE_BG: Record<number, string> = {
  0: 'bg-muted/40 border-border',
  2: 'bg-amber-100 text-amber-900 border-amber-200',
  4: 'bg-amber-200 text-amber-900 border-amber-300',
  8: 'bg-orange-300 text-orange-950 border-orange-400',
  16: 'bg-orange-400 text-white border-orange-500',
  32: 'bg-orange-500 text-white border-orange-600',
  64: 'bg-rose-500 text-white border-rose-600',
  128: 'bg-amber-500 text-white border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.45)]',
  256: 'bg-amber-600 text-white border-amber-700 shadow-[0_0_24px_rgba(217,119,6,0.5)]',
  512: 'bg-primary text-primary-foreground border-primary-dark shadow-[0_0_28px_rgba(196,99,59,0.55)]',
  1024: 'bg-primary-dark text-primary-foreground border-primary shadow-[0_0_32px_rgba(168,81,40,0.65)]',
  2048: 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-amber-300 shadow-[0_0_36px_rgba(245,158,11,0.85)]',
};

function tileClass(value: number): string {
  if (value === 0) return TILE_BG[0] as string;
  if (value > 2048) return TILE_BG[2048] as string;
  return TILE_BG[value] ?? (TILE_BG[2048] as string);
}

function tileFontSize(value: number): string {
  if (value < 100) return 'text-3xl sm:text-4xl';
  if (value < 1000) return 'text-2xl sm:text-3xl';
  if (value < 10000) return 'text-xl sm:text-2xl';
  return 'text-lg sm:text-xl';
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => newGame());
  const [over, setOver] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  const score = useMemo(() => calcScore(board), [board]);
  const highest = useMemo(() => highestTile(board), [board]);

  const restart = useCallback(() => {
    setBoard(newGame());
    setOver(false);
    setSubmitted(false);
    setLeaderboard([]);
    setIsNewBest(false);
    startedAtRef.current = Date.now();
  }, []);

  const tryMove = useCallback((dir: Direction) => {
    setBoard((b) => {
      const r = move(b, dir);
      if (!r.changed) return b;
      const next = addRandomTile(r.board);
      if (isGameOver(next)) {
        // marca over no próximo tick pra deixar o tile aparecer
        window.setTimeout(() => setOver(true), 80);
      }
      return next;
    });
  }, []);

  // Submit
  useEffect(() => {
    if (!over || submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    const dur = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    void submitGameScore('2048', score, dur).then((r) => {
      setSubmitting(false);
      if (r.ok) {
        setLeaderboard(r.leaderboard);
        setIsNewBest(r.is_new_best);
      }
    });
  }, [over, score, submitted]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      let d: Direction | null = null;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          d = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          d = 'right';
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          d = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          d = 'down';
          break;
      }
      if (d) {
        e.preventDefault();
        tryMove(d);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove]);

  // Swipe
  const start = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    start.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = start.current;
    const t = e.changedTouches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
    const d: Direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
          ? 'down'
          : 'up';
    tryMove(d);
    start.current = null;
  };

  return (
    <GameShell
      title="2048"
      subtitle="Combine pra chegar no 2048"
      icon="🧩"
      onRestart={restart}
      instructions={{
        gameId: '2048',
        title: '2048 Médico',
        subtitle: 'Junte conceitos crescentes',
        icon: '🧩',
        rules: [
          'Use setas (desktop) ou swipe (mobile) pra mover todas as peças do tabuleiro 4×4.',
          'Quando duas peças iguais se encostam, elas fundem e dobram de valor.',
          'Objetivo: chegar na peça 2048. Ganha pontos pelo maior valor alcançado.',
          'A cada movimento, uma nova peça (2 ou 4) aparece no tabuleiro.',
          'Game over quando o tabuleiro lota e nenhum movimento é possível.',
        ],
      }}
      hud={
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/15 px-2 py-1 font-bold text-primary tabular-nums">
            Maior: {highest}
          </span>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4">
        <div
          className="relative mx-auto w-full max-w-sm rounded-xl border border-amber-500/30 bg-card p-2 shadow-[0_0_24px_rgba(196,99,59,0.25)] sm:p-3"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}
          >
            {board.flatMap((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`}
                  className={
                    'flex aspect-square items-center justify-center rounded-md border-2 font-extrabold tabular-nums transition-transform duration-150 ' +
                    tileClass(v) +
                    ' ' +
                    tileFontSize(v) +
                    (v > 0 ? ' scale-100' : ' scale-95 opacity-90')
                  }
                  aria-label={v === 0 ? 'vazio' : `Tile ${v}`}
                >
                  {v === 0 ? '' : v}
                </div>
              )),
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Use as setas, WASD ou deslize. Score conta o maior tile alcançado.
        </p>

        {/* D-pad mobile */}
        <div className="mx-auto grid grid-cols-3 gap-1 sm:hidden">
          <span />
          <button
            type="button"
            aria-label="Cima"
            onClick={() => tryMove('up')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ▲
          </button>
          <span />
          <button
            type="button"
            aria-label="Esquerda"
            onClick={() => tryMove('left')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Baixo"
            onClick={() => tryMove('down')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Direita"
            onClick={() => tryMove('right')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ▶
          </button>
        </div>
      </div>

      <GameOverModal
        open={over}
        title="Sem mais movimentos"
        score={score}
        scoreLabel="Maior tile"
        headline={highest >= 2048 ? 'Você chegou no 2048!' : 'Tente de novo!'}
        details={`Maior tile alcançado: ${highest}`}
        isNewBest={isNewBest}
        loading={submitting}
        leaderboard={leaderboard}
        onPlayAgain={restart}
      />
    </GameShell>
  );
}
