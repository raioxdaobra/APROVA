-- =============================================================================
-- 0028_trilha_streak.sql
--
-- PR 27 — Streak da trilha. Adiciona colunas em `profiles`:
--   - trilha_streak_days int (default 0)
--   - trilha_last_active date
--
-- E cria função `bump_trilha_streak(p_user_id)` que:
--   - Se o user já fez hoje (last = today), retorna o streak atual.
--   - Se fez ontem (last = today - 1 day), incrementa.
--   - Caso contrário, reseta para 1.
--
-- Timezone: America/Fortaleza (alinhado com o resto do app).
-- Idempotente: `add column if not exists` + `create or replace function`.
-- =============================================================================

alter table public.profiles
  add column if not exists trilha_streak_days int not null default 0,
  add column if not exists trilha_last_active date;

create or replace function public.bump_trilha_streak(p_user_id uuid)
returns int as $$
declare
  v_today date := (now() at time zone 'America/Fortaleza')::date;
  v_last date;
  v_streak int;
begin
  select trilha_last_active, trilha_streak_days into v_last, v_streak
  from public.profiles where id = p_user_id;

  if v_last is null or v_last < v_today - interval '1 day' then
    v_streak := 1;
  elsif v_last = v_today - interval '1 day' then
    v_streak := coalesce(v_streak, 0) + 1;
  else
    -- já fez hoje, mantém
    v_streak := coalesce(v_streak, 1);
  end if;

  update public.profiles
    set trilha_streak_days = v_streak, trilha_last_active = v_today
    where id = p_user_id;

  return v_streak;
end;
$$ language plpgsql security definer set search_path = public;

comment on function public.bump_trilha_streak(uuid) is
  'PR 27 — Trilha streak. Atualiza profiles.trilha_streak_days/trilha_last_active e retorna o streak.';

grant execute on function public.bump_trilha_streak(uuid) to authenticated;
