/**
 * Inspeciona o conteudo das resolucoes em cache pra debug.
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

  const { rows } = await client.query<{
    question_id: string;
    generated_by: string;
    reviewed: boolean;
    content_md: string;
    subtopic: string | null;
    image_url: string | null;
  }>(`
    select s.question_id, s.generated_by, s.reviewed, s.content_md,
           q.subtopic, q.image_url
      from public.question_solutions s
      join public.questions q on q.id = s.question_id
     order by s.question_id desc
     limit 5
  `);

  console.log(`Total recente: ${rows.length} resolucoes\n`);
  for (const r of rows) {
    console.log('═'.repeat(70));
    console.log(`Question: ${r.question_id}`);
    console.log(`Provider:  ${r.generated_by}`);
    console.log(`Subtopic:  ${r.subtopic}`);
    console.log(`Image URL: ${r.image_url}`);
    console.log(`Reviewed:  ${r.reviewed}`);
    console.log('─'.repeat(70));
    console.log(r.content_md);
    console.log();
  }

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
