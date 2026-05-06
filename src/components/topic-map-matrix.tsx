'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ChevronRight, BookOpen, Check } from 'lucide-react';
import {
  type DisciplineTopicNode,
  type DisciplineProgress,
  getTopTopicsByDiscipline,
} from '@/lib/stats/topic-frequency';
import { startTopicsQuizAndRedirect } from '@/app/quiz/actions';
import {
  classifyLanguage,
  classifySubject,
  LANGUAGE_SHORT_LABEL,
  SUBJECT_SHORT_LABEL,
} from '@/lib/stats/sub-filters';
import type { HumanasSubject, Language } from '@/lib/supabase/types';

const LANGUAGE_TABS: ReadonlyArray<Language> = ['portugues', 'ingles', 'espanhol'];
const SUBJECT_TABS: ReadonlyArray<HumanasSubject> = [
  'historia',
  'geografia',
  'filosofia',
  'sociologia',
];

const DISCIPLINE_LABELS: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const ACCENT_VARS: Record<string, string> = {
  matematica: '--accent-quiz',
  fisica: '--accent-simulado',
  quimica: '--accent-trilha',
  biologia: '--accent-chat',
  humanas: '--accent-jogos',
  linguagens: '--accent-ranking',
};

// Ordem fixa pra grid 2x3 (matematica, humanas, biologia em cima; fisica, quimica, linguagens embaixo)
const DISPLAY_ORDER = [
  'matematica',
  'humanas',
  'biologia',
  'fisica',
  'quimica',
  'linguagens',
] as const;

export interface TopicMapMatrixProps {
  /** Frequência completa de tópicos por disciplina (todas as questões disponíveis, anuladas já filtradas). */
  data: DisciplineTopicNode[];
  /** Progresso pessoal por disciplina (resolved/correct). Pode estar ausente em mode='quiz'. */
  progress?: Record<string, DisciplineProgress>;
  /**
   * explore = expande accordion in-place;
   * quiz = navega pra /quiz?discipline=X&subtopic=Y;
   * simulado = toggle de seleção (precisa selectedTopics+onToggleTopic).
   */
  mode: 'explore' | 'quiz' | 'simulado';
  /** Set de IDs `discipline:subtopic` selecionados. Obrigatório em mode='simulado'. */
  selectedTopics?: Set<string>;
  /** Callback de toggle. Obrigatório em mode='simulado'. */
  onToggleTopic?: (topicId: string) => void;
}

/**
 * Constrói o ID canônico de um tópico (estável p/ Sets, deep-link, etc).
 */
export function topicIdOf(discipline: string, subtopic: string): string {
  return `${discipline}:${subtopic}`;
}

