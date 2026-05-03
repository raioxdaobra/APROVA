/**
 * Cliente Supabase para uso em Client Components do Next.js.
 *
 * Usa @supabase/ssr para integração com cookies do navegador, garantindo
 * que a sessão renderizada no server seja a mesma observada no client.
 */
import { createBrowserClient } from '@supabase/ssr';

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

export function createClient() {
  return createBrowserClient<Database>(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}
