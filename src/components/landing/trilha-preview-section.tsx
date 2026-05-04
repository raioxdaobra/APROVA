import {
  BookOpen,
  Crown,
  GraduationCap,
  Medal,
  Notebook,
  Sprout,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';
import { cn } from '@/lib/utils';

interface TrilhaRank {
  label: string;
  xp: string;
  Icon: LucideIcon;
  color: string;
  ring: string;
}

/**
 * 8 ranks de progressão visual mostrando a trilha gamificada.
 * Os primeiros 7 espelham o sistema real de XP; "Lendário" é uma prévia visual.
 */
const RANKS: TrilhaRank[] = [
  { label: 'Calouro', xp: '0 XP', Icon: Sprout, color: 'text-muted-foreground', ring: 'ring-border' },
  { label: 'Estudante', xp: '500 XP', Icon: BookOpen, color: 'text-foreground', ring: 'ring-border' },
  { label: 'Candidato', xp: '2k XP', Icon: Notebook, color: 'text-discipline-fisica', ring: 'ring-discipline-fisica/30' },
  { label: 'Aspirante', xp: '5k XP', Icon: Target, color: 'text-primary', ring: 'ring-primary/40' },
  { label: 'Vestibulando', xp: '12k XP', Icon: GraduationCap, color: 'text-warning', ring: 'ring-warning/40' },
  { label: 'Quase Lá', xp: '25k XP', Icon: Star, color: 'text-success', ring: 'ring-success/40' },
  { label: 'Aprovado', xp: '50k XP', Icon: Trophy, color: 'text-success', ring: 'ring-success/60' },
  { label: 'Lendário', xp: '100k XP', Icon: Crown, color: 'text-primary', ring: 'ring-primary/60' },
];

/**
 * Trilha visual com 8 patentes. Cada badge usa hover lift e fade-in.
 */
export function TrilhaPreviewSection() {
  return (
    <section
      className="container mx-auto max-w-6xl px-4 py-16 sm:py-24"
      aria-labelledby="trilha-title"
    >
      <ScrollReveal className="mb-12 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning-bg px-3 py-1 text-xs font-semibold text-warning">
          <Medal className="h-3.5 w-3.5" aria-hidden="true" /> Sistema gamificado
        </span>
        <h2
          id="trilha-title"
          className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          De Calouro a Aprovado
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Ganhe XP a cada questão, suba de patente e desbloqueie novas conquistas.
        </p>
      </ScrollReveal>

      <div className="relative">
        {/* Linha conectora */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />

        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
          {RANKS.map((rank, idx) => {
            const Icon = rank.Icon;
            return (
              <ScrollReveal key={rank.label} delay={idx * 60} as="li">
                <div className="group flex flex-col items-center gap-2 text-center">
                  <div
                    className={cn(
                      'relative flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-sm ring-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md',
                      rank.ring,
                    )}
                  >
                    <Icon className={cn('h-8 w-8', rank.color)} aria-hidden="true" />
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                  </div>
                  <p className={cn('text-sm font-semibold', rank.color)}>{rank.label}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{rank.xp}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
