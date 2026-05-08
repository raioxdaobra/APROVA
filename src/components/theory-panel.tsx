/**
 * Painel de teoria por subtópico.
 * Server Component — cache em `subtopic_theory`; on-demand via IA se vazio.
 */
import { createClient } from '@/lib/supabase/server';
import { getOrGenerateTeoria } from '@/lib/llm/on-demand';
import { MarkdownKatex } from './markdown-katex';

interface Props {
  discipline: string;
  subtopic: string;
}

interface TheoryLink {
  title: string;
  url: string;
  source?: string;
}

function parseLinks(raw: unknown): TheoryLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is { title: string; url: string; source?: string } =>
        Boolean(l) &&
        typeof l === 'object' &&
        typeof (l as { title?: unknown }).title === 'string' &&
        typeof (l as { url?: unknown }).url === 'string',
    )
    .map((l) => ({
      title: l.title,
      url: l.url,
      source: typeof l.source === 'string' ? l.source : undefined,
    }));
}

export async function TheoryPanel({ discipline, subtopic }: Props) {
  const supabase = await createClient();
  const row = await getOrGenerateTeoria(supabase, discipline, subtopic);
  const links = parseLinks(row?.links);

  if (!row?.summary_md && links.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Teoria deste subtópico em preparação.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {row?.summary_md ? <MarkdownKatex>{row.summary_md}</MarkdownKatex> : null}
      {links.length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Para se aprofundar
          </h4>
          <ul className="space-y-1.5">
            {links.map((l) => (
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
  );
}
