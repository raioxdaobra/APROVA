'use client';

import { useEffect } from 'react';

/**
 * Hook genérico de atalhos de teclado.
 *
 * Aceita um mapa de teclas → handler. Ignora se o foco está em INPUT/TEXTAREA
 * ou em um elemento contentEditable. As teclas A-E são case-insensitive; teclas
 * especiais usam os valores de `KeyboardEvent.key` (`ArrowLeft`, `ArrowRight`,
 * ` ` para espaço, `Enter`).
 *
 * Os handlers recebem o evento — chame `preventDefault()` se for necessário
 * (ex.: evitar scroll com Espaço).
 */
export type KeyHandler = (event: KeyboardEvent) => void;

export type ShortcutMap = Record<string, KeyHandler>;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function normalizeKey(key: string): string {
  if (key.length === 1) return key.toLowerCase();
  return key;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: { enabled?: boolean } = {},
): void {
  const { enabled = true } = options;
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = normalizeKey(event.key);
      const fn = shortcuts[key];
      if (typeof fn === 'function') {
        fn(event);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
