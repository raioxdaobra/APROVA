'use client';
/**
 * Renderiza Markdown com suporte a fórmulas KaTeX (`$inline$` e `$$bloco$$`).
 *
 * Usa react-markdown + remark-math + rehype-katex. O CSS do KaTeX é
 * importado aqui, então o componente carrega o estilo apenas onde é usado.
 */
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface Props {
  children: string;
  className?: string;
}

export function MarkdownKatex({ children, className }: Props) {
  return (
    <div className={className ?? 'prose prose-sm max-w-none dark:prose-invert'}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
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
