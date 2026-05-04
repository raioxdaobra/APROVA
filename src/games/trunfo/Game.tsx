'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Swords, Trophy, User2, Bot as BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameShell } from '@/components/game-shell';
import { submitScore } from '@/lib/games/score-action';
import { cn } from '@/lib/utils';
import {
  ATTRIBUTE_LABEL,
  TRUNFO_ATTRIBUTES,
  calcScore,
  compareRound,
  createInitialState,
  type TrunfoAttribute,
  type TrunfoCard,
  type TrunfoState,
} from './engine';
import { TrunfoBot, type TrunfoBotDifficulty } from './bot';

const DISCIPLINE_GRADIENT: Record<TrunfoCard['discipline'], string> = {
  matematica: 'from-indigo-600 via-indigo-500 to-violet-600',
  fisica: 'from-cyan-600 via-cyan-500 to-blue-600',
  quimica: 'from-emerald-600 via-emerald-500 to-teal-600',
  biologia: 'from-rose-600 via-rose-500 to-red-600',
  humanas: 'from-purple-600 via-purple-500 to-fuchsia-600',
  linguagens: 'from-pink-600 via-pink-500 to-rose-600',
};

const DISCIPLINE_LABEL: Record<TrunfoCard['discipline'], string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

interface TrunfoGameProps {
  initialDifficulty?: TrunfoBotDifficulty;
}

