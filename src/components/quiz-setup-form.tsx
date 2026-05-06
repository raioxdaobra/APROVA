'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { track } from '@/lib/analytics';
import {
  countQuestions,
  getSubtopics,
  startQuizSessionAndRedirect,
  checkQuestionsCapAction,
  type QuizFilters,
} from '@/app/quiz/actions';
import type { Discipline, HumanasSubject, Language } from '@/lib/supabase/types';
import { PaywallModal } from '@/components/paywall-modal';
import { isStripeEnabledClient } from '@/lib/billing/stripe-client';

const LANGUAGE_OPTIONS: Array<{ value: Language | 'tudo'; label: string }> = [
  { value: 'tudo', label: 'Tudo' },
  { value: 'portugues', label: 'Português + Literatura' },
  { value: 'ingles', label: 'Inglês' },
  { value: 'espanhol', label: 'Espanhol' },
];

const SUBJECT_OPTIONS: Array<{ value: HumanasSubject | 'tudo'; label: string }> = [
  { value: 'tudo', label: 'Tudo' },
  { value: 'historia', label: 'História' },
  { value: 'geografia', label: 'Geografia' },
  { value: 'filosofia', label: 'Filosofia' },
  { value: 'sociologia', label: 'Sociologia' },
];

const LANGUAGE_VALUES: Language[] = ['portugues', 'ingles', 'espanhol'];
const SUBJECT_VALUES: HumanasSubject[] = [
  'historia',
  'geografia',
  'filosofia',
  'sociologia',
];

const DISCIPLINE_OPTIONS: Array<{ value: Discipline | ''; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'fisica', label: 'Física' },
  { value: 'quimica', label: 'Química' },
  { value: 'biologia', label: 'Biologia' },
  { value: 'humanas', label: 'Humanas' },
  { value: 'linguagens', label: 'Linguagens' },
];

const DISCIPLINE_VALUES: Discipline[] = [
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
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
  language: Language | 'tudo';
  subject: HumanasSubject | 'tudo';
};

function toFilters(s: FormState): QuizFilters {
  return {
    discipline: s.discipline === '' ? null : s.discipline,
    subtopic: s.subtopic === '' ? null : s.subtopic,
    year: s.year === '' ? null : Number(s.year),
    status: s.status,
    hide_annulled: s.hide_annulled,
    language:
      s.discipline === 'linguagens' && s.language !== 'tudo' ? s.language : null,
    subject:
      s.discipline === 'humanas' && s.subject !== 'tudo' ? s.subject : null,
  };
}

export function QuizSetupForm({ years }: { years: number[] }) {
  const disciplineId = useId();
  const subtopicId = useId();
  const yearId = useId();
  const statusId = useId();
  const hideId = useId();
  const languageGroupId = useId();
  const subjectGroupId = useId();

  const searchParams = useSearchParams();
  const previewFreeMode = searchParams?.get('preview') === 'free';

  // Hidrata state inicial a partir de query params (?discipline=X&subtopic=Y&language=Z&subject=W)
  // Usado pelos chips do <TopicMapMatrix mode='quiz'> e drill-down.
  const initialDisciplineParam = searchParams?.get('discipline') ?? '';
  const initialSubtopicParam = searchParams?.get('subtopic') ?? '';
  const initialLanguageParam = searchParams?.get('language') ?? '';
  const initialSubjectParam = searchParams?.get('subject') ?? '';
  const initialDiscipline: Discipline | '' = (DISCIPLINE_VALUES as string[]).includes(
    initialDisciplineParam,
  )
    ? (initialDisciplineParam as Discipline)
    : '';
  const initialLanguage: Language | 'tudo' = (LANGUAGE_VALUES as string[]).includes(
    initialLanguageParam,
  )
    ? (initialLanguageParam as Language)
    : 'tudo';
  const initialSubject: HumanasSubject | 'tudo' = (SUBJECT_VALUES as string[]).includes(
    initialSubjectParam,
  )
    ? (initialSubjectParam as HumanasSubject)
    : 'tudo';

  const [state, setState] = useState<FormState>({
    discipline: initialDiscipline,
    subtopic: '',
    year: '',
    status: 'todas',
    hide_annulled: true,
    language: initialLanguage,
    subject: initialSubject,
  });

  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const subtopicHydratedRef = useRef(false);

  const filters = useMemo(() => toFilters(state), [state]);

  // Carrega subtopics quando disciplina muda
  useEffect(() => {
    let cancelled = false;
    if (state.discipline === '') {
      setSubtopics([]);
      return;
    }
    void getSubtopics(state.discipline).then((list) => {
      if (cancelled) return;
      setSubtopics(list);
      // Hidrata subtopic do query param na primeira carga, se ainda não foi feito
      // e o subtopic existe na lista carregada.
      if (
        !subtopicHydratedRef.current &&
        initialSubtopicParam &&
        list.includes(initialSubtopicParam)
      ) {
        subtopicHydratedRef.current = true;
        setState((prev) => ({ ...prev, subtopic: initialSubtopicParam }));
      } else if (!subtopicHydratedRef.current) {
        subtopicHydratedRef.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [state.discipline, initialSubtopicParam]);

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
      // Se trocou disciplina, zera subtopic e reseta sub-filtros pra 'tudo'.
      if (key === 'discipline' && prev.discipline !== value) {
        next.subtopic = '';
        next.language = 'tudo';
        next.subject = 'tudo';
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
        const cap = await checkQuestionsCapAction({ previewFreeMode });
        if (!cap.allowed) {
          setPaywallOpen(true);
          return;
        }
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

        {state.discipline === 'linguagens' ? (
          <fieldset
            className="flex flex-col gap-2 rounded border border-border bg-muted/30 p-3"
            aria-labelledby={languageGroupId}
          >
            <legend
              id={languageGroupId}
              className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Foco
            </legend>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((opt) => {
                const checked = state.language === opt.value;
                return (
                  <label
                    key={opt.value}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm transition-colors hover:bg-muted focus-within:ring-2 focus-within:ring-primary"
                    style={{
                      borderColor: checked ? 'hsl(var(--primary))' : undefined,
                      backgroundColor: checked
                        ? 'hsl(var(--primary) / 0.08)'
                        : undefined,
                      color: checked ? 'hsl(var(--primary))' : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="quiz-language"
                      value={opt.value}
                      checked={checked}
                      onChange={() => update('language', opt.value)}
                      className="h-4 w-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {state.discipline === 'humanas' ? (
          <fieldset
            className="flex flex-col gap-2 rounded border border-border bg-muted/30 p-3"
            aria-labelledby={subjectGroupId}
          >
            <legend
              id={subjectGroupId}
              className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Foco
            </legend>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((opt) => {
                const checked = state.subject === opt.value;
                return (
                  <label
                    key={opt.value}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm transition-colors hover:bg-muted focus-within:ring-2 focus-within:ring-primary"
                    style={{
                      borderColor: checked ? 'hsl(var(--primary))' : undefined,
                      backgroundColor: checked
                        ? 'hsl(var(--primary) / 0.08)'
                        : undefined,
                      color: checked ? 'hsl(var(--primary))' : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="quiz-subject"
                      value={opt.value}
                      checked={checked}
                      onChange={() => update('subject', opt.value)}
                      className="h-4 w-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

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

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="questions"
        fallback={!isStripeEnabledClient()}
      />
    </Card>
  );
}
