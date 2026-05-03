-- =============================================================================
-- Migration 0001 — Schema inicial do APROVA
-- =============================================================================
-- Cria as 7 tabelas principais da plataforma conforme PRD seção 7:
--   profiles, questions, study_sessions, attempts, weekly_xp, streaks,
--   user_question_status
--
-- Também cria tabelas auxiliares justificadas pelas regras de gamificação
-- (PRD seção 9):
--   - subtopic_mastery: garante que o bônus de 200 XP por domínio de
--     subtópico seja concedido apenas uma vez.
--   - simulado_bonuses: garante idempotência do bônus de XP de simulado.
--
-- Decisões não óbvias:
--   - questions.id é text porque o formato canônico é "{ano}-{semestre}_Q{num}"
--     (ex.: "2026-1_Q31") — é estável, externamente legível e útil em URLs.
--   - attempts.id é bigserial porque é a tabela de maior cardinalidade.
--   - study_sessions é declarada ANTES de attempts para que a FK
--     attempts.session_id -> study_sessions(id) resolva sem ALTER posterior.
--   - pgcrypto é necessário para gen_random_uuid().
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- profiles — estende auth.users do Supabase
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null
    constraint profiles_username_format
    check (length(username) between 3 and 20 and username ~ '^[a-z0-9_]+$'),
  display_name text not null
    constraint profiles_display_name_length
    check (length(display_name) between 1 and 60),
  city text default 'Fortaleza',
  target_exam text default 'unifor-medicina-2027.1',
  daily_goal_questions int default 20
    constraint profiles_daily_goal_positive
    check (daily_goal_questions > 0),
  is_public_in_leaderboard boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- questions — catálogo (read-only para usuários comuns)
-- -----------------------------------------------------------------------------
create table if not exists public.questions (
  id text primary key,
  discipline text not null,
  subtopic text not null,
  subtopic_short text not null,
  year int not null,
  semester int not null
    constraint questions_semester_valid
    check (semester in (1, 2)),
  question_num int not null,
  description text,
  image_url text not null,
  correct_answer char(1)
    constraint questions_correct_answer_valid
    check (correct_answer in ('A','B','C','D','E')),
  annulled boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_questions_discipline_subtopic
  on public.questions (discipline, subtopic);
create index if not exists idx_questions_prova
  on public.questions (year, semester);

-- -----------------------------------------------------------------------------
-- study_sessions — agrupa attempts (declarada antes de attempts por causa da FK)
-- -----------------------------------------------------------------------------
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null
    constraint study_sessions_type_valid
    check (type in ('quiz', 'revisao', 'simulado')),
  filters jsonb,
  started_at timestamptz default now(),
  ended_at timestamptz,
  total_questions int default 0,
  correct_count int default 0,
  duration_sec int
);

-- -----------------------------------------------------------------------------
-- attempts — tentativas individuais (tabela mais escrita do sistema)
-- -----------------------------------------------------------------------------
create table if not exists public.attempts (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id),
  answer char(1)
    constraint attempts_answer_valid
    check (answer in ('A','B','C','D','E')),
  is_correct boolean,
  time_spent_sec int,
  context text not null
    constraint attempts_context_valid
    check (context in ('quiz', 'revisao', 'simulado', 'review')),
  session_id uuid references public.study_sessions(id),
  created_at timestamptz default now()
);

create index if not exists idx_attempts_user_created
  on public.attempts (user_id, created_at desc);
create index if not exists idx_attempts_user_correct
  on public.attempts (user_id, is_correct);
create index if not exists idx_attempts_user_question
  on public.attempts (user_id, question_id);

-- -----------------------------------------------------------------------------
-- weekly_xp — cache de XP semanal (atualizado por trigger)
-- -----------------------------------------------------------------------------
create table if not exists public.weekly_xp (
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  xp int default 0,
  questions_answered int default 0,
  primary key (user_id, week_start)
);

create index if not exists idx_weekly_xp_week
  on public.weekly_xp (week_start, xp desc);

-- -----------------------------------------------------------------------------
-- streaks — sequência diária por usuário
-- -----------------------------------------------------------------------------
create table if not exists public.streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak int default 0,
  longest_streak int default 0,
  last_active_date date,
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- user_question_status — status pessoal por questão
-- -----------------------------------------------------------------------------
create table if not exists public.user_question_status (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id),
  status text not null
    constraint user_question_status_value_valid
    check (status in ('correct', 'wrong', 'toreview')),
  updated_at timestamptz default now(),
  primary key (user_id, question_id)
);

-- -----------------------------------------------------------------------------
-- subtopic_mastery — auxiliar: registra concessão única do bônus de domínio
-- -----------------------------------------------------------------------------
-- Justificativa: PRD seção 9 exige bônus único de 200 XP por domínio de
-- subtópico (>= 6 attempts com aproveitamento >= 75%). Esta tabela impede
-- concessão duplicada quando um usuário continua resolvendo questões do mesmo
-- subtópico após atingir o domínio.
create table if not exists public.subtopic_mastery (
  user_id uuid not null references public.profiles(id) on delete cascade,
  discipline text not null,
  subtopic text not null,
  granted_at timestamptz default now(),
  primary key (user_id, discipline, subtopic)
);

-- -----------------------------------------------------------------------------
-- simulado_bonuses — auxiliar: idempotência do bônus de XP de simulado
-- -----------------------------------------------------------------------------
-- Justificativa: PRD seção 9 define bônus único por simulado finalizado.
-- A função award_simulado_xp(session_id) consulta esta tabela para garantir
-- que o bônus seja contabilizado apenas uma vez por session_id.
create table if not exists public.simulado_bonuses (
  session_id uuid primary key references public.study_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  xp_awarded int not null,
  awarded_at timestamptz default now()
);
