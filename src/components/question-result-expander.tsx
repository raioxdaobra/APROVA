'use client';
/**
 * Expander de uma linha de resultado de simulado.
 * Ao clicar em "Ver explicação", abre o HelpPanel da questão.
 */
import { useState, type ReactNode } from 'react';
import { HelpPanel } from '@/components/help-panel';

interface Props {
  questionId: string;
  discipline: string;
  subtopic: string;
  /** Conteúdo do row (cabeçalho da linha, número, badges, etc.) */
  children: ReactNode;
}

export function QuestionResultExpander({
  questionId,
  discipline,
  subtopic,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border bg-card">
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
          <HelpPanel
            questionId={questionId}
            discipline={discipline}
            subtopic={subtopic}
          />
        </div>
      ) : null}
    </div>
  );
}
