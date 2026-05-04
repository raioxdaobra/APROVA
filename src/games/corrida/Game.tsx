'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flag, Gauge, Timer, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameShell } from '@/components/game-shell';
import { submitScore } from '@/lib/games/score-action';
import { cn } from '@/lib/utils';
import {
  QUIZ_COUNT,
  QUIZZES,
  TRACK_LENGTH,
  calcCorridaScore,
  initialCorridaState,
  type CorridaQuiz,
  type CorridaState,
} from './engine';
import { CorridaBot, type CorridaSpeed } from './bot';

const CANVAS_W = 800;
const CANVAS_H = 300;
const QUIZ_INTERVAL = TRACK_LENGTH / (QUIZ_COUNT + 1);

interface ActiveQuiz {
  quiz: CorridaQuiz;
  deadline: number; // ms timestamp
  answered?: boolean;
}

export default function CorridaGame({
  initialBotSpeed = 'slow',
}: {
  initialBotSpeed?: CorridaSpeed;
}) {
  const [botSpeed, setBotSpeed] = useState<CorridaSpeed>(initialBotSpeed);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<CorridaState>(() => initialCorridaState());
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null);
  const [now, setNow] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bot = useMemo(() => new CorridaBot(botSpeed), [botSpeed]);
  const lastTickRef = useRef<number>(Date.now());
  const userSpeedRef = useRef<number>(60);

  const restart = useCallback(() => {
    const s = initialCorridaState();
    setState(s);
    setQuiz(null);
    setSubmitted(false);
    setRunning(true);
    lastTickRef.current = Date.now();
    userSpeedRef.current = 60;
  }, []);

  // Game loop using requestAnimationFrame.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const loop = () => {
      const t = Date.now();
      const dt = t - lastTickRef.current;
      lastTickRef.current = t;
      setNow(t);

      setState((prev) => {
        if (prev.finishedAt) return prev;
        const userDelta = (userSpeedRef.current * dt) / 1000;
        const newUserPos = Math.min(TRACK_LENGTH, prev.userPos + userDelta);
        const newBotPos = Math.min(
          TRACK_LENGTH,
          bot.step(prev.botPos, dt, userSpeedRef.current),
        );
        // Recompute avg speed (decay toward baseline 60).
        const newAvg = userSpeedRef.current * 0.99 + 60 * 0.01;
        userSpeedRef.current = newAvg;

        const finishedAt =
          newUserPos >= TRACK_LENGTH || newBotPos >= TRACK_LENGTH ? t : null;
        return {
          ...prev,
          userPos: newUserPos,
          botPos: newBotPos,
          userAvgSpeed: newAvg,
          finishedAt,
        };
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, bot]);

  // Trigger quizzes at checkpoint distances.
  useEffect(() => {
    if (!running || quiz || state.finishedAt) return;
    const idx = state.finishedQuizIds.length;
    if (idx >= QUIZ_COUNT) return;
    const checkpoint = QUIZ_INTERVAL * (idx + 1);
    if (state.userPos >= checkpoint) {
      const q = QUIZZES[idx]!;
      setQuiz({ quiz: q, deadline: Date.now() + 10000 });
    }
  }, [state, running, quiz]);

  // Quiz timeout — counts as wrong.
  useEffect(() => {
    if (!quiz) return;
    if (quiz.answered) return;
    const remaining = quiz.deadline - now;
    if (remaining <= 0) {
      handleAnswer(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, quiz]);

  // Draw canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e293b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 137) % CANVAS_W;
      const y = (i * 53) % (CANVAS_H / 2);
      ctx.fillRect(x, y, 1, 1);
    }

    // Track (asphalt)
    const trackTop = CANVAS_H * 0.45;
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, trackTop, CANVAS_W, CANVAS_H - trackTop);

    // Lane stripes
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    const offset = (state.userPos * 1.5) % 40;
    for (let x = -offset; x < CANVAS_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_H * 0.65);
      ctx.lineTo(x + 20, CANVAS_H * 0.65);
      ctx.stroke();
    }
    for (let x = -offset; x < CANVAS_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_H * 0.85);
      ctx.lineTo(x + 20, CANVAS_H * 0.85);
      ctx.stroke();
    }

    // Finish flag — draw when user near finish
    const userFrac = state.userPos / TRACK_LENGTH;
    const botFrac = state.botPos / TRACK_LENGTH;
    if (userFrac > 0.85) {
      const flagX = CANVAS_W - 60 + (1 - userFrac) * 200;
      drawFinishFlag(ctx, flagX, trackTop - 30);
    }

    // Cars
    drawCar(ctx, 60 + userFrac * (CANVAS_W * 0.7), CANVAS_H * 0.55, '#0ea5e9', 'YOU');
    drawCar(ctx, 60 + botFrac * (CANVAS_W * 0.7), CANVAS_H * 0.78, '#ef4444', 'CPU');
  }, [state]);

  const handleAnswer = (idx: number) => {
    if (!quiz) return;
    if (quiz.answered) return;
    const correct = idx === quiz.quiz.correct;
    setQuiz({ ...quiz, answered: true });
    // Boost or penalty.
    userSpeedRef.current = correct
      ? Math.min(180, userSpeedRef.current + 60)
      : Math.max(20, userSpeedRef.current - 30);
    setState((s) => ({
      ...s,
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
      finishedQuizIds: [...s.finishedQuizIds, quiz.quiz.id],
    }));
    setTimeout(() => setQuiz(null), 600);
  };

  // Submit on finish.
  useEffect(() => {
    if (!state.finishedAt || submitted) return;
    setSubmitted(true);
    setRunning(false);
    const position: 'first' | 'second' =
      state.userPos >= state.botPos ? 'first' : 'second';
    const score = calcCorridaScore(state, position);
    void submitScore({
      gameId: 'corrida',
      score,
      durationMs: state.finishedAt - state.startedAt,
      meta: { difficulty: botSpeed, position },
    });
  }, [state, submitted, botSpeed]);

  const finalScore = state.finishedAt
    ? calcCorridaScore(
        state,
        state.userPos >= state.botPos ? 'first' : 'second',
      )
    : null;

  const elapsed = state.finishedAt
    ? state.finishedAt - state.startedAt
    : now - state.startedAt;

  return (
    <GameShell
      title="Corrida do Conhecimento"
      subtitle="Acerte os quizzes pra acelerar"
      onRestart={restart}
      finalScore={finalScore}
      hud={
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
            <Timer className="h-3 w-3" />
            {(elapsed / 1000).toFixed(1)}s
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
            <Gauge className="h-3 w-3" />
            {Math.round(userSpeedRef.current)} u/s
          </span>
        </div>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        {!running && !state.finishedAt ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-xl font-bold">Pronto pra correr?</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              6 perguntas vão aparecer durante a corrida. Você tem 10s pra cada — acerto
              acelera o carro, erro freia.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>CPU:</span>
              {(['slow', 'fast'] as CorridaSpeed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setBotSpeed(s)}
                  className={cn(
                    'rounded-full border px-3 py-1',
                    botSpeed === s
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  {s === 'slow' ? 'Lenta' : 'Rápida'}
                </button>
              ))}
            </div>
            <Button onClick={restart}>
              <Flag className="mr-2 h-4 w-4" /> Largar!
            </Button>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="block max-w-full"
          />
          {quiz && !state.finishedAt ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-white backdrop-blur">
              <div className="text-xs uppercase tracking-widest text-amber-300">
                Pit stop ⚡ {Math.max(0, Math.ceil((quiz.deadline - now) / 1000))}s
              </div>
              <p className="max-w-2xl text-center text-base font-semibold sm:text-lg">
                {quiz.quiz.question}
              </p>
              <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {quiz.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={quiz.answered}
                    className={cn(
                      'rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-left text-sm transition hover:bg-white/20 disabled:opacity-50',
                      quiz.answered && i === quiz.quiz.correct && 'bg-emerald-500/40 border-emerald-300',
                    )}
                  >
                    {String.fromCharCode(65 + i)}) {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>
            Acertos: <strong className="text-emerald-500">{state.correct}</strong> · Erros:{' '}
            <strong className="text-rose-500">{state.wrong}</strong>
          </span>
          <span>
            Distância: <strong>{Math.round(state.userPos)}</strong> /{' '}
            {TRACK_LENGTH}
          </span>
        </div>

        {state.finishedAt ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <Trophy className="h-10 w-10 text-amber-500" />
            <h2 className="text-xl font-bold">
              {state.userPos >= state.botPos ? 'Você venceu! 🏁' : 'A CPU chegou primeiro.'}
            </h2>
            <Button onClick={restart}>Correr de novo</Button>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}

function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
) {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - 22, y - 10, 44, 20, 6);
  ctx.fill();
  // Cabin
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 14, 20, 8, 3);
  ctx.fill();
  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x - 14, y + 10, 4, 0, Math.PI * 2);
  ctx.arc(x + 14, y + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  // Label
  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 2);
}

function drawFinishFlag(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x, y, 4, 80);
  // Checker
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? 'white' : 'black';
      ctx.fillRect(x + 4 + j * 8, y + i * 6, 8, 6);
    }
  }
}
