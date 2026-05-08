'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MoveHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameShell } from '@/components/game-shell';
import { submitScore } from '@/lib/games/score-action';
import { cn } from '@/lib/utils';
import { calcHanoiScore, initialHanoi, tryMove, type HanoiState } from './engine';

const DISC_OPTIONS = [5, 6, 7] as const;

const DISC_GRADIENTS = [
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-emerald-400 to-emerald-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-pink-400 to-pink-600',
];

export default function HanoiGame() {
  const [discCount, setDiscCount] = useState<5 | 6 | 7>(5);
  const [state, setState] = useState<HanoiState>(() => initialHanoi(5));
  const [submitted, setSubmitted] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const restart = (n: 5 | 6 | 7 = discCount) => {
    setDiscCount(n);
    setState(initialHanoi(n));
    setSubmitted(false);
    startedAtRef.current = Date.now();
  };

  const onTowerClick = (idx: 0 | 1 | 2) => {
    setState((s) => {
      if (s.finished) return s;
      if (s.selected === null) {
        if (s.towers[idx].length === 0) return s;
        return { ...s, selected: idx };
      }
      if (s.selected === idx) return { ...s, selected: null };
      return tryMove(s, s.selected, idx);
    });
  };

  useEffect(() => {
    if (!state.finished || submitted) return;
    setSubmitted(true);
    const score = calcHanoiScore(state.discCount, state.moves);
    void submitScore({
      gameId: 'hanoi',
      score,
      durationMs: Date.now() - startedAtRef.current,
      meta: { discCount: state.discCount, moves: state.moves },
    });
  }, [state, submitted]);

  const finalScore = state.finished
    ? calcHanoiScore(state.discCount, state.moves)
    : null;
  const optimal = Math.pow(2, state.discCount) - 1;

  return (
    <GameShell
      title="Torre de Hanói"
      subtitle="Mova todos os discos para a torre da direita"
      onRestart={() => restart()}
      finalScore={finalScore}
      instructions={{
        gameId: 'hanoi',
        title: 'Torre de Hanói',
        subtitle: 'Mova todos os discos no menor número de jogadas',
        icon: '🗼',
        rules: [
          'Você tem 3 hastes e vários discos empilhados na haste da esquerda (do maior pro menor).',
          'Mova todos os discos pra haste da direita, mantendo a ordem (maior embaixo).',
          'Só pode mover um disco por vez, e nunca colocar um maior em cima de um menor.',
          'Toque em uma haste pra "pegar" o disco do topo, depois toque na haste de destino.',
          'Quanto menos movimentos usar (mais perto do ótimo 2ⁿ−1), maior a pontuação.',
        ],
      }}
      hud={
        <span className="rounded-full bg-card px-2 py-1 text-xs">
          <MoveHorizontal className="mr-1 inline h-3 w-3" />
          {state.moves} mov · ótimo {optimal}
        </span>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Discos:</span>
          {DISC_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => restart(n)}
              className={cn(
                'rounded-full border px-3 py-1',
                discCount === n
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/40',
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <div
          className="flex w-full max-w-3xl items-end justify-around rounded-2xl border border-border/60 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl"
          style={{ perspective: '900px', minHeight: 360 }}
        >
          {([0, 1, 2] as const).map((idx) => {
            const isSel = state.selected === idx;
            const tower = state.towers[idx];
            return (
              <button
                key={idx}
                onClick={() => onTowerClick(idx)}
                className={cn(
                  'group relative flex h-72 w-1/3 flex-col-reverse items-center justify-end transition',
                  isSel && 'scale-105',
                )}
              >
                {/* Pole */}
                <div
                  className={cn(
                    'absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full transition-colors',
                    isSel ? 'bg-amber-400/80' : 'bg-amber-700/70',
                  )}
                  style={{ width: 8, height: 240 }}
                />
                {/* Base */}
                <div className="z-10 h-3 w-full rounded-md bg-gradient-to-b from-amber-700 to-amber-900 shadow-inner" />
                {/* Discs */}
                <div className="relative z-20 flex w-full flex-col-reverse items-center gap-1 pb-3">
                  {tower.map((d, i) => {
                    const widthPct = 30 + (d / state.discCount) * 60;
                    const grad = DISC_GRADIENTS[(d - 1) % DISC_GRADIENTS.length];
                    return (
                      <div
                        key={`${idx}-${i}-${d}`}
                        className={cn(
                          'h-6 rounded-full bg-gradient-to-b shadow-lg ring-1 ring-black/30',
                          grad,
                          isSel && i === tower.length - 1 && 'ring-2 ring-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.7)]',
                        )}
                        style={{
                          width: `${widthPct}%`,
                          transform: 'rotateX(20deg)',
                          transformStyle: 'preserve-3d',
                        }}
                      />
                    );
                  })}
                </div>
                <span className="absolute top-2 text-xs font-bold text-white/70">
                  {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Toque numa torre pra selecionar e em outra pra mover. Disco maior nunca pode
          ficar sobre disco menor.
        </p>

        {state.finished ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h2 className="text-xl font-bold">Resolvido!</h2>
            <p className="text-sm text-muted-foreground">
              {state.moves} movimentos (ótimo: {optimal})
            </p>
            <Button onClick={() => restart()}>Jogar de novo</Button>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}
