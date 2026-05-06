'use client';

/**
 * <TrilhaPathPicker> — modal pra customizar a ordem dos ranks 2-5.
 *
 * PR 27. Drawer fullscreen no mobile (<sm), modal centralizado em telas
 * maiores. 4 dropdowns com validação de unicidade.
 */
import { useEffect, useRef, useState, useTransition } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_TRILHA_ORDER,
  isValidTrilhaOrder,
  type TrilhaOrderPicks,
} from '@/lib/trilha/order';
import { saveTrilhaOrder } from '@/app/trilha/actions';
import { TRILHA_RANK_THEMES } from '@/lib/trilha/stations';

export interface TrilhaPathPickerProps {
  open: boolean;
  initial: TrilhaOrderPicks;
  onClose: () => void;
}

const POSITION_LABELS = [
  'Após Rank 1, vem o rank:',
  'Depois:',
  'Depois:',
  'Por último (antes do Rank 6):',
];

function rankLabel(rank: number): string {
  const theme = TRILHA_RANK_THEMES.find((t) => t.rank === rank);
  return theme ? `Rank ${rank} — ${theme.label}` : `Rank ${rank}`;
}

export function TrilhaPathPicker({ open, initial, onClose }: TrilhaPathPickerProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [picks, setPicks] = useState<TrilhaOrderPicks>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPicks(initial);
  }, [initial]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  const isValid = isValidTrilhaOrder(picks);
  const isDirty = picks.some((p, i) => p !== initial[i]);

  function setPick(idx: number, value: number) {
    setPicks((prev) => {
      const next = [...prev] as TrilhaOrderPicks;
      next[idx] = value;
      return next;
    });
  }

  function handleReset() {
    setPicks(DEFAULT_TRILHA_ORDER);
    setError(null);
  }

  function handleSave() {
    if (!isValid) {
      setError('Cada rank deve aparecer exatamente uma vez.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await saveTrilhaOrder(picks);
        onClose();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao salvar.';
        setError(msg);
      }
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="trilha-path-picker-title"
      className="m-0 h-full max-h-screen w-full max-w-none rounded-none border-0 bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/50 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-border"
    >
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2 id="trilha-path-picker-title" className="text-lg font-bold">
              Customizar caminho
            </h2>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Fechar"
            className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ✕
          </button>
        </header>

        <p className="text-sm text-muted-foreground">
          Customize a ordem das fases intermediárias.{' '}
          <strong>Ranks 1, 6, 7 e 8 são fixos.</strong>
        </p>

        <div className="flex flex-col gap-3">
          {POSITION_LABELS.map((label, idx) => (
            <label key={idx} className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">{label}</span>
              <select
                value={picks[idx]}
                onChange={(e) => setPick(idx, Number(e.target.value))}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {[2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {rankLabel(r)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {!isValid && (
          <div className="rounded-lg border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Cada rank precisa aparecer apenas uma vez.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            Restaurar padrão
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => ref.current?.close()}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!isValid || !isDirty || isPending}
            >
              {isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
