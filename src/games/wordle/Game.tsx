'use client';

/**
 * Wordle Vestibular — 5 letras, 6 tentativas.
 * Suporta teclado físico + teclado on-screen (mobile).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameShell, GameOverModal } from '@/components/game-shell';
import {
  type CellStatus,
  type GuessRow,
  MAX_GUESSES,
  WORD_LENGTH,
  calcScore,
  evaluateGuess,
  normalize,
  pickWord,
  VALID_WORDS,
} from './engine';
import { submitGameScore, type LeaderboardRow } from '@/lib/games/score-action';

type Phase = 'playing' | 'won' | 'lost';

const KEY_ROWS: ReadonlyArray<ReadonlyArray<string>> = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

function statusToClass(s: CellStatus): string {
  switch (s) {
    case 'correct':
      return 'bg-emerald-500 text-white border-emerald-500';
    case 'present':
      return 'bg-amber-500 text-white border-amber-500';
    case 'absent':
      return 'bg-zinc-700/70 text-zinc-200 border-zinc-700/70';
  }
}

export default function WordleGame() {
  const [target, setTarget] = useState<string>(() => pickWord());
  const [rows, setRows] = useState<GuessRow[]>([]);
  const [current, setCurrent] = useState<string>('');
  const [phase, setPhase] = useState<Phase>('playing');
  const [shake, setShake] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  const score = useMemo(() => {
    if (phase !== 'won') return 0;
    const dur = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
    return calcScore(rows.length, dur, true);
  }, [phase, rows.length]);

  // Map de status por letra pra colorir o teclado.
  const keyStatus = useMemo(() => {
    const m = new Map<string, CellStatus>();
    for (const row of rows) {
      row.letters.forEach((ch, i) => {
        const st = row.statuses[i];
        if (!st) return;
        const prev = m.get(ch);
        if (prev === 'correct') return;
        if (prev === 'present' && st === 'absent') return;
        m.set(ch, st);
      });
    }
    return m;
  }, [rows]);

  const restart = useCallback(() => {
    setTarget(pickWord());
    setRows([]);
    setCurrent('');
    setPhase('playing');
    setShake(false);
    setSubmitted(false);
    setLeaderboard([]);
    setIsNewBest(false);
    startedAtRef.current = Date.now();
  }, []);

  const handleSubmit = useCallback(() => {
    if (phase !== 'playing') return;
    if (current.length !== WORD_LENGTH) {
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
      return;
    }
    // (Optional) Aceitamos qualquer palavra de 5 letras — não força lista; mas se
    // quiser forçar dicionário, descomente abaixo.
    if (process.env.NEXT_PUBLIC_WORDLE_STRICT === '1' && !VALID_WORDS.includes(current)) {
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
      return;
    }
    const statuses = evaluateGuess(current, target);
    const row: GuessRow = { letters: current.split(''), statuses };
    const nextRows = [...rows, row];
    setRows(nextRows);
    setCurrent('');
    if (current === target) {
      setPhase('won');
    } else if (nextRows.length >= MAX_GUESSES) {
      setPhase('lost');
    }
  }, [current, phase, rows, target]);

  // Submete ao terminar
  useEffect(() => {
    if (phase === 'playing' || submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    const duration = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    const finalScore = calcScore(rows.length, duration, phase === 'won');
    void submitGameScore('wordle', finalScore, duration).then((r) => {
      setSubmitting(false);
      if (r.ok) {
        setLeaderboard(r.leaderboard);
        setIsNewBest(r.is_new_best);
      }
    });
  }, [phase, rows.length, submitted]);

  const handleKey = useCallback(
    (raw: string) => {
      if (phase !== 'playing') return;
      if (raw === 'ENTER') {
        handleSubmit();
        return;
      }
      if (raw === 'BACK' || raw === 'BACKSPACE') {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      const ch = normalize(raw);
      if (ch.length !== 1) return;
      setCurrent((c) => (c.length >= WORD_LENGTH ? c : c + ch));
    },
    [phase, handleSubmit],
  );

  // Keyboard físico
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKey('BACK');
      } else if (/^[a-zA-ZÀ-ÿ]$/.test(e.key)) {
        handleKey(e.key);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

  // Render rows fixos: 6 linhas
  const visibleRows: Array<GuessRow | { letters: string[]; statuses: null }> = [];
  for (let i = 0; i < MAX_GUESSES; i += 1) {
    if (i < rows.length) {
      visibleRows.push(rows[i] as GuessRow);
    } else if (i === rows.length && phase === 'playing') {
      const letters: string[] = [];
      for (let j = 0; j < WORD_LENGTH; j += 1) letters.push(current[j] ?? '');
      visibleRows.push({ letters, statuses: null });
    } else {
      visibleRows.push({ letters: ['', '', '', '', ''], statuses: null });
    }
  }

  const isPlayingRowIndex = rows.length;

  return (
    <GameShell
      title="Wordle Vestibular"
      subtitle="Adivinhe a palavra de 5 letras"
      icon="🔤"
      onRestart={restart}
      hud={
        <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-bold text-primary tabular-nums">
          {rows.length}/{MAX_GUESSES}
        </span>
      }
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-5">
        <div className="flex flex-col gap-1.5">
          {visibleRows.map((r, i) => (
            <div
              key={i}
              className={
                'grid grid-cols-5 gap-1.5 ' +
                (i === isPlayingRowIndex && shake ? 'animate-shake' : '')
              }
            >
              {r.letters.map((ch, j) => {
                const st = (r as GuessRow).statuses ? (r as GuessRow).statuses[j] : null;
                return (
                  <div
                    key={j}
                    className={
                      'flex aspect-square items-center justify-center rounded-md border-2 text-2xl font-bold uppercase transition-all duration-300 ' +
                      (st
                        ? statusToClass(st)
                        : ch
                          ? 'border-primary/60 bg-card scale-105'
                          : 'border-border bg-card')
                    }
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((k) => {
                const st = keyStatus.get(k);
                const wide = k === 'ENTER' || k === 'BACK';
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKey(k)}
                    className={
                      'h-12 select-none rounded-md text-xs font-bold uppercase transition-colors ' +
                      (wide ? 'min-w-[64px] px-3 text-[10px]' : 'min-w-[32px] flex-1 max-w-[44px]') +
                      ' ' +
                      (st
                        ? statusToClass(st)
                        : 'border border-border bg-card hover:bg-muted')
                    }
                    aria-label={k === 'BACK' ? 'Apagar' : k === 'ENTER' ? 'Confirmar' : k}
                  >
                    {k === 'BACK' ? '⌫' : k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <GameOverModal
        open={phase !== 'playing'}
        title={phase === 'won' ? 'Você venceu!' : 'Não foi dessa vez'}
        score={score}
        scoreLabel="Pontos"
        headline={
          phase === 'won' ? (
            <>Acertou em {rows.length} {rows.length === 1 ? 'tentativa' : 'tentativas'}!</>
          ) : (
            <>A palavra era <strong className="text-primary">{target}</strong></>
          )
        }
        isNewBest={isNewBest}
        loading={submitting}
        leaderboard={leaderboard}
        onPlayAgain={restart}
      />

      <style jsx>{`
        @keyframes shake-x {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        :global(.animate-shake) {
          animation: shake-x 0.3s ease-in-out;
        }
      `}</style>
    </GameShell>
  );
}
