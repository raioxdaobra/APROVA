-- =============================================================================
-- 0014_gamification.sql
--
-- PR 12 — Gamification: badges, missões diárias, settings globais.
--
--   1. achievements       — catálogo público dos 15 badges (id, title,
--      description, icon, rarity). Read-only para autenticados, write só
--      via service role / scripts/seed-achievements.ts.
--   2. user_achievements  — desbloqueios por usuário (composite PK).
--   3. daily_missions     — 3 missões geradas por usuário/dia, jsonb com
--      progress.
--   4. app_settings       — chave/valor global (target_date do vestibular,
--      futuras flags). Seed: vestibular_target_date='2026-12-15'.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. achievements
-- -----------------------------------------------------------------------------
create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  rarity text not null
    constraint achievements_rarity_valid
    check (rarity in ('common','rare','epic','legendary'))
);

alter table public.achievements enable row level security;

drop policy if exists achievements_select_authenticated on public.achievements;
create policy achievements_select_authenticated on public.achievements
  for select to authenticated
  using (true);

-- (sem políticas de INSERT/UPDATE/DELETE — service role apenas)

-- -----------------------------------------------------------------------------
-- 2. user_achievements
-- -----------------------------------------------------------------------------
create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

create index if not exists user_achievements_user_idx
  on public.user_achievements (user_id, unlocked_at desc);

alter table public.user_achievements enable row level security;

drop policy if exists user_achievements_select_own on public.user_achievements;
create policy user_achievements_select_own on public.user_achievements
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_achievements_insert_own on public.user_achievements;
create policy user_achievements_insert_own on public.user_achievements
  for insert to authenticated
  with check (auth.uid() = user_id);

-- (sem UPDATE/DELETE — desbloqueios são imutáveis)

-- -----------------------------------------------------------------------------
-- 3. daily_missions
-- -----------------------------------------------------------------------------
create table if not exists public.daily_missions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  missions jsonb not null default '[]'::jsonb,
  primary key (user_id, day)
);

alter table public.daily_missions enable row level security;

drop policy if exists daily_missions_select_own on public.daily_missions;
create policy daily_missions_select_own on public.daily_missions
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists daily_missions_insert_own on public.daily_missions;
create policy daily_missions_insert_own on public.daily_missions
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists daily_missions_update_own on public.daily_missions;
create policy daily_missions_update_own on public.daily_missions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. app_settings
-- -----------------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.app_settings enable row level security;

drop policy if exists app_settings_select_authenticated on public.app_settings;
create policy app_settings_select_authenticated on public.app_settings
  for select to authenticated
  using (true);

-- (sem políticas de INSERT/UPDATE/DELETE — service role apenas)

-- Seed inicial: countdown do vestibular Unifor Medicina 2026.2 → 15/12/2026.
insert into public.app_settings (key, value)
values ('vestibular_target_date', '"2026-12-15"'::jsonb)
on conflict (key) do nothing;
