-- =============================================================================
-- 0015_question_stats_view.sql
--
-- PR 12 — Materialized view com estatísticas globais por questão usadas
-- pelo chip de dificuldade (Fácil >75%, Média 40-75%, Difícil <40%) e
-- pelo painel de ranking.
--
-- Refresh: `scripts/refresh-question-stats.ts` (refresh materialized view
-- concurrently). Cron Vercel diário ou manual — idempotente.
-- =============================================================================

-- Idempotência: drop & recreate. Materialized views não suportam
-- `create materialized view if not exists` em todas as versões; usamos drop
-- explícito para garantir reaplicação consistente.
drop materialized view if exists public.question_stats;

create materialized view public.question_stats as
  select a.question_id,
         count(*)::int as total_attempts,
         count(*) filter (where a.is_correct)::int as total_correct,
         case when count(*) > 0
              then round(count(*) filter (where a.is_correct)::numeric / count(*) * 100)::int
              else null end as correct_pct
    from public.attempts a
   where a.context in ('quiz','simulado','revisao','review')
     and a.answer is not null
     and a.is_correct is not null
   group by a.question_id;

-- Índice único é necessário para `refresh materialized view concurrently`.
create unique index if not exists question_stats_question_id_idx
  on public.question_stats (question_id);

-- Materialized views herdam permissões da tabela base. Conferimos SELECT
-- explícito para 'authenticated' para garantir leitura pelo cliente.
grant select on public.question_stats to authenticated;
