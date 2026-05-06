'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ChevronRight, BookOpen } from 'lucide-react';
import {
  type DisciplineTopicNode,
  type DisciplineProgress,
  getTopTopicsByDiscipline,
} from '@/lib/stats/topic-frequency';
import { startTopicsQuizAndRedirect } from '@/app/quiz/actions';

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
  /** explore = expande accordion in-place; quiz = navega pra /quiz?discipline=X&subtopic=Y */
  mode: 'explore' | 'quiz';
}

export function TopicMapMatrix({ data, progress, mode }: TopicMapMatrixProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleChipClick = (discipline: string, subtopic: string) => {
    if (mode === 'quiz') {
      const url = `/quiz?discipline=${encodeURIComponent(discipline)}&subtopic=${encodeURIComponent(subtopic)}`;
      router.push(url);
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

  return (
    <div className="flex flex-col gap-4">
      {/* CTA superior */}
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-foreground">
            Mapa de tópicos
          </h2>
          <p className="text-xs text-muted-foreground">
            Cards equivalentes · top-3 com selo MAIS CAI
          </p>
        </div>
        <button
          type="button"
          onClick={handleStudyTop3}
          disabled={submitting}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Estudar o que mais cai"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Carregando…' : 'Estudar o que MAIS CAI (top-3 por disciplina)'}
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
          const top3 = top3ByDiscipline.get(d.discipline) ?? [];
          const top3Set = new Set(top3.map((t) => t.topic));
          const prog = progress?.[d.discipline];
          const isExpanded = expanded === d.discipline && mode === 'explore';

          return (
            <article
              key={d.discipline}
              className="flex min-h-[180px] flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors"
              style={{ borderTopWidth: '3px', borderTopColor: `hsl(var(${accent}))` }}
            >
              {/* Header */}
              <header className="flex items-baseline justify-between gap-2">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: `hsl(var(${accent}))` }}
                >
                  {label}
                </h3>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {d.count}
                </span>
              </header>

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
                    return (
                      <li key={t.topic}>
                        <button
                          type="button"
                          onClick={() => handleChipClick(d.discipline, t.topic)}
                          className="group inline-flex min-h-[28px] items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
                          style={{
                            backgroundColor: isHot
                              ? `hsl(var(${accent}) / 0.22)`
                              : `hsl(var(${accent}) / 0.08)`,
                            borderColor: isHot
                              ? `hsl(var(${accent}) / 0.5)`
                              : undefined,
                            color: isHot
                              ? `hsl(var(${accent}))`
                              : 'hsl(var(--foreground))',
                          }}
                          title={`${t.topic} (${t.count} questões)`}
                          aria-label={`${t.topic}, ${t.count} questões${isHot ? ', top 3' : ''}`}
                        >
                          {isHot ? (
                            <Flame
                              className="h-3 w-3 shrink-0"
                              aria-hidden="true"
                            />
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

              {/* Explore: botão "Ver todos" abaixo */}
              {mode === 'explore' && d.topics.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => (prev === d.discipline ? null : d.discipline))}
                  className="mt-auto inline-flex items-center justify-between gap-1 rounded border border-transparent px-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2"
                  aria-expanded={isExpanded}
                  aria-controls={`topics-all-${d.discipline}`}
                >
                  <span>
                    {isExpanded ? 'Ocultar' : 'Ver todos'} os {d.topics.length} tópicos
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
                    const max = Math.max(1, ...d.topics.map((t) => t.count));
                    return d.topics.map((t) => {
                      const pct = (t.count / max) * 100;
                      const isHot = top3Set.has(t.topic);
                      return (
                        <div key={t.topic} className="flex flex-col gap-0.5">
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span className="line-clamp-1 inline-flex items-center gap-1 text-foreground">
                              {isHot ? (
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
