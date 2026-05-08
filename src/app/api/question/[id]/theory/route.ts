/**
 * GET teoria de um subtópico.
 *
 * - Tenta cache em `subtopic_theory`.
 * - Se vazio: gera on-demand via chain LLM, persiste e retorna.
 * - Em caso de falha total: retorna { theory: null }.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrGenerateTeoria } from '@/lib/llm/on-demand';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const discipline = url.searchParams.get('discipline')?.trim();
  const subtopic = url.searchParams.get('subtopic')?.trim();
  if (!discipline || !subtopic) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  const theory = await getOrGenerateTeoria(supabase, discipline, subtopic);
  return NextResponse.json({ theory: theory ?? null });
}
