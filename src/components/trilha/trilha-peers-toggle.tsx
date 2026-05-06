'use client';

/**
 * <TrilhaPeersToggle> — switch persistido em localStorage que liga/desliga
 * o overlay de peers.
 *
 * PR 27.
 */
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrilhaPeersToggleProps {
  onChange: (enabled: boolean) => void;
}

const STORAGE_KEY = 'aprova:trilha:peers';

export function TrilhaPeersToggle({ onChange }: TrilhaPeersToggleProps) {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata do localStorage no mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const initial = raw === null ? true : raw === 'true';
      setEnabled(initial);
      onChange(initial);
    } catch {
      // ignora SSR/storage indisponível
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignora
      }
      onChange(next);
      return next;
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-full border-2 px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        enabled
          ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200'
          : 'border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      <Users className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Colegas</span>
      <span
        className={cn(
          'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-mono',
          enabled ? 'bg-blue-200 text-blue-900' : 'bg-muted text-muted-foreground',
        )}
      >
        {hydrated ? (enabled ? 'on' : 'off') : '…'}
      </span>
    </button>
  );
}
