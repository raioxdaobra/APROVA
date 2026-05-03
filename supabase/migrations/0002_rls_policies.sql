-- =============================================================================
-- Migration 0002 — Row Level Security (RLS)
-- =============================================================================
-- Habilita RLS em todas as 7 tabelas + auxiliares e cria políticas conforme
-- PRD seção 7:
--   - profiles: usuário lê/atualiza apenas o próprio
--   - questions: SELECT aberto para autenticados (catálogo público)
--   - attempts: SELECT/INSERT apenas user_id = auth.uid(); sem UPDATE/DELETE
--   - study_sessions: SELECT/INSERT/UPDATE apenas o próprio
--   - weekly_xp: SELECT apenas o próprio (writes só via trigger)
--   - streaks: SELECT apenas o próprio (writes só via trigger)
--   - user_question_status: SELECT/INSERT/UPDATE apenas o próprio
--   - subtopic_mastery / simulado_bonuses: SELECT apenas o próprio
--
-- Triggers e funções rodam com privilégios do owner (SECURITY DEFINER quando
-- necessário) para conseguir gravar em weekly_xp e streaks mesmo sem
-- política de INSERT/UPDATE para o usuário comum.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- questions — catálogo público para autenticados, somente leitura
-- -----------------------------------------------------------------------------
alter table public.questions enable row level security;

drop policy if exists questions_select_authenticated on public.questions;
create policy questions_select_authenticated on public.questions
  for select to authenticated
  using (true);

-- (sem políticas de INSERT/UPDATE/DELETE — bloqueado para usuários comuns)

-- -----------------------------------------------------------------------------
-- attempts — append-only por usuário
-- -----------------------------------------------------------------------------
alter table public.attempts enable row level security;

drop policy if exists attempts_select_own on public.attempts;
create policy attempts_select_own on public.attempts
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists attempts_insert_own on public.attempts;
create policy attempts_insert_own on public.attempts
  for insert to authenticated
  with check (auth.uid() = user_id);

-- (sem UPDATE/DELETE — attempts são imutáveis)

-- -----------------------------------------------------------------------------
-- study_sessions
-- -----------------------------------------------------------------------------
alter table public.study_sessions enable row level security;

drop policy if exists study_sessions_select_own on public.study_sessions;
create policy study_sessions_select_own on public.study_sessions
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists study_sessions_insert_own on public.study_sessions;
create policy study_sessions_insert_own on public.study_sessions
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists study_sessions_update_own on public.study_sessions;
create policy study_sessions_update_own on public.study_sessions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (sem DELETE — preserva histórico)

-- -----------------------------------------------------------------------------
-- weekly_xp — somente leitura para o usuário; gravação via triggers
-- -----------------------------------------------------------------------------
alter table public.weekly_xp enable row level security;

drop policy if exists weekly_xp_select_own on public.weekly_xp;
create policy weekly_xp_select_own on public.weekly_xp
  for select to authenticated
  using (auth.uid() = user_id);

-- (sem INSERT/UPDATE/DELETE direto — apenas triggers/functions com SECURITY DEFINER)

-- -----------------------------------------------------------------------------
-- streaks — somente leitura para o usuário; gravação via triggers
-- -----------------------------------------------------------------------------
alter table public.streaks enable row level security;

drop policy if exists streaks_select_own on public.streaks;
create policy streaks_select_own on public.streaks
  for select to authenticated
  using (auth.uid() = user_id);

-- (sem INSERT/UPDATE/DELETE direto — apenas triggers/functions com SECURITY DEFINER)

-- -----------------------------------------------------------------------------
-- user_question_status
-- -----------------------------------------------------------------------------
alter table public.user_question_status enable row level security;

drop policy if exists user_question_status_select_own on public.user_question_status;
create policy user_question_status_select_own on public.user_question_status
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_question_status_insert_own on public.user_question_status;
create policy user_question_status_insert_own on public.user_question_status
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists user_question_status_update_own on public.user_question_status;
create policy user_question_status_update_own on public.user_question_status
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (sem DELETE)

-- -----------------------------------------------------------------------------
-- subtopic_mastery — somente leitura para o usuário; writes via trigger
-- -----------------------------------------------------------------------------
alter table public.subtopic_mastery enable row level security;

drop policy if exists subtopic_mastery_select_own on public.subtopic_mastery;
create policy subtopic_mastery_select_own on public.subtopic_mastery
  for select to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- simulado_bonuses — somente leitura para o usuário; writes via function
-- -----------------------------------------------------------------------------
alter table public.simulado_bonuses enable row level security;

drop policy if exists simulado_bonuses_select_own on public.simulado_bonuses;
create policy simulado_bonuses_select_own on public.simulado_bonuses
  for select to authenticated
  using (auth.uid() = user_id);
