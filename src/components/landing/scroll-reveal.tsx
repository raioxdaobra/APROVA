'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay em ms antes de animar (escalonar elementos próximos) */
  delay?: number;
  /** Tag HTML do wrapper. Default `div`. */
  as?: 'div' | 'section' | 'article' | 'li';
}

/**
 * Wrapper client-side que aplica fade-in + slide-up quando o elemento entra na viewport.
 * Usa IntersectionObserver com threshold pequeno e dispara apenas uma vez.
 * Em ambientes sem IO (SSR ou prefers-reduced-motion), o conteúdo aparece imediatamente.
 */
export function ScrollReveal({ children, className, delay = 0, as: Tag = 'div' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              window.setTimeout(() => setVisible(true), delay);
            } else {
              setVisible(true);
            }
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag
      // @ts-expect-error ref polimórfico simples
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
