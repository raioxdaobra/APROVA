'use client';

/**
 * Wrapper para `canvas-confetti`. Re-dispara um burst sempre que `trigger`
 * passa de false → true. `intensity` controla quantidade de partículas.
 *
 * Render-safe em SSR (no-op até montar) e respeita prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';

export type ConfettiIntensity = 'small' | 'medium' | 'big';

export interface ConfettiBurstProps {
  trigger: boolean;
  intensity?: ConfettiIntensity;
}

const PARTICLE_COUNT: Record<ConfettiIntensity, number> = {
  small: 30,
  medium: 80,
  big: 200,
};

const SPREAD: Record<ConfettiIntensity, number> = {
  small: 60,
  medium: 90,
  big: 130,
};

export function ConfettiBurst({ trigger, intensity = 'medium' }: ConfettiBurstProps) {
  const lastTriggered = useRef(false);

  useEffect(() => {
    if (!trigger || lastTriggered.current === trigger) {
      lastTriggered.current = trigger;
      return;
    }
    lastTriggered.current = trigger;
    if (typeof window === 'undefined') return;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    } catch {
      /* ignore */
    }
    let cancelled = false;
    void import('canvas-confetti').then((mod) => {
      if (cancelled) return;
      const fn = mod.default;
      try {
        fn({
          particleCount: PARTICLE_COUNT[intensity],
          spread: SPREAD[intensity],
          startVelocity: intensity === 'big' ? 55 : 40,
          origin: { y: 0.6 },
          ticks: intensity === 'big' ? 220 : 150,
        });
      } catch {
        /* ignore */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [trigger, intensity]);

  return null;
}
