'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database, Discipline } from '@/lib/supabase/types';

export type FieldState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const DISCIPLINE_VALUES: ReadonlyArray<Discipline> = [
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
];

// -----------------------------------------------------------------------------
// Conta — display name, username, password
// -----------------------------------------------------------------------------

const displayNameSchema = z.object({
  display_name: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(40, 'Máximo 40 caracteres.'),
});

export async function updateDisplayName(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const parsed = displayNameSchema.safeParse({
    display_name: formData.get('display_name'),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: parsed.data.display_name })
    .eq('id', user.id);
  if (error) return { error: 'Não conseguimos salvar seu nome.' };

  revalidatePath('/configuracoes');
  revalidatePath('/dashboard');
  return { ok: true };
}

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres.')
    .max(20, 'Máximo 20 caracteres.')
    .regex(/^[a-z0-9_]+$/, 'Use só letras minúsculas, números e _.'),
});

export async function updateUsername(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const parsed = usernameSchema.safeParse({
    username: formData.get('username'),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('profiles')
    .update({ username: parsed.data.username })
    .eq('id', user.id);
  if (error) {
    const code = (error as { code?: string }).code ?? '';
    if (code === '23505') return { error: 'Esse username já foi escolhido.' };
    return { error: 'Não conseguimos salvar seu username.' };
  }

  revalidatePath('/configuracoes');
  return { ok: true };
}

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Informe sua senha atual.'),
    new_password: z.string().min(8, 'Mínimo 8 caracteres.'),
    confirm: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'As senhas não coincidem.',
    path: ['confirm'],
  });

export async function updatePassword(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const parsed = passwordSchema.safeParse({
    current_password: formData.get('current_password'),
    new_password: formData.get('new_password'),
    confirm: formData.get('confirm'),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: 'Sessão expirada.' };

  // Re-autenticar com a senha atual antes de trocar
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (signInErr) {
    return { fieldErrors: { current_password: 'Senha atual incorreta.' } };
  }

  const { error: updErr } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });
  if (updErr) return { error: 'Não conseguimos atualizar sua senha.' };

  return { ok: true };
}

// -----------------------------------------------------------------------------
// Estudo — daily goal, favorite discipline
// -----------------------------------------------------------------------------

const dailyGoalSchema = z.object({
  daily_goal: z.coerce.number().int().min(5).max(100),
});

export async function updateDailyGoal(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const parsed = dailyGoalSchema.safeParse({
    daily_goal: formData.get('daily_goal'),
  });
  if (!parsed.success) {
    return { error: 'Escolha um valor entre 5 e 100.' };
  }
  const value = parsed.data.daily_goal;
  if (value % 5 !== 0) {
    return { error: 'Use múltiplos de 5.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('profiles')
    .update({ daily_goal_questions: value })
    .eq('id', user.id);
  if (error) return { error: 'Não conseguimos salvar sua meta.' };

  revalidatePath('/configuracoes');
  revalidatePath('/dashboard');
  return { ok: true };
}

const favoriteSchema = z.object({
  favorite_discipline: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === '' || v === 'none' ? null : v))
    .refine(
      (v) => v === null || v === undefined || DISCIPLINE_VALUES.includes(v as Discipline),
      'Disciplina inválida.',
    ),
});

export async function updateFavoriteDiscipline(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const parsed = favoriteSchema.safeParse({
    favorite_discipline: formData.get('favorite_discipline'),
  });
  if (!parsed.success) {
    return { error: 'Disciplina inválida.' };
  }
  const value = (parsed.data.favorite_discipline ?? null) as Discipline | null;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('profiles')
    .update({ favorite_discipline: value })
    .eq('id', user.id);
  if (error) return { error: 'Não conseguimos salvar sua disciplina.' };

  revalidatePath('/configuracoes');
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Privacidade
// -----------------------------------------------------------------------------

export async function updatePrivacy(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const leaderboard = formData.get('leaderboard') === 'on';
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('profiles')
    .update({ is_public_in_leaderboard: leaderboard })
    .eq('id', user.id);
  if (error) return { error: 'Não conseguimos salvar sua preferência.' };

  revalidatePath('/configuracoes');
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Conta destrutiva — delete + signout
// -----------------------------------------------------------------------------

export async function deleteAccount(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const confirmation = String(formData.get('confirm_username') ?? '').trim();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();
  const username = profile?.username ?? '';
  if (!username || confirmation !== username) {
    return { fieldErrors: { confirm_username: 'Digite seu username para confirmar.' } };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { error: 'Servidor sem credenciais para apagar a conta.' };
  }

  const admin = createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return { error: 'Não conseguimos apagar sua conta. Tente novamente.' };

  await supabase.auth.signOut();
  redirect('/');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
