/**
 * Cliente Supabase para uso em Server Components, Route Handlers e Server
 * Actions do Next.js. Lê e escreve cookies via API do Next 14+.
 *
 * Em Server Components puros, `cookies().set()` lança — encapsulamos com
 * try/catch para tornar essa diferença transparente.
 */
import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';

import type { Database } from './types';

function getEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[supabase] variavel de ambiente ${name} ausente. Configure em .env.local conforme supabase/README.md`,
    );
  }
  return value;
}

export function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient<Database>(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component puro — `set` nao e permitido. Ignoramos para
            // permitir leitura de sessao; o middleware cuida do refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // ver comentario acima
          }
        },
      },
    },
  );
}
