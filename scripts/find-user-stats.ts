/**
 * Localiza usuario por nome/email e mostra todas as estatisticas que
 * estao salvas pra ele em todas as tabelas relacionadas.
 *
 * Uso: tsx scripts/find-user-stats.ts <termo_busca>
 *   <termo_busca> e parte do username, display_name ou email
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

async function main() {
  const term = process.argv[2];
  if (!term) {
    console.error('Uso: tsx scripts/find-user-stats.ts <termo>');
    process.exit(1);
  }

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

  // Busca em profiles + auth.users
  const { rows: users } = await client.query<{
    id: string;
    username: string | null;
    display_name: string | null;
    email: string | null;
    is_admin: boolean | null;
    active_exam: string | null;
  }>(
    `select p.id, p.username, p.display_name, u.email, p.is_admin, p.active_exam
       from public.profiles p
       join auth.users u on u.id = p.id
      where p.username ilike $1
         or p.display_name ilike $1
         or u.email ilike $1`,
    [`%${term}%`],
  );

  if (users.length === 0) {
    console.log(`Nenhum usuario encontrado com termo "${term}"`);
    await client.end();
    return;
  }

  for (const u of users) {
    console.log('═'.repeat(70));
    console.log('user_id:        ', u.id);
    console.log('username:       ', u.username);
    console.log('display_name:   ', u.display_name);
    console.log('email:          ', u.email);
    console.log('is_admin:       ', u.is_admin);
    console.log('active_exam:    ', u.active_exam);
    console.log('─'.repeat(70));

    // Counts em cada tabela de estatisticas
    const tables = [
      'attempts',
      'study_sessions',
      'weekly_xp',
      'daily_xp',
      'simulado_bonuses',
      'subtopic_mastery',
      'streaks',
      'review_status',
      'flashcard_reviews',
      'achievements_earned',
      'mission_progress',
    ];

    for (const t of tables) {
      try {
        const { rows: r } = await client.query<{ count: string }>(
          `select count(*)::text as count from public.${t} where user_id = $1`,
          [u.id],
        );
        const c = r[0]?.count ?? '0';
        if (Number(c) > 0) {
          console.log(`  ${t.padEnd(22)} ${c}`);
        }
      } catch (err) {
        // tabela nao existe — ignora
      }
    }
    console.log();
  }

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
