/**
 * Envia convite de cadastro pra um email via Supabase Auth.
 *
 * Funciona igual ao InviteForm da tela /admin/usuarios — chama
 * supabase.auth.admin.inviteUserByEmail e marca o profile como
 * approved direto (atalho do admin).
 *
 * Uso: tsx scripts/send-invite.ts <email>
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: tsx scripts/send-invite.ts <email>');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // Primeiro tenta como CONVITE NOVO (inviteUserByEmail). Se ja existir,
  // cai pra MAGIC LINK de login (signInWithOtp) — funciona pra conta
  // existente que precisa voltar.
  console.log(`Enviando convite/magic-link pra ${email}...`);

  const { data: inviteData, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://aprova-five.vercel.app/onboarding/perfil',
    });

  if (inviteErr && !inviteErr.message?.includes('already')) {
    console.error(`✗ Erro no invite: ${inviteErr.message}`);
    process.exit(1);
  }

  if (inviteData?.user?.id) {
    console.log(`✓ Convite NOVO enviado (conta criada).`);
    console.log(`  user_id: ${inviteData.user.id}`);
    await admin
      .from('profiles')
      .upsert(
        { id: inviteData.user.id, account_status: 'approved' },
        { onConflict: 'id' },
      );
    return;
  }

  // Conta ja existe — manda magic-link de LOGIN (signInWithOtp).
  // shouldCreateUser=false garante que nao cria conta nova caso o email
  // bata em alguma condicao de borda.
  console.log(`  conta ja existe — enviando magic-link de login`);

  const { error: otpErr } = await admin.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: 'https://aprova-five.vercel.app/dashboard',
    },
  });

  if (otpErr) {
    console.error(`✗ Erro no magic-link: ${otpErr.message}`);
    process.exit(1);
  }

  console.log(`✓ Magic-link enviado!`);
  console.log(`  email: ${email}`);
  console.log(`\nUsuario vai receber email do Supabase com link de login direto.`);
  console.log(`Ao clicar: vai pra https://aprova-five.vercel.app/dashboard sem precisar de senha.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
