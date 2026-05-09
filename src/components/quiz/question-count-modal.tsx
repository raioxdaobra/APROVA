'use client';

/**
 * Modal "Quantas questões?" — pergunta o user qual o tamanho do quiz
 * antes de iniciar. Mostra presets coerentes com o pool e um campo
 * pra digitar custom. Botão de "Tudo" usa o pool inteiro (até o teto MAX).
 *
 * Props:
 *   open       — controle externo (true = visível)
 *   poolSize   — total de questões disponíveis no recorte selecionado
 *   maxAllowed — teto absoluto (MAX_QUIZ_QUESTIONS no server, 60)
 *   onConfirm(n) — chamado com a quantidade escolhida
 *   onCancel   — fecha o modal
 *   pending    — quando true, desabilita controles
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  open: boolean;
  poolSize: number;
  maxAllowed: number;
  onConfirm: (n: number) => void;
  onCancel: () => void;
  pending?: boolean;
  /** Texto contextual abaixo do título (ex: "59 questões disponíveis em Análise sintática"). */
  contextLabel?: string;
}

// Presets crescentes — só os que cabem no pool atual aparecem (filtrados
// em visiblePresets). Inclui valores acima de 30 pra disciplinas grandes
// agora que MAX_QUIZ_QUESTIONS subiu de 60 → 200.
const PRESETS = [5, 10, 20, 30, 50, 80, 120];

export function QuestionCountModal({
  open,
  poolSize,
  maxAllowed,
  onConfirm,
  onCancel,
  pending = false,
  contextLabel,
}: Props) {
  // Presets que fazem sentido pro pool atual: descarta os maiores que poolSize.
  const visiblePresets = useMemo(
    () => PRESETS.filter((n) => n < poolSize && n <= maxAllowed),
    [poolSize, maxAllowed],
  );
  // "Todas" é min(poolSize, maxAllowed).
  const allCount = Math.min(poolSize, maxAllowed);

  // Default selecionado: primeiro preset razoável ou allCount se pool pequeno.
  const defaultCount = visiblePresets[0] ?? allCount;
  const [selected, setSelected] = useState<number>(defaultCount);
  const [custom, setCustom] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reseta quando reabre
  useEffect(() => {
    if (open) {
      setSelected(defaultCount);
      setCustom('');
    }
  }, [open, defaultCount]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onCancel();
      if (e.key === 'Enter' && !pending) {
        e.preventDefault();
        confirm();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending, selected, custom]);

  function setCustomCount(value: string) {
    setCustom(value);
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      setSelected(Math.min(parsed, allCount));
    }
  }

  function confirm() {
    const n = Math.max(1, Math.min(selected, allCount));
    onConfirm(n);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qc-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default bg-black/60"
        onClick={() => {
          if (!pending) onCancel();
        }}
        disabled={pending}
      />
      <Card className="relative w-full max-w-md p-6">
        <h2 id="qc-title" className="text-xl font-semibold text-foreground">
          Quantas questões?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {contextLabel ?? `${poolSize} disponíveis no que você selecionou.`}
        </p>

        {/* Presets */}
        <div className="mt-5 flex flex-wrap gap-2">
          {visiblePresets.map((n) => {
            const active = selected === n && custom === '';
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setSelected(n);
                  setCustom('');
                }}
                disabled={pending}
                className={[
                  'inline-flex h-11 min-w-[3.5rem] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-foreground hover:bg-muted',
                ].join(' ')}
              >
                {n}
              </button>
            );
          })}
          {/* Botão "Todas" */}
          <button
            type="button"
            onClick={() => {
              setSelected(allCount);
              setCustom('');
            }}
            disabled={pending}
            className={[
              'inline-flex h-11 min-w-[5rem] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors',
              selected === allCount && custom === ''
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-foreground hover:bg-muted',
            ].join(' ')}
          >
            Todas ({allCount})
          </button>
        </div>

        {/* Input custom */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="qc-custom" className="text-xs font-medium text-muted-foreground">
            Outra quantidade (1–{allCount})
          </label>
          <input
            ref={inputRef}
            id="qc-custom"
            type="number"
            inputMode="numeric"
            min={1}
            max={allCount}
            value={custom}
            onChange={(e) => setCustomCount(e.target.value)}
            placeholder={`Ex.: 7`}
            disabled={pending}
            className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        {/* Info de seleção atual */}
        <p className="mt-4 text-sm text-foreground">
          Você vai resolver{' '}
          <strong className="tabular-nums text-primary">{Math.min(selected, allCount)}</strong>{' '}
          {Math.min(selected, allCount) === 1 ? 'questão' : 'questões'} aleatórias.
        </p>

        {/* Ações */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button type="button" onClick={confirm} disabled={pending} className="min-w-[8rem]">
            {pending ? 'Carregando…' : 'Começar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
