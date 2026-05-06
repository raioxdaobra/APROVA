'use client';

import { useState } from 'react';

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

export interface TopicNode {
  topic: string;
  count: number;
}
export interface DisciplineTreeNode {
  discipline: string;
  count: number;
  topics: TopicNode[];
}

interface Props {
  data: DisciplineTreeNode[];
  topicsPerDiscipline?: number;
}

/**
 * Treemap-like visualization. Em desktop usa flex-grow proporcional ao volume
 * de questões; em mobile vira accordion-list pra continuar legível em 375px.
 */
export function TopicTreemap({ data, topicsPerDiscipline = 8 }: Props) {
  const [expanded, setExpanded] = useState<string | null>(data[0]?.discipline ?? null);

  if (data.length === 0) return null;
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop: tiles proporcionais ao count */}
      <div className="hidden gap-2 md:flex md:flex-wrap">
        {data.map((d) => {
          const accent = ACCENT_VARS[d.discipline] ?? '--accent-quiz';
          const label = DISCIPLINE_LABELS[d.discipline] ?? d.discipline;
          const isOpen = expanded === d.discipline;
          return (
            <button
              key={d.discipline}
              type="button"
              onClick={() => setExpanded(isOpen ? null : d.discipline)}
              className="group relative h-24 min-w-[140px] overflow-hidden rounded-lg border border-border text-left transition-all hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2"
              style={{
                flexGrow: d.count,
                flexBasis: '0',
                backgroundColor: `hsl(var(${accent}) / 0.14)`,
                borderColor: isOpen ? `hsl(var(${accent}))` : undefined,
              }}
              aria-expanded={isOpen}
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ backgroundColor: `hsl(var(${accent}))` }}
              />
              <div className="flex h-full flex-col justify-between p-3">
                <span
                  className="text-sm font-semibold"
                  style={{ color: `hsl(var(${accent}))` }}
                >
                  {label}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {d.count}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {total > 0 ? Math.round((d.count / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile: accordion */}
      <div className="flex flex-col gap-2 md:hidden">
        {data.map((d) => {
          const accent = ACCENT_VARS[d.discipline] ?? '--accent-quiz';
          const label = DISCIPLINE_LABELS[d.discipline] ?? d.discipline;
          const isOpen = expanded === d.discipline;
          return (
            <button
              key={d.discipline}
              type="button"
              onClick={() => setExpanded(isOpen ? null : d.discipline)}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left"
              style={{ borderLeftWidth: '3px', borderLeftColor: `hsl(var(${accent}))` }}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: `hsl(var(${accent}))` }}
                >
                  {label}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {d.count}
                </span>
              </div>
              <span
                className="text-xs"
                style={{ color: `hsl(var(${accent}))` }}
                aria-hidden="true"
              >
                {isOpen ? '▾' : '▸'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Painel de tópicos da disciplina expandida */}
      {expanded
        ? (() => {
            const node = data.find((d) => d.discipline === expanded);
            if (!node) return null;
            const accent = ACCENT_VARS[node.discipline] ?? '--accent-quiz';
            const label = DISCIPLINE_LABELS[node.discipline] ?? node.discipline;
            const topTopics = node.topics.slice(0, topicsPerDiscipline);
            const max = Math.max(1, ...topTopics.map((t) => t.count));
            return (
              <div
                className="rounded-lg border border-border bg-background p-4"
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: `hsl(var(${accent}))`,
                }}
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: `hsl(var(${accent}))` }}
                  >
                    Tópicos mais cobrados em {label}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    top {topTopics.length} de {node.topics.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {topTopics.map((t) => {
                    const pct = (t.count / max) * 100;
                    return (
                      <li key={t.topic} className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="line-clamp-1 text-sm font-medium text-foreground">
                            {t.topic}
                          </span>
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {t.count}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: `hsl(var(${accent}))`,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()
        : null}
    </div>
  );
}
