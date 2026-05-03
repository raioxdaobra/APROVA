/**
 * Cliente Supabase para uso em Server Components, Route Handlers e Server
 * Actions do Next.js.
 *
 * No Next 15 `cookies()` torna-se async; ja marcamos esta funcao como `async`
 * e usamos `await cookies()` para forward-compat. No Next 14, `await` em um
 * valor sincrono e no-op, entao continua funcionando.
 *
 * O nome do export e `createClient`, alinhado a documentacao do Supabase
 * (https://supabase.com/docs/guides/auth/server-side/nextjs). Nao colide com
 * o `createClient` do `src/lib/supabase/client.ts` porque os imports usam
 * paths distintos.
 *
 * Em Server Components puros, `cookieStore.set()` lanca — encapsulamos com
 * try/catch para manter a leitura de sessao funcional; o middleware cuida
 * do refresh dos cookies.
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

export async function createClient() {
  const cookieStore = await cookies();

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
