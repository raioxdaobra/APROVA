'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Server action invocada quando o user clica num card de prova ATIVA na
 * tela /inicio. Salva profiles.active_exam e manda ele pro dashboard.
 *
 * Fase 1 (multi-vestibular): só Unifor está ativa. ENEM/UECE também passam
 * por aqui no futuro mas hoje os cards deles são desabilitados.
 *
 * Spec: docs/superpowers/specs/2026-05-09-multi-vestibular-design.md
 */
export async function setActiveExam(exam: string): Promise<void> {
  // Whitelist defensiva — nunca aceitar valor que o check da tabela rejeita.
  const allowed = new Set(['unifor-medicina', 'enem', 'uece']);
  if (!allowed.has(exam)) {
    throw new Error(`Prova inválida: ${exam}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ active_exam: exam })
    .eq('id', user.id);

  if (error) {
    throw new Error(`Falha ao definir prova ativa: ${error.message}`);
  }

  // Revalida o dashboard pra que ele recarregue com o exam novo (Fase 2).
  revalidatePath('/dashboard');
  revalidatePath('/inicio');
  redirect('/dashboard');
}
