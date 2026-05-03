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

  const [
    { data: profile },
    { data: attempts },
    { data: sessions },
    { data: status },
    { data: weekly },
    { data: streak },
    { data: mastery },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, username, display_name, city, target_exam, daily_goal_questions, is_public_in_leaderboard, onboarding_completed, created_at, updated_at',
      )
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('attempts')
      .select('id, question_id, answer, is_correct, time_spent_sec, context, session_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('study_sessions')
      .select('id, type, filters, started_at, ended_at, total_questions, correct_count, duration_sec')
      .eq('user_id', user.id)
      .order('started_at', { ascending: true }),
    supabase
      .from('user_question_status')
      .select('question_id, status, updated_at')
      .eq('user_id', user.id),
    supabase
      .from('weekly_xp')
      .select('week_start, xp, questions_answered')
      .eq('user_id', user.id)
      .order('week_start', { ascending: true }),
    supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_active_date, updated_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('subtopic_mastery')
      .select('discipline, subtopic, granted_at')
      .eq('user_id', user.id),
  ]);

  const exportPayload = {
    exported_at: new Date().toISOString(),
    schema_version: 1,
    profile: profile ?? null,
    streak: streak ?? null,
    attempts: attempts ?? [],
    study_sessions: sessions ?? [],
    user_question_status: status ?? [],
    weekly_xp: weekly ?? [],
    subtopic_mastery: mastery ?? [],
  };

  const username = profile?.username ?? 'aprova';
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `aprova-${username}-${dateStr}.json`;

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
}
