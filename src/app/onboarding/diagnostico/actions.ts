'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function startDiagnostic(): Promise<void> {
  redirect('/diagnostico');
}

export async function skipDiagnostic(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);

  if (error) {
    throw new Error('Falha ao concluir onboarding.');
  }

  redirect('/dashboard');
}
