/**
 * scripts/check-supabase-env.ts
 *
 * Valida que .env.local contem as variaveis necessarias e tenta uma query
 * basica contra public.questions. Use:
 *
 *   npm run check:supabase
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'

type EnvMap = Record<string, string>

const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

function loadEnvLocal(): EnvMap {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) {
    return {}
  }
  const content = readFileSync(path, 'utf8')
  const map: EnvMap = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    map[key] = value
  }
  return map
}

async function main(): Promise<void> {
  const fileEnv = loadEnvLocal()
  const merged: EnvMap = { ...fileEnv, ...(process.env as EnvMap) }

  const missing = REQUIRED.filter((name) => !merged[name])
  if (missing.length > 0) {
    console.error('[check:supabase] variaveis ausentes em .env.local ou no ambiente:')
    for (const name of missing) {
      console.error('  - ' + name)
    }
    console.error('\nConsulte supabase/README.md para obter os valores no dashboard.')
    process.exit(1)
  }

  const url = merged['NEXT_PUBLIC_SUPABASE_URL']
  const anon = merged['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!url || !anon) {
    // redundante (REQUIRED ja garante), mas satisfaz o type-checker estrito
    console.error('[check:supabase] credenciais publicas ausentes apos validacao.')
    process.exit(1)
  }

  console.log('[check:supabase] envs OK — testando conexao...')

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase.from('questions').select('id', { count: 'exact', head: true })

  if (error) {
    console.error('[check:supabase] erro ao consultar public.questions:')
    console.error('  ' + error.message)
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('\n  Aplique as migrations primeiro: supabase db push')
    }
    process.exit(2)
  }

  console.log('[check:supabase] conexao OK — public.questions acessivel.')
}

main().catch((err) => {
  console.error('[check:supabase] falha inesperada:', err)
  process.exit(99)
})
