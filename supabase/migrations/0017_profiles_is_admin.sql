-- =============================================================================
-- 0017_profiles_is_admin.sql
--
-- Garante que profiles.is_admin existe (foi adicionado manualmente durante o
-- smoke test do PR 4 sem migration formal). Idempotente — não afeta DBs que
-- já têm a coluna.
-- =============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists idx_profiles_is_admin on public.profiles (is_admin) where is_admin = true;
