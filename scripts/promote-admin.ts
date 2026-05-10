/**
 * Promove um usuario a administrador (is_admin = true).
 * Uso: tsx scripts/promote-admin.ts <email>
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: tsx scripts/promote-admin.ts <email>');
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
  const { rows } = await client.query<{
    id: string; email: string; username: string | null; is_admin: boolean | null;
  }>(
    `select p.id, u.email::text, p.username, p.is_admin
       from public.profiles p
       join auth.users u on u.id = p.id
      where u.email = $1`,
    [email],
  );

  if (rows.length === 0) {
    console.error(`Usuario nao encontrado: ${email}`);
    await client.end();
    process.exit(1);
  }

  const u = rows[0]!;
  console.log(`Encontrado:`);
  console.log(`  user_id:   ${u.id}`);
  console.log(`  email:     ${u.email}`);
  console.log(`  username:  ${u.username}`);
  console.log(`  is_admin:  ${u.is_admin} -> true`);

  await client.query(
    `update public.profiles
        set is_admin = true,
            account_status = 'approved'
      where id = $1`,
    [u.id],
  );

  console.log(`\n✓ Promovido a administrador.`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