export function TopicMapMatrix({
  data,
  progress,
  mode,
  selectedTopics,
  onToggleTopic,
}: TopicMapMatrixProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Mini-tabs por card (sub-filtro local). null = "tudo".
  const [languageTab, setLanguageTab] = useState<Language | null>(null);
  const [subjectTab, setSubjectTab] = useState<HumanasSubject | null>(null);

  // Ordena disciplinas conforme DISPLAY_ORDER, aproveitando dados existentes
  const disciplinesByKey = useMemo(() => {
    const map = new Map<string, DisciplineTopicNode>();
    for (const d of data) map.set(d.discipline, d);
    return map;
  }, [data]);

  const top3ByDiscipline = useMemo(
    () => getTopTopicsByDiscipline(data, 3),
    [data],
  );

  const orderedDisciplines = DISPLAY_ORDER.map((key) => {
    return (
      disciplinesByKey.get(key) ?? {
        discipline: key,
        count: 0,
        topics: [],
      }
    );
  });

  const isSimulado = mode === 'simulado';
  const selected = selectedTopics ?? new Set<string>();

  const handleChipClick = (discipline: string, subtopic: string) => {
    if (mode === 'quiz') {
      const params = new URLSearchParams();
      params.set('discipline', discipline);
      params.set('subtopic', subtopic);
      if (discipline === 'linguagens' && languageTab) {
        params.set('language', languageTab);
      }
      if (discipline === 'humanas' && subjectTab) {
        params.set('subject', subjectTab);
      }
      router.push(`/quiz?${params.toString()}`);
      return;
    }
    if (isSimulado) {
      onToggleTopic?.(topicIdOf(discipline, subtopic));
      return;
    }
    // explore: alterna accordion
    setExpanded((prev) => (prev === discipline ? null : discipline));
  };

  const handleStudyTop3 = () => {
    if (submitting) return;
    setErrorMsg(null);

    if (mode === 'explore') {
      // Em /estatisticas redirecionamos pra /quiz com a flag — usuário confirma lá
      router.push('/quiz?source=mais-cai');
      return;
    }

    if (isSimulado) {
      // Em simulado, "MAIS CAI" pré-seleciona top-3 de cada disciplina.
      if (!onToggleTopic) return;
      const ids = new Set<string>();
      for (const [discipline, topics] of top3ByDiscipline) {
        for (const t of topics) ids.add(topicIdOf(discipline, t.topic));
      }
      // Aplica diff: adiciona quem falta.
      for (const id of ids) {
        if (!selected.has(id)) onToggleTopic(id);
      }
      return;
    }

    const pairs: Array<{ discipline: 'matematica' | 'fisica' | 'quimica' | 'biologia' | 'humanas' | 'linguagens'; subtopic: string }> = [];
    for (const [discipline, topics] of top3ByDiscipline) {
      if (!isKnownDiscipline(discipline)) continue;
      for (const t of topics) {
        pairs.push({ discipline, subtopic: t.topic });
      }
    }
    if (pairs.length === 0) {
      setErrorMsg('Sem tópicos suficientes pra montar o quiz.');
      return;
    }

    startTransition(async () => {
      try {
        await startTopicsQuizAndRedirect({ topics: pairs, mode: 'aleatorio' });
      } catch (err) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
        setErrorMsg(err instanceof Error ? err.message : 'Falha ao iniciar.');
      }
    });
  };

  // Header CTA varia por modo
  const ctaLabel = isSimulado
    ? '⚡ Simulado focado nos que mais caem'
    : 'Estudar o que MAIS CAI (top-3 por disciplina)';
  const ctaSubtitle = isSimulado
    ? 'Selecione tópicos manualmente ou clique abaixo'
    : 'Cards equivalentes · top-3 com selo MAIS CAI';

  return (
    <div className="flex flex-col gap-4">
      {/* CTA superior */}
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-foreground">
            Mapa de tópicos
          </h2>
          <p className="text-xs text-muted-foreground">{ctaSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleStudyTop3}
          disabled={submitting}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={ctaLabel}
        >
          {!isSimulado ? <BookOpen className="h-4 w-4" aria-hidden="true" /> : null}
          {submitting ? 'Carregando…' : ctaLabel}
        </button>
      </div>

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      {/* Grid de cards equivalentes */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orderedDisciplines.map((d) => {
          const accent = ACCENT_VARS[d.discipline] ?? '--accent-quiz';
          const label = DISCIPLINE_LABELS[d.discipline] ?? d.discipline;
          const isLinguagens = d.discipline === 'linguagens';
          const isHumanas = d.discipline === 'humanas';

          // Mini-tabs: contagens por idioma (Linguagens) ou matéria (Humanas).
          const languageCounts: Record<Language, number> | null = isLinguagens
            ? { portugues: 0, ingles: 0, espanhol: 0 }
            : null;
          const subjectCounts: Record<HumanasSubject, number> | null = isHumanas
            ? { historia: 0, geografia: 0, filosofia: 0, sociologia: 0 }
            : null;
          if (languageCounts) {
            for (const t of d.topics) {
              const cls = classifyLanguage(t.topic);
              if (cls) languageCounts[cls] += t.count;
            }
          }
          if (subjectCounts) {
            for (const t of d.topics) {
              const cls = classifySubject(t.topic);
              if (cls) subjectCounts[cls] += t.count;
            }
          }

          // Aplica filtro local da mini-tab quando ativo.
          const filteredTopics =
            isLinguagens && languageTab
              ? d.topics.filter((t) => classifyLanguage(t.topic) === languageTab)
              : isHumanas && subjectTab
                ? d.topics.filter((t) => classifySubject(t.topic) === subjectTab)
                : d.topics;

          const top3Raw = top3ByDiscipline.get(d.discipline) ?? [];
          const top3 =
            isLinguagens && languageTab
              ? top3Raw.filter((t) => classifyLanguage(t.topic) === languageTab)
              : isHumanas && subjectTab
                ? top3Raw.filter((t) => classifySubject(t.topic) === subjectTab)
                : top3Raw;
          const top3Set = new Set(top3.map((t) => t.topic));
          const prog = progress?.[d.discipline];
          // explore E simulado podem expandir accordion
          const isExpanded =
            expanded === d.discipline && (mode === 'explore' || isSimulado);

          // Conta tópicos selecionados nesta disciplina (só simulado)
          const selectedCountInDiscipline = isSimulado
            ? filteredTopics.filter((t) =>
                selected.has(topicIdOf(d.discipline, t.topic)),
              ).length
            : 0;
          const totalTopicsInDiscipline = filteredTopics.length;
          const isAnySelected = selectedCountInDiscipline > 0;

          return (
            <article
              key={d.discipline}
              className="flex min-h-[180px] flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors"
              style={{
                borderTopWidth: '3px',
                borderTopColor: `hsl(var(${accent}))`,
                borderColor: isSimulado && isAnySelected
                  ? `hsl(var(${accent}) / 0.6)`
                  : undefined,
              }}
            >
              {/* Header */}
              <header className="flex items-baseline justify-between gap-2">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: `hsl(var(${accent}))` }}
                >
                  {label}
                </h3>
                {isSimulado ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium tabular-nums"
                    style={{
                      backgroundColor: isAnySelected
                        ? `hsl(var(${accent}) / 0.15)`
                        : 'transparent',
                      color: isAnySelected
                        ? `hsl(var(${accent}))`
                        : 'hsl(var(--muted-foreground))',
                      borderColor: isAnySelected
                        ? `hsl(var(${accent}) / 0.4)`
                        : undefined,
                    }}
                    aria-label={`${selectedCountInDiscipline} de ${totalTopicsInDiscipline} tópicos selecionados em ${label}`}
                  >
                    {isAnySelected ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : null}
                    {selectedCountInDiscipline}/{totalTopicsInDiscipline}
                  </span>
                ) : (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {d.count}
                  </span>
                )}
              </header>

              {/* Mini-tabs por idioma (Linguagens) ou matéria (Humanas) */}
              {isLinguagens && languageCounts ? (
                <div
                  role="tablist"
                  aria-label="Filtrar por idioma"
                  className="flex flex-wrap gap-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={languageTab === null}
                    onClick={() => setLanguageTab(null)}
                    className="inline-flex min-h-[28px] items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      backgroundColor:
                        languageTab === null
                          ? `hsl(var(${accent}) / 0.18)`
                          : 'transparent',
                      borderColor:
                        languageTab === null
                          ? `hsl(var(${accent}) / 0.5)`
                          : 'hsl(var(--border))',
                      color:
                        languageTab === null
                          ? `hsl(var(${accent}))`
                          : 'hsl(var(--muted-foreground))',
                    }}
                  >
                    Tudo
                  </button>
                  {LANGUAGE_TABS.map((lang) => {
                    const cnt = languageCounts[lang];
                    if (cnt === 0) return null;
                    const active = languageTab === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() =>
                          setLanguageTab((prev) => (prev === lang ? null : lang))
                        }
                        className="inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2"
                        style={{
                          backgroundColor: active
                            ? `hsl(var(${accent}) / 0.18)`
                            : 'transparent',
                          borderColor: active
                            ? `hsl(var(${accent}) / 0.5)`
                            : 'hsl(var(--border))',
                          color: active
                            ? `hsl(var(${accent}))`
                            : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        <span>{LANGUAGE_SHORT_LABEL[lang]}</span>
                        <span className="opacity-70">{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {isHumanas && subjectCounts ? (
                <div
                  role="tablist"
                  aria-label="Filtrar por matéria"
                  className="flex flex-wrap gap-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={subjectTab === null}
                    onClick={() => setSubjectTab(null)}
                    className="inline-flex min-h-[28px] items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      backgroundColor:
                        subjectTab === null
                          ? `hsl(var(${accent}) / 0.18)`
                          : 'transparent',
                      borderColor:
                        subjectTab === null
                          ? `hsl(var(${accent}) / 0.5)`
                          : 'hsl(var(--border))',
                      color:
                        subjectTab === null
                          ? `hsl(var(${accent}))`
                          : 'hsl(var(--muted-foreground))',
                    }}
                  >
                    Tudo
                  </button>
                  {SUBJECT_TABS.map((sub) => {
                    const cnt = subjectCounts[sub];
                    if (cnt === 0) return null;
                    const active = subjectTab === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() =>
                          setSubjectTab((prev) => (prev === sub ? null : sub))
                        }
                        className="inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2"
                        style={{
                          backgroundColor: active
                            ? `hsl(var(${accent}) / 0.18)`
                            : 'transparent',
                          borderColor: active
                            ? `hsl(var(${accent}) / 0.5)`
                            : 'hsl(var(--border))',
                          color: active
                            ? `hsl(var(${accent}))`
                            : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        <span>{SUBJECT_SHORT_LABEL[sub]}</span>
                        <span className="opacity-70">{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Mini barra de progresso */}
              <div className="flex flex-col gap-1">
                {prog && prog.pct !== null ? (
                  <>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground">
                        Você acertou{' '}
                        <span
                          className="font-semibold"
                          style={{ color: `hsl(var(${accent}))` }}
                        >
                          {prog.pct}%
                        </span>{' '}
                        das que resolveu
                      </span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {prog.resolved}/{prog.total}
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={prog.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Acerto em ${label}: ${prog.pct}%`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${prog.pct}%`,
                          backgroundColor: `hsl(var(${accent}))`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-xs italic text-muted-foreground">
                    {d.count === 0 ? 'Sem questões disponíveis' : 'Sem progresso ainda'}
                  </span>
                )}
              </div>

              {/* Chips top-3 */}
              {top3.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {top3.map((t) => {
                    const isHot = top3Set.has(t.topic);
                    const tid = topicIdOf(d.discipline, t.topic);
                    const isSelected = isSimulado && selected.has(tid);
                    return (
                      <li key={t.topic}>
                        <button
                          type="button"
                          onClick={() => handleChipClick(d.discipline, t.topic)}
                          aria-pressed={isSimulado ? isSelected : undefined}
                          className="group inline-flex min-h-[28px] items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
                          style={{
                            backgroundColor: isSelected
                              ? `hsl(var(${accent}) / 0.32)`
                              : isHot
                                ? `hsl(var(${accent}) / 0.22)`
                                : `hsl(var(${accent}) / 0.08)`,
                            borderColor: isSelected
                              ? `hsl(var(${accent}))`
                              : isHot
                                ? `hsl(var(${accent}) / 0.5)`
                                : 'hsl(var(--border))',
                            color: isHot || isSelected
                              ? `hsl(var(${accent}))`
                              : 'hsl(var(--foreground))',
                          }}
                          title={`${t.topic} (${t.count} questões)`}
                          aria-label={`${t.topic}, ${t.count} questões${isHot ? ', top 3' : ''}${isSelected ? ', selecionado' : ''}`}
                        >
                          {isSelected ? (
                            <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                          ) : isHot ? (
                            <Flame className="h-3 w-3 shrink-0" aria-hidden="true" />
                          ) : null}
                          <span className="line-clamp-1 max-w-[140px]">
                            {t.topic}
                          </span>
                          <span className="font-mono tabular-nums opacity-70">
                            {t.count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  Sem tópicos cadastrados.
                </p>
              )}

              {/* Explore/Simulado: botão "Ver todos" abaixo */}
              {(mode === 'explore' || isSimulado) && filteredTopics.length > 3 ? (
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) =>
                      prev === d.discipline ? null : d.discipline,
                    )
                  }
                  className="mt-auto inline-flex items-center justify-between gap-1 rounded border border-transparent px-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2"
                  aria-expanded={isExpanded}
                  aria-controls={`topics-all-${d.discipline}`}
                >
                  <span>
                    {isExpanded ? 'Ocultar' : 'Ver todos'} os {filteredTopics.length} tópicos
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 transition-transform"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  />
                </button>
              ) : null}

              {/* Accordion expandido (só no card que tá aberto) */}
              {isExpanded ? (
                <div
                  id={`topics-all-${d.discipline}`}
                  className="-mx-4 -mb-4 mt-1 flex flex-col gap-1.5 border-t border-border bg-muted/30 px-4 py-3"
                >
                  {(() => {
                    const max = Math.max(1, ...filteredTopics.map((t) => t.count));
                    return filteredTopics.map((t) => {
                      const pct = (t.count / max) * 100;
                      const isHot = top3Set.has(t.topic);
                      const tid = topicIdOf(d.discipline, t.topic);
                      const isSelected = isSimulado && selected.has(tid);

                      const row = (
                        <>
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span className="line-clamp-1 inline-flex items-center gap-1 text-foreground">
                              {isSelected ? (
                                <Check
                                  className="h-3 w-3 shrink-0"
                                  style={{ color: `hsl(var(${accent}))` }}
                                  aria-hidden="true"
                                />
                              ) : isHot ? (
                                <Flame
                                  className="h-3 w-3 shrink-0"
                                  style={{ color: `hsl(var(${accent}))` }}
                                  aria-hidden="true"
                                />
                              ) : null}
                              {t.topic}
                            </span>
                            <span className="font-mono tabular-nums text-muted-foreground">
                              {t.count}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: `hsl(var(${accent}))`,
                              }}
                            />
                          </div>
                        </>
                      );

                      // Em simulado, cada tópico é toggleável (botão com tap-target ≥44px)
                      if (isSimulado) {
                        return (
                          <button
                            key={t.topic}
                            type="button"
                            onClick={() => onToggleTopic?.(tid)}
                            aria-pressed={isSelected}
                            className="flex min-h-[44px] flex-col gap-1 rounded border border-transparent px-1 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2"
                            style={{
                              backgroundColor: isSelected
                                ? `hsl(var(${accent}) / 0.12)`
                                : undefined,
                              borderColor: isSelected
                                ? `hsl(var(${accent}) / 0.4)`
                                : undefined,
                            }}
                          >
                            {row}
                          </button>
                        );
                      }

                      return (
                        <div key={t.topic} className="flex flex-col gap-0.5">
                          {row}
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function isKnownDiscipline(
  d: string,
): d is 'matematica' | 'fisica' | 'quimica' | 'biologia' | 'humanas' | 'linguagens' {
  return (
    d === 'matematica' ||
    d === 'fisica' ||
    d === 'quimica' ||
    d === 'biologia' ||
    d === 'humanas' ||
    d === 'linguagens'
  );
}
