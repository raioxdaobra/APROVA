/**
 * Aplica o template HTML de Magic Link no Supabase Auth via Management API.
 *
 * Pre-requisitos:
 *   - Pegar Personal Access Token em https://supabase.com/dashboard/account/tokens
 *   - Setar em .env.local (ou exportar) como SUPABASE_ACCESS_TOKEN
 *
 * Uso:
 *   tsx scripts/apply-email-template.ts
 *
 * Apos rodar, todo Magic Link enviado pelo Supabase Auth (signInWithOtp)
 * vai usar o template novo (com APROVA branding + texto anti-spam +
 * boas-vindas + CTA). Conteudo do template: docs/email-templates/magic-link-aprova.html
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!accessToken) {
    console.error(`✗ SUPABASE_ACCESS_TOKEN ausente.

Pra pegar:
1. Acesse https://supabase.com/dashboard/account/tokens
2. Clique "Generate new token", de qualquer nome (ex: "claude-cli")
3. Copie o token (comeca com 'sbp_...')
4. Adicione em .env.local: SUPABASE_ACCESS_TOKEN=sbp_xxxx
5. Rode novamente: npx tsx scripts/apply-email-template.ts
`);
    process.exit(1);
  }

  if (!supabaseUrl) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL ausente em .env.local');
    process.exit(1);
  }

  // Extrai project ref da URL: https://<ref>.supabase.co
  const refMatch = new URL(supabaseUrl).hostname.match(
    /^([a-z0-9]+)\.supabase\.co$/,
  );
  if (!refMatch) {
    console.error(`✗ URL do Supabase inesperada: ${supabaseUrl}`);
    process.exit(1);
  }
  const projectRef = refMatch[1];
  console.log(`Project ref: ${projectRef}`);

  // Le o template HTML
  const templatePath = join(ROOT, 'docs/email-templates/magic-link-aprova.html');
  const templateHtml = readFileSync(templatePath, 'utf8');
  console.log(`Template:    ${templatePath} (${templateHtml.length} chars)`);

  // PATCH no auth config — mailer_templates_magic_link_content e o campo
  // do Supabase Management API pro template do magic link.
  console.log(`\nAplicando template via Management API...`);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mailer_subjects_magic_link: 'Bem-vinda ao APROVA · seu acesso',
        mailer_templates_magic_link_content: templateHtml,
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error(`✗ ${res.status} ${res.statusText}`);
    console.error(errText.slice(0, 500));
    process.exit(1);
  }

  const json = await res.json();
  console.log(`✓ Template aplicado com sucesso!`);
  console.log(
    `  subject: "${(json as { mailer_subjects_magic_link?: string }).mailer_subjects_magic_link ?? '?'}"`,
  );
  console.log(`\nProximo magic-link enviado vai usar o novo formato.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
