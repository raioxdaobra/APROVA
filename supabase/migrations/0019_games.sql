-- =============================================================================
-- 0019_games.sql
--
-- PR 13 (W1) — Mini-games + foco diário.
--
--   1. game_scores         — histórico de partidas (id, user, game_id, score,
--      duration, difficulty, played_at). RLS: dono lê/escreve.
--   2. daily_focus_minutes — minutos de foco por usuário/dia (PK user+day).
--      RLS: dono lê/escreve.
--   3. game_leaderboard    — view com melhor score por jogo + posição. Apenas
--      perfis públicos (is_public_in_leaderboard=true). authenticated lê.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. game_scores
-- -----------------------------------------------------------------------------
create table if not exists public.game_scores (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null,
  score int not null,
  duration_sec int,
  difficulty text,
  played_at timestamptz default now()
);

create index if not exists idx_game_scores_game_score
  on public.game_scores (game_id, score desc);
create index if not exists idx_game_scores_user
  on public.game_scores (user_id, played_at desc);

alter table public.game_scores enable row level security;

drop policy if exists game_scores_select_own on public.game_scores;
create policy game_scores_select_own on public.game_scores
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists game_scores_insert_own on public.game_scores;
create policy game_scores_insert_own on public.game_scores
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists game_scores_update_own on public.game_scores;
create policy game_scores_update_own on public.game_scores
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists game_scores_delete_own on public.game_scores;
create policy game_scores_delete_own on public.game_scores
  for delete to authenticated
  using (auth.uid() = user_id);

-- Política adicional para alimentar a view game_leaderboard com perfis
-- públicos (análoga à weekly_xp_select_public_leaderboard).
drop policy if exists game_scores_select_public_leaderboard on public.game_scores;
create policy game_scores_select_public_leaderboard on public.game_scores
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = game_scores.user_id
        and p.is_public_in_leaderboard = true
    )
  );

-- -----------------------------------------------------------------------------
-- 2. daily_focus_minutes
-- -----------------------------------------------------------------------------
create table if not exists public.daily_focus_minutes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  minutes int not null default 0,
  primary key (user_id, day)
);

alter table public.daily_focus_minutes enable row level security;

drop policy if exists daily_focus_minutes_select_own on public.daily_focus_minutes;
create policy daily_focus_minutes_select_own on public.daily_focus_minutes
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists daily_focus_minutes_insert_own on public.daily_focus_minutes;
create policy daily_focus_minutes_insert_own on public.daily_focus_minutes
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists daily_focus_minutes_update_own on public.daily_focus_minutes;
create policy daily_focus_minutes_update_own on public.daily_focus_minutes
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. game_leaderboard view (pública para authenticated)
-- -----------------------------------------------------------------------------
create or replace view public.game_leaderboard
with (security_invoker = true)
as
select
  g.game_id,
  p.username,
  p.display_name,
  max(g.score) as best_score,
  count(*) as plays,
  row_number() over (
    partition by g.game_id
    order by max(g.score) desc
  ) as position
from public.game_scores g
join public.profiles p on p.id = g.user_id
where p.is_public_in_leaderboard = true
group by g.game_id, p.username, p.display_name;

comment on view public.game_leaderboard is
  'Ranking dos mini-games: best score por jogo. Apenas perfis com is_public_in_leaderboard=true.';

grant select on public.game_leaderboard to authenticated;
