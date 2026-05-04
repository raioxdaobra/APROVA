-- =============================================================================
-- 0020_trilha.sql
--
-- PR 14a — Trilha de evolução estilo Duolingo.
--
--   1. trilha_stations         — catálogo de 40 estações (5 por rank x 8 ranks).
--      RLS: leitura pública (authenticated/anon). Apenas seed/admin escreve.
--   2. user_trilha_progress    — progresso por usuário/estação. RLS: dono.
--   3. user_trilha_full        — view conveniente que junta estações + progresso
--      do usuário corrente (auth.uid()), ordenada por rank e position.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. trilha_stations
-- -----------------------------------------------------------------------------
create table if not exists public.trilha_stations (
  id text primary key,
  rank_id text not null,
  position int not null,
  title text not null,
  description text not null,
  goal_type text not null check (goal_type in (
    'answer_questions',
    'answer_correct',
    'complete_simulado',
    'master_subtopics',
    'reach_streak',
    'complete_diagnostic',
    'play_game',
    'focus_minutes'
  )),
  goal_target int not null,
  goal_filter jsonb,
  xp_reward int not null,
  badge_reward text,
  unique (rank_id, position)
);

create index if not exists idx_trilha_stations_rank
  on public.trilha_stations (rank_id, position);

alter table public.trilha_stations enable row level security;

drop policy if exists trilha_stations_read_all on public.trilha_stations;
create policy trilha_stations_read_all on public.trilha_stations
  for select
  using (true);

-- -----------------------------------------------------------------------------
-- 2. user_trilha_progress
-- -----------------------------------------------------------------------------
create table if not exists public.user_trilha_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  station_id text not null references public.trilha_stations(id) on delete cascade,
  progress int not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, station_id)
);

create index if not exists idx_user_trilha_progress_user
  on public.user_trilha_progress (user_id);

alter table public.user_trilha_progress enable row level security;

drop policy if exists trilha_progress_select_own on public.user_trilha_progress;
create policy trilha_progress_select_own on public.user_trilha_progress
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists trilha_progress_insert_own on public.user_trilha_progress;
create policy trilha_progress_insert_own on public.user_trilha_progress
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists trilha_progress_update_own on public.user_trilha_progress;
create policy trilha_progress_update_own on public.user_trilha_progress
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. user_trilha_full view
--    Junta a estação com o progresso do usuário autenticado (auth.uid()).
--    Usa security_invoker para herdar as RLS das tabelas base.
-- -----------------------------------------------------------------------------
create or replace view public.user_trilha_full
with (security_invoker = true)
as
select
  s.id,
  s.rank_id,
  s.position,
  s.title,
  s.description,
  s.goal_type,
  s.goal_target,
  s.goal_filter,
  s.xp_reward,
  s.badge_reward,
  coalesce(p.progress, 0) as user_progress,
  coalesce(p.completed, false) as user_completed,
  p.completed_at
from public.trilha_stations s
left join public.user_trilha_progress p
  on p.station_id = s.id and p.user_id = auth.uid()
order by
  case s.rank_id
    when 'calouro' then 1
    when 'pre_vest' then 2
    when 'estudante' then 3
    when 'aspirante' then 4
    when 'vestibulando' then 5
    when 'expert' then 6
    when 'genio' then 7
    when 'aprovado' then 8
    else 99
  end,
  s.position;

comment on view public.user_trilha_full is
  'Estações da trilha com o progresso do usuário corrente. Ordenado por rank/position.';

grant select on public.user_trilha_full to authenticated;
