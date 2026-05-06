-- =============================================================================
-- 0030_trilha_peers.sql
--
-- PR 27 — Multiplayer assíncrono (avatar de colegas). Função que retorna a
-- "estação atual" de até 10 peers (top XP semanal excluindo o próprio user).
--
-- Privacidade:
--   - Só retorna users com profiles.is_public_in_leaderboard = true.
--   - Nunca expõe email, id real é retornado mas pode ser ofuscado no front.
--
-- "Estação atual" = próxima estação desbloqueada e ainda não passada.
-- =============================================================================

create or replace function public.trilha_peers_progress(p_user_id uuid)
returns table (
  peer_id uuid,
  peer_username text,
  peer_display_name text,
  current_station_id text,
  current_rank int,
  current_position int,
  completed_count int
) as $$
  with current_week as (
    select date_trunc('week', (now() at time zone 'America/Fortaleza'))::date as week_start
  ),
  top_peers as (
    select
      p.id,
      p.username,
      p.display_name,
      coalesce(wx.xp, 0) as week_xp
    from public.profiles p
    left join public.weekly_xp wx
      on wx.user_id = p.id
      and wx.week_start = (select week_start from current_week)
    where p.id <> p_user_id
      and p.is_public_in_leaderboard = true
    order by week_xp desc
    limit 10
  ),
  peer_sessions as (
    select
      s.user_id,
      s.filters->>'trilha_station_id' as station_id,
      s.total_questions,
      s.correct_count,
      case
        when coalesce(s.total_questions, 0) > 0 then
          round((coalesce(s.correct_count, 0)::numeric / s.total_questions::numeric) * 100, 0)
        else 0
      end as score_pct
    from public.study_sessions s
    where s.user_id in (select id from top_peers)
      and s.filters ? 'trilha_station_id'
  ),
  peer_station_best as (
    select
      ps.user_id,
      ps.station_id,
      max(ps.score_pct) as best_score_pct
    from peer_sessions ps
    where ps.station_id is not null
    group by ps.user_id, ps.station_id
  ),
  peer_passed as (
    select
      psb.user_id,
      psb.station_id,
      st.rank,
      st.position_in_rank,
      st.unlocks_after,
      psb.best_score_pct >= st.passing_pct as is_passed
    from peer_station_best psb
    join public.trilha_stations st on st.id = psb.station_id
  ),
  peer_completed_count as (
    select user_id, count(*)::int as completed_count
    from peer_passed
    where is_passed
    group by user_id
  ),
  peer_current_station as (
    -- Próxima estação desbloqueada e ainda não passed.
    select distinct on (st_all.peer_id)
      st_all.peer_id,
      st_all.station_id,
      st_all.rank,
      st_all.position_in_rank
    from (
      select
        tp.id as peer_id,
        st.id as station_id,
        st.rank,
        st.position_in_rank,
        st.unlocks_after,
        coalesce(pp_self.is_passed, false) as is_passed,
        case
          when st.unlocks_after is null then true
          else coalesce(pp_prev.is_passed, false)
        end as is_unlocked
      from top_peers tp
      cross join public.trilha_stations st
      left join peer_passed pp_self
        on pp_self.user_id = tp.id and pp_self.station_id = st.id
      left join peer_passed pp_prev
        on pp_prev.user_id = tp.id and pp_prev.station_id = st.unlocks_after
      where st.rank is not null
    ) st_all
    where st_all.is_unlocked and not st_all.is_passed
    order by st_all.peer_id, st_all.rank, st_all.position_in_rank
  )
  select
    tp.id as peer_id,
    tp.username as peer_username,
    tp.display_name as peer_display_name,
    pcs.station_id as current_station_id,
    pcs.rank as current_rank,
    pcs.position_in_rank as current_position,
    coalesce(pcc.completed_count, 0) as completed_count
  from top_peers tp
  left join peer_current_station pcs on pcs.peer_id = tp.id
  left join peer_completed_count pcc on pcc.user_id = tp.id
  where pcs.station_id is not null;
$$ language sql security definer set search_path = public;

comment on function public.trilha_peers_progress(uuid) is
  'PR 27 — Trilha peers. Retorna top 10 peers (week_xp) com sua estação atual na trilha.';

grant execute on function public.trilha_peers_progress(uuid) to authenticated;
