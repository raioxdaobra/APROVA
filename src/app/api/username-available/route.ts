import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const USERNAME_REGEX = /^[a-z0-9_]+$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const u = url.searchParams.get('u')?.trim() ?? '';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (u.length < 3) {
    return NextResponse.json({ available: false, reason: 'too_short' });
  }
  if (u.length > 20 || !USERNAME_REGEX.test(u)) {
    return NextResponse.json({ available: false, reason: 'invalid' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', u)
    .neq('id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }

  if (data) {
    return NextResponse.json({ available: false, reason: 'taken' });
  }
  return NextResponse.json({ available: true });
}
