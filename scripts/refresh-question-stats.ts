/**
 * Atualiza a materialized view public.question_stats.
 *
 * Idempotente: usa `refresh materialized view concurrently` que requer um
 * índice único (criado em 0015_question_stats_view.sql). Roda quantas vezes
 * for preciso — pode ser chamado por cron Vercel (1x/hora) ou manualmente.
 *
 * Uso: npm run gen:stats
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

async function main(): Promise<void> {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL ausente em .env.local');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const refMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (!refMatch) {
    throw new Error(`SUPABASE_DB_URL host inesperado: ${url.hostname}`);
  }
  const projectRef = refMatch[1];
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const poolerUser = `postgres.${projectRef}`;

  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: poolerUser,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`[gen:stats] conectado ao pooler ${poolerHost}.`);

  const t0 = Date.now();
  try {
    await client.query('refresh materialized view concurrently public.question_stats');
    console.log(`[gen:stats] refresh concorrente ok em ${Date.now() - t0}ms.`);
  } catch (err) {
    // Fallback: na primeira execução pode não haver dados ainda; tenta sem
    // concurrently para não falhar.
    console.warn('[gen:stats] concurrently falhou, tentando refresh simples:', err);
    await client.query('refresh materialized view public.question_stats');
    console.log(`[gen:stats] refresh simples ok em ${Date.now() - t0}ms.`);
  }

  const countRes = await client.query<{ count: string }>(
    'select count(*)::text as count from public.question_stats'
  );
  console.log(`[gen:stats] rows=${countRes.rows[0]?.count ?? '0'}`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
