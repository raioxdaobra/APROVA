-- =============================================================================
-- Migration 0004 — Triggers de gamificação
-- =============================================================================
-- Implementa as três regras de gamificação descritas no PRD seção 9, todas
-- disparadas após INSERT em attempts:
--
--   1) update_user_question_status_on_attempt
--      Atualiza public.user_question_status para 'correct'/'wrong' SEM
--      sobrescrever 'toreview' marcado manualmente.
--
--   2) update_streak_on_attempt
--      Mantém public.streaks. Anti-cheat: ignora attempts com
--      time_spent_sec < 2.
--
--   3) update_weekly_xp_on_attempt
--      Calcula XP (10 base + 5 acerto), aplica anti-cheat (time >= 2,
--      cap diário 2.000 XP, descarte se últimas 30 attempts tiveram a
--      mesma answer) e concede bônus de 200 XP por domínio de subtópico
--      (>=6 attempts no subtopic com aproveitamento >=75%) registrando
--      em subtopic_mastery para evitar duplicação.
--
-- Todas as funções rodam com SECURITY DEFINER para conseguir gravar em
-- tabelas com RLS restritiva (weekly_xp, streaks, subtopic_mastery).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) user_question_status
-- -----------------------------------------------------------------------------
create or replace function public.fn_update_user_question_status_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_status text;
  v_existing_status text;
begin
  -- attempt válido: usuário respondeu (answer não nula) e is_correct foi
  -- determinado (não anulada).
  if new.answer is null or new.is_correct is null then
    return new;
  end if;

  v_new_status := case when new.is_correct then 'correct' else 'wrong' end;

  select status into v_existing_status
  from public.user_question_status
  where user_id = new.user_id
    and question_id = new.question_id;

  -- Não sobrescrever 'toreview' marcado manualmente.
  if v_existing_status = 'toreview' then
    return new;
  end if;

  insert into public.user_question_status (user_id, question_id, status, updated_at)
  values (new.user_id, new.question_id, v_new_status, now())
  on conflict (user_id, question_id) do update
    set status = excluded.status,
        updated_at = now()
    where public.user_question_status.status <> 'toreview';

  return new;
end;
$$;

drop trigger if exists trg_update_user_question_status_on_attempt on public.attempts;
create trigger trg_update_user_question_status_on_attempt
after insert on public.attempts
for each row execute function public.fn_update_user_question_status_on_attempt();

-- -----------------------------------------------------------------------------
-- 2) streaks
-- -----------------------------------------------------------------------------
create or replace function public.fn_update_streak_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_last  date;
  v_curr  int;
  v_long  int;
begin
  -- attempt válido + anti-cheat de tempo (< 2s ignorado).
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
    -- já contou hoje, nada muda
    return new;
  elsif v_last = v_today - 1 then
    v_curr := coalesce(v_curr, 0) + 1;
  else
    -- last is null ou < hoje - 1: reseta para 1
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

drop trigger if exists trg_update_streak_on_attempt on public.attempts;
create trigger trg_update_streak_on_attempt
after insert on public.attempts
for each row execute function public.fn_update_streak_on_attempt();

-- -----------------------------------------------------------------------------
-- 3) weekly_xp + subtopic mastery
-- -----------------------------------------------------------------------------
create or replace function public.fn_update_weekly_xp_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xp_gained int;
  v_week_start date;
  v_today date := current_date;
  v_xp_today int;
  v_repeated_count int;
  v_subtopic text;
  v_discipline text;
  v_attempts_in_subtopic int;
  v_correct_in_subtopic int;
  v_already_mastered boolean;
begin
  -- attempt válido + anti-cheat de tempo
  if new.answer is null or new.is_correct is null then
    return new;
  end if;
  if new.time_spent_sec is null or new.time_spent_sec < 2 then
    return new;
  end if;

  -- Anti-cheat de sequência: se as últimas 30 attempts tiveram TODAS a mesma
  -- answer (incluindo a atual), descarta o XP mas mantém o INSERT.
  -- Verificamos as 30 mais recentes (excluindo a atual) com mesma answer.
  select count(*) into v_repeated_count
  from (
    select answer
    from public.attempts
    where user_id = new.user_id
      and id <> new.id
    order by created_at desc, id desc
    limit 29
  ) recent
  where recent.answer = new.answer;

  if v_repeated_count >= 29 then
    -- 29 anteriores idênticas + a atual = 30 idênticas em sequência
    return new;
  end if;

  -- XP base
  v_xp_gained := 10 + case when new.is_correct then 5 else 0 end;

  -- Cap diário de 2.000 XP: somar XP já ganho hoje (regra equivalente)
  -- Estimativa: 10 por attempt válido + 5 por acerto, dentro do dia.
  select coalesce(
           sum(10 + case when a.is_correct then 5 else 0 end),
           0
         )
    into v_xp_today
  from public.attempts a
  where a.user_id = new.user_id
    and a.id <> new.id
    and a.answer is not null
    and a.is_correct is not null
    and a.time_spent_sec >= 2
    and a.created_at::date = v_today;

  if v_xp_today >= 2000 then
    -- já bateu o teto, descarta ganho deste attempt
    v_xp_gained := 0;
  elsif v_xp_today + v_xp_gained > 2000 then
    v_xp_gained := 2000 - v_xp_today;
  end if;

  -- Bônus de domínio de subtópico (200 XP, único por subtópico)
  select q.subtopic, q.discipline
    into v_subtopic, v_discipline
  from public.questions q
  where q.id = new.question_id;

  if v_subtopic is not null then
    select exists(
      select 1 from public.subtopic_mastery
      where user_id = new.user_id
        and discipline = v_discipline
        and subtopic = v_subtopic
    ) into v_already_mastered;

    if not v_already_mastered then
      select count(*),
             count(*) filter (where a.is_correct)
        into v_attempts_in_subtopic, v_correct_in_subtopic
      from public.attempts a
      join public.questions q on q.id = a.question_id
      where a.user_id = new.user_id
        and q.subtopic = v_subtopic
        and q.discipline = v_discipline
        and a.answer is not null
        and a.is_correct is not null;

      if v_attempts_in_subtopic >= 6
         and v_correct_in_subtopic::numeric / v_attempts_in_subtopic >= 0.75 then
        insert into public.subtopic_mastery (user_id, discipline, subtopic, granted_at)
        values (new.user_id, v_discipline, v_subtopic, now())
        on conflict (user_id, discipline, subtopic) do nothing;

        -- bônus único de 200 XP, ainda respeitando o cap diário
        if v_xp_today + v_xp_gained < 2000 then
          v_xp_gained := least(v_xp_gained + 200, 2000 - v_xp_today);
        end if;
      end if;
    end if;
  end if;

  -- Persistir em weekly_xp (semana ISO: segunda-feira)
  v_week_start := date_trunc('week', v_today)::date;

  insert into public.weekly_xp (user_id, week_start, xp, questions_answered)
  values (new.user_id, v_week_start, v_xp_gained, 1)
  on conflict (user_id, week_start) do update
    set xp = public.weekly_xp.xp + excluded.xp,
        questions_answered = public.weekly_xp.questions_answered + 1;

  return new;
end;
$$;

drop trigger if exists trg_update_weekly_xp_on_attempt on public.attempts;
create trigger trg_update_weekly_xp_on_attempt
after insert on public.attempts
for each row execute function public.fn_update_weekly_xp_on_attempt();
