-- =============================================================================
-- 0018_paywall.sql
--
-- PR 13 (W1) — Paywall + plano (free/pro).
--
--   1. profiles: adiciona colunas plan, plan_expires_at, questions_used_count,
--      simulados_used_count para suportar limites do plano free e expiração
--      do plano pro.
--   2. subscriptions: metadata do Stripe (customer_id, subscription_id, status,
--      current_period_end). PK = user_id (1:1 com profile). RLS: usuário lê
--      apenas o próprio registro; escrita restrita a service role (webhook).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles — colunas de paywall
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists plan text not null default 'free'
    constraint profiles_plan_valid check (plan in ('free','pro')),
  add column if not exists plan_expires_at timestamptz,
  add column if not exists questions_used_count int not null default 0,
  add column if not exists simulados_used_count int not null default 0;

-- -----------------------------------------------------------------------------
-- 2. subscriptions — metadata do Stripe
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive'
    constraint subscriptions_status_valid
    check (status in ('active','past_due','canceled','inactive')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_stripe_customer
  on public.subscriptions (stripe_customer_id);
create index if not exists idx_subscriptions_stripe_subscription
  on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- (sem políticas de INSERT/UPDATE/DELETE — escrita exclusivamente via service
-- role no webhook do Stripe)

comment on table public.subscriptions is
  'Metadata do Stripe (1:1 com profiles). Apenas service role escreve via webhook.';
