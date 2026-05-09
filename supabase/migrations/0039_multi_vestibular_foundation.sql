-- 0039_multi_vestibular_foundation.sql
--
-- Fase 1 do projeto multi-vestibular. Spec completo em
-- docs/superpowers/specs/2026-05-09-multi-vestibular-design.md
--
-- Adiciona FUNDAÇÃO pra escopar dados por prova:
--   - profiles.active_exam: qual prova o user está estudando agora
--   - exam_interest: leads pra "Quero ser avisado" das provas em breve
--   - colunas exam em tabelas de progresso (weekly_xp, daily_xp,
--     simulado_bonuses, study_sessions, subtopic_mastery, attempts)
--   - weekly_leaderboard view recriada particionando por exam
--
-- Backfill: tudo que existe vira 'unifor-medicina'. Todas as questões
-- atuais já são Unifor; users existentes ficam ativos no Unifor.
--
-- NÃO escopa: streaks (global), flashcard_reviews (global),
-- user_question_status (global). Esses ficam fora por design (ver spec).
--
-- NÃO muda primary keys das tabelas escopadas. Como hoje todos os dados
-- são Unifor (1 prova só), não há conflito de PK. Phase 2 vai mudar PKs
-- quando começarmos a escrever dados de várias provas no mesmo (user, week).
--
-- Idempotente: usa "if not exists" e "drop constraint if exists" em todo
-- lugar, então roda múltiplas vezes sem erro.

begin;

-- =============================================================================
-- 1. profiles.active_exam — qual prova o user está estudando agora
-- =============================================================================
alter table public.profiles
  add column if not exists active_exam text default 'unifor-medicina';

-- Backfill explícito (default só pega rows novos; rows antigos ficariam null).
update public.profiles set active_exam = 'unifor-medicina' where active_exam is null;

alter table public.profiles
  alter column active_exam set not null;

-- Check de valores aceitos. ENEM e UECE entram já porque virão em breve;
-- evita migration extra quando virarem ativas.
alter table public.profiles
  drop constraint if exists profiles_active_exam_valid;
alter table public.profiles
  add constraint profiles_active_exam_valid
  check (active_exam in ('unifor-medicina','enem','uece'));

-- =============================================================================
-- 2. exam_interest — leads "Quero ser avisado" das provas em breve
-- =============================================================================
create table if not exists public.exam_interest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null check (exam in ('enem','uece','unicristus','usp','ufc','outras')),
  created_at timestamptz not null default now(),
  unique (user_id, exam)
);

create index if not exists idx_exam_interest_exam on public.exam_interest (exam);
create index if not exists idx_exam_interest_user on public.exam_interest (user_id);

alter table public.exam_interest enable row level security;

drop policy if exists exam_interest_select_own on public.exam_interest;
create policy exam_interest_select_own on public.exam_interest
  for select using (auth.uid() = user_id);

drop policy if exists exam_interest_insert_own on public.exam_interest;
create policy exam_interest_insert_own on public.exam_interest
  for insert with check (auth.uid() = user_id);

-- =============================================================================
-- 3. Colunas `exam` em tabelas de progresso
-- =============================================================================
-- Padrão: add column with default 'unifor-medicina', not null. O default
-- backfilla rows existentes na própria DDL. Default permanece na coluna pra
-- queries de Fase 2 simplificarem inserts (camada de app pode passar exam
-- explícito ou cair no Unifor que é o ativo).

alter table public.weekly_xp
  add column if not exists exam text not null default 'unifor-medicina';

alter table public.daily_xp
  add column if not exists exam text not null default 'unifor-medicina';

alter table public.simulado_bonuses
  add column if not exists exam text not null default 'unifor-medicina';

alter table public.study_sessions
  add column if not exists exam text not null default 'unifor-medicina';

alter table public.subtopic_mastery
  add column if not exists exam text not null default 'unifor-medicina';

alter table public.attempts
  add column if not exists exam text not null default 'unifor-medicina';

-- Indexes pro filtro principal de Fase 2 — queries vão escopar (user_id, exam).
create index if not exists idx_weekly_xp_user_exam_week
  on public.weekly_xp (user_id, exam, week_start);
create index if not exists idx_daily_xp_user_exam_day
  on public.daily_xp (user_id, exam, day);
create index if not exists idx_attempts_user_exam_created
  on public.attempts (user_id, exam, created_at desc);
create index if not exists idx_study_sessions_user_exam
  on public.study_sessions (user_id, exam);

-- =============================================================================
-- 4. Recriar view weekly_leaderboard particionando por exam
-- =============================================================================
-- Postgres não permite ADD column em VIEW. Precisa drop + recreate.
-- Versão antiga particionava só por week_start; agora cada prova tem seu
-- próprio ranking semanal.

drop view if exists public.weekly_leaderboard;

create view public.weekly_leaderboard
with (security_invoker = true)
as
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
  ) as position
from public.weekly_xp wx
join public.profiles p on p.id = wx.user_id
where p.is_public_in_leaderboard = true;

comment on view public.weekly_leaderboard is
  'Ranking semanal por prova. Particiona por (week_start, exam) — cada prova tem ranking próprio. Spec: docs/superpowers/specs/2026-05-09-multi-vestibular-design.md';

grant select on public.weekly_leaderboard to authenticated;

commit;
