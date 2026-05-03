-- =============================================================================
-- 0013_chat.sql
--
-- PR 12 — AI Helper: chat preso à questão.
--
--   1. question_chats     — 1 thread por (user_id, question_id), mensagens
--      em jsonb [{role:'user'|'assistant', content, ts}]. Exportável por
--      LGPD e apagável com a conta (cascade).
--   2. daily_chat_usage   — contador diário por usuário, hard cap 100/dia.
--   3. global_chat_usage  — contador diário global + breakdown por provedor,
--      hard cap 5000/dia + alerta 80%. RLS: nenhum SELECT user-facing
--      (writes só via service role; leitura via service role no painel admin).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. question_chats
-- -----------------------------------------------------------------------------
create table if not exists public.question_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  msg_count int not null default 0
    constraint question_chats_msg_count_nonneg
    check (msg_count >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, question_id)
);

create index if not exists question_chats_user_idx
  on public.question_chats (user_id, updated_at desc);

alter table public.question_chats enable row level security;

drop policy if exists question_chats_select_own on public.question_chats;
create policy question_chats_select_own on public.question_chats
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists question_chats_insert_own on public.question_chats;
create policy question_chats_insert_own on public.question_chats
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists question_chats_update_own on public.question_chats;
create policy question_chats_update_own on public.question_chats
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (sem DELETE direto — cascata vem de profiles; LGPD apaga via deletar conta)

-- -----------------------------------------------------------------------------
-- 2. daily_chat_usage
-- -----------------------------------------------------------------------------
create table if not exists public.daily_chat_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  msg_count int not null default 0
    constraint daily_chat_usage_msg_count_nonneg
    check (msg_count >= 0),
  primary key (user_id, day)
);

alter table public.daily_chat_usage enable row level security;

drop policy if exists daily_chat_usage_select_own on public.daily_chat_usage;
create policy daily_chat_usage_select_own on public.daily_chat_usage
  for select to authenticated
  using (auth.uid() = user_id);

-- (sem INSERT/UPDATE/DELETE direto — apenas service role / SECURITY DEFINER)

-- -----------------------------------------------------------------------------
-- 3. global_chat_usage
-- -----------------------------------------------------------------------------
create table if not exists public.global_chat_usage (
  day date primary key,
  msg_count int not null default 0
    constraint global_chat_usage_msg_count_nonneg
    check (msg_count >= 0),
  by_provider jsonb not null default '{}'::jsonb
);

alter table public.global_chat_usage enable row level security;

-- (sem políticas para usuários comuns — leitura/escrita só via service role)
