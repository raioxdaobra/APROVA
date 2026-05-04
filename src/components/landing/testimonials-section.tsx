import { Quote, Star } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Comecei errando metade dos exercícios de química. Em dois meses na plataforma, virei o jogo. A IA explica o porquê — não só a resposta.',
    name: 'Ana Beatriz',
    role: 'Aprovada Unifor Medicina 2025',
    initials: 'AB',
  },
  {
    quote:
      'O ranking da semana foi o que me fez acordar cedo. Ver meu nome subindo virou rotina. Faz diferença ter outros vestibulandos juntos.',
    name: 'Lucas Fernandes',
    role: 'Vestibulando — Fortaleza',
    initials: 'LF',
  },
  {
    quote:
      'A trilha por matéria me organizou. Sabia exatamente onde estava ruim e o que treinar. Os simulados imitam a prova real.',
    name: 'Marina Costa',
    role: 'Aprovada Unifor Medicina 2024',
    initials: 'MC',
  },
];

/**
 * 3 cards com depoimentos. Quotes fictícios mas realistas.
 */
export function TestimonialsSection() {
  return (
    <section
      className="container mx-auto max-w-6xl px-4 py-16 sm:py-24"
      aria-labelledby="testimonials-title"
    >
      <ScrollReveal className="mb-12 text-center">
        <h2
          id="testimonials-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Quem usa, recomenda
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Vestibulandos e aprovados da Unifor Medicina contam suas experiências.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, idx) => (
          <ScrollReveal key={t.name} delay={idx * 100}>
            <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <Quote className="h-6 w-6 text-primary/40" aria-hidden="true" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">{t.quote}</p>

              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-warning text-warning" aria-hidden="true" />
                  ))}
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
