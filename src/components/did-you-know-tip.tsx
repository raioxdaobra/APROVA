'use client';

/**
 * Card "💡 Você sabia?" dismissivel — inspirado no respostaCerta.
 *
 * Mostra dica contextual de UX (atalhos de teclado, gestos, etc.). Se o user
 * fechar com X, persiste em localStorage pra nunca aparecer de novo.
 *
 * Uso:
 *   <DidYouKnowTip
 *     id="quiz-keyboard-shortcut"
 *     text="Pressione A, B, C, D ou E pra responder rápido pelo teclado."
 *   />
 */
import { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface Props {
  /** Chave única no localStorage. Diferentes IDs = diferentes dicas. */
  id: string;
  /** Texto da dica. Mantenha curto (1-2 linhas). */
  text: string;
}

const STORAGE_PREFIX = 'aprova:tip-dismissed:';

export function DidYouKnowTip({ id, text }: Props) {
  const [open, setOpen] = useState(false);

  // Inicia escondido pra evitar flash; só abre se nunca foi dispensado.
  // Sem efeito SSR (typeof window), portanto rendereiza vazio no server.
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (dismissed !== '1') setOpen(true);
    } catch {
      // Storage indisponivel (cookie bloqueado, modo privado): mostra mesmo.
      setOpen(true);
    }
  }, [id]);

  function handleDismiss() {
    setOpen(false);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, '1');
    } catch {
      // Sem storage, dica volta na próxima sessão. Tudo bem.
    }
  }

  if (!open) return null;

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <Lightbulb className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Você sabia?
        </p>
        <p className="mt-0.5 text-sm text-foreground">{text}</p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dispensar dica"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
