/**
 * Conta quantas resolucoes ja existem e quantas estao no formato antigo
 * (sem o header "## Análise das alternativas").
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error('SUPABASE_DB_URL ausente');
  const url = new URL(dbUrl);
  const refMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (!refMatch) throw new Error(`host inesperado: ${url.hostname}`);
  const projectRef = refMatch[1];
  const poolerHost = process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: `postgres.${projectRef}`,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const total = await client.query<{ count: string }>(`
    select count(*)::text as count
      from public.questions
     where exam = 'unifor-medicina'
       and coalesce(annulled, false) = false
  `);

  const withSol = await client.query<{ count: string }>(`
    select count(*)::text as count
      from public.question_solutions
  `);

  const newFormat = await client.query<{ count: string }>(`
    select count(*)::text as count
      from public.question_solutions
     where content_md ilike '%Análise das alternativas%'
        or content_md ilike '%Analise das alternativas%'
  `);

  const oldFormat = await client.query<{ count: string }>(`
    select count(*)::text as count
      from public.question_solutions
     where not (
       content_md ilike '%Análise das alternativas%'
       or content_md ilike '%Analise das alternativas%'
     )
  `);

  const stub = await client.query<{ count: string }>(`
    select count(*)::text as count
      from public.question_solutions
     where content_md ilike '%[stub]%'
  `);

  console.log('Total questoes Unifor (nao-anuladas):', total.rows[0]?.count);
  console.log('Resolucoes existentes:               ', withSol.rows[0]?.count);
  console.log('  formato NOVO (com analise itens):  ', newFormat.rows[0]?.count);
  console.log('  formato ANTIGO (sem analise itens):', oldFormat.rows[0]?.count);
  console.log('  stubs (geracao falhou):            ', stub.rows[0]?.count);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
