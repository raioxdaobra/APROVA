/**
 * GET resolução pré-gerada para uma questão.
 * Auth obrigatória; resposta pública dentro do app autenticado.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

type AnyDb = SupabaseClient;

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { data } = await (supabase as AnyDb)
    .from('question_solutions')
    .select('content_md, conclusion, generated_by, reviewed')
    .eq('question_id', context.params.id)
    .maybeSingle();
  return NextResponse.json({ solution: data ?? null });
}
