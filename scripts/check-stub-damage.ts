/**
 * Verifica quantas resolucoes ficaram corrompidas como [stub] apos o
 * regen falhar por rate limit.
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

  const stubs = await client.query<{ question_id: string; content_md: string }>(`
    select question_id, substring(content_md, 1, 150) as content_md
      from public.question_solutions
     where content_md ilike '%[stub] Geração falhou%'
        or content_md ilike '%[stub] Resolução pendente%'
     order by question_id
  `);

  console.log(`Resolucoes corrompidas como stub: ${stubs.rowCount}`);
  for (const r of stubs.rows) {
    console.log(`  ${r.question_id}: ${r.content_md.slice(0, 80)}...`);
  }

  // Tambem checar formato — quantas tem "Análise das alternativas"
  const old = await client.query<{ count: string }>(`
    select count(*)::text as count
      from public.question_solutions
     where content_md not ilike '%Análise das alternativas%'
       and content_md not ilike '%Analise das alternativas%'
  `);
  console.log(`\nResolucoes ainda no formato antigo (sem analise itens): ${old.rows[0]?.count}`);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
