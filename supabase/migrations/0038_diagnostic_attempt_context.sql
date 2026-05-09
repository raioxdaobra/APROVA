-- 0038_diagnostic_attempt_context.sql
--
-- BUG CRITICO encontrado durante teste E2E:
-- Apos terminar as 5 questoes do diagnostico, o usuario ficava em limbo
-- (nada acontecia). Causa: a check constraint `attempts_context_valid`
-- (criada em 0001_initial_schema.sql) so permitia ('quiz', 'revisao',
-- 'simulado', 'review') mas o action `finishDiagnostic` insere linhas
-- com `context='diagnostic'`. Constraint falhava silenciosamente,
-- action retornava erro mas UI ficava paralisada (phase='submitting'
-- eterno).
--
-- Fix: dropar e recriar a constraint incluindo 'diagnostic'.
-- Idempotente.
--
-- Acompanha 0037 (que fez o mesmo pra study_sessions).

begin;

alter table public.attempts
  drop constraint if exists attempts_context_valid;

alter table public.attempts
  add constraint attempts_context_valid
  check (context in ('quiz', 'revisao', 'simulado', 'review', 'diagnostic'));

commit;
