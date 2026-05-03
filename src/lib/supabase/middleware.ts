/**
 * Helper para refresh de sessao Supabase em middleware do Next.js.
 *
 * Uso (em src/middleware.ts):
 *
 *   import { updateSession } from '@/lib/supabase/middleware'
 *   export async function middleware(request: NextRequest) {
 *     return updateSession(request)
 *   }
 *
 * O helper:
 *   1) cria um NextResponse a partir da request
 *   2) propaga cookies recebidos do client e atualizados pelo Supabase
 *   3) chama supabase.auth.getUser() para forcar refresh do JWT quando
 *      proximo de expirar
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import type { Database } from './types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Em ambientes onde as envs nao estao configuradas (ex.: build inicial sem
    // projeto Supabase), apenas seguimos sem refresh. NAO lancar para nao
    // quebrar paginas publicas.
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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

  await supabase.auth.getUser();

  return response;
}
