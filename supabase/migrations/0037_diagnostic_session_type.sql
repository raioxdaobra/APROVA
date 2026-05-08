-- 0037_diagnostic_session_type.sql
--
-- BUG CRITICO encontrado em prod 2026-05-08:
-- Onboarding /onboarding/diagnostico → "Fazer diagnóstico" disparava
-- Application error 500 (Digest 2656171610). Causa: a check constraint
-- `study_sessions_type_valid` (criada em 0001_initial_schema.sql) só permitia
-- 'quiz', 'revisao', 'simulado' — mas o action `startDiagnostic` insere
-- linhas com `type='diagnostic'`. Constraint falhava no insert.
--
-- Fix: dropar e recriar a constraint incluindo 'diagnostic'.
-- Idempotente.

begin;

alter table public.study_sessions
  drop constraint if exists study_sessions_type_valid;

alter table public.study_sessions
  add constraint study_sessions_type_valid
  check (type in ('quiz', 'revisao', 'simulado', 'diagnostic'));

commit;
