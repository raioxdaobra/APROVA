-- =============================================================================
-- Migration 0005 — Função award_simulado_xp(session_id)
-- =============================================================================
-- Concede o bônus de XP de simulado (PRD seção 9):
--   bônus = 100 base + (acertos * 20) + 200 se finalizou dentro do tempo
--           (study_sessions.duration_sec <= filters->>'time_limit_sec')
--
-- Idempotência garantida pela tabela simulado_bonuses (PK = session_id):
-- a função verifica se já foi concedido antes de gravar.
--
-- Segurança: SECURITY DEFINER para escrever em weekly_xp e simulado_bonuses,
-- mas valida que a sessão pertence ao auth.uid() chamador.
-- =============================================================================

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
  -- Carrega a sessão
  select user_id, type, correct_count, duration_sec, started_at, filters
    into v_user_id, v_type, v_correct, v_duration, v_started, v_filters
  from public.study_sessions
  where id = p_session_id;

  if not found then
    raise exception 'study_session % nao encontrada', p_session_id;
  end if;

  -- Apenas o dono da sessão pode chamar (a menos que rodando como service role)
  if v_caller is not null and v_caller <> v_user_id then
    raise exception 'usuario nao autorizado a conceder bonus para session %', p_session_id;
  end if;

  if v_type <> 'simulado' then
    raise exception 'session % nao e do tipo simulado', p_session_id;
  end if;

  -- Idempotência
  select exists (
    select 1 from public.simulado_bonuses where session_id = p_session_id
  ) into v_already;

  if v_already then
    return 0;
  end if;

  -- Cálculo do bônus
  v_xp_total := 100 + coalesce(v_correct, 0) * 20;

  v_time_limit := nullif(v_filters->>'time_limit_sec', '')::int;
  if v_time_limit is not null
     and v_duration is not null
     and v_duration <= v_time_limit then
    v_xp_total := v_xp_total + 200;
  end if;

  -- Persistência (idempotente)
  insert into public.simulado_bonuses (session_id, user_id, xp_awarded, awarded_at)
  values (p_session_id, v_user_id, v_xp_total, now())
  on conflict (session_id) do nothing;

  -- Soma em weekly_xp na semana em que o simulado foi feito
  v_week_start := date_trunc('week', coalesce(v_started, now()))::date;

  insert into public.weekly_xp (user_id, week_start, xp, questions_answered)
  values (v_user_id, v_week_start, v_xp_total, 0)
  on conflict (user_id, week_start) do update
    set xp = public.weekly_xp.xp + excluded.xp;

  return v_xp_total;
end;
$$;

revoke all on function public.award_simulado_xp(uuid) from public;
grant execute on function public.award_simulado_xp(uuid) to authenticated;
