'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HelpPanel } from '@/components/help-panel';
import { DifficultyChip } from '@/components/difficulty-chip';
import { KeyboardHintsOverlay } from '@/components/keyboard-hints-overlay';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  finishQuizSession,
  submitAttempt,
  toggleReviewStatus,
} from '@/app/quiz/actions';
import { evaluateAfterAttemptAction } from '@/app/quiz/gamification-actions';
import { getAudioPlayer } from '@/lib/audio/player';
import { rankFromXp } from '@/lib/achievements/ranks';
import { showAchievementToast } from '@/components/achievement-toast';
import { RankUpModal } from '@/components/rank-up-modal';
import type { AnswerLetter, Discipline } from '@/lib/supabase/types';

export interface QuizQuestion {
  id: string;
  discipline: string;
  subtopic: string;
  subtopic_short: string;
  year: number;
  semester: number;
  question_num: number;
  image_url: string;
  annulled: boolean;
  correct_pct?: number | null;
}

const DISCIPLINE_LABEL: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const DISCIPLINE_BG: Record<Discipline, string> = {
  matematica: 'bg-discipline-matematica',
  fisica: 'bg-discipline-fisica',
  quimica: 'bg-discipline-quimica',
  biologia: 'bg-discipline-biologia',
  humanas: 'bg-discipline-humanas',
  linguagens: 'bg-discipline-linguagens',
};

function disciplineLabel(d: string): string {
  return DISCIPLINE_LABEL[d] ?? d;
}

function disciplineBg(d: string): string {
  if (d in DISCIPLINE_BG) return DISCIPLINE_BG[d as Discipline];
  return 'bg-secondary';
}

const ANSWER_LETTERS: AnswerLetter[] = ['A', 'B', 'C', 'D', 'E'];

interface AnswerState {
  selected: AnswerLetter | null;
  correct: AnswerLetter | null;
  is_correct: boolean | null;
  annulled: boolean;
  submitting: boolean;
}

const emptyAnswer: AnswerState = {
  selected: null,
  correct: null,
  is_correct: null,
  annulled: false,
  submitting: false,
};

