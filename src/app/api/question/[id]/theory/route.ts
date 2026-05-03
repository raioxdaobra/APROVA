/**
 * GET teoria do subtópico (recebe discipline e subtopic em query string).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

type AnyDb = SupabaseClient;

export const dynamic = 'force-dynamic';

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
  const { data } = await (supabase as AnyDb)
    .from('subtopic_theory')
    .select('summary_md, links')
    .eq('discipline', discipline)
    .eq('subtopic', subtopic)
    .maybeSingle();
  return NextResponse.json({ theory: data ?? null });
}
