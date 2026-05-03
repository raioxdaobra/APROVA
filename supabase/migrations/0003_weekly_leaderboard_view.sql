-- =============================================================================
-- Migration 0003 — view weekly_leaderboard
-- =============================================================================
-- View pública (leitura para autenticados) que agrega weekly_xp e expõe apenas
-- usuários que optaram por aparecer (profiles.is_public_in_leaderboard = true).
--
-- Privacidade:
--   - Nunca expõe email, id (uuid), created_at ou outros dados pessoais.
--   - Mostra apenas: display_name, username, week_start, xp,
--     questions_answered e position (rank por xp dentro da semana).
--
-- security_invoker = true: a view aplica as políticas RLS do usuário que
-- consulta. Isso garante que weekly_xp_select_own (que filtra por
-- auth.uid() = user_id) seja relaxado pelo join+filter explícito de
-- is_public_in_leaderboard. Para que a view funcione, weekly_xp precisa
-- permitir leitura cruzada — por isso adicionamos uma política específica
-- de leitura pública no contexto do leaderboard.
-- =============================================================================

-- Política adicional: permite a leitura de weekly_xp de outros usuários SOMENTE
-- quando o profile correspondente tem is_public_in_leaderboard = true.
-- Mantém a semântica de privacidade do PRD.
drop policy if exists weekly_xp_select_public_leaderboard on public.weekly_xp;
create policy weekly_xp_select_public_leaderboard on public.weekly_xp
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = weekly_xp.user_id
        and p.is_public_in_leaderboard = true
    )
  );

-- Política análoga em profiles para permitir o join na view ler display_name
-- e username de quem optou por aparecer.
drop policy if exists profiles_select_public_leaderboard on public.profiles;
create policy profiles_select_public_leaderboard on public.profiles
  for select to authenticated
  using (is_public_in_leaderboard = true);

-- View do leaderboard
create or replace view public.weekly_leaderboard
with (security_invoker = true)
as
select
  p.username,
  p.display_name,
  wx.week_start,
  wx.xp,
  wx.questions_answered,
  rank() over (
    partition by wx.week_start
    order by wx.xp desc, wx.questions_answered desc
  ) as position
from public.weekly_xp wx
join public.profiles p on p.id = wx.user_id
where p.is_public_in_leaderboard = true;

comment on view public.weekly_leaderboard is
  'Ranking semanal público: agrega weekly_xp e profiles.is_public_in_leaderboard. Nunca expõe email, id ou created_at.';

grant select on public.weekly_leaderboard to authenticated;
