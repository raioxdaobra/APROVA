'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Save, Scale, Zap, Play } from 'lucide-react';
import { TopicMapMatrix } from '@/components/topic-map-matrix';
import type { DisciplineTopicNode } from '@/lib/stats/topic-frequency';
import {
  balanceSelection,
  summarizeSelection,
} from '@/lib/simulado/balancing';
import {
  MIN_QUESTIONS_TO_START,
  MINUTES_PER_QUESTION,
  TARGET_DEFAULT,
  estimatedMinutes,
} from '@/lib/simulado/sizing';
import { startMultiTopicSimuladoAndRedirect } from '@/app/simulado/actions';
import { PaywallModal } from '@/components/paywall-modal';
import { isStripeEnabledClient } from '@/lib/billing/stripe-client';
import { checkSimuladoCapAction } from '@/app/simulado/actions';

const ACCENT_VARS: Record<string, string> = {
  matematica: '--accent-quiz',
  fisica: '--accent-simulado',
  quimica: '--accent-trilha',
  biologia: '--accent-chat',
  humanas: '--accent-jogos',
  linguagens: '--accent-ranking',
};

const DISCIPLINE_LABELS: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const TEMPLATES_KEY = 'aprova:simulado:templates';

interface SimuladoTemplate {
  name: string;
  topics: string[];
  createdAt: string; // ISO
}

const KNOWN_DISCIPLINES = new Set([
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
]);

function parseTopicId(
  id: string,
):
  | {
      discipline: 'matematica' | 'fisica' | 'quimica' | 'biologia' | 'humanas' | 'linguagens';
      subtopic: string;
    }
  | null {
  const idx = id.indexOf(':');
  if (idx <= 0) return null;
  const discipline = id.slice(0, idx);
  const subtopic = id.slice(idx + 1);
  if (!KNOWN_DISCIPLINES.has(discipline) || !subtopic) return null;
  return {
    discipline: discipline as
      | 'matematica'
      | 'fisica'
      | 'quimica'
      | 'biologia'
      | 'humanas'
      | 'linguagens',
    subtopic,
  };
}

function topicsFromUrl(raw: string | null): Set<string> {
  if (!raw) return new Set();
  const out = new Set<string>();
  for (const piece of raw.split(',')) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    if (parseTopicId(trimmed)) out.add(trimmed);
  }
  return out;
}

function topicsToUrl(set: Set<string>): string {
  return [...set].sort().join(',');
}

export interface TopicMultiSelectorProps {
  data: DisciplineTopicNode[];
}

