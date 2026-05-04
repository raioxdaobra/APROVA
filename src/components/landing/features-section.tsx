import { Bot, Gamepad2, Target, Trophy, type LucideIcon } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: Target,
    title: '680 questões oficiais',
    description:
      'Banco completo de provas Unifor Medicina com filtros por matéria, ano e dificuldade.',
    accent: 'text-primary bg-primary/10',
  },
  {
    icon: Bot,
    title: 'IA tira dúvidas',
    description:
      'Pergunte qualquer coisa sobre uma questão. A IA explica passo a passo, do zero.',
    accent: 'text-discipline-quimica bg-success-bg',
  },
  {
    icon: Trophy,
    title: 'Ranking de Fortaleza',
    description:
      'Compare seu progresso semanal com outros vestibulandos da cidade. Compete saudável.',
    accent: 'text-warning bg-warning-bg',
  },
  {
    icon: Gamepad2,
    title: '10 mini-games',
    description:
      'Pausas estratégicas pra fixar conceitos. Memória, anatomia, química — sem tédio.',
    accent: 'text-discipline-humanas bg-primary/5',
  },
];

/**
 * Grid 2x2 com features principais. Cards em ScrollReveal escalonados.
 */
export function FeaturesSection() {
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
              <div className="group h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.accent} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
