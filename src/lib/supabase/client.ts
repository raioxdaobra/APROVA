/**
 * Cliente Supabase para uso em Client Components do Next.js.
 *
 * Usa @supabase/ssr para integração com cookies do navegador, garantindo
 * que a sessão renderizada no server seja a mesma observada no client.
 */
import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

// Acesso a process.env por nome literal: o Next.js inlina o valor apenas
// quando o identificador da chave é estático no código-fonte do cliente.
// Não trocar por acesso dinâmico (process.env[name]) — quebra o bundle.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente no bundle.',
    );
  }
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
