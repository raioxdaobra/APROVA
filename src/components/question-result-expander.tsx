'use client';
/**
 * Expander de uma linha de resultado de simulado.
 * Ao expandir, mostra mini-versão do `QuestionLayout` (imagem à esquerda em
 * desktop, explicação à direita) — sem fullscreen, mas com lightbox.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { HelpPanel } from '@/components/help-panel';
import { QuestionLayout } from '@/components/question-layout';

/**
 * Evento global pra forçar abertura de um expander específico (usado pelo
 * card "Revisar erros com IA" no topo do resultado do simulado).
 */
const EXPAND_EVENT = 'aprova:expand-question' as const;

interface Props {
  questionId: string;
  discipline: string;
  subtopic: string;
  /** URL da imagem da questão. Quando ausente, omite a coluna de imagem. */
  imageUrl?: string;
  /** Alt da imagem para a11y. */
  imageAlt?: string;
  /** Conteúdo do row (cabeçalho da linha, número, badges, etc.) */
  children: ReactNode;
}

export function QuestionResultExpander({
  questionId,
  discipline,
  subtopic,
  imageUrl,
  imageAlt,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Escuta evento global pra abrir + scroll quando o user clica
  // "Revisar erros com IA" no topo do resultado.
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ questionId: string }>).detail;
      if (detail?.questionId === questionId) {
        setOpen(true);
        requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    }
    window.addEventListener(EXPAND_EVENT, handler);
    return () => window.removeEventListener(EXPAND_EVENT, handler);
  }, [questionId]);

  const helpPanel = (
    <HelpPanel
      questionId={questionId}
      discipline={discipline}
      subtopic={subtopic}
    />
  );

  return (
    <div ref={rootRef} className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        {children}
        <span className="ml-2 text-xs text-muted-foreground">
          {open ? 'fechar ▴' : 'ver explicação ▾'}
        </span>
      </button>
      {open ? (
        <div className="border-t border-border p-3">
          {imageUrl ? (
            <QuestionLayout
              enableFullscreen={false}
              enableLightbox={false}
              image={
                <Card className="overflow-hidden p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={imageAlt ?? 'Imagem da questão'}
                    className="h-auto w-full"
                    loading="lazy"
                  />
                </Card>
              }
              body={helpPanel}
              imageUrl={imageUrl}
              imageAlt={imageAlt ?? 'Imagem da questão'}
            />
          ) : (
            helpPanel
          )}
        </div>
      ) : null}
    </div>
  );
}
