/**
 * Barra horizontal de navegação no fim do /dashboard. Pega os itens da
 * sidebar e exibe como ícones com labels curtas, em formato grid (3 col
 * mobile / 6 col desktop). Inspiração no respostaCerta + pedido do user.
 *
 * Server component — sem state, sem queries. Renderiza apenas links.
 *
 * Mantida em paralelo com a sidebar (sidebar continua existindo pra
 * navegação rápida desktop). Esta barra resolve o caso "preciso achar
 * Missões/Trilha mas já estou no dashboard" sem precisar abrir drawer.
 */
import Link from 'next/link';
import {
  Brain,
  Gamepad2,
  ListChecks,
  Map as MapIcon,
  Settings,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Variável CSS hsl pra cor do ícone (mesma da sidebar). */
  accentVar: string;
}

const ITEMS: NavItem[] = [
  {
    href: '/trilha',
    label: 'Trilha',
    Icon: MapIcon,
    accentVar: '--accent-trilha',
  },
  {
    href: '/revisao',
    label: 'Revisão',
    Icon: Brain,
    accentVar: '--accent-chat',
  },
  {
    href: '/missoes',
    label: 'Missões',
    Icon: ListChecks,
    accentVar: '--primary',
  },
  {
    href: '/jogos',
    label: 'Jogos',
    Icon: Gamepad2,
    accentVar: '--accent-jogos',
  },
  {
    href: '/ranking',
    label: 'Ranking',
    Icon: Trophy,
    accentVar: '--accent-ranking',
  },
  {
    href: '/configuracoes',
    label: 'Config.',
    Icon: Settings,
    accentVar: '--neutral-500',
  },
];

export function DashboardQuickNav() {
  return (
    <section
      aria-labelledby="dashboard-quick-nav"
      className="rounded-xl border border-border bg-card p-4"
    >
      <h2
        id="dashboard-quick-nav"
        className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Outros recursos
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform group-hover:-translate-y-0.5"
              style={{
                backgroundColor: `hsl(var(${item.accentVar}) / 0.16)`,
                color: `hsl(var(${item.accentVar}))`,
              }}
            >
              <item.Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-foreground">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
