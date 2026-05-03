'use client';

/**
 * Anima um número de 0 → `value` em ~600ms via requestAnimationFrame.
 * Evita reanimar quando o valor não muda. Respeita prefers-reduced-motion
 * (renderiza o valor final imediatamente).
 */

import { useEffect, useRef, useState } from 'react';

export interface RollingNumberProps {
  value: number;
  durationMs?: number;
  className?: string;
  formatter?: (n: number) => string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function RollingNumber({
  value,
  durationMs = 600,
  className,
  formatter,
}: RollingNumberProps) {
  const [display, setDisplay] = useState<number>(() => value);
  const previous = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const start = previous.current;
    const end = value;
    if (start === end) return;

    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduced = false;
    }
    if (reduced) {
      previous.current = end;
      setDisplay(end);
      return;
    }

    const startTs = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTs) / durationMs);
      const v = Math.round(start + (end - start) * easeOutCubic(t));
      setDisplay(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        previous.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{formatter ? formatter(display) : display}</span>;
}
