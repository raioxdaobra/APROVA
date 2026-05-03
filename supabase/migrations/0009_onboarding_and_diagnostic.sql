-- =============================================================================
-- 0009_onboarding_and_diagnostic.sql
--
-- PR 4 — Auth + Onboarding + Walking skeleton.
--
-- Mudanças:
--   1. profiles.onboarding_completed (boolean, default false)
--   2. public.get_diagnostic_questions() — RPC SECURITY DEFINER que devolve 1
--      questão de cada disciplina principal (matematica, fisica, quimica,
--      biologia, humanas), filtrada por subtópicos com >= 5 questões não-anuladas.
--   3. fn_update_streak_on_attempt e fn_update_weekly_xp_on_attempt: skip de
--      attempts pertencentes a study_sessions.type = 'diagnostic'. O resto do
--      corpo é cópia idêntica da versão final em 0006_review_fixes.sql — apenas
--      o early-return é novo.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles.onboarding_completed
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- -----------------------------------------------------------------------------
-- 2. public.get_diagnostic_questions()
-- -----------------------------------------------------------------------------
create or replace function public.get_diagnostic_questions()
returns table (
  id text,
  discipline text,
  subtopic text,
  subtopic_short text,
  year int,
  semester int,
  question_num int,
  image_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  d text;
begin
  for d in select unnest(array['matematica','fisica','quimica','biologia','humanas']::text[])
  loop
    return query
      select q.id, q.discipline, q.subtopic, q.subtopic_short,
             q.year, q.semester, q.question_num, q.image_url
      from public.questions q
      where q.exam = 'unifor-medicina'
        and not q.annulled
        and q.discipline = d
        and q.subtopic in (
          select subtopic from public.questions
          where exam = 'unifor-medicina'
            and not annulled
            and discipline = d
          group by subtopic
          having count(*) >= 5
        )
      order by random()
      limit 1;
  end loop;
end;
$$;

revoke all on function public.get_diagnostic_questions() from public;
grant execute on function public.get_diagnostic_questions() to authenticated;

-- -----------------------------------------------------------------------------
-- 3. fn_update_streak_on_attempt — patch: skip diagnostic
-- -----------------------------------------------------------------------------
-- Cópia do corpo final de 0006 (linhas 60-109) com 5 linhas novas (declaração
-- de is_diag + bloco de check no início).
create or replace function public.fn_update_streak_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := public.aprova_today();
  v_last  date;
  v_curr  int;
  v_long  int;
  v_is_diag boolean := false;  -- PR4
begin
  -- PR4: skip diagnostic sessions
  if new.session_id is not null then
    select coalesce(s.type = 'diagnostic', false) into v_is_diag
      from public.study_sessions s where s.id = new.session_id;
    if v_is_diag then return new; end if;
  end if;

  if new.answer is null or new.is_correct is null then
    return new;
  end if;
  if new.time_spent_sec is null or new.time_spent_sec < 2 then
    return new;
  end if;

  select last_active_date, current_streak, longest_streak
    into v_last, v_curr, v_long
  from public.streaks
  where user_id = new.user_id;

  if not found then
    insert into public.streaks (user_id, current_streak, longest_streak, last_active_date, updated_at)
    values (new.user_id, 1, 1, v_today, now());
    return new;
  end if;

  if v_last = v_today then
    return new;
  elsif v_last = v_today - 1 then
    v_curr := coalesce(v_curr, 0) + 1;
  else
    v_curr := 1;
  end if;

  v_long := greatest(coalesce(v_long, 0), v_curr);

  update public.streaks
     set current_streak = v_curr,
         longest_streak = v_long,
         last_active_date = v_today,
         updated_at = now()
   where user_id = new.user_id;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. fn_update_weekly_xp_on_attempt — patch: skip diagnostic
-- -----------------------------------------------------------------------------
-- Cópia do corpo final de 0006 (linhas 518-639, incluindo FIX 5 — filtrar
-- annulled na contagem de domínio) com 5 linhas novas no início.
create or replace function public.fn_update_weekly_xp_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := new.user_id;
  v_today date := public.aprova_today();
  v_week_start date;
  v_repeated_count int;
  v_subtopic text;
  v_discipline text;
  v_attempts_in_subtopic int;
  v_correct_in_subtopic int;
  v_already_mastered boolean;
  v_threshold int;
  v_xp_to_add int;
  v_xp_today int;
  v_xp_remaining int;
  v_xp_actual int;
  v_bonus int := 0;
  v_is_diag boolean := false;  -- PR4
begin
  -- PR4: skip diagnostic sessions
  if new.session_id is not null then
    select coalesce(s.type = 'diagnostic', false) into v_is_diag
      from public.study_sessions s where s.id = new.session_id;
    if v_is_diag then return new; end if;
  end if;

  if new.answer is null or new.is_correct is null then
    return new;
  end if;
  if new.time_spent_sec is null or new.time_spent_sec < 2 then
    return new;
  end if;

  select count(*) into v_repeated_count
  from (
    select answer
    from public.attempts
    where user_id = v_user
      and id <> new.id
    order by created_at desc, id desc
    limit 29
  ) recent
  where recent.answer = new.answer;

  if v_repeated_count >= 29 then
    return new;
  end if;

  v_xp_to_add := 10 + case when new.is_correct then 5 else 0 end;

  select q.subtopic, q.discipline
    into v_subtopic, v_discipline
  from public.questions q
  where q.id = new.question_id;

  if v_subtopic is not null then
    select exists(
      select 1 from public.subtopic_mastery
      where user_id = v_user
        and discipline = v_discipline
        and subtopic = v_subtopic
    ) into v_already_mastered;

    if not v_already_mastered then
      select count(*),
             count(*) filter (where a.is_correct)
        into v_attempts_in_subtopic, v_correct_in_subtopic
      from public.attempts a
      join public.questions q on q.id = a.question_id
      where a.user_id = v_user
        and q.subtopic = v_subtopic
        and q.discipline = v_discipline
        and coalesce(q.annulled, false) = false
        and a.answer is not null
        and a.is_correct is not null;

      v_threshold := least(6, (
        select count(*) from public.questions
        where discipline = v_discipline
          and subtopic = v_subtopic
          and coalesce(annulled, false) = false
      ));

      if v_threshold > 0
         and v_attempts_in_subtopic >= v_threshold
         and v_correct_in_subtopic::numeric / v_attempts_in_subtopic >= 0.75 then
        insert into public.subtopic_mastery (user_id, discipline, subtopic, granted_at)
        values (v_user, v_discipline, v_subtopic, now())
        on conflict (user_id, discipline, subtopic) do nothing;
        v_bonus := 200;
      end if;
    end if;
  end if;

  v_xp_to_add := v_xp_to_add + v_bonus;

  insert into public.daily_xp (user_id, day, xp)
  values (v_user, v_today, 0)
  on conflict (user_id, day) do nothing;

  select xp into v_xp_today
  from public.daily_xp
  where user_id = v_user and day = v_today
  for update;

  v_xp_remaining := greatest(0, 2000 - v_xp_today);
  v_xp_actual := least(v_xp_to_add, v_xp_remaining);

  if v_xp_actual > 0 then
    update public.daily_xp
       set xp = xp + v_xp_actual
     where user_id = v_user and day = v_today;
  end if;

  v_week_start := public.aprova_week_start(v_today);

  insert into public.weekly_xp (user_id, week_start, xp, questions_answered)
  values (v_user, v_week_start, v_xp_actual, 1)
  on conflict (user_id, week_start) do update
    set xp = public.weekly_xp.xp + excluded.xp,
        questions_answered = public.weekly_xp.questions_answered + 1;

  return new;
end;
$$;
