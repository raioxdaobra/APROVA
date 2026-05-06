'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Home,
  Map as MapIcon,
  MessageSquare,
  Settings,
  Shield,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  match: (p: string) => boolean;
  accentVar: string;
  adminOnly?: boolean;
}

const ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Início',
    Icon: Home,
    match: (p) => p === '/dashboard' || p.startsWith('/dashboard/'),
    accentVar: '--primary',
  },
  {
    href: '/quiz',
    label: 'Quiz',
    Icon: Target,
    match: (p) => p === '/quiz' || p.startsWith('/quiz/'),
    accentVar: '--accent-quiz',
  },
  {
    href: '/simulado',
    label: 'Simulado',
    Icon: BarChart3,
    match: (p) => p === '/simulado' || p.startsWith('/simulado/'),
    accentVar: '--accent-simulado',
  },
  {
    href: '/trilha',
    label: 'Trilha',
    Icon: MapIcon,
    match: (p) => p === '/trilha' || p.startsWith('/trilha/'),
    accentVar: '--accent-trilha',
  },
  {
    href: '/jogos',
    label: 'Jogos',
    Icon: Gamepad2,
    match: (p) => p === '/jogos' || p.startsWith('/jogos/'),
    accentVar: '--accent-jogos',
  },
  {
    href: '/ranking',
    label: 'Ranking',
    Icon: Trophy,
    match: (p) => p === '/ranking' || p.startsWith('/ranking/'),
    accentVar: '--accent-ranking',
  },
  {
    href: '/estatisticas',
    label: 'Estatísticas',
    Icon: BarChart3,
    match: (p) => p === '/estatisticas' || p.startsWith('/estatisticas/'),
    accentVar: '--accent-chat',
  },
  {
    href: '/admin/usuarios',
    label: 'Admin',
    Icon: Shield,
    match: (p) => p.startsWith('/admin'),
    accentVar: '--accent-ranking',
    adminOnly: true,
  },
  {
    href: '/configuracoes',
    label: 'Configurações',
    Icon: Settings,
    match: (p) => p === '/configuracoes' || p.startsWith('/configuracoes/'),
    accentVar: '--neutral-500',
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  isAdmin: boolean;
  /** "drawer" hides toggle button (drawer has its own close in header). */
  variant?: 'desktop' | 'drawer';
}

export function AppSidebar({
  collapsed,
  onToggle,
  onNavigate,
  isAdmin,
  variant = 'desktop',
}: AppSidebarProps) {
  const pathname = usePathname() ?? '/';

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card text-foreground',
        variant === 'desktop' && 'transition-[width] duration-200',
        variant === 'desktop' && (collapsed ? 'w-[60px]' : 'w-[240px]'),
        variant === 'drawer' && 'w-[260px]',
      )}
      aria-label="Navegação principal"
    >
      <div
        className={cn(
          'flex items-center border-b border-border px-3',
          collapsed && variant === 'desktop' ? 'justify-center' : 'justify-between',
          'h-14 shrink-0',
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2 font-semibold tracking-tight text-primary',
            collapsed && variant === 'desktop' ? 'justify-center' : '',
          )}
          onClick={onNavigate}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            A
          </span>
          {!(collapsed && variant === 'desktop') && (
            <span className="text-base">APROVA</span>
          )}
        </Link>
        {variant === 'desktop' && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            className={cn(
              'rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground',
              collapsed && 'absolute right-2',
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-0.5">
          {ITEMS.filter((it) => !it.adminOnly || isAdmin).map((it) => {
            const active = it.match(pathname);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    collapsed && variant === 'desktop' && 'justify-center',
                  )}
                  title={collapsed && variant === 'desktop' ? it.label : undefined}
                >
                  <it.Icon
                    className="h-[18px] w-[18px] shrink-0"
                    aria-hidden="true"
                    style={active ? { color: `hsl(var(${it.accentVar}))` } : undefined}
                  />
                  {!(collapsed && variant === 'desktop') && (
                    <span className="flex-1 truncate">{it.label}</span>
                  )}
                  {active && !(collapsed && variant === 'desktop') && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `hsl(var(${it.accentVar}))` }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!(collapsed && variant === 'desktop') && (
        <div className="border-t border-border px-3 py-3 text-[11px] text-muted-foreground">
          <span>APROVA · Unifor Medicina</span>
        </div>
      )}
    </aside>
  );
}
