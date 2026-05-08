'use client';
/**
 * Wrapper com 2 abas: Resolução e Teoria.
 * Usado em quiz pós-resposta, simulado-resultado, modo revisão.
 *
 * Faz fetch lazy das APIs:
 *  - GET /api/question/[id]/solution
 *  - GET /api/question/[id]/theory?discipline=&subtopic=
 */
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownKatex } from '@/components/markdown-katex';

interface Props {
  questionId: string;
  discipline: string;
  subtopic: string;
  defaultTab?: 'resolucao' | 'teoria';
}

interface SolutionData {
  content_md: string;
  conclusion: string;
  generated_by: string;
  reviewed: boolean;
}

interface TheoryData {
  summary_md: string;
  links: Array<{ title: string; url: string; source?: string }>;
}

export function HelpPanel({
  questionId,
  discipline,
  subtopic,
  defaultTab = 'resolucao',
}: Props) {
  const [tab, setTab] = useState<string>(defaultTab);
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [solutionLoaded, setSolutionLoaded] = useState(false);
  const [theory, setTheory] = useState<TheoryData | null>(null);
  const [theoryLoaded, setTheoryLoaded] = useState(false);

  useEffect(() => {
    if (tab === 'resolucao' && !solutionLoaded) {
      let cancelled = false;
      fetch(`/api/question/${encodeURIComponent(questionId)}/solution`, {
        cache: 'no-store',
      })
        .then(async (r) => (r.ok ? ((await r.json()) as { solution: SolutionData | null }) : null))
        .then((data) => {
          if (cancelled) return;
          setSolution(data?.solution ?? null);
        })
        .catch(() => {})
        .finally(() => !cancelled && setSolutionLoaded(true));
      return () => {
        cancelled = true;
      };
    }
  }, [tab, solutionLoaded, questionId]);

  useEffect(() => {
    if (tab === 'teoria' && !theoryLoaded) {
      let cancelled = false;
      const params = new URLSearchParams({ discipline, subtopic });
      fetch(
        `/api/question/${encodeURIComponent(questionId)}/theory?${params.toString()}`,
        { cache: 'no-store' },
      )
        .then(async (r) => (r.ok ? ((await r.json()) as { theory: TheoryData | null }) : null))
        .then((data) => {
          if (cancelled) return;
          // Garante shape de links
          const t = data?.theory;
          if (t) {
            setTheory({
              summary_md: t.summary_md ?? '',
              links: Array.isArray(t.links) ? t.links : [],
            });
          } else {
            setTheory(null);
          }
        })
        .catch(() => {})
        .finally(() => !cancelled && setTheoryLoaded(true));
      return () => {
        cancelled = true;
      };
    }
  }, [tab, theoryLoaded, questionId, discipline, subtopic]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="resolucao" className="flex-1">
            Resolução
          </TabsTrigger>
          <TabsTrigger value="teoria" className="flex-1">
            Teoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resolucao">
          {!solutionLoaded ? (
            <p className="text-sm text-muted-foreground">Carregando resolução…</p>
          ) : !solution?.content_md ? (
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Resolução em preparação. Volte em breve!
            </div>
          ) : (
            <div className="space-y-3">
              <MarkdownKatex>{solution.content_md}</MarkdownKatex>
              {solution.reviewed === false ? (
                <p className="text-xs text-muted-foreground">
                  Resolução gerada por IA — pode conter imprecisões.
                </p>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teoria">
          {!theoryLoaded ? (
            <p className="text-sm text-muted-foreground">Carregando teoria…</p>
          ) : !theory ? (
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Teoria deste subtópico em preparação.
            </div>
          ) : (
            <div className="space-y-4">
              {theory.summary_md ? (
                <MarkdownKatex>{theory.summary_md}</MarkdownKatex>
              ) : null}
              {theory.links.length > 0 ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    Para se aprofundar
                  </h4>
                  <ul className="space-y-1.5">
                    {theory.links.map((l) => (
                      <li key={l.url} className="text-sm">
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {l.title}
                        </a>
                        {l.source ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({l.source})
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
