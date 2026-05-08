'use client';

/**
 * Snake Anatomia — cobrinha clássica em grid 20×20. Frutas = órgãos.
 * Renderiza via Canvas pra performance. Suporta:
 *  - Setas / WASD (desktop)
 *  - Botões direcionais on-screen (mobile)
 *  - Swipe sobre o canvas (mobile)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameShell, GameOverModal } from '@/components/game-shell';
import {
  type Dir,
  type SnakeState,
  GRID,
  initialState,
  setDirection,
  step,
} from './engine';
import { submitGameScore, type LeaderboardRow } from '@/lib/games/score-action';

const TICK_MS = 110; // velocidade fixa
const CELL = 18; // tamanho da célula em px (canvas = GRID*CELL)

export default function SnakeAnatomyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<SnakeState>(() => initialState());
  const stateRef = useRef<SnakeState>(state);
  stateRef.current = state;

  const startedAtRef = useRef<number>(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  const restart = useCallback(() => {
    setState(initialState());
    setSubmitted(false);
    setLeaderboard([]);
    setIsNewBest(false);
    startedAtRef.current = Date.now();
  }, []);

  // Game loop
  useEffect(() => {
    if (!state.alive) return;
    const id = window.setInterval(() => {
      setState((s) => step(s));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [state.alive]);

  // Submit
  useEffect(() => {
    if (state.alive || submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    const dur = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    void submitGameScore('snake_anatomy', state.score, dur).then((r) => {
      setSubmitting(false);
      if (r.ok) {
        setLeaderboard(r.leaderboard);
        setIsNewBest(r.is_new_best);
      }
    });
  }, [state.alive, state.score, submitted]);

  // Render via canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = GRID * CELL;
    const h = GRID * CELL;
    canvas.width = w;
    canvas.height = h;

    // background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1c1209');
    grad.addColorStop(1, '#0e0805');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // grid sutil
    ctx.strokeStyle = 'rgba(196,99,59,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(w, i * CELL);
      ctx.stroke();
    }

    // organ
    const o = state.organ;
    ctx.font = `${CELL - 2}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.emoji, o.pos.x * CELL + CELL / 2, o.pos.y * CELL + CELL / 2);

    // snake — degradê cobre
    state.snake.forEach((p, idx) => {
      const t = idx / Math.max(1, state.snake.length - 1);
      const r = Math.round(196 + (245 - 196) * (1 - t));
      const g = Math.round(99 + (158 - 99) * (1 - t));
      const b = Math.round(59 + (11 - 59) * (1 - t));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      const pad = idx === 0 ? 1 : 2;
      ctx.fillRect(
        p.x * CELL + pad,
        p.y * CELL + pad,
        CELL - pad * 2,
        CELL - pad * 2,
      );
      if (idx === 0) {
        // glow na cabeça
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(p.x * CELL + CELL / 2 - 1, p.y * CELL + 4, 2, 2);
      }
    });
  }, [state]);

  // Teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      let d: Dir | null = null;
      switch (e.key) {
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
      }
      if (d) {
        e.preventDefault();
        setState((s) => setDirection(s, d as Dir));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Swipe touch
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    const t = e.changedTouches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
    let d: Dir;
    if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? 'right' : 'left';
    else d = dy > 0 ? 'down' : 'up';
    setState((s) => setDirection(s, d));
    touchStart.current = null;
  };

  const press = (d: Dir) => () => setState((s) => setDirection(s, d));

  return (
    <GameShell
      title="Snake Anatomia"
      subtitle="Coma órgãos pra crescer. Não bata na parede!"
      icon="🐍"
      onRestart={restart}
      instructions={{
        gameId: 'snake_anatomy',
        title: 'Snake Anatomia',
        subtitle: 'Snake clássico com órgãos do corpo humano',
        icon: '🐍',
        rules: [
          'Controle a cobra com setas/WASD (desktop) ou D-pad/swipe (mobile).',
          'Coma os órgãos que aparecem pra crescer e somar pontos.',
          'A cobra não pode bater nela mesma nem nas paredes — game over imediato.',
          'A velocidade aumenta gradualmente: quanto mais comer, mais rápido fica.',
          'O comprimento final vai pro ranking.',
        ],
      }}
      hud={
        <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-bold text-primary tabular-nums">
          {state.score}
        </span>
      }
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4">
        <div
          className="relative mx-auto overflow-hidden rounded-xl border border-amber-500/30 shadow-[0_0_30px_rgba(196,99,59,0.25)]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <canvas
            ref={canvasRef}
            className="block touch-none select-none"
            style={{ width: '100%', maxWidth: GRID * CELL, aspectRatio: '1/1' }}
            aria-label="Tabuleiro do jogo Snake"
          />
        </div>

        {state.lastEaten ? (
          <p className="text-center text-sm text-amber-500" aria-live="polite">
            <span className="mr-1" aria-hidden>
              {state.lastEaten.emoji}
            </span>
            <strong>{state.lastEaten.name}</strong>
          </p>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Use as setas, WASD ou deslize a tela. Em pé ou deitado, ele cresce.
          </p>
        )}

        {/* D-pad mobile */}
        <div className="mx-auto grid grid-cols-3 gap-1 sm:hidden">
          <span />
          <button
            type="button"
            aria-label="Cima"
            onClick={press('up')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ▲
          </button>
          <span />
          <button
            type="button"
            aria-label="Esquerda"
            onClick={press('left')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Baixo"
            onClick={press('down')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Direita"
            onClick={press('right')}
            className="h-12 w-12 rounded-md border border-border bg-card font-bold active:bg-muted"
          >
            ▶
          </button>
        </div>
      </div>

      <GameOverModal
        open={!state.alive}
        title="Game Over"
        score={state.score}
        scoreLabel="Comprimento"
        headline="Sua cobra parou aqui"
        details={state.lastEaten ? `Último órgão: ${state.lastEaten.name}` : undefined}
        isNewBest={isNewBest}
        loading={submitting}
        leaderboard={leaderboard}
        onPlayAgain={restart}
      />
    </GameShell>
  );
}