export function QuizRunner({
  sessionId,
  questions,
  initialReviewMarked,
  initialWeeklyXp = 0,
}: {
  sessionId: string;
  questions: QuizQuestion[];
  initialReviewMarked: Record<string, boolean>;
  initialWeeklyXp?: number;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(() =>
    questions.map((q) => ({ ...emptyAnswer, annulled: q.annulled })),
  );
  const [reviewMarked, setReviewMarked] = useState<Record<string, boolean>>(
    () => initialReviewMarked,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [finishing, startFinishTransition] = useTransition();
  const [, startReviewTransition] = useTransition();
  const [weeklyXp, setWeeklyXp] = useState<number>(initialWeeklyXp);
  const [rankUpOpen, setRankUpOpen] = useState(false);
  const lastRankIdRef = useRef<string>(rankFromXp(initialWeeklyXp).id);

  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    track('quiz_session_started', { total: questions.length });
    // Telemetria de visualização da primeira questão
    if (questions[0]) {
      track('question_viewed', {
        question_id: questions[0].id,
        index: 0,
      });
    }
  }, [questions]);

  // Reset cronômetro ao trocar de questão
  useEffect(() => {
    startedAtRef.current = Date.now();
    if (questions[currentIndex]) {
      track('question_viewed', {
        question_id: questions[currentIndex].id,
        index: currentIndex,
      });
    }
  }, [currentIndex, questions]);

  // Prefetch da próxima imagem
  useEffect(() => {
    const next = questions[currentIndex + 1];
    if (!next) return;
    const img = new window.Image();
    img.src = next.image_url;
  }, [currentIndex, questions]);

  // Toast de XP — auto-hide
  useEffect(() => {
    if (xpToast === null) return;
    const t = setTimeout(() => setXpToast(null), 1500);
    return () => clearTimeout(t);
  }, [xpToast]);

  const total = questions.length;
  const current = questions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? emptyAnswer;
  const currentMarked = current ? reviewMarked[current.id] === true : false;
  const isLast = currentIndex === total - 1;
  const isFirst = currentIndex === 0;

  // Refs para handlers — atualizados em cada render. Permite registrar atalhos
  // de teclado antes do early return sem violar ordem de hooks.
  const handleAnswerRef = useRef<(letter: AnswerLetter) => void>(() => {});
  const handleNextRef = useRef<() => void>(() => {});
  const handlePrevRef = useRef<() => void>(() => {});

  const shortcuts = useMemo(
    () => ({
      a: () => handleAnswerRef.current('A'),
      b: () => handleAnswerRef.current('B'),
      c: () => handleAnswerRef.current('C'),
      d: () => handleAnswerRef.current('D'),
      e: () => handleAnswerRef.current('E'),
      ArrowLeft: () => handlePrevRef.current(),
      ArrowRight: (e: KeyboardEvent) => {
        e.preventDefault();
        handleNextRef.current();
      },
      ' ': (e: KeyboardEvent) => {
        e.preventDefault();
        handleNextRef.current();
      },
      Enter: (e: KeyboardEvent) => {
        e.preventDefault();
        handleNextRef.current();
      },
    }),
    [],
  );
  useKeyboardShortcuts(shortcuts);

  if (!current) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Nenhuma questão nesta sessão.</p>
      </Card>
    );
  }

  const handleAnswer = (letter: AnswerLetter) => {
    if (current.annulled || currentAnswer.selected || currentAnswer.submitting) return;

    const elapsed = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
    setAnswers((prev) => {
      const next = [...prev];
      const existing = next[currentIndex] ?? emptyAnswer;
      next[currentIndex] = {
        ...existing,
        selected: letter,
        submitting: true,
      };
      return next;
    });
    setErrorMsg(null);

    void submitAttempt({
      session_id: sessionId,
      question_id: current.id,
      answer: letter,
      time_spent_sec: elapsed,
    }).then((res) => {
      if (!res.ok) {
        setErrorMsg(res.error);
        setAnswers((prev) => {
          const next = [...prev];
          const existing = next[currentIndex] ?? emptyAnswer;
          next[currentIndex] = {
            ...existing,
            selected: null,
            submitting: false,
          };
          return next;
        });
        return;
      }

      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          selected: letter,
          correct: res.correct_answer,
          is_correct: res.is_correct,
          annulled: res.annulled,
          submitting: false,
        };
        return next;
      });

      // Refletir status pessoal local (acertou/errou) — mas não mexer em 'toreview'
      if (!res.annulled) {
        setReviewMarked((prev) => {
          if (prev[current.id]) return prev; // mantém toreview
          // remove flag se não tiver — não precisamos refletir correct/wrong aqui
          return prev;
        });
      }

      // Vibração háptica
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Som — acerto/erro (respeita prefers-reduced-motion + localStorage)
      try {
        if (!res.annulled) {
          getAudioPlayer().play(res.is_correct ? 'correct' : 'wrong');
        }
      } catch {
        /* noop */
      }

      // XP indicativo (10 base + 5 por acerto). DB calcula o real via trigger.
      const xp = res.is_correct ? 15 : 10;
      setXpToast(xp);

      track('question_answered', {
        question_id: current.id,
        is_correct: res.is_correct,
        time_spent_sec: elapsed,
        annulled: res.annulled,
      });

      // Gamificação: avalia badges + missões + atualiza XP semanal.
      // Fail-soft — se algo der errado, não bloqueia o fluxo.
      void evaluateAfterAttemptAction({
        question_id: current.id,
        is_correct: res.is_correct,
        discipline: current.discipline,
      }).then((g) => {
        if (g.badges.length > 0) {
          try {
            getAudioPlayer().play('badge');
          } catch {
            /* noop */
          }
          showAchievementToast(g.badges);
        }
        if (typeof g.weeklyXp === 'number' && g.weeklyXp >= 0) {
          setWeeklyXp(g.weeklyXp);
          const newRankId = rankFromXp(g.weeklyXp).id;
          if (newRankId !== lastRankIdRef.current) {
            lastRankIdRef.current = newRankId;
            setRankUpOpen(true);
          }
        }
      });
    });
  };

  const handleToggleReview = () => {
    if (!current) return;
    const nextValue = !currentMarked;
    setReviewMarked((prev) => ({ ...prev, [current.id]: nextValue }));
    startReviewTransition(async () => {
      const res = await toggleReviewStatus({
        question_id: current.id,
        toreview: nextValue,
      });
      if (!res.ok) {
        // Reverte em erro
        setReviewMarked((prev) => ({ ...prev, [current.id]: !nextValue }));
        setErrorMsg(res.error);
      }
    });
  };

  const handlePrev = () => {
    if (isFirst) return;
    setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    // Finalizar
    setErrorMsg(null);
    startFinishTransition(async () => {
      const res = await finishQuizSession(sessionId);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      track('quiz_session_completed', {
        session_id: sessionId,
        total,
      });
      router.push(`/quiz/sessao/${sessionId}/fim`);
    });
  };

  const showFeedback = currentAnswer.selected !== null && !current.annulled;
  const correctLetter = currentAnswer.correct;

  // Atualiza refs (declarados antes do early return) com os handlers atuais —
  // assim os atalhos de teclado sempre disparam a versão mais recente.
  handleAnswerRef.current = handleAnswer;
  handleNextRef.current = handleNext;
  handlePrevRef.current = handlePrev;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white',
              disciplineBg(current.discipline),
            )}
          >
            {disciplineLabel(current.discipline)}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {current.year}.{current.semester}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            #{current.question_num}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {current.subtopic_short}
          </span>
          <DifficultyChip correct_pct={current.correct_pct ?? null} />
          {current.annulled ? (
            <span className="inline-flex items-center rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning">
              Anulada
            </span>
          ) : null}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="relative w-full bg-stone-100">
          <Image
            src={current.image_url}
            alt={`Questão ${current.question_num} de ${current.year}.${current.semester} — ${disciplineLabel(current.discipline)}`}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full max-w-3xl rounded-lg"
            priority={currentIndex === 0}
            unoptimized
          />
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        {ANSWER_LETTERS.map((letter) => {
          const isSelected = currentAnswer.selected === letter;
          const isCorrect = correctLetter === letter;
          let stateClass = '';
          if (showFeedback) {
            if (isCorrect) {
              stateClass = 'border-success bg-success-bg text-success';
            } else if (isSelected && !isCorrect) {
              stateClass = 'border-error bg-error-bg text-error';
            } else {
              stateClass = 'opacity-60';
            }
          }
          return (
            <Button
              key={letter}
              type="button"
              variant="secondary"
              size="lg"
              disabled={
                current.annulled ||
                currentAnswer.submitting ||
                currentAnswer.selected !== null
              }
              onClick={() => handleAnswer(letter)}
              className={cn(
                'w-full justify-start text-base transition-colors duration-motion-base',
                stateClass,
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  'mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border font-semibold',
                  showFeedback && isCorrect ? 'border-success text-success' : '',
                  showFeedback && isSelected && !isCorrect ? 'border-error text-error' : '',
                )}
              >
                {letter}
              </span>
              Alternativa {letter}
            </Button>
          );
        })}
      </div>

      {current.annulled ? (
        <div className="rounded-lg bg-warning-bg p-3 text-sm text-warning" role="status">
          Esta questão foi anulada pela banca — pontuação concedida a todos.
        </div>
      ) : null}

      {showFeedback && correctLetter ? (
        <div
          className={cn(
            'rounded-lg p-3 text-sm',
            currentAnswer.is_correct
              ? 'bg-success-bg text-success'
              : 'bg-error-bg text-error',
          )}
          role="status"
        >
          {currentAnswer.is_correct
            ? `Correto! Gabarito: ${correctLetter}`
            : `Resposta certa: ${correctLetter}. Você marcou ${currentAnswer.selected}.`}
        </div>
      ) : null}

      {currentAnswer.selected !== null ? (
        <HelpPanel
          key={current.id}
          questionId={current.id}
          discipline={current.discipline}
          subtopic={current.subtopic}
        />
      ) : null}

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleToggleReview}
          className={cn(
            'inline-flex items-center gap-2 self-start rounded px-2 py-1 text-sm font-medium transition-colors',
            currentMarked
              ? 'text-warning hover:bg-warning-bg'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span aria-hidden>{currentMarked ? '★' : '☆'}</span>
          {currentMarked ? 'Marcada para revisar' : 'Marcar p/ revisar depois'}
        </button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handlePrev}
            disabled={isFirst}
          >
            ← Anterior
          </Button>
          <Button
            type="button"
            size="md"
            onClick={handleNext}
            disabled={finishing}
          >
            {isLast ? (finishing ? 'Finalizando…' : 'Finalizar') : 'Próxima →'}
          </Button>
        </div>
      </div>

      {xpToast !== null ? (
        <div
          className="pointer-events-none fixed right-4 top-4 z-50 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-opacity"
          role="status"
        >
          +{xpToast} XP
        </div>
      ) : null}

      <RankUpModal
        open={rankUpOpen}
        xp={weeklyXp}
        onClose={() => setRankUpOpen(false)}
      />
      <PomodoroTimer />
      <KeyboardHintsOverlay />
    </>
  );
}
