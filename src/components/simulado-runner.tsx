'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuestionLayout } from '@/components/question-layout';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { finalizeSimulado } from '@/app/simulado/actions';
import { disciplineBg, disciplineLabel } from '@/app/simulado/config';
import { normalizeQuestionText } from '@/lib/text/normalize-question-text';
import type { AnswerLetter } from '@/lib/supabase/types';

/**
 * Renderiza questões em texto puro (image_url vazio) como se fosse o scan
 * de uma página de PDF: fundo claro (papel), texto escuro, header com
 * "Questão XX" e footer "UNIFOR — Processo Seletivo YYYY.X - MEDICINA".
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
        <div className="mb-4 border-b border-stone-300 pb-2">
          <span className="inline-block bg-stone-900 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-stone-50">
            Questão {questionNum}
          </span>
        </div>
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

export interface SimuladoQuestion {
  id: string;
  discipline: string;
  subtopic: string;
  subtopic_short: string;
  year: number;
  semester: number;
  question_num: number;
  image_url: string;
  description?: string;
}

const ANSWER_LETTERS: AnswerLetter[] = ['A', 'B', 'C', 'D', 'E'];

function formatMmSs(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

interface SubmitPayload {
  question_id: string;
  answer: AnswerLetter | null;
}

export function SimuladoRunner({
  sessionId,
  questions,
  timeLimitSec,
  startedAtIso,
  initialAnswers,
}: {
  sessionId: string;
  questions: SimuladoQuestion[];
  timeLimitSec: number;
  startedAtIso: string;
  /** Map question_id → letra marcada anteriormente, pra retomar sem perder progresso. */
  initialAnswers?: Record<string, AnswerLetter | null>;
}) {
  const router = useRouter();
  const total = questions.length;
  const startMs = useMemo(() => new Date(startedAtIso).getTime(), [startedAtIso]);
  const deadlineMs = useMemo(() => startMs + timeLimitSec * 1000, [startMs, timeLimitSec]);

  const firstUnansweredIndex = useMemo(() => {
    if (!initialAnswers) return 0;
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q) continue;
      const v = initialAnswers[q.id];
      if (v == null) return i;
    }
    return Math.max(0, questions.length - 1);
  }, [questions, initialAnswers]);

  const [currentIndex, setCurrentIndex] = useState(firstUnansweredIndex);
  const [answers, setAnswers] = useState<Map<string, AnswerLetter>>(() => {
    const m = new Map<string, AnswerLetter>();
    if (initialAnswers) {
      for (const [qid, letter] of Object.entries(initialAnswers)) {
        if (letter) m.set(qid, letter);
      }
    }
    return m;
  });
  const [remainingSec, setRemainingSec] = useState<number>(() =>
    Math.max(0, Math.round((deadlineMs - Date.now()) / 1000)),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submittedRef = useRef(false);
  const trackedStartRef = useRef(false);

  useEffect(() => {
    if (trackedStartRef.current) return;
    trackedStartRef.current = true;
    track('session_started', { type: 'simulado' });
  }, []);

  const submitFinal = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    setErrorMsg(null);

    const payload: SubmitPayload[] = questions.map((q) => ({
      question_id: q.id,
      answer: answers.get(q.id) ?? null,
    }));

    const answeredCount = payload.filter((a) => a.answer !== null).length;

    startTransition(async () => {
      const res = await finalizeSimulado({
        session_id: sessionId,
        answers: payload,
      });
      if (!res.ok) {
        submittedRef.current = false;
        setSubmitted(false);
        setErrorMsg(res.error);
        return;
      }
      track('session_completed', {
        type: 'simulado',
        total,
        answered: answeredCount,
      });
      router.replace(`/simulado/sessao/${sessionId}/resultado`);
    });
  }, [answers, questions, sessionId, total, router]);

  useEffect(() => {
    if (submitted) return;
    const tick = () => {
      const left = Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));
      setRemainingSec(left);
      if (left <= 0 && !submittedRef.current) {
        submitFinal();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadlineMs, submitFinal, submitted]);

  const current = questions[currentIndex];
  const selectedLetter = current ? answers.get(current.id) ?? null : null;
  const answeredCount = answers.size;

  const handleSelect = (letter: AnswerLetter) => {
    if (!current || submitted) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      const prevLetter = next.get(current.id);
      if (prevLetter === letter) {
        next.delete(current.id);
      } else {
        next.set(current.id, letter);
      }
      return next;
    });
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(total - 1, i + 1));
  const jumpTo = (idx: number) => setCurrentIndex(Math.max(0, Math.min(total - 1, idx)));

  const shortcutsEnabled = !submitted && !confirmOpen;
  const handleSelectRef = useRef(handleSelect);
  handleSelectRef.current = handleSelect;
  const goPrevRef = useRef(goPrev);
  goPrevRef.current = goPrev;
  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  const shortcuts = useMemo(
    () => ({
      a: () => handleSelectRef.current('A'),
      b: () => handleSelectRef.current('B'),
      c: () => handleSelectRef.current('C'),
      d: () => handleSelectRef.current('D'),
      e: () => handleSelectRef.current('E'),
      ArrowLeft: () => goPrevRef.current(),
      ArrowRight: (e: KeyboardEvent) => {
        e.preventDefault();
        goNextRef.current();
      },
      ' ': (e: KeyboardEvent) => {
        e.preventDefault();
        goNextRef.current();
      },
      Enter: (e: KeyboardEvent) => {
        e.preventDefault();
        goNextRef.current();
      },
    }),
    [],
  );
  useKeyboardShortcuts(shortcuts, { enabled: shortcutsEnabled });

  const timerColor =
    remainingSec < 60
      ? 'text-destructive'
      : remainingSec < 600
        ? 'text-warning'
        : 'text-foreground';

  if (!current) {
    return (
      <Card className="m-4">
        <p className="text-sm text-muted-foreground">
          Nenhuma questão disponível neste simulado.
        </p>
      </Card>
    );
  }

  const imageAlt = `Questão ${current.question_num} de ${current.year}.${current.semester} — ${disciplineLabel(current.discipline)}`;

  const hasImage = Boolean(current.image_url && current.image_url.trim().length > 0);
  const imageSlot = hasImage ? (
    <Card
      className="overflow-hidden p-0"
      style={{
        touchAction: 'pan-y',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.image_url}
        alt={imageAlt}
        width={1200}
        height={800}
        className="h-auto w-full pointer-events-none select-none"
        loading={currentIndex === 0 ? 'eager' : 'lazy'}
        draggable={false}
        style={
          {
            WebkitUserDrag: 'none',
            WebkitTouchCallout: 'none',
          } as React.CSSProperties
        }
      />
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
    <div className="flex items-center justify-between gap-2">
      <span
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white',
          disciplineBg(current.discipline),
        )}
      >
        {disciplineLabel(current.discipline)}
      </span>
      <span className="text-xs text-muted-foreground">
        {current.year}.{current.semester} · Q{current.question_num}
      </span>
    </div>
  );

  const alternativesSlot = (
    <div className="grid grid-cols-5 gap-2">
      {ANSWER_LETTERS.map((letter) => {
        const isSelected = selectedLetter === letter;
        return (
          <button
            key={letter}
            type="button"
            disabled={submitted}
            onClick={() => handleSelect(letter)}
            aria-pressed={isSelected}
            aria-label={`Marcar alternativa ${letter}`}
            className={cn(
              'flex items-center justify-center rounded-md border px-3 py-3 text-base font-medium transition-colors duration-motion-base disabled:opacity-40',
              isSelected
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-full border font-bold',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border',
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
    <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={goPrev}
        disabled={submitted || currentIndex === 0}
      >
        Anterior
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="md"
        onClick={() => setConfirmOpen(true)}
        disabled={submitted}
      >
        Finalizar agora
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={goNext}
        disabled={submitted || currentIndex === total - 1}
      >
        Próxima
      </Button>
    </div>
  );

  const bodySlot = (
    <>
      {headerSlot}
      {alternativesSlot}
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
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <button
          type="button"
          onClick={() => {
            const ok = typeof window !== 'undefined'
              ? window.confirm('Sair do simulado? O tempo decorrido continua contando.')
              : true;
            if (ok) router.push('/dashboard');
          }}
          aria-label="Sair do simulado"
          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Sair
        </button>
        <span
          className={cn(
            'font-mono text-2xl font-semibold tabular-nums',
            timerColor,
          )}
          aria-live="polite"
          aria-label="Tempo restante"
        >
          {formatMmSs(remainingSec)}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentIndex + 1}/{total} · {answeredCount} resp.
        </span>
      </header>

      <section className="px-4 py-4">
        <QuestionLayout
          image={imageSlot}
          body={bodySlot}
          imageUrl={current.image_url}
          imageAlt={imageAlt}
          enableLightbox={false}
          enableFullscreen={false}
        />
      </section>

      <footer className="flex flex-col gap-3 border-t border-border bg-background px-4 py-3">
        <GridNav
          total={total}
          currentIndex={currentIndex}
          answeredIds={answers}
          questions={questions}
          onJump={jumpTo}
          disabled={submitted}
        />
      </footer>

      {confirmOpen ? (
        <ConfirmDialog
          answeredCount={answeredCount}
          total={total}
          loading={isPending || submitted}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            submitFinal();
          }}
        />
      ) : null}
    </>
  );
}

function GridNav({
  total,
  currentIndex,
  answeredIds,
  questions,
  onJump,
  disabled,
}: {
  total: number;
  currentIndex: number;
  answeredIds: Map<string, AnswerLetter>;
  questions: SimuladoQuestion[];
  onJump: (idx: number) => void;
  disabled: boolean;
}) {
  return (
    <nav
      aria-label="Navegação entre questões"
      className="grid grid-cols-8 gap-1 sm:grid-cols-10"
    >
      {Array.from({ length: total }, (_, idx) => {
        const q = questions[idx];
        const answered = q ? answeredIds.has(q.id) : false;
        const isCurrent = idx === currentIndex;
        const stateClass = isCurrent
          ? 'bg-primary text-primary-foreground'
          : answered
            ? 'bg-success/20 text-success'
            : 'bg-muted text-muted-foreground';
        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onJump(idx)}
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`Ir para questão ${idx + 1}${answered ? ' (respondida)' : ''}`}
            className={cn(
              'h-9 rounded text-xs font-semibold transition-colors duration-motion-base disabled:opacity-40',
              stateClass,
            )}
          >
            {idx + 1}
          </button>
        );
      })}
    </nav>
  );
}

function ConfirmDialog({
  answeredCount,
  total,
  loading,
  onCancel,
  onConfirm,
}: {
  answeredCount: number;
  total: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="finalize-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onCancel}
        className="absolute inset-0 bg-black/50"
      />
      <Card className="relative w-full max-w-sm p-6">
        <h2
          id="finalize-dialog-title"
          className="text-lg font-semibold text-foreground"
        >
          Finalizar simulado?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Você respondeu {answeredCount} de {total} questões. Não dá para voltar
          depois de finalizar.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Continuar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Finalizar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
