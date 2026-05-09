'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuestionLayout } from '@/components/question-layout';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { finishDiagnostic } from '@/app/diagnostico/actions';
import type { AnswerLetter, Discipline } from '@/lib/supabase/types';

export interface DiagnosticQuestion {
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

interface RecordedAnswer {
  question_id: string;
  answer: AnswerLetter;
  time_spent_sec: number;
  is_correct: boolean | null;
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

export function DiagnosticRunner({
  sessionId,
  questions,
}: {
  sessionId: string;
  questions: DiagnosticQuestion[];
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [phase, setPhase] = useState<'running' | 'submitting' | 'done'>('running');
  const [result, setResult] = useState<{
    score: number;
    time_total_sec: number;
    results: Array<{ question_id: string; is_correct: boolean }>;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    track('diagnostic_started');
  }, []);

  // Ao avançar de questão, reseta o cronômetro.
  useEffect(() => {
    if (phase === 'running') {
      setStartedAt(Date.now());
    }
  }, [currentIndex, phase]);

  const total = questions.length;
  const current = questions[currentIndex];

  const submitFinal = (finalAnswers: RecordedAnswer[]) => {
    setPhase('submitting');
    setErrorMsg(null);
    startTransition(async () => {
      const res = await finishDiagnostic({
        sessionId,
        answers: finalAnswers.map((a) => ({
          question_id: a.question_id,
          answer: a.answer,
          time_spent_sec: a.time_spent_sec,
        })),
      });
      if (!res.ok) {
        setErrorMsg(res.error);
        setPhase('running');
        return;
      }
      track('diagnostic_completed', {
        score: res.score,
        time_total_sec: res.time_total_sec,
      });
      setResult({
        score: res.score,
        time_total_sec: res.time_total_sec,
        results: res.results,
      });
      setPhase('done');
    });
  };

  const handleAnswer = (letter: AnswerLetter) => {
    if (!current || phase !== 'running') return;
    const elapsed = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const recorded: RecordedAnswer = {
      question_id: current.id,
      answer: letter,
      time_spent_sec: elapsed,
      is_correct: null,
    };
    const next = [...answers, recorded];
    setAnswers(next);

    if (currentIndex + 1 >= total) {
      submitFinal(next);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (phase === 'done' && result) {
    return (
      <DoneSummary
        questions={questions}
        results={result.results}
        score={result.score}
        onContinue={() => router.push('/dashboard')}
      />
    );
  }

  if (!current) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          Nenhuma questão disponível para o diagnóstico no momento.
        </p>
      </Card>
    );
  }

  const submitting = phase === 'submitting' || isPending;

  const imageAlt = `Questão ${current.question_num} de ${current.year}.${current.semester} — ${disciplineLabel(current.discipline)}`;

  const hasImage = Boolean(current.image_url && current.image_url.trim().length > 0);
  const imageSlot = hasImage ? (
    <Card className="overflow-hidden p-0">
      <div className="relative w-full">
        <Image
          src={current.image_url}
          alt={imageAlt}
          width={1200}
          height={800}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="h-auto w-full"
          priority={currentIndex === 0}
          unoptimized
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

  const bodySlot = (
    <>
      <header className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white',
            disciplineBg(current.discipline),
          )}
        >
          {disciplineLabel(current.discipline)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        {ANSWER_LETTERS.map((letter) => (
          <Button
            key={letter}
            type="button"
            variant="secondary"
            size="lg"
            disabled={submitting}
            onClick={() => handleAnswer(letter)}
            className="w-full justify-start text-base"
          >
            <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border font-semibold">
              {letter}
            </span>
            Alternativa {letter}
          </Button>
        ))}
      </div>

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      {submitting ? (
        <p className="text-center text-sm text-muted-foreground">Salvando suas respostas…</p>
      ) : null}
    </>
  );

  return (
    <QuestionLayout
      image={imageSlot}
      body={bodySlot}
      imageUrl={current.image_url}
      imageAlt={imageAlt}
    />
  );
}

function DoneSummary({
  questions,
  results,
  score,
  onContinue,
}: {
  questions: DiagnosticQuestion[];
  results: Array<{ question_id: string; is_correct: boolean }>;
  score: number;
  onContinue: () => void;
}) {
  const correctById = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const r of results) m.set(r.question_id, r.is_correct);
    return m;
  }, [results]);

  const total = questions.length;
  const pct = Math.round((score / Math.max(total, 1)) * 100);

  // Mensagem motivacional baseada no resultado
  let headline: string;
  let sub: string;
  if (score === total) {
    headline = 'Cinco em cinco! 🔥';
    sub = 'Você manda bem. Bora continuar pra manter o ritmo nos 1015 questões oficiais.';
  } else if (score >= Math.ceil(total * 0.6)) {
    headline = `Mandou bem! ${score} de ${total} acertos.`;
    sub = 'Você já tem base. Agora é só consistência diária pra refinar onde ainda erra.';
  } else if (score > 0) {
    headline = `${score} de ${total} acertos — bom começo!`;
    sub =
      'Calma, esse é só o ponto de partida. Cada questão resolvida vai te aproximar da aprovação.';
  } else {
    headline = 'Calma, é só o começo.';
    sub =
      'Todo mundo começa do zero. Vamos pro app — você tem 7 dias de Trial Pro pra explorar tudo.';
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl" aria-hidden="true">
          {score === total ? '🎉' : score >= Math.ceil(total * 0.6) ? '👏' : '💪'}
        </span>
        <h1 className="text-2xl font-semibold text-foreground">{headline}</h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
        <div className="mt-2 inline-flex items-baseline gap-2 rounded-full bg-primary/10 px-4 py-1.5">
          <span className="text-xs uppercase tracking-wide text-primary">
            Seu desempenho
          </span>
          <span className="text-xl font-bold tabular-nums text-primary">{pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {questions.map((q, idx) => {
          const correct = correctById.get(q.id) === true;
          return (
            <div
              key={q.id}
              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 text-center"
            >
              <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
              <span className="text-sm font-semibold text-foreground">
                {DISCIPLINE_LABEL[q.discipline] ?? q.discipline}
              </span>
              <span
                aria-hidden
                className={cn(
                  'mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                  correct
                    ? 'bg-success-bg text-success'
                    : 'bg-error-bg text-error',
                )}
              >
                {correct ? '✓' : '✗'}
              </span>
            </div>
          );
        })}
      </div>

      <Button type="button" size="lg" onClick={onContinue} className="w-full">
        Continuar pro app
      </Button>
    </Card>
  );
}
