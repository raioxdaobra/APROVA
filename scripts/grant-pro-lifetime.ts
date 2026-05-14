/**
 * Concede acesso Pro vitalicio (plan='pro', plan_expires_at=null) a um usuario.
 * Uso: tsx scripts/grant-pro-lifetime.ts <email>
 *
 * Diferenca para promote-admin:
 *   - NAO seta is_admin=true (mantem usuario comum)
 *   - Seta plan='pro' + plan_expires_at=null => acesso ilimitado pra sempre
 *   - Remove o banner de "trial acabando" automaticamente
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
    console.error('Uso: tsx scripts/grant-pro-lifetime.ts <email>');
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

  const { rows } = await client.query<{
    id: string;
    email: string;
    username: string | null;
    plan: string | null;
    plan_expires_at: string | null;
    trial_ends_at: string | null;
  }>(
    `select p.id, u.email::text, p.username, p.plan, p.plan_expires_at, p.trial_ends_at
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
  console.log(`  user_id:         ${u.id}`);
  console.log(`  email:           ${u.email}`);
  console.log(`  username:        ${u.username}`);
  console.log(`  plan:            ${u.plan} -> pro`);
  console.log(`  plan_expires_at: ${u.plan_expires_at} -> null`);
  console.log(`  trial_ends_at:   ${u.trial_ends_at} (mantido, ja eh ignorado quando plan=pro)`);

  await client.query(
    `update public.profiles
        set plan = 'pro',
            plan_expires_at = null,
            account_status = 'approved'
      where id = $1`,
    [u.id],
  );

  console.log(`\n✓ Acesso Pro vitalicio concedido. Banner de trial desaparece no proximo refresh.`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
