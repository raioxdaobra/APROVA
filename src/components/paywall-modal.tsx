'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signOutAction } from '@/app/configuracoes/actions';

export type PaywallReason = 'questions' | 'simulado' | 'chat' | 'generic';

export interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  reason?: PaywallReason;
  /**
   * Se true, o ambiente não tem Stripe configurado — exibe mensagem de
   * fallback "Em breve" com botão de logout/contato.
   */
  fallback?: boolean;
}

const REASON_COPY: Record<PaywallReason, { title: string; subtitle: string }> = {
  questions: {
    title: 'Limite gratuito atingido',
    subtitle:
      'Você usou as 30 questões grátis. Continue praticando ilimitadamente com o plano Pro.',
  },
  simulado: {
    title: 'Simulado gratuito utilizado',
    subtitle:
      'Você já fez seu simulado grátis. No Pro você pode simular quantas vezes quiser.',
  },
  chat: {
    title: 'Limite diário do chat IA',
    subtitle:
      'Você atingiu 5 perguntas no tira-dúvidas hoje. Pro tem chat ilimitado.',
  },
  generic: {
    title: 'Recurso exclusivo do Pro',
    subtitle: 'Desbloqueie tudo com o plano Pro.',
  },
};

export function PaywallModal({
  open,
  onClose,
  reason = 'generic',
  fallback = false,
}: PaywallModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual');

  // ESC fecha modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const copy = REASON_COPY[reason];

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: selected }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (!res.ok || !json.url) {
          setError(
            json.error === 'stripe_not_configured'
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

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (err) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
        setError('Falha ao sair.');
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
    >
      {/* Backdrop clicável para fechar — botão "ghost" preenche todo o overlay */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-transparent"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-2xl rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="mb-5 flex flex-col gap-1">
          <h2 id="paywall-title" className="text-xl font-semibold text-foreground">
            {copy.title}
          </h2>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        {fallback ? (
          <div className="flex flex-col gap-4">
            <Card className="bg-muted/30">
              <p className="text-sm text-foreground">
                <strong>Em breve.</strong> A assinatura Pro estará disponível em
                breve. Para acesso antecipado, entre em contato:
              </p>
              <p className="mt-2 text-sm font-medium text-primary">
                eng.arocha@gmail.com
              </p>
            </Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleLogout}>
                Sair
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PlanCard
                title="Mensal"
                price="R$ 14,90"
                period="/mês"
                bullets={[
                  'Questões ilimitadas',
                  'Simulados ilimitados',
                  'Chat IA ilimitado',
                  'Sem fidelidade',
                ]}
                selected={selected === 'monthly'}
                onSelect={() => setSelected('monthly')}
              />
              <PlanCard
                title="Anual"
                price="R$ 119"
                period="/ano"
                badge="33% off"
                bullets={[
                  'Tudo do Mensal',
                  'Equivale a R$ 9,92/mês',
                  '12 meses garantidos',
                  'Melhor custo-benefício',
                ]}
                selected={selected === 'annual'}
                onSelect={() => setSelected('annual')}
              />
            </div>

            {error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={onClose} disabled={isPending}>
                Agora não
              </Button>
              <Button onClick={handleCheckout} disabled={isPending}>
                {isPending ? 'Abrindo checkout...' : 'Assinar Pro'}
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cartão ou PIX via Stripe. Cancele quando quiser.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  period,
  bullets,
  badge,
  selected,
  onSelect,
}: {
  title: string;
  price: string;
  period: string;
  bullets: string[];
  badge?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      className={cn(
        'relative cursor-pointer transition-colors duration-motion-base',
        selected ? 'border-primary bg-primary-light' : 'hover:border-primary/40',
      )}
    >
      {badge ? (
        <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {badge}
        </span>
      ) : null}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1">
            <span className="text-2xl font-semibold text-foreground">{price}</span>
            <span className="text-sm text-muted-foreground">{period}</span>
          </p>
        </div>
        <ul className="flex flex-col gap-1 text-sm text-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span aria-hidden className="text-primary">
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
