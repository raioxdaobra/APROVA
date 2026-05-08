import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/reset',
  '/forgot-password',
  '/sobre',
  '/privacidade',
  '/termos',
  '/design',
  '/instalar',
]);
const ONBOARDING_PREFIX = '/onboarding';
const DIAGNOSTIC_ROUTE = '/diagnostico';
const APP_ROUTE = '/dashboard';
const PENDING_ROUTE = '/aguardando-aprovacao';
const BLOCKED_ROUTE = '/conta-bloqueada';
const ADMIN_PREFIX = '/admin';

function isPublic(path: string): boolean {
  return (
    PUBLIC_ROUTES.has(path) ||
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path === '/sw.js' ||
    path === '/manifest.webmanifest' ||
    path === '/manifest.json' ||
    path.startsWith('/icons/') ||
    /\.(?:svg|png|jpe?g|gif|webp|ico|woff2?|js|webmanifest)$/i.test(path)
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Sem sessao
  if (!user) {
    if (isPublic(path)) return response;
    const u = request.nextUrl.clone();
    u.pathname = '/';
    return NextResponse.redirect(u);
  }

  // Com sessao — checar onboarding + status da conta
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, account_status, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const completed = profile?.onboarding_completed === true;
  const accountStatus = (profile?.account_status as 'pending' | 'approved' | 'blocked' | undefined) ?? 'pending';
  const isAdmin = profile?.is_admin === true;

  // Logado em rota de auth → manda para destino certo
  if (path === '/' || path === '/login' || path === '/signup') {
    const u = request.nextUrl.clone();
    if (!completed) {
      u.pathname = `${ONBOARDING_PREFIX}/perfil`;
    } else if (!isAdmin && accountStatus === 'blocked') {
      u.pathname = BLOCKED_ROUTE;
    } else if (!isAdmin && accountStatus === 'pending') {
      u.pathname = PENDING_ROUTE;
    } else {
      u.pathname = APP_ROUTE;
    }
    return NextResponse.redirect(u);
  }

  // Onboarding pendente: força fluxo. Exceção: rotas /api/* completam suas
  // próprias verificações de auth — redirecionar /api/* quebra fetches dos
  // próprios formulários do onboarding (ex.: check de username).
  if (
    !completed &&
    !path.startsWith(ONBOARDING_PREFIX) &&
    !path.startsWith('/api/') &&
    path !== DIAGNOSTIC_ROUTE &&
    !isPublic(path)
  ) {
    const u = request.nextUrl.clone();
    u.pathname = `${ONBOARDING_PREFIX}/perfil`;
    return NextResponse.redirect(u);
  }

  // Já completou: não revisita onboarding
  if (completed && path.startsWith(ONBOARDING_PREFIX)) {
    const u = request.nextUrl.clone();
    u.pathname = APP_ROUTE;
    return NextResponse.redirect(u);
  }

  // Account approval gate (admin bypass).
  if (completed && !isAdmin) {
    if (accountStatus === 'blocked') {
      // Permite a própria página /conta-bloqueada e API auth
      if (path !== BLOCKED_ROUTE && !path.startsWith('/api/') && !isPublic(path)) {
        const u = request.nextUrl.clone();
        u.pathname = BLOCKED_ROUTE;
        return NextResponse.redirect(u);
      }
    } else if (accountStatus === 'pending') {
      if (path !== PENDING_ROUTE && !path.startsWith('/api/') && !isPublic(path)) {
        const u = request.nextUrl.clone();
        u.pathname = PENDING_ROUTE;
        return NextResponse.redirect(u);
      }
    } else {
      // approved: bloqueia /admin/* para não-admins
      if (path.startsWith(ADMIN_PREFIX)) {
        const u = request.nextUrl.clone();
        u.pathname = APP_ROUTE;
        return NextResponse.redirect(u);
      }
      // Se já aprovado, não deixa ficar nas páginas de espera/bloqueio
      if (path === PENDING_ROUTE || path === BLOCKED_ROUTE) {
        const u = request.nextUrl.clone();
        u.pathname = APP_ROUTE;
        return NextResponse.redirect(u);
      }
    }
  }

  // Admin: também não deve ficar preso em /aguardando ou /bloqueada.
  if (completed && isAdmin && (path === PENDING_ROUTE || path === BLOCKED_ROUTE)) {
    const u = request.nextUrl.clone();
    u.pathname = APP_ROUTE;
    return NextResponse.redirect(u);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
