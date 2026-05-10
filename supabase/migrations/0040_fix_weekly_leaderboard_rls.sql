-- =============================================================================
-- 0040 — Fix RLS do weekly_leaderboard pra qualquer usuario ver o ranking
-- =============================================================================
-- Problema: a migration 0039 dropou e recriou a view weekly_leaderboard com
-- `security_invoker = true`, lendo weekly_xp + profiles diretamente. Como a
-- RLS de weekly_xp tem policy weekly_xp_select_own (cada user só vê sua
-- propria linha), QUALQUER user nao-admin que consulta a view via cliente
-- recebe SO sua propria linha — ranking some pra ele.
--
-- A migration 0006 ja tinha resolvido esse problema usando uma function
-- SECURITY DEFINER (fn_weekly_leaderboard) que roda com privilegios do owner
-- e bypassa RLS, expondo SO colunas seguras (username, display_name, xp,
-- questions_answered, position). 0039 perdeu essa solucao ao recriar a view
-- diretamente — esta migration restaura.
--
-- Mudancas:
--   - Recria fn_weekly_leaderboard com novo parametro `exam_filter` pra
--     suportar a particionamento por prova adicionado em 0039.
--   - Recria a view weekly_leaderboard chamando essa funcao.
-- =============================================================================

begin;

-- Drop versao quebrada (security_invoker) introduzida em 0039.
drop view if exists public.weekly_leaderboard;

-- Drop funcao antiga (sem suporte a exam) pra recriar com parametro novo.
drop function if exists public.fn_weekly_leaderboard();
drop function if exists public.fn_weekly_leaderboard(text);

-- Recria com SECURITY DEFINER + suporte a exam. Quando exam_filter e null,
-- retorna ranking de todas as provas (compat com codigo antigo).
create function public.fn_weekly_leaderboard(exam_filter text default null)
returns table (
  username text,
  display_name text,
  week_start date,
  exam text,
  xp int,
  questions_answered int,
  "position" bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    p.username,
    p.display_name,
    wx.week_start,
    wx.exam,
    wx.xp,
    wx.questions_answered,
    rank() over (
      partition by wx.week_start, wx.exam
      order by wx.xp desc, wx.questions_answered desc
    ) as "position"
  from public.weekly_xp wx
  join public.profiles p on p.id = wx.user_id
  where p.is_public_in_leaderboard = true
    and (exam_filter is null or wx.exam = exam_filter)
$$;

revoke all on function public.fn_weekly_leaderboard(text) from public;
grant execute on function public.fn_weekly_leaderboard(text) to authenticated;

-- View thin: mantem a interface SELECT * FROM weekly_leaderboard usada pelo
-- codigo cliente. Como nao passa exam_filter, retorna todas as provas — o
-- cliente aplica .eq('exam', '...') por cima se quiser filtrar.
create view public.weekly_leaderboard as
  select * from public.fn_weekly_leaderboard(null);

comment on view public.weekly_leaderboard is
  'Ranking semanal publico via fn_weekly_leaderboard (SECURITY DEFINER). '
  'Expoe SO colunas seguras (username, display_name, exam, xp, questions_answered, position). '
  'Filtrado por is_public_in_leaderboard=true. Particionado por (week_start, exam).';

grant select on public.weekly_leaderboard to authenticated;

commit;
