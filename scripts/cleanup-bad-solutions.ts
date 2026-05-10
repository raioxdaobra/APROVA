/**
 * Limpa resolucoes corrompidas (stubs) + as antigas (sem analise item-a-item).
 * Apos o delete, o on-demand.ts (com prompt atualizado) regenera fresh
 * quando o user clicar em "ver resolucao".
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

  // Conta antes
  const before = await client.query<{ count: string }>(
    `select count(*)::text as count from public.question_solutions`,
  );
  console.log(`Antes: ${before.rows[0]?.count} resolucoes`);

  // Deleta TODAS as resolucoes em cache. Motivo: o prompt anterior pedia
  // pro LLM analisar 5 alternativas que ele nao via — gerava resolucao
  // que nao correspondia a questao. Prompt agora e curto, conceitual e
  // honesto. Wipe + lazy regen com novo prompt.
  const del = await client.query(`delete from public.question_solutions`);

  console.log(`Deletadas: ${del.rowCount}`);

  const after = await client.query<{ count: string }>(
    `select count(*)::text as count from public.question_solutions`,
  );
  console.log(`Depois: ${after.rows[0]?.count} resolucoes (todas no formato novo)`);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
