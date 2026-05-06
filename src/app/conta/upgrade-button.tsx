'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

export interface UpgradeButtonProps {
  label: string;
  /** Plano padrão pré-selecionado para o checkout MP. */
  defaultPlan?: 'monthly' | 'annual';
}

/**
 * Botão "Assinar Pro / Renovar" que dispara checkout Mercado Pago e
 * redireciona o usuário pra `init_point` retornado.
 */
export function UpgradeButton({ label, defaultPlan = 'monthly' }: UpgradeButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/mercadopago/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: defaultPlan }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (!res.ok || !json.url) {
          setError(
            json.error === 'mp_not_configured'
              ? 'Pagamentos em breve. Entre em contato.'
              : 'Falha ao iniciar checkout. Tente novamente.',
          );
          return;
        }
        window.location.href = json.url;
      } catch {
        setError('Sem conexão com o servidor.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={isPending} size="md" className="self-start">
        {isPending ? 'Abrindo checkout…' : label}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
