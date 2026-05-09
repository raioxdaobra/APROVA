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
    title: 'Você está pegando o ritmo 🔥',
    subtitle:
      'Já resolveu suas 30 questões grátis. Estude com TUDO o que cai na Unifor — 20 anos de prova oficial.',
  },
  simulado: {
    title: 'Você está pegando o ritmo 🔥',
    subtitle:
      'Já fez seu simulado grátis. Treine quantas vezes quiser com o banco completo Unifor — 20 anos de prova oficial.',
  },
  chat: {
    title: 'Você está pegando o ritmo 🔥',
    subtitle:
      'Atingiu 5 perguntas no chat IA hoje. Libere tira-dúvidas ilimitado e estude sem freio.',
  },
  generic: {
    title: 'Você está pegando o ritmo 🔥',
    subtitle: 'Libere tudo do APROVA com a versão completa.',
  },
};

const PRO_BULLETS: string[] = [
  'Banco completo: 1.000+ questões oficiais Unifor',
  'Simulados ilimitados, no formato real',
  'IA tira-dúvidas 24/7 em qualquer questão',
  'Ranking semanal de Fortaleza',
  '10 mini-games premium pra fixar conceitos',
];

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
        const res = await fetch('/api/mercadopago/checkout', {
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
            json.error === 'mp_not_configured' || json.error === 'stripe_not_configured'
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
            <Card className="border-primary/40 bg-primary/5">
              <p className="text-sm leading-relaxed text-foreground">
                <strong className="text-primary">Pagamento liberado em 48h.</strong> Garanta acesso antecipado com{' '}
                <strong>50% off</strong> pelo email{' '}
                <a
                  href="mailto:eng.arocha@gmail.com?subject=Acesso%20antecipado%20APROVA%20-%2050%25%20off"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  eng.arocha@gmail.com
                </a>
                .
              </p>
            </Card>
            <ul className="flex flex-col gap-1.5 text-sm text-foreground">
              {PRO_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span aria-hidden className="text-primary">
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={handleLogout}>
                Sair
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="mb-4 flex flex-col gap-1.5 text-sm text-foreground">
              {PRO_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span aria-hidden className="text-primary">
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PlanCard
                title="Anual"
                price="R$ 119"
                period="/ano"
                badge="Mais escolhido"
                bullets={[
                  'Equivale a R$ 9,92/mês',
                  '12 meses garantidos',
                  '33% mais barato que mensal',
                ]}
                featured
                selected={selected === 'annual'}
                onSelect={() => setSelected('annual')}
              />
              <PlanCard
                title="Mensal"
                price="R$ 14,90"
                period="/mês"
                bullets={['Sem fidelidade', 'Cancela a qualquer momento']}
                selected={selected === 'monthly'}
                onSelect={() => setSelected('monthly')}
              />
            </div>

            {error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={handleCheckout} disabled={isPending} size="lg" className="w-full">
                {isPending
                  ? 'Abrindo checkout...'
                  : selected === 'annual'
                  ? 'Garantir minha vaga · R$ 119/ano'
                  : 'Garantir minha vaga · R$ 14,90/mês'}
              </Button>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuar com 30 questões grátis
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cancela quando quiser · 7 dias de garantia · PIX ou cartão
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
  featured,
  selected,
  onSelect,
}: {
  title: string;
  price: string;
  period: string;
  bullets: string[];
  badge?: string;
  featured?: boolean;
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
        'relative cursor-pointer transition-all duration-motion-base',
        featured && !selected && 'border-2 border-primary/60',
        selected
          ? 'border-2 border-primary bg-primary-light shadow-[0_0_24px_-12px_rgba(196,99,59,0.7)]'
          : 'hover:border-primary/50',
      )}
    >
      {badge ? (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
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