export default function TrunfoGame({ initialDifficulty = 'easy' }: TrunfoGameProps) {
  const [difficulty, setDifficulty] = useState<TrunfoBotDifficulty>(initialDifficulty);
  const [state, setState] = useState<TrunfoState>(() => createInitialState());
  const [revealBot, setRevealBot] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const bot = useMemo(() => new TrunfoBot(difficulty), [difficulty]);

  const userTop = state.userHand[0];
  const botTop = state.botHand[0];
  const userScore = state.userHand.length;
  const botScore = state.botHand.length;

  const restart = () => {
    setState(createInitialState());
    setRevealBot(false);
    setSubmitted(false);
    startedAtRef.current = Date.now();
  };

  // Bot turn — auto-pick after a short delay.
  useEffect(() => {
    if (state.finished) return;
    if (state.turn !== 'bot') return;
    const t = setTimeout(() => {
      const attr = bot.chooseAttribute(state.botHand);
      setRevealBot(true);
      setState((s) => compareRound(s, attr));
      setRevealBot(false);
    }, 900);
    return () => clearTimeout(t);
  }, [state, bot]);

  // Submit score on finish.
  useEffect(() => {
    if (!state.finished || submitted) return;
    setSubmitted(true);
    const durationMs = Date.now() - startedAtRef.current;
    const finalScore = calcScore(state, durationMs);
    void submitScore({
      gameId: 'trunfo',
      score: finalScore,
      durationMs,
      meta: { difficulty },
    });
  }, [state, submitted, difficulty]);

  const onPickAttribute = (attr: TrunfoAttribute) => {
    if (state.finished || state.turn !== 'user') return;
    setRevealBot(true);
    setState((s) => compareRound(s, attr));
  };

  const finalScore = state.finished
    ? calcScore(state, Date.now() - startedAtRef.current)
    : null;

  return (
    <GameShell
      title="Super Trunfo Vestibular"
      subtitle="Escolha o atributo mais forte da sua carta"
      onRestart={restart}
      finalScore={finalScore}
      hud={
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-xs font-bold text-primary">
            <User2 className="h-3 w-3" /> Você {userScore}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-1 text-xs font-bold text-rose-400">
            <BotIcon className="h-3 w-3" /> CPU {botScore}
          </span>
          <span className="text-muted-foreground text-xs">Rodada {state.round}</span>
        </div>
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Dificuldade do bot:</span>
          {(['easy', 'hard'] as TrunfoBotDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                restart();
              }}
              className={cn(
                'rounded-full border px-3 py-1 transition',
                difficulty === d
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              {d === 'easy' ? 'Fácil' : 'Difícil'}
            </button>
          ))}
        </div>

        <div className="grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2">
          <CardView
            label="Sua carta"
            card={userTop}
            faceUp
            highlightAttr={state.lastRound?.attribute}
            badge={state.turn === 'user' && !state.finished ? 'Sua vez' : undefined}
          />
          <CardView
            label="Carta da CPU"
            card={botTop}
            faceUp={revealBot || !!state.lastRound || state.finished}
            highlightAttr={state.lastRound?.attribute}
            badge={state.turn === 'bot' && !state.finished ? 'Pensando…' : undefined}
            mirrored
          />
        </div>

        {!state.finished ? (
          <div className="flex w-full max-w-3xl flex-col items-center gap-3">
            <p className="text-sm font-semibold">
              {state.turn === 'user' ? 'Escolha o atributo:' : 'CPU está escolhendo…'}
            </p>
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {TRUNFO_ATTRIBUTES.map((attr) => (
                <Button
                  key={attr}
                  variant="secondary"
                  disabled={state.turn !== 'user'}
                  onClick={() => onPickAttribute(attr)}
                  className="h-auto justify-between py-3"
                >
                  <span>{ATTRIBUTE_LABEL[attr]}</span>
                  <span className="font-mono text-base text-primary">
                    {userTop?.attrs[attr] ?? '-'}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <Trophy className="h-10 w-10 text-amber-500" />
            <h2 className="text-2xl font-bold">
              {userScore > 0 ? 'Você venceu!' : 'A CPU venceu desta vez.'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Cartas conquistadas: {userScore} • Rodadas jogadas: {state.round - 1}
            </p>
            <Button onClick={restart}>
              <Sparkles className="mr-2 h-4 w-4" /> Jogar de novo
            </Button>
          </div>
        )}

        {state.lastRound ? (
          <div className="rounded-lg border border-border/60 bg-card/60 px-4 py-2 text-xs text-muted-foreground">
            <Swords className="mr-1 inline h-3 w-3" />
            Última rodada — {ATTRIBUTE_LABEL[state.lastRound.attribute]}: você{' '}
            <span className="font-mono text-foreground">{state.lastRound.userValue}</span> × CPU{' '}
            <span className="font-mono text-foreground">{state.lastRound.botValue}</span> →{' '}
            <span
              className={cn(
                'font-bold',
                state.lastRound.winner === 'user' && 'text-emerald-500',
                state.lastRound.winner === 'bot' && 'text-rose-500',
                state.lastRound.winner === 'draw' && 'text-amber-500',
              )}
            >
              {state.lastRound.winner === 'user'
                ? 'você venceu'
                : state.lastRound.winner === 'bot'
                  ? 'CPU venceu'
                  : 'empate'}
            </span>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}

interface CardViewProps {
  label: string;
  card: TrunfoCard | undefined;
  faceUp: boolean;
  highlightAttr?: TrunfoAttribute;
  badge?: string;
  mirrored?: boolean;
}

function CardView({ label, card, faceUp, highlightAttr, badge, mirrored }: CardViewProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {badge ? (
          <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
            {badge}
          </span>
        ) : null}
      </span>
      <div
        className={cn(
          'relative h-[420px] w-[280px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 transition-transform duration-500',
          mirrored && 'md:-rotate-1',
          !mirrored && 'md:rotate-1',
        )}
        style={{ perspective: '1000px' }}
      >
        {!card || !faceUp ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
            <Sparkles className="h-12 w-12 text-white/30" />
          </div>
        ) : (
          <div
            className={cn(
              'flex h-full w-full flex-col bg-gradient-to-br p-5 text-white',
              DISCIPLINE_GRADIENT[card.discipline],
            )}
          >
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                {DISCIPLINE_LABEL[card.discipline]}
              </span>
              <span className="text-3xl drop-shadow-lg">{card.emoji}</span>
            </div>
            <div className="mt-6 flex-1">
              <h3 className="text-2xl font-extrabold leading-tight drop-shadow">
                {card.topic}
              </h3>
            </div>
            <div className="space-y-2">
              {TRUNFO_ATTRIBUTES.map((attr) => (
                <div
                  key={attr}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition',
                    highlightAttr === attr
                      ? 'border-amber-300 bg-amber-300/30 shadow-[0_0_20px_rgba(252,211,77,0.5)]'
                      : 'border-white/20 bg-white/10',
                  )}
                >
                  <span className="font-medium">{ATTRIBUTE_LABEL[attr]}</span>
                  <span className="font-mono text-lg font-bold tabular-nums">
                    {card.attrs[attr]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
