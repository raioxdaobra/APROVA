import Link from 'next/link';
import { InstallPrompt } from '@/components/install-prompt';
import { HeroSection } from '@/components/landing/hero-section';
import { ShowcaseSection } from '@/components/landing/showcase-section';
import { FeatureCards } from '@/components/landing/feature-cards';
import { TrilhaPreviewSection } from '@/components/landing/trilha-preview-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { FaqSection } from '@/components/landing/faq-section';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex flex-col bg-background text-foreground">
      <HeroSection />
      <ShowcaseSection />
      <FeatureCards />
      <TrilhaPreviewSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />

      {/* CTA final */}
      <section className="container mx-auto max-w-4xl px-4 py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-primary/5 p-10 text-center shadow-lg sm:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(196,99,59,0.25), transparent 70%)',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Sua aprovação começa hoje.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Crie sua conta em 30 segundos. Sem cartão. Sem compromisso.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="w-full shadow-[0_0_40px_-12px_rgba(196,99,59,0.6)] sm:w-auto"
              >
                <Link href="/signup">Começar grátis</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <span className="text-2xl font-semibold tracking-tight text-primary">APROVA</span>
            <p className="text-xs text-muted-foreground">
              Feito em Fortaleza, pra quem vai passar na Unifor Medicina.
            </p>
          </div>
          <nav
            aria-label="Links institucionais"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <Link href="/sobre" className="hover:text-foreground hover:underline">
              Sobre
            </Link>
            <Link href="/privacidade" className="hover:text-foreground hover:underline">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-foreground hover:underline">
              Termos
            </Link>
            <Link href="/login" className="hover:text-foreground hover:underline">
              Entrar
            </Link>
          </nav>
        </div>
      </footer>

      <InstallPrompt />
    </main>
  );
}
