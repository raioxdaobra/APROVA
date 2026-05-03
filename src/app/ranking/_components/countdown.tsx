'use client';

import { useEffect, useState } from 'react';

function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function computeDelta(targetIso: string): { days: number; hours: number; minutes: number; expired: boolean } {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const ms = target - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, expired: false };
}

export function ResetCountdown({ targetIso }: { targetIso: string }) {
  const [delta, setDelta] = useState(() => computeDelta(targetIso));

  useEffect(() => {
    const tick = () => setDelta(computeDelta(targetIso));
    tick();
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  if (delta.expired) {
    return <span className="text-sm text-muted-foreground">Reset agora</span>;
  }

  return (
    <span className="text-sm text-muted-foreground" suppressHydrationWarning>
      Reset em {pluralize(delta.days, 'dia', 'dias')}, {pluralize(delta.hours, 'hora', 'horas')}
      {delta.days === 0 ? ` e ${pluralize(delta.minutes, 'minuto', 'minutos')}` : ''}
    </span>
  );
}
