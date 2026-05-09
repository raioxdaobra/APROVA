'use client';

/**
 * AppShell pos-remocao da sidebar.
 *
 * User pediu pra "excluir o menu lateral" — agora navegacao e feita via
 * <MobileBottomNav> (que apesar do nome historico, aparece em mobile e
 * desktop) + cards do dashboard com icones (Estatisticas + Ranking).
 *
 * Este componente preserva apenas o wrapper de padding pra que o conteudo
 * de cada pagina nao fique escondido pela bottom nav fixa.
 */
import { usePathname } from 'next/navigation';

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
}: {
  children: React.ReactNode;
  /** Mantido na assinatura pra compat com layout.tsx (passa isAdmin),
   *  mas nao usado mais — sidebar foi removida. */
  isAdmin?: boolean;
}) {
  const pathname = usePathname() ?? '/';

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // Sem sidebar — bottom nav (MobileBottomNav) e a unica navegacao em
  // mobile e desktop. Wrapper de padding garante que o conteudo do fim
  // de cada pagina nao fique sob a barra fixa.
  return (
    <div className="min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)]">
      {children}
    </div>
  );
}
