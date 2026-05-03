'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { track } from '@/lib/analytics';
import {
  countQuestions,
  getSubtopics,
  startQuizSessionAndRedirect,
  type QuizFilters,
} from '@/app/quiz/actions';
import type { Discipline } from '@/lib/supabase/types';

const DISCIPLINE_OPTIONS: Array<{ value: Discipline | ''; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'fisica', label: 'Física' },
  { value: 'quimica', label: 'Química' },
  { value: 'biologia', label: 'Biologia' },
  { value: 'humanas', label: 'Humanas' },
];

const STATUS_OPTIONS: Array<{ value: 'todas' | 'correct' | 'wrong' | 'toreview'; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'correct', label: 'Acertei antes' },
  { value: 'wrong', label: 'Errei antes' },
  { value: 'toreview', label: 'Marcadas p/ revisar' },
];

type FormState = {
  discipline: Discipline | '';
  subtopic: string;
  year: string;
  status: 'todas' | 'correct' | 'wrong' | 'toreview';
  hide_annulled: boolean;
};

function toFilters(s: FormState): QuizFilters {
  return {
    discipline: s.discipline === '' ? null : s.discipline,
    subtopic: s.subtopic === '' ? null : s.subtopic,
    year: s.year === '' ? null : Number(s.year),
    status: s.status,
    hide_annulled: s.hide_annulled,
  };
}

export function QuizSetupForm({ years }: { years: number[] }) {
  const disciplineId = useId();
  const subtopicId = useId();
  const yearId = useId();
  const statusId = useId();
  const hideId = useId();

  const [state, setState] = useState<FormState>({
    discipline: '',
    subtopic: '',
    year: '',
    status: 'todas',
    hide_annulled: true,
  });

  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();

  const filters = useMemo(() => toFilters(state), [state]);

  // Carrega subtopics quando disciplina muda
  useEffect(() => {
    let cancelled = false;
    if (state.discipline === '') {
      setSubtopics([]);
      return;
    }
    void getSubtopics(state.discipline).then((list) => {
      if (!cancelled) setSubtopics(list);
    });
    return () => {
      cancelled = true;
    };
  }, [state.discipline]);

  // Conta questões com debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCounting(true);
    debounceRef.current = setTimeout(() => {
      void countQuestions(filters).then((n) => {
        setCount(n);
        setCounting(false);
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      // Se trocou disciplina, zera subtopic
      if (key === 'discipline' && prev.discipline !== value) {
        next.subtopic = '';
      }
      return next;
    });
  };

  const start = (mode: 'sequencial' | 'aleatorio') => {
    if ((count ?? 0) === 0) return;
    setErrorMsg(null);
    track('quiz_setup_started', { mode, ...filters });
    startTransition(async () => {
      try {
        await startQuizSessionAndRedirect({ filters, mode });
      } catch (err) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          // redirect lança intencionalmente
          return;
        }
        setErrorMsg(err instanceof Error ? err.message : 'Falha ao iniciar sessão.');
      }
    });
  };

  const noResults = count === 0;
  const disableSubmit = submitting || counting || noResults || count === null;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Quiz</h1>
        <p className="text-sm text-muted-foreground">
          Filtre por disciplina, subtópico, prova ou status pessoal e comece a praticar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={disciplineId}>Disciplina</Label>
          <select
            id={disciplineId}
            value={state.discipline}
            onChange={(e) => update('discipline', e.target.value as Discipline | '')}
            className="h-11 w-full rounded border border-input bg-card px-3 text-base text-foreground transition-colors duration-motion-fast focus-visible:border-primary focus-visible:outline-none"
          >
            {DISCIPLINE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={subtopicId}>Subtópico</Label>
          <select
            id={subtopicId}
            value={state.subtopic}
            onChange={(e) => update('subtopic', e.target.value)}
            disabled={state.discipline === '' || subtopics.length === 0}
            className="h-11 w-full rounded border border-input bg-card px-3 text-base text-foreground transition-colors duration-motion-fast focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {state.discipline === '' ? 'Escolha uma disciplina antes' : 'Todos'}
            </option>
            {subtopics.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={yearId}>Ano da prova</Label>
          <select
            id={yearId}
            value={state.year}
            onChange={(e) => update('year', e.target.value)}
            className="h-11 w-full rounded border border-input bg-card px-3 text-base text-foreground transition-colors duration-motion-fast focus-visible:border-primary focus-visible:outline-none"
          >
            <option value="">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={statusId}>Status pessoal</Label>
          <select
            id={statusId}
            value={state.status}
            onChange={(e) =>
              update('status', e.target.value as 'todas' | 'correct' | 'wrong' | 'toreview')
            }
            className="h-11 w-full rounded border border-input bg-card px-3 text-base text-foreground transition-colors duration-motion-fast focus-visible:border-primary focus-visible:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={hideId} className="cursor-pointer">
            Esconder anuladas
          </Label>
          <Switch
            id={hideId}
            checked={state.hide_annulled}
            onCheckedChange={(v) => update('hide_annulled', v)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
        {counting || count === null ? (
          <span className="text-sm text-muted-foreground">Calculando…</span>
        ) : (
          <span className="text-sm font-semibold text-foreground">
            {count} {count === 1 ? 'questão corresponde' : 'questões correspondem'}
          </span>
        )}
      </div>

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={disableSubmit}
          onClick={() => start('sequencial')}
          className="w-full"
        >
          Sequencial
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={disableSubmit}
          onClick={() => start('aleatorio')}
          className="w-full"
        >
          Aleatório
        </Button>
      </div>
    </Card>
  );
}
