/**
 * Zera todas as estatisticas de um usuario especifico.
 * Usado pelo admin pra resetar progresso de qualquer user.
 *
 * Uso: tsx scripts/admin-zero-user-stats.ts <user_id_ou_email_ou_username>
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

// Mesmas tabelas usadas pelo deleteAllProgress action — manter sync.
const TABLES = [
  'attempts',
  'study_sessions',
  'user_question_status',
  'weekly_xp',
  'streaks',
  'subtopic_mastery',
  'simulado_bonuses',
  'daily_xp',
  'flashcard_reviews',
  'review_status',
  'achievements_earned',
  'mission_progress',
];

async function main() {
  const term = process.argv[2];
  if (!term) {
    console.error('Uso: tsx scripts/admin-zero-user-stats.ts <id|email|username>');
    process.exit(1);
  }

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error('SUPABASE_DB_URL ausente');
  const url = new URL(dbUrl);
  const projectRef = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)![1];
  const poolerHost = process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const client = new Client({
    host: poolerHost, port: 5432, database: 'postgres',
    user: `postgres.${projectRef}`, password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Acha user
  const { rows } = await client.query<{ id: string; username: string; display_name: string; email: string }>(
    `select p.id, p.username, p.display_name, u.email
       from public.profiles p
       join auth.users u on u.id = p.id
      where p.id::text = $1
         or u.email = $1
         or p.username = $1
         or p.username ilike $2`,
    [term, `%${term}%`],
  );

  if (rows.length === 0) {
    console.error(`Nenhum usuario encontrado com "${term}"`);
    await client.end();
    process.exit(1);
  }
  if (rows.length > 1) {
    console.error(`Multiplos usuarios encontrados (${rows.length}). Use o user_id pra ser especifico:`);
    for (const r of rows) console.error(`  ${r.id}  ${r.username}  ${r.email}`);
    await client.end();
    process.exit(1);
  }

  const u = rows[0]!;
  console.log(`Zerando estatisticas de:`);
  console.log(`  user_id:      ${u.id}`);
  console.log(`  username:     ${u.username}`);
  console.log(`  display_name: ${u.display_name}`);
  console.log(`  email:        ${u.email}`);
  console.log();

  let totalDeleted = 0;
  for (const table of TABLES) {
    try {
      const result = await client.query(
        `delete from public.${table} where user_id = $1`,
        [u.id],
      );
      const n = result.rowCount ?? 0;
      totalDeleted += n;
      if (n > 0) console.log(`  ${table.padEnd(24)} ${n} linhas deletadas`);
    } catch (err) {
      const msg = (err as Error).message ?? '';
      if (msg.includes('does not exist') || msg.includes('relation')) continue;
      console.error(`  ${table}: ERRO ${msg}`);
    }
  }
  console.log(`\nTotal: ${totalDeleted} linhas removidas. Estatisticas zeradas.`);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
