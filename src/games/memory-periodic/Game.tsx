'use client';

/**
 * Memory Periódica — 16 cards (8 pares símbolo ↔ nome). Vire dois iguais pra
 * formar par. Score = max(0, 1000 - tries*50 - duration*2).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameShell, GameOverModal } from '@/components/game-shell';
import { type MemoryCard, PAIRS, calcScore, makeBoard } from './engine';
import { submitGameScore, type LeaderboardRow } from '@/lib/games/score-action';

type Phase = 'playing' | 'won';

export default function MemoryPeriodicGame() {
  const [board, setBoard] = useState<MemoryCard[]>(() => makeBoard());
  const [revealed, setRevealed] = useState<string[]>([]); // ids virados (até 2)
  const [matched, setMatched] = useState<Set<string>>(() => new Set()); // pairKeys feitos
  const [tries, setTries] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  const score = useMemo(
    () => calcScore(tries, seconds),
    [tries, seconds],
  );

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Win condition
  useEffect(() => {
    if (matched.size === PAIRS && phase === 'playing') {
      setPhase('won');
    }
  }, [matched, phase]);

  // Submit
  useEffect(() => {
    if (phase !== 'won' || submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    const dur = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    void submitGameScore('memory_periodic', score, dur).then((r) => {
      setSubmitting(false);
      if (r.ok) {
        setLeaderboard(r.leaderboard);
        setIsNewBest(r.is_new_best);
      }
    });
  }, [phase, submitted, score]);

  const handleClick = useCallback(
    (card: MemoryCard) => {
      if (busy || phase !== 'playing') return;
      if (matched.has(card.pairKey)) return;
      if (revealed.includes(card.id)) return;

      const next = [...revealed, card.id];
      setRevealed(next);

      if (next.length === 2) {
        setBusy(true);
        setTries((t) => t + 1);
        const [aId, bId] = next as [string, string];
        const a = board.find((c) => c.id === aId);
        const b = board.find((c) => c.id === bId);
        const isPair = a && b && a.pairKey === b.pairKey && a.kind !== b.kind;

        window.setTimeout(
          () => {
            if (isPair && a) {
              setMatched((m) => {
                const ns = new Set(m);
                ns.add(a.pairKey);
                return ns;
              });
            }
            setRevealed([]);
            setBusy(false);
          },
          isPair ? 450 : 850,
        );
      }
    },
    [board, busy, matched, phase, revealed],
  );

  const restart = useCallback(() => {
    setBoard(makeBoard());
    setRevealed([]);
    setMatched(new Set());
    setTries(0);
    setSeconds(0);
    setBusy(false);
    setPhase('playing');
    setSubmitted(false);
    setLeaderboard([]);
    setIsNewBest(false);
    startedAtRef.current = Date.now();
  }, []);

  return (
    <GameShell
      title="Memory Periódica"
      subtitle="Encontre os 8 pares: símbolo ↔ nome"
      icon="⚛️"
      onRestart={restart}
      hud={
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/15 px-2 py-1 font-bold text-primary tabular-nums">
            {matched.size}/{PAIRS}
          </span>
          <span className="rounded-full bg-amber-500/15 px-2 py-1 font-bold text-amber-500 tabular-nums">
            {tries} tries
          </span>
          <span className="rounded-full bg-muted px-2 py-1 font-bold tabular-nums">
            {seconds}s
          </span>
        </div>
      }
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3">
        {board.map((card) => {
          const isRevealed = revealed.includes(card.id) || matched.has(card.pairKey);
          const isMatched = matched.has(card.pairKey);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleClick(card)}
              disabled={busy || isMatched}
              aria-label={isRevealed ? card.label : 'Carta virada'}
              className={
                'relative aspect-square rounded-xl border text-center font-bold transition-all duration-300 [transform-style:preserve-3d] ' +
                (isRevealed
                  ? '[transform:rotateY(180deg)] '
                  : '') +
                (isMatched
                  ? 'border-emerald-500/60 shadow-[0_0_18px_rgba(16,185,129,0.45)]'
                  : 'border-border')
              }
            >
              {/* Frente (virada) */}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-2xl text-primary-foreground [backface-visibility:hidden]"
              >
                ?
              </span>
              {/* Verso (revelado) */}
              <span
                aria-hidden
                className={
                  'absolute inset-0 flex items-center justify-center rounded-xl bg-card p-2 text-foreground [backface-visibility:hidden] [transform:rotateY(180deg)] ' +
                  (card.kind === 'symbol'
                    ? 'text-3xl tracking-tight'
                    : 'text-xs sm:text-sm')
                }
              >
                {card.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Score atual: <span className="font-bold text-primary">{score}</span>
      </p>

      <GameOverModal
        open={phase === 'won'}
        title="Parabéns!"
        score={score}
        scoreLabel="Pontos"
        headline="Todos os pares formados!"
        details={
          <span>
            Tentativas: <strong className="text-primary">{tries}</strong> · Tempo:{' '}
            <strong>{seconds}s</strong>
          </span>
        }
        isNewBest={isNewBest}
        loading={submitting}
        leaderboard={leaderboard}
        onPlayAgain={restart}
      />
    </GameShell>
  );
}
