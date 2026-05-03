'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function startDiagnostic(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Reusa uma sessão de diagnóstico recente (até 10 minutos) e ainda aberta —
  // evita criar linhas duplicadas se o usuário voltar para esta tela.
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('study_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'diagnostic')
    .is('ended_at', null)
    .gt('started_at', tenMinutesAgo)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from('study_sessions')
      .insert({ user_id: user.id, type: 'diagnostic' });
    if (error) {
      throw new Error('Falha ao iniciar diagnóstico.');
    }
  }

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
