'use client';

/**
 * Texto da questão com marca-texto interativo.
 *
 * Modelo word-level pra simplicidade + UX consistente em mobile:
 * - Texto e quebrado em palavras (tokens). Espaços/quebras de linha
 *   ficam como tokens neutros entre palavras.
 * - Toggle "Marca-texto" liga/desliga o modo de marcacao.
 * - Com modo ativo: tap numa palavra adiciona/remove marca amarela.
 * - Marcacoes persistem em localStorage por question_id.
 *
 * NOTA: depende da questao ter `description` populada. Hoje a maioria
 * das ~1015 questoes ainda usa imagem escaneada — esse componente so
 * renderiza onde tem texto. Apos OCR (Passo 2), todas teriam.
 *
 * Persistencia: chave `aprova:highlights:{questionId}` = JSON array de
 * indices de palavras marcadas.
 */
import { useCallback, useEffect, useState } from 'react';
import { Highlighter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  /** Texto cru do enunciado (vem do questions.description). */
  text: string;
  /** ID da questao — pra escopar a persistencia local. */
  questionId: string;
}

const STORAGE_PREFIX = 'aprova:highlights:';

export function HighlightableText({ text, questionId }: Props) {
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Carrega marcacoes persistidas (apos hidratacao pra evitar mismatch SSR).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${questionId}`);
      if (saved) {
        const arr = JSON.parse(saved) as unknown;
        if (Array.isArray(arr)) {
          setHighlights(new Set(arr.filter((n): n is number => typeof n === 'number')));
        }
      }
    } catch {
      // Ignora — localStorage indisponivel ou JSON invalido
    }
    setHydrated(true);
  }, [questionId]);

  // Salva quando muda
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (highlights.size === 0) {
        localStorage.removeItem(`${STORAGE_PREFIX}${questionId}`);
      } else {
        localStorage.setItem(
          `${STORAGE_PREFIX}${questionId}`,
          JSON.stringify(Array.from(highlights)),
        );
      }
    } catch {
      // Ignora
    }
  }, [highlights, hydrated, questionId]);

  const toggleWord = useCallback(
    (idx: number) => {
      if (!active) return;
      setHighlights((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    },
    [active],
  );

  // Quebra em tokens preservando espacos pra que a renderizacao mantenha
  // o layout do texto. Regex `(\s+)` captura espacos/quebras como groups.
  const tokens = text.split(/(\s+)/);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Enunciado
        </h3>
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          aria-pressed={active}
          aria-label={active ? 'Desativar marca-texto' : 'Ativar marca-texto'}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors',
            active
              ? 'border-warning bg-warning-bg text-warning'
              : 'border-border bg-card text-muted-foreground hover:bg-muted',
          )}
        >
          <Highlighter className="h-4 w-4" aria-hidden="true" />
          {active ? 'Marca-texto ON' : 'Marca-texto'}
        </button>
      </div>

      <p
        className={cn(
          'whitespace-pre-wrap text-base leading-relaxed text-foreground',
          active && 'select-none',
        )}
      >
        {tokens.map((token, idx) => {
          // Tokens de espaco/quebra renderizam como texto puro (nao
          // sao destacaveis, mas preservam layout).
          if (/^\s+$/.test(token)) {
            return <span key={idx}>{token}</span>;
          }

          const isHighlighted = highlights.has(idx);

          // Quando active=true, render como <button> pra acessibilidade
          // (suporta foco/teclado/Enter/Space). Quando inativo, span
          // simples — palavras sao apenas texto. <button> inline herda
          // estilo de paragrafo com font: inherit.
          if (active) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleWord(idx)}
                aria-pressed={isHighlighted}
                className={cn(
                  'rounded-sm transition-colors',
                  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'inline font-[inherit] text-[inherit]',
                  isHighlighted
                    ? 'bg-warning/30 px-0.5 dark:bg-warning/40'
                    : 'hover:bg-warning/15',
                )}
              >
                {token}
              </button>
            );
          }

          // Modo passivo: so destaca o que ja esta marcado, sem interacao.
          return (
            <span
              key={idx}
              className={cn(
                isHighlighted && 'rounded-sm bg-warning/30 px-0.5 dark:bg-warning/40',
              )}
            >
              {token}
            </span>
          );
        })}
      </p>

      {highlights.size > 0 ? (
        <button
          type="button"
          onClick={() => setHighlights(new Set())}
          className="mt-3 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Limpar marcações ({highlights.size})
        </button>
      ) : null}

      {!active && highlights.size === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Toque em &ldquo;Marca-texto&rdquo; pra destacar trechos importantes.
        </p>
      ) : null}
    </div>
  );
}
