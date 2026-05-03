'use server';

import { revalidatePath } from 'next/cache';
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
