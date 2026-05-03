import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  const [
    profileRes,
    attemptsRes,
    sessionsRes,
    weeklyXpRes,
    streakRes,
    statusRes,
    masteryRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: true }),
    supabase
      .from('weekly_xp')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: true }),
    supabase.from('streaks').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('user_question_status')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: true }),
    supabase
      .from('subtopic_mastery')
      .select('*')
      .eq('user_id', userId)
      .order('granted_at', { ascending: true }),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: userId, email: user.email ?? null },
    profile: profileRes.data ?? null,
    streak: streakRes.data ?? null,
    attempts: attemptsRes.data ?? [],
    study_sessions: sessionsRes.data ?? [],
    weekly_xp: weeklyXpRes.data ?? [],
    user_question_status: statusRes.data ?? [],
    subtopic_mastery: masteryRes.data ?? [],
  };

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `aprova-export-${stamp}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