export function TopicMultiSelector({ data }: TopicMultiSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewFreeMode = searchParams?.get('preview') === 'free';

  const [selected, setSelected] = useState<Set<string>>(() =>
    topicsFromUrl(searchParams?.get('topics') ?? null),
  );
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Mobile drawer state
  const [statusOpen, setStatusOpen] = useState(true);

  // Templates
  const [templates, setTemplates] = useState<SimuladoTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // Carrega templates do localStorage no mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(TEMPLATES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (t): t is SimuladoTemplate =>
              typeof t === 'object' &&
              t !== null &&
              typeof (t as SimuladoTemplate).name === 'string' &&
              Array.isArray((t as SimuladoTemplate).topics),
          );
          setTemplates(cleaned);
        }
      }
    } catch {
      // ignore parse errors
    }
    setTemplatesLoaded(true);
  }, []);

  // Sincroniza URL ?topics=... com a seleção (deep link)
  // Skip a primeira sincronização pra evitar loop.
  const isFirstSyncRef = useRef(true);
  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }
    const params = new URLSearchParams(
      Array.from(searchParams?.entries() ?? []),
    );
    const serialized = topicsToUrl(selected);
    if (serialized.length > 0) {
      params.set('topics', serialized);
    } else {
      params.delete('topics');
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggleTopic = useCallback((topicId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const summary = useMemo(() => summarizeSelection(data, selected), [data, selected]);
  const totalQuestions = summary.totalAvailableQuestions;
  const totalTopics = summary.totalSelectedTopics;
  const minutes = estimatedMinutes(totalQuestions);

  const canStart = totalQuestions >= MIN_QUESTIONS_TO_START;

  const handleBalance = useCallback(() => {
    setSelected((prev) => balanceSelection(data, prev, TARGET_DEFAULT));
  }, [data]);

  const handleClear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleSaveTemplate = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (selected.size === 0) return;
    const name = window.prompt('Nome do template:')?.trim();
    if (!name) return;
    const next: SimuladoTemplate = {
      name,
      topics: [...selected],
      createdAt: new Date().toISOString(),
    };
    const all = [...templates, next];
    try {
      window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
      setTemplates(all);
    } catch {
      // sem storage disponível — silencia
    }
  }, [selected, templates]);

  const handleApplyTemplate = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = Number(e.target.value);
      if (Number.isNaN(idx) || idx < 0 || idx >= templates.length) return;
      const tpl = templates[idx];
      if (!tpl) return;
      setSelected(new Set(tpl.topics));
      // reseta o select pra deixar o usuário trocar de template depois
      e.target.value = '';
    },
    [templates],
  );

  const handleStart = useCallback(() => {
    if (!canStart || isPending) return;
    setErrorMsg(null);

    const topics = [...selected]
      .map(parseTopicId)
      .filter((p): p is NonNullable<ReturnType<typeof parseTopicId>> => p !== null);

    if (topics.length === 0) {
      setErrorMsg('Sem tópicos válidos selecionados.');
      return;
    }

    startTransition(async () => {
      try {
        const cap = await checkSimuladoCapAction({ previewFreeMode });
        if (!cap.allowed) {
          setPaywallOpen(true);
          return;
        }
        await startMultiTopicSimuladoAndRedirect({ topics });
      } catch (err) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
        setErrorMsg(err instanceof Error ? err.message : 'Falha ao iniciar simulado.');
      }
    });
  }, [canStart, isPending, selected, previewFreeMode]);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
      {/* Coluna principal: matriz */}
      <div className="flex flex-col gap-4 order-2 lg:order-1">
        <TopicMapMatrix
          data={data}
          mode="simulado"
          selectedTopics={selected}
          onToggleTopic={toggleTopic}
        />

        {selected.size > 0 ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-muted-foreground hover:underline"
            >
              Limpar seleção ({selected.size})
            </button>
          </div>
        ) : null}
      </div>

      {/* Painel de status */}
      <aside
        aria-label="Resumo da seleção"
        className="order-1 lg:order-2 lg:sticky lg:top-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
      >
        {/* Header colapsável (mobile) */}
        <button
          type="button"
          className="flex items-center justify-between gap-2 text-left lg:cursor-default"
          onClick={() => setStatusOpen((v) => !v)}
          aria-expanded={statusOpen}
        >
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Resumo
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {totalTopics} {totalTopics === 1 ? 'tópico' : 'tópicos'} ·{' '}
              {totalQuestions}{' '}
              {totalQuestions === 1 ? 'questão' : 'questões'} · ~{minutes}min
            </span>
          </div>
          <span className="lg:hidden text-muted-foreground">
            {statusOpen ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
        </button>

        {(statusOpen || typeof window === 'undefined') ? (
          <div className="flex flex-col gap-3">
            {/* Distribuição por disciplina */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">
                Distribuição
              </span>
              {totalQuestions === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  Selecione tópicos pra ver a distribuição.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {summary.byDiscipline
                    .filter((s) => s.selectedCount > 0)
                    .sort((a, b) => b.selectedCount - a.selectedCount)
                    .map((s) => {
                      const accent = ACCENT_VARS[s.discipline] ?? '--accent-quiz';
                      const label = DISCIPLINE_LABELS[s.discipline] ?? s.discipline;
                      const skewed = Math.abs(s.deltaPp) > 15;
                      const pct = Math.round(s.pctOfSelection);
                      return (
                        <li key={s.discipline} className="flex flex-col gap-1">
                          <div className="flex items-baseline justify-between text-[11px]">
                            <span
                              className="font-medium"
                              style={{
                                color: skewed
                                  ? 'hsl(var(--destructive))'
                                  : `hsl(var(${accent}))`,
                              }}
                            >
                              {label}
                              {skewed ? ' ⚠' : ''}
                            </span>
                            <span className="font-mono tabular-nums text-muted-foreground">
                              {s.selectedCount}q · {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: skewed
                                  ? 'hsl(var(--destructive))'
                                  : `hsl(var(${accent}))`,
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
              <p className="text-[10px] italic text-muted-foreground">
                Banco médio: {MINUTES_PER_QUESTION} min/questão · ⚠ &gt; 15pp
                fora da proporção do banco
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleBalance}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2"
              >
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                Balancear automático ({TARGET_DEFAULT}q alvo)
              </button>

              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={selected.size === 0}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Salvar como template
              </button>

              {templatesLoaded && templates.length > 0 ? (
                <select
                  aria-label="Aplicar template salvo"
                  defaultValue=""
                  onChange={handleApplyTemplate}
                  className="h-10 rounded-md border border-border bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2"
                >
                  <option value="">
                    Aplicar template ({templates.length})…
                  </option>
                  {templates.map((tpl, i) => (
                    <option key={`${tpl.name}-${i}`} value={i}>
                      {tpl.name} ({tpl.topics.length} tópicos)
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            {errorMsg ? (
              <p className="text-xs text-destructive" role="alert">
                {errorMsg}
              </p>
            ) : null}

            {/* CTA primário (desktop) */}
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || isPending}
              className="hidden lg:inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {isPending ? 'Iniciando…' : 'Iniciar simulado'}
            </button>

            {!canStart ? (
              <p className="text-[11px] italic text-muted-foreground">
                Mínimo de {MIN_QUESTIONS_TO_START} questões pra iniciar.
              </p>
            ) : null}
          </div>
        ) : null}
      </aside>

      {/* CTA fixo na base (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2 border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur lg:hidden">
        <div className="flex flex-1 flex-col">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Selecionado
          </span>
          <span className="text-xs font-semibold tabular-nums text-foreground">
            {totalQuestions}q · ~{minutes}min
          </span>
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart || isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2"
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          {isPending ? 'Iniciando…' : 'Iniciar'}
        </button>
      </div>
      {/* Spacer pra evitar que o CTA fixo cubra conteúdo no fim do scroll */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="simulado"
        fallback={!isStripeEnabledClient()}
      />
    </div>
  );
}
