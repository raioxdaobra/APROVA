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
  /**
   * Respostas já submetidas na sessão (mapeadas por question_id). Quando
   * presente, o runner pré-popula `answers` e pula pro primeiro índice sem
   * resposta — evita repetir questões já feitas ao retomar a sessão.
   */
  initialAnswers?: Record<string, { answer: string | null; is_correct: boolean | null }>;
  initialWeeklyXp?: number;
}) {
  const router = useRouter();

  // Calcula o primeiro índice de questão ainda não-respondida.
  const firstUnansweredIndex = (() => {
    if (!initialAnswers) return 0;
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q) continue;
      if (!initialAnswers[q.id]) return i;
    }
    // Tudo respondido — fica na última.
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
          // Se acertou, "correct" é o próprio selected; se errou, não sabemos qual
          // era o correto a partir do attempt isolado (a session ainda não terminou).
          // Deixamos null aqui — o feedback visual completo só aparece com a chamada
          // de submit do quiz-runner.
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

  // Estado do banner "Bora entender?" que aparece ao errar.
  // Map por questionId pra resetar quando o user navega.
  const [reviewBannerDismissed, setReviewBannerDismissed] = useState<Set<string>>(
    () => new Set(),
  );
  const helpPanelRef = useRef<HelpPanelHandle | null>(null);

  // Draft selection foi REMOVIDO a pedido do user — click numa alternativa
  // ja submete direto (comportamento original). selectedDraft mantido como
  // const sempre null pra nao precisar refatorar referencias visuais ainda.
  const selectedDraft: AnswerLetter | null = null;

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

  // Prefetch da próxima imagem (só quando tem imagem)
  useEffect(() => {
    const next = questions[currentIndex + 1];
    if (!next || !next.image_url || next.image_url.trim().length === 0) return;
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

  // Atalhos de teclado:
  //   A-E: responde direto a alternativa (sem confirmar)
  //   Enter / Espaco: vai pra proxima (apos ja ter respondido)
  //   ArrowLeft/Right: navega entre questoes
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
            // Só celebra com confete/modal se a resposta foi CERTA.
            // Errar e ganhar XP base não merece comemoração.
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

  const imageAlt = `Questão ${current.question_num} de ${current.year}.${current.semester} — ${disciplineLabel(current.discipline)}`;

  const hasImage = Boolean(current.image_url && current.image_url.trim().length > 0);
  const imageSlot = hasImage ? (
    <Card className="overflow-hidden p-0">
      {/* Container com TODAS as protecoes pra imagem nao reagir a gestos
          de toque no mobile (long-press menu, double-tap zoom, pinch). */}
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
    <Card className="overflow-hidden">
      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-foreground sm:prose-base">
        {current.description ?? '(Enunciado indisponível.)'}
      </div>
    </Card>
  );

  const headerSlot = (
    <header className="flex flex-col gap-2">
      {/* Chips de metadados da questao (disciplina, ano, etc.).
          Botao "Sair" foi promovido pra um sticky page-level, abaixo. */}
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

  // Alternativas como cards com letra em quadrado destacado (estilo
  // respostaCerta). Click submete a resposta IMEDIATAMENTE — user pediu
  // pra remover o passo "Responder questão" (era desnecessario).
  const alternativesSlot = (
    <div className="grid grid-cols-5 gap-2">
      {ANSWER_LETTERS.map((letter) => {
        const isSubmitted = currentAnswer.selected === letter;
        const isCorrect = correctLetter === letter;

        // Classes do CARD inteiro
        let cardClass = 'border-border bg-background';
        if (showFeedback) {
          if (isCorrect) cardClass = 'border-success/60 bg-success-bg/30';
          else if (isSubmitted && !isCorrect)
            cardClass = 'border-destructive/60 bg-destructive/5';
          else cardClass = 'border-border bg-background opacity-60';
        }

        // Classes do BOX da letra (quadradinho A/B/C/D/E)
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

  // Footer reorganizado: stack vertical SEMPRE (estrela em cima, navegacao
  // embaixo) — porque no desktop o body column fica estreito (~40% da tela)
  // e o sm:flex-row de antes brigava com o pouco espaço, gerando os botoes
  // espremidos da v anterior. Agora tudo respira em qualquer largura.
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
        {/* "Proxima"/"Finalizar": maior peso visual no fim do flow. */}
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

      {/* Dica de UX dispensavel — mostra atalho de teclado A-E. Persiste
          em localStorage; user fecha uma vez e nao volta. */}
      {!showFeedback ? (
        <DidYouKnowTip
          id="quiz-keyboard-shortcut"
          text="Pressione A, B, C, D ou E pra responder pelo teclado. ← e → navegam entre questões."
        />
      ) : null}

      {/* Enunciado em texto + marca-texto removidos a pedido do user.
          A questao e exibida via imagem escaneada (image_url) — quando
          nao houver imagem, o fallback no imageSlot mostra o description
          em formato simples. */}

      {alternativesSlot}

      {current.annulled ? (
        <div className="rounded-lg bg-warning-bg p-3 text-sm text-warning" role="status">
          Esta questão foi anulada pela banca — pontuação concedida a todos.
        </div>
      ) : null}

      {showFeedback && correctLetter ? (
        <div
          className={cn(
            // Card prominente inspirado no respostaCerta. Border-2 + padding
            // generoso + emoji grande + titulo bold pra dar peso visual ao
            // resultado. Detalhes (gabarito, sua resposta) em linha menor.
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

      {/* Banner "Bora entender?" — só ao errar e se ainda não dispensado */}
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
      {/* Sticky bar fixa no topo — Sair (esquerda) + contador (direita).
          User pediu pra ter saida bem visivel a qualquer momento durante
          a sessao. Sticky garante que aparece mesmo quando rola pra baixo
          do conteudo da questao. */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        {/* Sair vai pra /dashboard (tela com os cards da prova) — user
            pediu pra voltar pro "menu da prova" e nao pra /quiz que e a
            tela de selecao de disciplinas/topicos. */}
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
