/**
 * Aplica as migrations de supabase/migrations/ no banco de dados Supabase em ordem.
 *
 * Uso: npm run db:push
 *
 * Lê SUPABASE_DB_URL de .env.local. Cria tabela _aprova_migrations para
 * tracking idempotente. Cada arquivo aplica num único BEGIN/COMMIT.
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lookup } from 'node:dns/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MIGRATIONS_DIR = join(ROOT, 'supabase', 'migrations');

config({ path: join(ROOT, '.env.local') });

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error('SUPABASE_DB_URL ausente em .env.local');
  process.exit(1);
}

async function main() {
  // Supabase direct connections (db.<ref>.supabase.co) só resolvem em IPv6
  // em muitos ambientes. Usamos o pooler (IPv4) com session mode (:5432).
  // O usuário no pooler é `postgres.<project-ref>`. Pode ser sobrescrito via
  // SUPABASE_POOLER_HOST. Default detectado para este projeto: us-east-2.
  const url = new URL(dbUrl!);
  const directHost = url.hostname;
  const refMatch = directHost.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (!refMatch) {
    throw new Error(`SUPABASE_DB_URL host inesperado: ${directHost}`);
  }
  const projectRef = refMatch[1];
  const poolerHost = process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const poolerUser = `postgres.${projectRef}`;
  // lookup mantido apenas como diagnóstico opcional
  try {
    const a = await lookup(poolerHost, { family: 0 });
    console.log(`[db:push] pooler ${poolerHost} (${a.address}) user=${poolerUser.slice(0, 14)}***`);
  } catch {
    console.log(`[db:push] pooler ${poolerHost} user=${poolerUser.slice(0, 14)}***`);
  }

  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: poolerUser,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('[db:push] conectado.');

  await client.query(`
    create table if not exists public._aprova_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const appliedRes = await client.query(
    'select filename from public._aprova_migrations'
  );
  const applied = new Set<string>(appliedRes.rows.map((r) => r.filename));

  let okCount = 0;
  let skipCount = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[db:push] skip  ${file}`);
      skipCount++;
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'insert into public._aprova_migrations (filename) values ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`[db:push] ok    ${file}`);
      okCount++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[db:push] error ${file}`);
      console.error(err);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`[db:push] done. applied=${okCount} skipped=${skipCount}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
