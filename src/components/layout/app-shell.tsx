'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useSidebarState } from '@/lib/hooks/use-sidebar-state';
import { cn } from '@/lib/utils';

const PUBLIC_PREFIXES = new Set([
  '/',
  '/login',
  '/signup',
  '/sobre',
  '/privacidade',
  '/termos',
]);

const PUBLIC_DYNAMIC = ['/auth', '/onboarding', '/aguardando-aprovacao', '/conta-bloqueada'];

// Rotas autenticadas que NÃO mostram sidebar. Hoje só /inicio: tela de
// seleção de prova fica "limpa", sem distração de menu lateral. Sidebar
// volta a aparecer assim que o user clica num card e cai no /dashboard.
const NO_SIDEBAR_ROUTES = ['/inicio'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PREFIXES.has(pathname)) return true;
  if (PUBLIC_DYNAMIC.some((p) => pathname.startsWith(p))) return true;
  if (NO_SIDEBAR_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return false;
}

export function AppShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname() ?? '/';
  const { collapsed, toggle, hydrated } = useSidebarState();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fecha drawer ao navegar
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Trava scroll do body quando drawer aberto em mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [drawerOpen]);

  // ESC fecha drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop (md+) */}
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <AppSidebar
          collapsed={hydrated ? collapsed : false}
          onToggle={toggle}
          isAdmin={isAdmin}
          variant="desktop"
        />
      </div>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 h-full motion-safe:animate-[drawer-slide_220ms_ease-out]">
            <AppSidebar
              collapsed={false}
              onToggle={() => undefined}
              onNavigate={() => setDrawerOpen(false)}
              isAdmin={isAdmin}
              variant="drawer"
            />
          </div>
        </div>
      )}

      {/* Botão hambúrguer flutuante mobile (só aparece em rotas autenticadas) */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menu"
        className={cn(
          'fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-md md:hidden',
          drawerOpen && 'hidden',
        )}
        style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Botão de fechar dentro do drawer (header float) */}
      {drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Fechar menu"
          className="fixed right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-md md:hidden"
          style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Wrapper de conteúdo. Bottom padding em mobile compensa a altura do
          <MobileBottomNav> (h-14 = 56px) + safe-area do iPhone. Sem isso,
          o último elemento da página (botões, links) fica por baixo da nav
          fixa e não dá pra clicar. Desktop não tem bottom nav, sem padding. */}
      <div
        className="min-w-0 flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] md:pb-0"
      >
        {children}
      </div>
    </div>
  );
}
