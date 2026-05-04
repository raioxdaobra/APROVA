'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Home, Map as MapIcon, User } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Home;
  /** Match prefix to highlight nested routes too. */
  match: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Início',
    Icon: Home,
    match: (p) => p === '/dashboard' || p.startsWith('/dashboard/'),
  },
  {
    href: '/trilha',
    label: 'Trilha',
    Icon: MapIcon,
    match: (p) => p === '/trilha' || p.startsWith('/trilha/'),
  },
  {
    href: '/jogos',
    label: 'Jogos',
    Icon: Gamepad2,
    match: (p) => p === '/jogos' || p.startsWith('/jogos/'),
  },
  {
    href: '/configuracoes',
    label: 'Perfil',
    Icon: User,
    match: (p) => p === '/configuracoes' || p.startsWith('/configuracoes/'),
  },
];

const PUBLIC_ROUTES = new Set<string>([
  '/',
  '/login',
  '/signup',
  '/sobre',
  '/privacidade',
  '/termos',
]);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  // Auth callback / onboarding flow pages should not show the bottom nav.
  if (pathname.startsWith('/auth')) return true;
  if (pathname.startsWith('/onboarding')) return true;
  if (pathname.startsWith('/aguardando-aprovacao')) return true;
  if (pathname.startsWith('/conta-bloqueada')) return true;
  return false;
}

export function MobileBottomNav(): JSX.Element | null {
  const pathname = usePathname() ?? '/';
  if (isPublicRoute(pathname)) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <Icon
                  aria-hidden="true"
                  className={['h-5 w-5', active ? 'stroke-[2.25]' : 'stroke-[1.75]'].join(' ')}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
