/**
 * Manda email customizado APROVA pra um usuario, com magic-link de login
 * embutido. Funciona pra contas EXISTENTES (login direto sem senha).
 *
 * Pipeline:
 *   1. Supabase Admin generateLink({ type: 'magiclink' }) — gera URL com token
 *   2. Le template HTML em docs/email-templates/magic-link-aprova.html
 *   3. Substitui {{ .ConfirmationURL }} pelo magic-link real
 *   4. POST pra Resend API com from='onboarding@resend.dev'
 *
 * Uso: tsx scripts/send-custom-invite.ts <email>
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const APROVA_URL = 'https://aprova-five.vercel.app';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: tsx scripts/send-custom-invite.ts <email>');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!resendKey) {
    console.error('Falta RESEND_API_KEY em .env.local');
    process.exit(1);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Gera magic-link via Supabase Admin (NAO envia email)
  console.log(`1. Gerando magic-link pra ${email}...`);
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${APROVA_URL}/dashboard`,
    },
  });

  if (linkErr) {
    console.error(`✗ generateLink falhou: ${linkErr.message}`);
    process.exit(1);
  }

  const magicLink =
    (linkData?.properties as { action_link?: string } | undefined)?.action_link;
  if (!magicLink) {
    console.error('✗ action_link nao retornado pelo Supabase');
    console.error(JSON.stringify(linkData, null, 2));
    process.exit(1);
  }
  console.log(`   ✓ magic-link gerado (${magicLink.length} chars)`);

  // 2. Le template e injeta o link
  console.log(`2. Renderizando template...`);
  const templatePath = join(ROOT, 'docs/email-templates/magic-link-aprova.html');
  const template = readFileSync(templatePath, 'utf8');
  const html = template.replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, magicLink);
  console.log(`   ✓ HTML renderizado (${html.length} chars)`);

  // 3. Envia via Resend
  console.log(`3. Enviando via Resend...`);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'APROVA <onboarding@resend.dev>',
      to: [email],
      subject: 'Bem-vinda ao APROVA · seu acesso',
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`✗ Resend retornou ${res.status}:`);
    console.error(errText);
    process.exit(1);
  }

  const json = (await res.json()) as { id?: string };
  console.log(`   ✓ Email enviado!`);
  console.log(`   resend_id: ${json.id ?? '(sem id)'}`);
  console.log(`\nDestinatario: ${email}`);
  console.log(`Remetente:    APROVA <onboarding@resend.dev>`);
  console.log(`Magic-link valido por 1 hora apos gerado.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
