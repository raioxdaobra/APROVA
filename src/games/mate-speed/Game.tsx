'use client';

/**
 * Mate-Speed — 10 contas em 60 segundos.
 * Score = acertos × 10. Submete via submitGameScore('mate_speed', ...).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameShell, GameOverModal } from '@/components/game-shell';
import {
  type MateProblem,
  MATE_TIME_LIMIT_SEC,
  MATE_TOTAL_QUESTIONS,
  calcScore,
  makeProblems,
} from './engine';
import {
  submitGameScore,
  type LeaderboardRow,
} from '@/lib/games/score-action';

type Phase = 'playing' | 'finished';

export default function MateSpeedGame() {
  const [problems, setProblems] = useState<MateProblem[]>(() => makeProblems());
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MATE_TIME_LIMIT_SEC);
  const [phase, setPhase] = useState<Phase>('playing');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const startedAtRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Submit state
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  const score = useMemo(() => calcScore(correct), [correct]);
  const current = problems[Math.min(index, problems.length - 1)];

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Foco automático
  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus();
  }, [phase, index]);

  // Detecta fim
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0 || index >= problems.length) {
      setPhase('finished');
    }
  }, [timeLeft, index, problems.length, phase]);

  // Submete score quando finaliza
  useEffect(() => {
    if (phase !== 'finished' || submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    const duration = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    void submitGameScore('mate_speed', score, duration).then((r) => {
      setSubmitting(false);
      if (r.ok) {
        setLeaderboard(r.leaderboard);
        setIsNewBest(r.is_new_best);
      }
    });
  }, [phase, submitted, score]);

  const handleSubmitAnswer = useCallback(() => {
    if (phase !== 'playing' || !current) return;
    const trimmed = input.trim();
    if (trimmed === '') return;
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return;
    if (Math.round(num) === current.answer) {
      setCorrect((c) => c + 1);
      setFeedback('correct');
    } else {
      setWrong((w) => w + 1);
      setFeedback('wrong');
    }
    setInput('');
    window.setTimeout(() => setFeedback('idle'), 220);
    setIndex((i) => i + 1);
  }, [current, input, phase]);

  const handleRestart = useCallback(() => {
    setProblems(makeProblems());
    setIndex(0);
    setInput('');
    setCorrect(0);
    setWrong(0);
    setTimeLeft(MATE_TIME_LIMIT_SEC);
    setFeedback('idle');
    setSubmitted(false);
    setLeaderboard([]);
    setIsNewBest(false);
    startedAtRef.current = Date.now();
    setPhase('playing');
  }, []);

  return (
    <GameShell
      title="Mate-Speed"
      subtitle="10 contas. 60 segundos. Sem misericórdia."
      icon="🧮"
      onRestart={handleRestart}
      hud={
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/15 px-2 py-1 font-bold text-primary tabular-nums">
            {String(index).padStart(2, '0')}/{MATE_TOTAL_QUESTIONS}
          </span>
          <span
            className={
              'rounded-full px-2 py-1 font-bold tabular-nums ' +
              (timeLeft <= 10
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-amber-500/15 text-amber-400')
            }
          >
            {timeLeft}s
          </span>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Acertos: <span className="font-bold text-emerald-500">{correct}</span></span>
          <span>Erros: <span className="font-bold text-rose-500">{wrong}</span></span>
          <span>Score: <span className="font-bold text-primary tabular-nums">{score}</span></span>
        </div>

        <div
          className={
            'relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent p-8 shadow-md transition-transform ' +
            (feedback === 'correct'
              ? 'border-emerald-500/60 scale-[1.02]'
              : feedback === 'wrong'
                ? 'border-rose-500/60 animate-pulse'
                : 'border-border')
          }
          aria-live="polite"
        >
          <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            Resolva
          </div>
          <div className="mt-2 text-center font-mono text-5xl font-bold tabular-nums">
            {current ? current.prompt : '—'}
          </div>

          <form
            className="mt-6 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAnswer();
            }}
          >
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={phase !== 'playing'}
              placeholder="resposta"
              className="h-14 w-full rounded-md border border-border bg-card px-4 text-center text-2xl font-bold tabular-nums tracking-wide outline-none ring-primary/50 transition-shadow focus:ring-2"
              aria-label="Sua resposta"
            />
            <button
              type="submit"
              disabled={phase !== 'playing' || input.trim() === ''}
              className="h-14 shrink-0 rounded-md bg-gradient-to-br from-primary to-primary-dark px-4 font-bold text-primary-foreground shadow-md transition-transform active:scale-95 disabled:opacity-40"
            >
              OK
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pressione Enter pra confirmar
          </p>
        </div>
      </div>

      <GameOverModal
        open={phase === 'finished'}
        title="Tempo!"
        score={score}
        scoreLabel="Pontos"
        headline={
          timeLeft <= 0 ? 'Acabou o tempo!' : 'Você completou todas as contas!'
        }
        details={
          <span>
            Acertos: <strong className="text-emerald-500">{correct}</strong> · Erros:{' '}
            <strong className="text-rose-500">{wrong}</strong>
          </span>
        }
        isNewBest={isNewBest}
        loading={submitting}
        leaderboard={leaderboard}
        onPlayAgain={handleRestart}
      />
    </GameShell>
  );
}
