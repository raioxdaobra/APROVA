import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './scroll-reveal';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  '30 questões por semana',
  '1 simulado por mês',
  '5 dúvidas com IA por dia',
  'Ranking semanal de Fortaleza',
  'Mini-games básicos',
];

const PRO_FEATURES = [
  'Questões ilimitadas',
  'Simulados ilimitados',
  'IA ilimitada (com chat completo)',
  'Estatísticas avançadas',
  'Trilhas personalizadas por matéria',
  'Modo offline (PWA)',
  'Sem anúncios, pra sempre',
];

/**
 * Cards Free vs Pro. Pro destacado com ring/glow e badge.
 */
export function PricingSection() {
  return (
    <section
      id="pricing"
      className="container mx-auto max-w-5xl px-4 py-16 sm:py-24"
      aria-labelledby="pricing-title"
    >
      <ScrollReveal className="mb-12 text-center">
        <h2
          id="pricing-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Comece grátis. Vire Pro quando quiser.
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Sem pegadinha. Cancele em um clique.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2">
        <ScrollReveal>
          <PricingCard
            name="Free"
            price="R$ 0"
            period="pra sempre"
            description="O essencial pra começar a estudar hoje."
            features={FREE_FEATURES}
            cta="Criar conta grátis"
            href="/signup"
            variant="secondary"
          />
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <PricingCard
            name="Pro"
            price="R$ 14,90"
            period="por mês"
            description="Pra quem está focado em passar este ano."
            features={PRO_FEATURES}
            cta="Começar teste grátis"
            href="/signup?plan=pro"
            variant="primary"
            featured
          />
        </ScrollReveal>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Pagamento seguro via Stripe. Sem fidelidade. Reembolso em 7 dias.
      </p>
    </section>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  href,
  variant,
  featured,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  variant: 'primary' | 'secondary';
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-xl border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        featured ? 'border-primary/50 ring-2 ring-primary/30 shadow-[0_0_50px_-20px_rgba(196,99,59,0.6)]' : 'border-border',
      )}
    >
      {featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
          <Sparkles className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Mais escolhido
        </span>
      ) : null}

      <h3 className="text-xl font-semibold text-foreground">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-semibold text-foreground sm:text-5xl">{price}</span>
        <span className="text-sm text-muted-foreground">/ {period}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                featured ? 'text-primary' : 'text-success',
              )}
              aria-hidden="true"
            />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant={variant} size="lg" className="mt-8 w-full">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
