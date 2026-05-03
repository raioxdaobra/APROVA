-- =============================================================================
-- Migration 0006 — Fixes do code review (PR 2)
-- =============================================================================
-- FIX 1 — Helpers de timezone (America/Fortaleza) e uso nos triggers/funcoes.
-- FIX 2 — Cap diario 2.000 XP atomico via tabela daily_xp + SELECT FOR UPDATE.
--
-- Migrations sao append-only: nao editamos 0001-0005, apenas criamos 0006+.
-- Demais fixes do review (RLS leak, threshold dominio, annulled, indexes,
-- CHECK constraints) serao adicionados a este arquivo nos proximos commits.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FIX 1.a — Helpers de timezone
-- -----------------------------------------------------------------------------
create or replace function public.aprova_today()
returns date
language sql
stable
as $$ select (timezone('America/Fortaleza', now()))::date $$;

create or replace function public.aprova_week_start(d date default null)
returns date
language sql
stable
as $$
  select (date_trunc('week', coalesce(d, public.aprova_today())))::date
$$;

-- -----------------------------------------------------------------------------
-- FIX 2.a — Tabela daily_xp para cap diario atomico
-- -----------------------------------------------------------------------------
-- Antes: somava XP do dia recalculando attempts em cada trigger -> race
-- condition. Agora: linha por (user, day) atualizada com SELECT FOR UPDATE
-- garante que o teto de 2.000 XP seja respeitado mesmo sob concorrencia.
create table if not exists public.daily_xp (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  xp int not null default 0 check (xp >= 0),
  primary key (user_id, day)
);

alter table public.daily_xp enable row level security;
drop policy if exists daily_xp_select_own on public.daily_xp;
create policy daily_xp_select_own on public.daily_xp
  for select to authenticated
  using (auth.uid() = user_id);

-- Nenhuma policy de INSERT/UPDATE: a tabela e gravada apenas pelo trigger
-- SECURITY DEFINER fn_update_weekly_xp_on_attempt.

-- -----------------------------------------------------------------------------
-- FIX 1.b — update_streak_on_attempt usando aprova_today()
-- -----------------------------------------------------------------------------
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
begin
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
-- FIX 2.b — update_weekly_xp_on_attempt com cap diario atomico (daily_xp)
-- -----------------------------------------------------------------------------
-- Mudancas:
--   * Inserir linha em daily_xp (idempotente) e fazer SELECT ... FOR UPDATE
--     para ler o XP do dia sob lock de linha.
--   * Calcular v_xp_actual = least(v_xp_to_add, 2000 - daily_xp.xp).
--   * Persistir em daily_xp e weekly_xp na mesma transacao.
--   * Bonus de dominio (200 XP) tambem passa pelo mesmo cap atomico.
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
  v_xp_to_add int;
  v_xp_today int;
  v_xp_remaining int;
  v_xp_actual int;
  v_bonus int := 0;
begin
  if new.answer is null or new.is_correct is null then
    return new;
  end if;
  if new.time_spent_sec is null or new.time_spent_sec < 2 then
    return new;
  end if;

  -- Anti-cheat de sequencia: 30 attempts identicas em sequencia => zero XP.
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

  -- XP base do attempt (10 base + 5 acerto)
  v_xp_to_add := 10 + case when new.is_correct then 5 else 0 end;

  -- Bonus de dominio de subtopico (200 XP, unico por subtopico)
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
        and a.answer is not null
        and a.is_correct is not null;

      if v_attempts_in_subtopic >= 6
         and v_correct_in_subtopic::numeric / v_attempts_in_subtopic >= 0.75 then
        insert into public.subtopic_mastery (user_id, discipline, subtopic, granted_at)
        values (v_user, v_discipline, v_subtopic, now())
        on conflict (user_id, discipline, subtopic) do nothing;
        v_bonus := 200;
      end if;
    end if;
  end if;

  v_xp_to_add := v_xp_to_add + v_bonus;

  -- Cap diario atomico: garante a linha em daily_xp e trava-a com FOR UPDATE.
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

  -- Persistir em weekly_xp (sempre incrementa questions_answered, mesmo se
  -- o XP foi capado a zero, para coerencia com o significado do contador).
  v_week_start := public.aprova_week_start(v_today);

  insert into public.weekly_xp (user_id, week_start, xp, questions_answered)
  values (v_user, v_week_start, v_xp_actual, 1)
  on conflict (user_id, week_start) do update
    set xp = public.weekly_xp.xp + excluded.xp,
        questions_answered = public.weekly_xp.questions_answered + 1;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- FIX 1.d — award_simulado_xp usando aprova_week_start()
-- -----------------------------------------------------------------------------
create or replace function public.award_simulado_xp(p_session_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_type text;
  v_correct int;
  v_duration int;
  v_time_limit int;
  v_started timestamptz;
  v_filters jsonb;
  v_xp_total int;
  v_week_start date;
  v_already boolean;
  v_caller uuid := auth.uid();
begin
  select user_id, type, correct_count, duration_sec, started_at, filters
    into v_user_id, v_type, v_correct, v_duration, v_started, v_filters
  from public.study_sessions
  where id = p_session_id;

  if not found then
    raise exception 'study_session % nao encontrada', p_session_id;
  end if;

  if v_caller is not null and v_caller <> v_user_id then
    raise exception 'usuario nao autorizado a conceder bonus para session %', p_session_id;
  end if;

  if v_type <> 'simulado' then
    raise exception 'session % nao e do tipo simulado', p_session_id;
  end if;

  select exists (
    select 1 from public.simulado_bonuses where session_id = p_session_id
  ) into v_already;

  if v_already then
    return 0;
  end if;

  v_xp_total := 100 + coalesce(v_correct, 0) * 20;

  v_time_limit := nullif(v_filters->>'time_limit_sec', '')::int;
  if v_time_limit is not null
     and v_duration is not null
     and v_duration <= v_time_limit then
    v_xp_total := v_xp_total + 200;
  end if;

  insert into public.simulado_bonuses (session_id, user_id, xp_awarded, awarded_at)
  values (p_session_id, v_user_id, v_xp_total, now())
  on conflict (session_id) do nothing;

  v_week_start := public.aprova_week_start(
    coalesce(v_started::date, public.aprova_today())
  );

  insert into public.weekly_xp (user_id, week_start, xp, questions_answered)
  values (v_user_id, v_week_start, v_xp_total, 0)
  on conflict (user_id, week_start) do update
    set xp = public.weekly_xp.xp + excluded.xp;

  return v_xp_total;
end;
$$;

revoke all on function public.award_simulado_xp(uuid) from public;
grant execute on function public.award_simulado_xp(uuid) to authenticated;
