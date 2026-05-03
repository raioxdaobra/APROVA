-- =============================================================================
-- 0011_profiles_favorite_discipline.sql
--
-- PR 11 — Tela de Configurações (8.12).
--
-- Adiciona coluna profiles.favorite_discipline para permitir ao usuário marcar
-- a disciplina favorita opcional. As 6 disciplinas refletem `Discipline` no
-- src/lib/supabase/types.ts.
-- =============================================================================

alter table public.profiles
  add column if not exists favorite_discipline text
  check (
    favorite_discipline is null
    or favorite_discipline in (
      'matematica',
      'fisica',
      'quimica',
      'biologia',
      'humanas',
      'linguagens'
    )
  );
