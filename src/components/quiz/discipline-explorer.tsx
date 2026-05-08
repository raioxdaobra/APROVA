'use client';

/**
 * DisciplineExplorer — substitui o antigo TopicMapMatrix (6 cards) no /quiz e
 * /simulado. Layout: cards de disciplina coloridos à esquerda (com contagem
 * e %), tópicos da disciplina ativa à direita (com barra de progresso e
 * toggle de seleção). Mobile: vertical (cards em cima, tópicos embaixo).
 *
 * Mantém:
 *  - Lógica de Set<string> (formato "discipline:subtopic" ou "discipline:*")
 *  - Mini-tabs de Linguagens (PT/ING/ESP) e Humanas (HIST/GEO/FILO/SOC)
 *
 * NÃO inclui CTAs nem indicadores — o parent (shell/multi-selector) cuida
 * disso pra reaproveitar a integração com paywall, balancing, etc.
 */

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { DisciplineTopicNode } from '@/lib/stats/topic-frequency';
import {
  classifyLanguage,
  classifySubject,
  LANGUAGE_SHORT_LABEL,
  SUBJECT_SHORT_LABEL,
} from '@/lib/stats/sub-filters';
import type { HumanasSubject, Language } from '@/lib/supabase/types';

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

const LANGUAGE_TABS: ReadonlyArray<Language> = ['portugues', 'ingles', 'espanhol'];
const SUBJECT_TABS: ReadonlyArray<HumanasSubject> = [
  'historia',
  'geografia',
  'filosofia',
  'sociologia',
];

export interface DisciplineExplorerProps {
  data: DisciplineTopicNode[];
  selected: Set<string>;
  onToggle: (topicId: string) => void;
  /** Header opcional embutido (ex.: "990 questões oficiais · clique pra montar"). */
  title?: string;
  /** Subtítulo opcional do header. */
  subtitle?: string;
}

function topicIdOf(discipline: string, subtopic: string): string {
  return `${discipline}:${subtopic}`;
}

