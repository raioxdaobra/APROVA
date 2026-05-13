'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DidYouKnowTip } from '@/components/did-you-know-tip';
import { HelpPanel, type HelpPanelHandle } from '@/components/help-panel';
import { Lightbulb } from 'lucide-react';
import { DifficultyChip } from '@/components/difficulty-chip';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { QuestionLayout } from '@/components/question-layout';
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
import { normalizeQuestionText } from '@/lib/text/normalize-question-text';
import type { AnswerLetter, Discipline } from '@/lib/supabase/types';

/**
 * Renderiza questões em texto puro (image_url vazio) como se fosse o scan
 * de uma página de PDF: fundo claro (papel), texto escuro, header com
 * "Questão XX" e footer "UNIFOR — Processo Seletivo YYYY.X - MEDICINA".
 * Mantém o mesmo padrão visual das questões com scan (image-based).
 */
function QuestionTextFallback({
  description,
  questionNum,
  year,
  semester,
}: {
  description: string | null;
  questionNum: number;
  year: number;
  semester: number;
}) {
  const paragraphs = normalizeQuestionText(description);
  return (
    <div className="overflow-hidden rounded-lg bg-stone-50 text-stone-900">
      <div className="px-5 py-4 sm:px-7 sm:py-6">
        {/* Header: "Questão XX" igual ao scan */}
        <div className="mb-4 border-b border-stone-300 pb-2">
          <span className="inline-block bg-stone-900 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-stone-50">
            Questão {questionNum}
          </span>
        </div>

        {/* Corpo */}
        {paragraphs.length === 0 ? (
          <p className="italic text-stone-500">(Enunciado indisponível.)</p>
        ) : (
          <div className="text-[15px] leading-relaxed text-stone-900 sm:text-base">
            {paragraphs.map((para, i) => {
              const isTitle =
                para.length <= 60 &&
                /^[A-ZÁÉÍÓÚÀÂÊÎÔÛÃÕÇ0-9][A-ZÁÉÍÓÚÀÂÊÎÔÛÃÕÇ0-9\s\d.,!?:'"()\-–—]+$/.test(para);
              if (isTitle) {
                return (
                  <h3
                    key={i}
                    className="mb-3 mt-1 text-base font-semibold uppercase tracking-wide text-stone-900"
                  >
                    {para}
                  </h3>
                );
              }
              return (
                <p key={i} className="mb-3 last:mb-0">
                  {para}
                </p>
              );
            })}
          </div>
        )}

        {/* Footer no rodapé da página */}
        <div className="mt-6 flex items-center justify-between border-t border-stone-300 pt-2 text-[11px] text-stone-600">
          <span>&nbsp;</span>
          <span className="font-medium">
            UNIFOR — Processo Seletivo {year}.{semester} - MEDICINA
          </span>
        </div>
      </div>
    </div>
  );
}

export interface QuizQuestion {
  id: string;
  discipline: string;
  subtopic: string;
  subtopic_short: string;
  year: number;
  semester: number;
  question_num: number;
  image_url: string;
  description?: string;
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
  initialAnswers,
  initialWeeklyXp = 0,
}: {
  sessionId: string;
  questions: QuizQuestion[];
  initialReviewMarked: Record<string, boolean>;
  initialAnswers?: Record<string, { answer: string | null; is_correct: boolean | null }>;
  initialWeeklyXp?: number;
}) {
  const router = useRouter();

  const firstUnansweredIndex = (() => {
    if (!initialAnswers) return 0;
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q) continue;
      if (!initialAnswers[q.id]) return i;
    }
    return Math.max(0, questions.length - 1);
  })();

  const [currentIndex, setCurrentIndex] = useState(firstUnansweredIndex);
  const [answers, setAnswers] = useState<AnswerState[]>(() =>
    questions.map((q) => {
      const prior = initialAnswers?.[q.id];
      if (prior) {
        const selected = (prior.answer as AnswerLetter | null) ?? null;
        return {
          selected,
          correct: prior.is_correct === true ? selected : null,
          is_correct: prior.is_correct,
          annulled: q.annulled,
          submitting: false,
        };
      }
      return { ...emptyAnswer, annulled: q.annulled };
    }),
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

  const [reviewBannerDismissed, setReviewBannerDismissed] = useState<Set<string>>(
    () => new Set(),
  );
  const helpPanelRef = useRef<HelpPanelHandle | null>(null);

  const selectedDraft: AnswerLetter | null = null;

  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    track('quiz_session_started', { total: questions.length });
    if (questions[0]) {
      track('question_viewed', {
        question_id: questions[0].id,
        index: 0,
      });
    }
  }, [questions]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    if (questions[currentIndex]) {
      track('question_viewed', {
        question_id: questions[currentIndex].id,
        index: currentIndex,
      });
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    const next = questions[currentIndex + 1];
    if (!next || !next.image_url || next.image_url.trim().length === 0) return;
    const img = new window.Image();
    img.src = next.image_url;
  }, [currentIndex, questions]);

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

      if (!res.annulled) {
        setReviewMarked((prev) => {
          if (prev[current.id]) return prev;
          return prev;
        });
      }

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }

      try {
        if (!res.annulled) {
          getAudioPlayer().play(res.is_correct ? 'correct' : 'wrong');
        }
      } catch {
        /* noop */
      }

      const xp = res.is_correct ? 15 : 10;
      setXpToast(xp);

      track('question_answered', {
        question_id: current.id,
        is_correct: res.is_correct,
        time_spent_sec: elapsed,
        annulled: res.annulled,
      });

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
            if (res.is_correct) {
              setRankUpOpen(true);
            }
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

  handleAnswerRef.current = handleAnswer;
  handleNextRef.current = handleNext;
  handlePrevRef.current = handlePrev;

  const imageAlt = `Questão ${current.question_num} de ${current.year}.${current.semester} — ${disciplineLabel(current.discipline)}`;

  const hasImage = Boolean(current.image_url && current.image_url.trim().length > 0);
  const imageSlot = hasImage ? (
    <Card className="overflow-hidden p-0">
      <div
        className="relative w-full bg-stone-100"
        style={{
          touchAction: 'pan-y',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        <Image
          src={current.image_url}
          alt={imageAlt}
          width={1200}
          height={800}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="h-auto w-full rounded-lg pointer-events-none select-none"
          priority={currentIndex === 0}
          unoptimized
          draggable={false}
          style={{
            WebkitUserDrag: 'none',
            WebkitTouchCallout: 'none',
          } as React.CSSProperties}
        />
      </div>
    </Card>
  ) : (
    <Card className="overflow-hidden p-0">
      <QuestionTextFallback
        description={current.description ?? null}
        questionNum={current.question_num}
        year={current.year}
        semester={current.semester}
      />
    </Card>
  );

  const headerSlot = (
    <header className="flex flex-col gap-2">
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
    </header>
  );

  const alternativesSlot = (
    <div className="grid grid-cols-5 gap-2">
      {ANSWER_LETTERS.map((letter) => {
        const isSubmitted = currentAnswer.selected === letter;
        const isCorrect = correctLetter === letter;

        let cardClass = 'border-border bg-background';
        if (showFeedback) {
          if (isCorrect) cardClass = 'border-success/60 bg-success-bg/30';
          else if (isSubmitted && !isCorrect)
            cardClass = 'border-destructive/60 bg-destructive/5';
          else cardClass = 'border-border bg-background opacity-60';
        }

        let letterBoxClass = 'border-border bg-card text-foreground';
        if (showFeedback) {
          if (isCorrect)
            letterBoxClass = 'border-success bg-success text-success-foreground';
          else if (isSubmitted && !isCorrect)
            letterBoxClass = 'border-destructive bg-destructive text-destructive-foreground';
        }

        return (
          <button
            key={letter}
            type="button"
            disabled={current.annulled || currentAnswer.submitting || showFeedback}
            onClick={() => handleAnswer(letter)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-center transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              !showFeedback && !current.annulled && 'hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/40',
              cardClass,
            )}
            aria-label={`Marcar alternativa ${letter}`}
            aria-pressed={isSubmitted}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-bold transition-colors',
                letterBoxClass,
              )}
            >
              {letter}
            </span>
          </button>
        );
      })}
    </div>
  );

  const footerSlot = (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
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
        {currentMarked ? 'Marcada para revisar' : 'Marcar p/ revisar'}
      </button>

      <div className="flex items-stretch gap-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={isFirst}
          className="flex-1"
        >
          Anterior
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={finishing}
          className="flex-[2]"
        >
          {isLast ? (finishing ? 'Finalizando…' : 'Finalizar') : 'Próxima'}
        </Button>
      </div>
    </div>
  );

  const bodySlot = (
    <>
      {headerSlot}

      {!showFeedback ? (
        <DidYouKnowTip
          id="quiz-keyboard-shortcut"
          text="Pressione A, B, C, D ou E pra responder pelo teclado. ← e → navegam entre questões."
        />
      ) : null}

      {alternativesSlot}

      {current.annulled ? (
        <div className="rounded-lg bg-warning-bg p-3 text-sm text-warning" role="status">
          Esta questão foi anulada pela banca — pontuação concedida a todos.
        </div>
      ) : null}

      {showFeedback && correctLetter ? (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border-2 p-4',
            currentAnswer.is_correct
              ? 'border-success/40 bg-success-bg/40'
              : 'border-destructive/40 bg-destructive/5',
          )}
          role="status"
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl font-bold',
              currentAnswer.is_correct
                ? 'bg-success/15 text-success'
                : 'bg-destructive/15 text-destructive',
            )}
          >
            {currentAnswer.is_correct ? '✓' : '✕'}
          </span>
          <div className="flex flex-col gap-0.5">
            <h3
              className={cn(
                'text-base font-semibold',
                currentAnswer.is_correct ? 'text-success' : 'text-destructive',
              )}
            >
              {currentAnswer.is_correct ? 'Resposta correta' : 'Resposta incorreta'}
            </h3>
            {!currentAnswer.is_correct ? (
              <p className="text-sm text-muted-foreground">
                Gabarito:{' '}
                <strong className="text-foreground">{correctLetter}</strong>
                {' · '}
                Você marcou{' '}
                <strong className="text-foreground">{currentAnswer.selected}</strong>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Mandou bem! Continue na sequência.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {showFeedback &&
      !currentAnswer.is_correct &&
      !current.annulled &&
      !reviewBannerDismissed.has(current.id) ? (
        <div
          className="flex flex-col gap-3 rounded-lg border-2 border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center"
          role="region"
          aria-label="Sugestão de revisão"
        >
          <div className="flex flex-1 items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
            >
              <Lightbulb className="h-5 w-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">
                Bora entender essa?
              </p>
              <p className="text-xs text-muted-foreground">
                A IA explica direto onde você errou. 30 segundos.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => helpPanelRef.current?.openTab('resolucao')}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Ver resolução
            </button>
            <button
              type="button"
              onClick={() =>
                setReviewBannerDismissed((prev) => {
                  const next = new Set(prev);
                  next.add(current.id);
                  return next;
                })
              }
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Pular
            </button>
          </div>
        </div>
      ) : null}

      {currentAnswer.selected !== null ? (
        <HelpPanel
          ref={helpPanelRef}
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

      {footerSlot}
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          aria-label="Sair da sessão"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Sair
        </button>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {currentIndex + 1}{' '}
          <span className="text-muted-foreground">/ {total}</span>
        </span>
      </div>

      <QuestionLayout
        image={imageSlot}
        body={bodySlot}
        imageUrl={current.image_url}
        imageAlt={imageAlt}
        enableLightbox={false}
        enableFullscreen={false}
      />

      {xpToast !== null ? (
        <div
          className="pointer-events-none fixed right-4 top-4 z-[60] rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-opacity"
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
    </>
  );
}
