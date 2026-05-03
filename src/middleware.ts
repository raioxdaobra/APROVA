import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/sobre',
  '/privacidade',
  '/termos',
  '/design',
]);
const ONBOARDING_PREFIX = '/onboarding';
const DIAGNOSTIC_ROUTE = '/diagnostico';
const APP_ROUTE = '/dashboard';

function isPublic(path: string): boolean {
  return (
    PUBLIC_ROUTES.has(path) ||
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    /\.(?:svg|png|jpe?g|gif|webp|ico|woff2?)$/i.test(path)
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

  // Com sessao — checar onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();
  const completed = profile?.onboarding_completed === true;

  // Logado em rota de auth → manda para destino certo
  if (path === '/' || path === '/login' || path === '/signup') {
    const u = request.nextUrl.clone();
    u.pathname = completed ? APP_ROUTE : `${ONBOARDING_PREFIX}/perfil`;
    return NextResponse.redirect(u);
  }

  // Onboarding pendente: força fluxo
  if (
    !completed &&
    !path.startsWith(ONBOARDING_PREFIX) &&
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

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
