import Link from 'next/link';
import { Bot, Gamepad2, Target, Trophy, type LucideIcon } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accentVar: string;
}

const FEATURES: Feature[] = [
  {
    icon: Target,
    title: '1.000+ questões oficiais',
    description:
      'Banco completo de provas Unifor Medicina com filtros por matéria, ano e dificuldade.',
    href: '/quiz',
    accentVar: '--accent-quiz',
  },
  {
    icon: Bot,
    title: 'IA tira dúvidas',
    description:
      'Pergunte qualquer coisa sobre uma questão. A IA explica passo a passo, do zero.',
    href: '/chat',
    accentVar: '--accent-chat',
  },
  {
    icon: Trophy,
    title: 'Ranking de Fortaleza',
    description:
      'Compare seu progresso semanal com outros vestibulandos da cidade. Compete saudável.',
    href: '/ranking',
    accentVar: '--accent-ranking',
  },
  {
    icon: Gamepad2,
    title: '10 mini-games',
    description:
      'Pausas estratégicas pra fixar conceitos. Memória, anatomia, química — sem tédio.',
    href: '/jogos',
    accentVar: '--accent-jogos',
  },
];

export function FeatureCards() {
  return (
    <section
      id="features"
      className="container mx-auto max-w-6xl px-4 py-16 sm:py-24"
      aria-labelledby="features-title"
    >
      <ScrollReveal className="mb-12 text-center">
        <h2
          id="features-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Construído pra quem leva o vestibular a sério
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Sem fluff. Cada recurso existe pra você acertar mais questões na prova.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <ScrollReveal key={feature.title} delay={idx * 80}>
              <Link
                href={feature.href}
                className="group block h-full rounded-xl border-l-4 border-l-[hsl(var(--accent))] border-y border-r border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_-12px_hsl(var(--accent)/0.7)] focus-visible:-translate-y-1 focus-visible:shadow-[0_0_28px_-12px_hsl(var(--accent)/0.7)]"
                style={{ ['--accent' as string]: `var(${feature.accentVar})` }}
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: 'hsl(var(--accent) / 0.12)',
                    color: 'hsl(var(--accent))',
                  }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ color: 'hsl(var(--accent))' }}
                >
                  Explorar
                </span>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
