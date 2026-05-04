'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

async function ensureAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sessão expirada.' };
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false, error: 'Acesso negado.' };
  return { ok: true };
}

async function setStatus(userId: string, status: 'pending' | 'approved' | 'blocked') {
  const guard = await ensureAdmin();
  if (!guard.ok) {
    return { ok: false, error: guard.error };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_set_account_status', {
    target_user_id: userId,
    new_status: status,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function approveUser(userId: string) {
  return setStatus(userId, 'approved');
}

export async function blockUser(userId: string) {
  return setStatus(userId, 'blocked');
}

export async function unblockUser(userId: string) {
  return setStatus(userId, 'approved');
}

const inviteSchema = z.object({
  email: z.string().trim().email('Email inválido.'),
});

export async function inviteUser(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const guard = await ensureAdmin();
  if (!guard.ok) return { error: guard.error };
  const parsed = inviteSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Email inválido.' };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { error: 'Service role key ausente em prod. Configure SUPABASE_SECRET_KEY no Vercel.' };
  }
  const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: 'https://aprova-five.vercel.app/onboarding/perfil',
  });
  if (error) {
    if (error.message?.includes('already')) {
      return { error: 'Esse email já tem cadastro.' };
    }
    return { error: error.message };
  }
  // Marca como aprovado direto (atalho do admin)
  if (data?.user?.id) {
    await admin
      .from('profiles')
      .upsert({ id: data.user.id, account_status: 'approved' }, { onConflict: 'id' });
  }
  revalidatePath('/admin/usuarios');
  return { ok: true };
}
