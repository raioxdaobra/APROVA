'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const STORAGE_KEY = 'aprova-kbd-hints-seen';

interface ShortcutEntry {
  keys: string[];
  label: string;
}

const DEFAULT_SHORTCUTS: ShortcutEntry[] = [
  { keys: ['A', 'B', 'C', 'D', 'E'], label: 'Selecionar alternativa' },
  { keys: ['→', 'Espaço'], label: 'Próxima questão' },
  { keys: ['←'], label: 'Questão anterior' },
  { keys: ['Enter'], label: 'Confirmar / Finalizar' },
];

export function KeyboardHintsOverlay({
  shortcuts = DEFAULT_SHORTCUTS,
  storageKey = STORAGE_KEY,
}: {
  shortcuts?: ShortcutEntry[];
  storageKey?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = window.localStorage.getItem(storageKey);
      if (!seen) {
        // Pequeno delay pra não disputar com a primeira pintura
        const t = window.setTimeout(() => setOpen(true), 250);
        return () => window.clearTimeout(t);
      }
    } catch {
      // Acesso ao localStorage pode falhar (modo privado, etc.) — silencioso.
    }
  }, [storageKey]);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch {
      // ignora
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kbd-hints-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={dismiss}
        className="absolute inset-0 bg-black/60"
      />
      <Card className="relative w-full max-w-md p-6">
        <h2
          id="kbd-hints-title"
          className="text-xl font-semibold text-foreground"
        >
          Atalhos de teclado
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Você pode responder e navegar usando o teclado:
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {shortcuts.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-foreground">{s.label}</span>
              <span className="flex flex-wrap items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex min-w-[2rem] items-center justify-center rounded border border-border bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <Button type="button" size="md" onClick={dismiss}>
            Entendi
          </Button>
        </div>
      </Card>
    </div>
  );
}