export function DisciplineExplorer({
  data,
  selected,
  onToggle,
  title,
  subtitle,
}: DisciplineExplorerProps) {
  // Mini-tabs por disciplina (sub-filtro local).
  const [languageTab, setLanguageTab] = useState<Language | null>(null);
  const [subjectTab, setSubjectTab] = useState<HumanasSubject | null>(null);

  // Total geral (somatório dos counts) pra calcular %.
  const totalAll = useMemo(
    () => data.reduce((acc, d) => acc + d.count, 0),
    [data],
  );

  // Disciplina ativa (default = primeira disciplina com mais questões).
  const sortedDisciplines = useMemo(
    () => [...data].sort((a, b) => b.count - a.count),
    [data],
  );
  const firstDiscipline = sortedDisciplines[0]?.discipline ?? null;
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(
    firstDiscipline,
  );

  const activeNode = useMemo(
    () => sortedDisciplines.find((d) => d.discipline === activeDiscipline) ?? null,
    [sortedDisciplines, activeDiscipline],
  );

  const isLinguagens = activeNode?.discipline === 'linguagens';
  const isHumanas = activeNode?.discipline === 'humanas';

  // Filtra tópicos da disciplina ativa pelas mini-tabs.
  const filteredTopics = useMemo(() => {
    if (!activeNode) return [];
    if (isLinguagens && languageTab) {
      return activeNode.topics.filter(
        (t) => classifyLanguage(t.topic) === languageTab,
      );
    }
    if (isHumanas && subjectTab) {
      return activeNode.topics.filter(
        (t) => classifySubject(t.topic) === subjectTab,
      );
    }
    return activeNode.topics;
  }, [activeNode, isLinguagens, isHumanas, languageTab, subjectTab]);

  // Contagens por mini-tab pra mostrar nos botões.
  const languageCounts: Record<Language, number> = useMemo(() => {
    const out: Record<Language, number> = { portugues: 0, ingles: 0, espanhol: 0 };
    if (!activeNode || !isLinguagens) return out;
    for (const t of activeNode.topics) {
      const cls = classifyLanguage(t.topic);
      if (cls) out[cls] += t.count;
    }
    return out;
  }, [activeNode, isLinguagens]);

  const subjectCounts: Record<HumanasSubject, number> = useMemo(() => {
    const out: Record<HumanasSubject, number> = {
      historia: 0,
      geografia: 0,
      filosofia: 0,
      sociologia: 0,
    };
    if (!activeNode || !isHumanas) return out;
    for (const t of activeNode.topics) {
      const cls = classifySubject(t.topic);
      if (cls) out[cls] += t.count;
    }
    return out;
  }, [activeNode, isHumanas]);

  // Conta tópicos selecionados em cada disciplina (pro badge nos cards).
  const selectedCountByDiscipline = useMemo(() => {
    const out = new Map<string, number>();
    for (const d of data) {
      const allId = `${d.discipline}:*`;
      if (selected.has(allId)) {
        out.set(d.discipline, d.topics.length);
        continue;
      }
      let n = 0;
      for (const t of d.topics) {
        if (selected.has(topicIdOf(d.discipline, t.topic))) n += 1;
      }
      out.set(d.discipline, n);
    }
    return out;
  }, [data, selected]);

  const maxTopicCount = useMemo(
    () => Math.max(1, ...filteredTopics.map((t) => t.count)),
    [filteredTopics],
  );

  return (
    <section
      aria-label="Explorar tópicos por disciplina"
      className="rounded-lg border border-border bg-card"
    >
      {(title || subtitle) ? (
        <header className="flex flex-col gap-1 border-b border-border px-4 py-3">
          {title ? (
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      ) : null}

      <div className="flex flex-col gap-4 p-4 lg:flex-row">
        {/* Esquerda: cards de disciplina */}
        <ul
          role="tablist"
          aria-label="Selecione uma disciplina"
          className="flex flex-row flex-wrap gap-2 lg:flex-col lg:w-[260px] lg:flex-nowrap"
        >
          {sortedDisciplines.map((d) => {
            const accent = ACCENT_VARS[d.discipline] ?? '--accent-quiz';
            const label = DISCIPLINE_LABELS[d.discipline] ?? d.discipline;
            const pct = totalAll > 0 ? Math.round((d.count / totalAll) * 100) : 0;
            const isActive = activeDiscipline === d.discipline;
            const sel = selectedCountByDiscipline.get(d.discipline) ?? 0;
            return (
              <li key={d.discipline} className="flex-1 min-w-[140px] lg:min-w-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveDiscipline(d.discipline)}
                  className="flex w-full min-h-[64px] items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: `hsl(var(${accent}))`,
                    borderColor: isActive
                      ? `hsl(var(${accent}) / 0.6)`
                      : sel > 0
                        ? `hsl(var(${accent}) / 0.4)`
                        : 'hsl(var(--border))',
                    backgroundColor: isActive
                      ? `hsl(var(${accent}) / 0.12)`
                      : sel > 0
                        ? `hsl(var(${accent}) / 0.05)`
                        : 'transparent',
                  }}
                >
                  <div className="flex flex-col">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: `hsl(var(${accent}))` }}
                    >
                      {label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {pct}% do banco
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className="text-xl font-bold tabular-nums leading-none"
                      style={{ color: `hsl(var(${accent}))` }}
                    >
                      {d.count}
                    </span>
                    {sel > 0 ? (
                      <span
                        className="mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                        style={{
                          backgroundColor: `hsl(var(${accent}) / 0.18)`,
                          color: `hsl(var(${accent}))`,
                        }}
                      >
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                        {sel}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Direita: tópicos da disciplina ativa */}
        <div className="flex flex-1 flex-col gap-3">
          {activeNode ? (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: `hsl(var(${ACCENT_VARS[activeNode.discipline] ?? '--accent-quiz'}))`,
                  }}
                >
                  Tópicos de{' '}
                  {DISCIPLINE_LABELS[activeNode.discipline] ?? activeNode.discipline}
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {filteredTopics.length}{' '}
                  {filteredTopics.length === 1 ? 'tópico' : 'tópicos'}
                </span>
              </div>

              {/* Mini-tabs Linguagens */}
              {isLinguagens ? (
                <div
                  role="tablist"
                  aria-label="Filtrar por idioma"
                  className="flex flex-wrap gap-1"
                >
                  <MiniTabButton
                    active={languageTab === null}
                    onClick={() => setLanguageTab(null)}
                    accent="--accent-ranking"
                  >
                    Tudo
                  </MiniTabButton>
                  {LANGUAGE_TABS.map((lang) => {
                    const cnt = languageCounts[lang];
                    if (cnt === 0) return null;
                    return (
                      <MiniTabButton
                        key={lang}
                        active={languageTab === lang}
                        onClick={() =>
                          setLanguageTab((prev) => (prev === lang ? null : lang))
                        }
                        accent="--accent-ranking"
                      >
                        <span>{LANGUAGE_SHORT_LABEL[lang]}</span>
                        <span className="opacity-70">{cnt}</span>
                      </MiniTabButton>
                    );
                  })}
                </div>
              ) : null}

              {/* Mini-tabs Humanas */}
              {isHumanas ? (
                <div
                  role="tablist"
                  aria-label="Filtrar por matéria"
                  className="flex flex-wrap gap-1"
                >
                  <MiniTabButton
                    active={subjectTab === null}
                    onClick={() => setSubjectTab(null)}
                    accent="--accent-jogos"
                  >
                    Tudo
                  </MiniTabButton>
                  {SUBJECT_TABS.map((sub) => {
                    const cnt = subjectCounts[sub];
                    if (cnt === 0) return null;
                    return (
                      <MiniTabButton
                        key={sub}
                        active={subjectTab === sub}
                        onClick={() =>
                          setSubjectTab((prev) => (prev === sub ? null : sub))
                        }
                        accent="--accent-jogos"
                      >
                        <span>{SUBJECT_SHORT_LABEL[sub]}</span>
                        <span className="opacity-70">{cnt}</span>
                      </MiniTabButton>
                    );
                  })}
                </div>
              ) : null}

              {/* Lista de tópicos da disciplina ativa */}
              {filteredTopics.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">
                  Sem tópicos cadastrados.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredTopics.map((t) => {
                    const tid = topicIdOf(activeNode.discipline, t.topic);
                    const allId = `${activeNode.discipline}:*`;
                    const isSelected =
                      selected.has(tid) || selected.has(allId);
                    const accent =
                      ACCENT_VARS[activeNode.discipline] ?? '--accent-quiz';
                    const widthPct = (t.count / maxTopicCount) * 100;
                    return (
                      <li key={t.topic}>
                        <button
                          type="button"
                          onClick={() => onToggle(tid)}
                          aria-pressed={isSelected}
                          className="flex min-h-[44px] w-full flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: isSelected
                              ? `hsl(var(${accent}) / 0.6)`
                              : 'hsl(var(--border))',
                            backgroundColor: isSelected
                              ? `hsl(var(${accent}) / 0.12)`
                              : 'transparent',
                          }}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="line-clamp-1 inline-flex items-center gap-1.5 text-sm text-foreground">
                              {isSelected ? (
                                <Check
                                  className="h-3.5 w-3.5 shrink-0"
                                  style={{ color: `hsl(var(${accent}))` }}
                                  aria-hidden="true"
                                />
                              ) : null}
                              {t.topic}
                            </span>
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">
                              {t.count}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: `hsl(var(${accent}))`,
                              }}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Selecione uma disciplina pra explorar os tópicos.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

interface MiniTabButtonProps {
  active: boolean;
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}

function MiniTabButton({ active, onClick, accent, children }: MiniTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: active ? `hsl(var(${accent}) / 0.18)` : 'transparent',
        borderColor: active
          ? `hsl(var(${accent}) / 0.5)`
          : 'hsl(var(--border))',
        color: active
          ? `hsl(var(${accent}))`
          : 'hsl(var(--muted-foreground))',
      }}
    >
      {children}
    </button>
  );
}
