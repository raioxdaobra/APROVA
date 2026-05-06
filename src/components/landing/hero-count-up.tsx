'use client';

import { useCountUp } from '@/lib/hooks/use-count-up';

export function HeroCountUp({ target = 1000 }: { target?: number }) {
  const { value, ref } = useCountUp(target, 1500);
  const formatted = value.toLocaleString('pt-BR');
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent tabular-nums"
      aria-label={`${target.toLocaleString('pt-BR')} mais questões`}
    >
      {formatted}+
    </span>
  );
}
