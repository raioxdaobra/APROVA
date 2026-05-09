'use client';

/**
 * Markdown da resolução com hierarquia visual rica — inspirado no
 * respostaCerta. Headers H2 ganham emoji decorativo + linha colorida
 * embaixo (igual "🤔 Abordagem" em amarelo / "➡️ Resolução" em azul).
 *
 * Detecta o conteúdo do header e atribui emoji + cor por keyword.
 * Caso não case com nenhum padrão conhecido, cai pro estilo neutro
 * (primary). Resoluções existentes que não tem headers ainda renderizam
 * normalmente — não quebra nada.
 *
 * Separado de <MarkdownKatex> pra não interferir em outros usos
 * (questão, teoria, chat).
 */
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface HeadingStyle {
  emoji: string;
  /** Cor da linha decorativa. Aceita hsl() ou hex. */
  color: string;
}

function getHeadingStyle(text: string): HeadingStyle {
  const t = text.toLowerCase();
  // Ordem importa: matches mais específicos primeiro.
  if (
    t.includes('análise das alternativas') ||
    t.includes('analise das alternativas') ||
    t.includes('alternativas')
  ) {
    return { emoji: '📋', color: '#8b5cf6' }; // roxo — analise por alternativa
  }
  if (t.includes('abordagem') || t.includes('estratégia') || t.includes('estrategia')) {
    return { emoji: '🤔', color: '#f59e0b' }; // amarelo
  }
  if (
    t.includes('resoluç') ||
    t.includes('resoluc') ||
    t.includes('passo a passo') ||
    t.includes('cálculo') ||
    t.includes('calculo')
  ) {
    return { emoji: '➡️', color: '#3b82f6' }; // azul
  }
  if (t.includes('conclus') || t.includes('resposta final') || t.includes('gabarito')) {
    return { emoji: '✅', color: '#10b981' }; // verde
  }
  if (t.includes('passo') || t.includes('etapa')) {
    return { emoji: '📌', color: '#0ea5e9' }; // azul claro (passos)
  }
  if (t.includes('atenç') || t.includes('cuidado') || t.includes('observ')) {
    return { emoji: '⚠️', color: '#ef4444' }; // vermelho
  }
  // Default: cor primary do tema, sem emoji decorativo.
  return { emoji: '', color: 'hsl(var(--primary))' };
}

interface Props {
  children: string;
}

/**
 * Extrai texto plano de children do react-markdown (que vem como string,
 * array de strings/elementos, ou ReactNode misto).
 */
function nodeToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(nodeToText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as { props?: { children?: React.ReactNode } }).props;
    return nodeToText(props?.children);
  }
  return '';
}

export function SolutionMarkdown({ children }: Props) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-li:my-0.5">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h2: ({ children: ch }) => {
            const text = nodeToText(ch).trim();
            const { emoji, color } = getHeadingStyle(text);
            return (
              <div className="mt-6 mb-2 first:mt-0">
                <h2 className="m-0 flex items-center gap-2 text-lg font-bold text-foreground">
                  {emoji ? (
                    <span aria-hidden="true" className="text-xl leading-none">
                      {emoji}
                    </span>
                  ) : null}
                  <span>{ch}</span>
                </h2>
                <div
                  aria-hidden="true"
                  className="mt-1.5 h-1 w-16 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          },
          h3: ({ children: ch }) => (
            <h3 className="mt-4 mb-1.5 text-base font-semibold text-foreground">
              {ch}
            </h3>
          ),
          a: ({ href, children: ch, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {ch}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
