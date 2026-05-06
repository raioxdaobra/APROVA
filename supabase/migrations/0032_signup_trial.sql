-- 0032_signup_trial.sql
-- Auto-aprovar TODOS os novos signups e conceder trial Pro de 7 dias.
-- Decisão PR 28: 1A=A (sem fila admin), Trial=A (Pro completo por 7 dias).
-- Idempotente: re-rodar não muda nada nem sobrescreve trials existentes.

-- 1) Coluna trial_ends_at
alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

-- 2) Trigger BEFORE INSERT em profiles:
--    - força account_status para 'approved' quando ausente/'pending'
--    - seta trial_ends_at = now() + 7d quando ausente
create or replace function public.set_default_signup_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_status is null or new.account_status = 'pending' then
    new.account_status := 'approved';
  end if;

  if new.trial_ends_at is null then
    new.trial_ends_at := now() + interval '7 days';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_default_signup_state on public.profiles;
create trigger trg_set_default_signup_state
  before insert on public.profiles
  for each row execute function public.set_default_signup_state();

-- 3) Backfill: usuários existentes sem trial_ends_at recebem 7d a partir
--    do created_at (ou now() como fallback).
update public.profiles
set trial_ends_at = coalesce(trial_ends_at, coalesce(created_at, now()) + interval '7 days')
where trial_ends_at is null;
