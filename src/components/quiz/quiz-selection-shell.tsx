'use client';

/**
 * PR 33 — Wrapper que dá ao /quiz uma seleção compartilhada usando o
 * <DisciplineExplorer> (cards à esquerda + tópicos à direita) + 2 CTAs
 * embaixo. Substitui o antigo `<TopicMapMatrix>` (6 cards 2x3) que ficava
 * empilhado em cima do drilldown.
 *
 * Persiste seleção via URL `?selected=mat:funcoes,bio:*,quim:reacoes`.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Play } from 'lucide-react';
import { DisciplineExplorer } from '@/components/quiz/discipline-explorer';
import {
  type DisciplineTopicNode,
  getTopTopicsByDiscipline,
} from '@/lib/stats/topic-frequency';
import {
  type SelectionState,
  countQuestionsInSelection,
  expandSelection,
  parseSelectionFromUrl,
  selectionToUrlParam,
  toggleItem,
  SELECTION_URL_PARAM,
} from '@/lib/quiz/selection';
import { startTopicsQuizAndRedirect, checkQuestionsCapAction } from '@/app/quiz/actions';
import { PaywallModal } from '@/components/paywall-modal';
import { isStripeEnabledClient } from '@/lib/billing/stripe-client';

type Discipline =
  | 'matematica'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'humanas'
  | 'linguagens';

const KNOWN_DISCIPLINES: ReadonlyArray<Discipline> = [
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
];

function isKnownDiscipline(d: string): d is Discipline {
  return (KNOWN_DISCIPLINES as ReadonlyArray<string>).includes(d);
}

export interface QuizSelectionShellProps {
  data: DisciplineTopicNode[];
  /** Mantido pra compat — não é mais usado já que o `<details>` foi removido. */
  years?: number[];
}

export function QuizSelectionShell({ data }: QuizSelectionShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewFreeMode = searchParams?.get('preview') === 'free';

  const [selected, setSelected] = useState<SelectionState>(() => {
    const params = new URLSearchParams(
      Array.from(searchParams?.entries() ?? []),
    );
    return parseSelectionFromUrl(params);
  });

  const [isPendingMaisCai, startMaisCaiTransition] = useTransition();
  const [isPendingSelected, startSelectedTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Sincroniza ?selected= na URL (deep-link).
  const isFirstSyncRef = useRef(true);
  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }
    const params = new URLSearchParams(
      Array.from(searchParams?.entries() ?? []),
    );
    const serialized = selectionToUrlParam(selected);
    if (serialized.length > 0) {
      params.set(SELECTION_URL_PARAM, serialized);
    } else {
      params.delete(SELECTION_URL_PARAM);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleToggle = useCallback((item: string) => {
    setSelected((prev) => toggleItem(prev, item));
  }, []);

  const handleClear = useCallback(() => setSelected(new Set()), []);

  // Expansão: resolve "*" em todos os subtópicos e devolve pares (discipline, subtopic).
  const expandedPairs = useMemo(
    () => expandSelection(selected, data),
    [selected, data],
  );

  const totalQuestions = useMemo(
    () => countQuestionsInSelection(selected, data),
    [selected, data],
  );

  const totalSelectedItems = selected.size;

  const totalAvailable = useMemo(
    () => data.reduce((acc, d) => acc + d.count, 0),
    [data],
  );

  const startQuizFromPairs = useCallback(
    (
      pairs: Array<{ discipline: string; subtopic: string }>,
      starter: typeof startMaisCaiTransition,
      label: 'mais-cai' | 'selecionados',
    ) => {
      setErrorMsg(null);
      const valid = pairs.filter(
        (p): p is { discipline: Discipline; subtopic: string } =>
          isKnownDiscipline(p.discipline) && p.subtopic.length > 0,
      );
      if (valid.length === 0) {
        setErrorMsg(
          label === 'mais-cai'
            ? 'Sem tópicos suficientes pra montar o quiz.'
            : 'Selecione ao menos um tópico.',
        );
        return;
      }
      starter(async () => {
        try {
          const cap = await checkQuestionsCapAction({ previewFreeMode });
          if (!cap.allowed) {
            setPaywallOpen(true);
            return;
          }
          await startTopicsQuizAndRedirect({ topics: valid, mode: 'aleatorio' });
        } catch (err) {
          if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
          setErrorMsg(err instanceof Error ? err.message : 'Falha ao iniciar.');
        }
      });
    },
    [previewFreeMode],
  );

  const handleStudyMaisCai = useCallback(() => {
    // Top-3 de cada disciplina, sem alterar a seleção visível.
    const top3 = getTopTopicsByDiscipline(data, 3);
    const pairs: Array<{ discipline: string; subtopic: string }> = [];
    for (const [discipline, topics] of top3) {
      for (const t of topics) {
        pairs.push({ discipline, subtopic: t.topic });
      }
    }
    startQuizFromPairs(pairs, startMaisCaiTransition, 'mais-cai');
  }, [data, startQuizFromPairs]);

  const handleStudySelected = useCallback(() => {
    if (totalSelectedItems === 0) return;
    startQuizFromPairs(expandedPairs, startSelectedTransition, 'selecionados');
  }, [totalSelectedItems, expandedPairs, startQuizFromPairs]);

  const isPending = isPendingMaisCai || isPendingSelected;
  const canStartSelected = totalSelectedItems > 0 && !isPending;

  return (
    <div className="flex flex-col gap-4">
      <DisciplineExplorer
        data={data}
        selected={selected}
        onToggle={handleToggle}
        title={`${totalAvailable} questões oficiais`}
        subtitle="Clique numa disciplina pra ver os tópicos · clique nos tópicos pra montar seu quiz"
      />

      {/* Indicador de seleção */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-sm text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {totalSelectedItems === 0 ? (
            'Nenhum item selecionado.'
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {totalSelectedItems}
              </span>{' '}
              {totalSelectedItems === 1 ? 'selecionado' : 'selecionados'} ·{' '}
              <span className="font-semibold text-foreground">
                {totalQuestions}
              </span>{' '}
              {totalQuestions === 1 ? 'questão disponível' : 'questões disponíveis'}
            </>
          )}
        </p>
        {totalSelectedItems > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-muted-foreground hover:underline"
          >
            Limpar seleção
          </button>
        ) : null}
      </div>

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      {/* CTAs */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleStudyMaisCai}
          disabled={isPending}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Estudar o que mais cai (top-3 por disciplina)"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {isPendingMaisCai ? 'Carregando…' : 'Estudar o que mais cai'}
        </button>
        <button
          type="button"
          onClick={handleStudySelected}
          disabled={!canStartSelected}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Estudar itens selecionados"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          {isPendingSelected
            ? 'Carregando…'
            : totalSelectedItems === 0
              ? 'Estudar itens selecionados'
              : `Estudar itens selecionados (${totalQuestions}q)`}
        </button>
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="questions"
        fallback={!isStripeEnabledClient()}
      />
    </div>
  );
}
