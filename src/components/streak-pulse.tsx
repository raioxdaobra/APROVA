'use client';

/**
 * Wrapper que aplica uma animação de pulse (Tailwind) por 600ms quando a
 * prop `pulse` transiciona de true para false. Útil para reagir a uma
 * conquista de streak sem reanimar com cada re-render.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StreakPulseProps {
  pulse: boolean;
  children: ReactNode;
  className?: string;
}

export function StreakPulse({ pulse, children, className }: StreakPulseProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!pulse) return;
    setActive(true);
    const t = window.setTimeout(() => setActive(false), 600);
    return () => window.clearTimeout(t);
  }, [pulse]);

  return (
    <span className={cn(active && 'animate-pulse', className)}>
      {children}
    </span>
  );
}
