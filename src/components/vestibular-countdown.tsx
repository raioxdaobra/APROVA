'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';

/**
 * Contagem regressiva pro vestibular. Recebe a data alvo via prop (Server
 * Component faz a leitura de `app_settings.vestibular_target_date`).
 *
 * Tick a cada minuto. Se a data já passou, mostra "Boa prova!".
 */
export function VestibularCountdown({
  targetDate,
}: {
  targetDate: string | null;
}) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!targetDate) return null;

  // Aceita ISO completo (`2026-12-15T...`) ou apenas date (`2026-12-15`).
  // Para apenas-data, considera 00:00 horário de Fortaleza (UTC-03).
  const targetMs = (() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return new Date(`${targetDate}T00:00:00-03:00`).getTime();
    }
    return new Date(targetDate).getTime();
  })();

  if (Number.isNaN(targetMs)) return null;

  const diffMs = targetMs - now;

  let content: React.ReactNode;
  if (diffMs <= 0) {
    content = (
      <span className="text-sm font-semibold text-foreground">Boa prova!</span>
    );
  } else {
    const totalHours = Math.floor(diffMs / 3_600_000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    content = (
      <span className="text-sm font-semibold text-foreground">
        Faltam{' '}
        <span className="font-mono tabular-nums text-primary">{days}</span>{' '}
        {days === 1 ? 'dia' : 'dias'} e{' '}
        <span className="font-mono tabular-nums text-primary">{hours}</span>{' '}
        {hours === 1 ? 'hora' : 'horas'}
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
    >
      <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
      {content}
    </div>
  );
}
