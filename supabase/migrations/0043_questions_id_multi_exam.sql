-- =============================================================================
-- 0043 — questions.id aceita prefixo de prova (multi-vestibular)
-- =============================================================================
-- O check `questions_id_format` (migration 0007) exigia o formato exato
-- '{ano}-{semestre}_Q{num}' — herança do MVP single-exam (só Unifor).
--
-- Com o ENEM entrando, os IDs precisam de um prefixo pra não colidir com os
-- do Unifor no PRIMARY KEY (ex.: Unifor '2023-1_Q41' vs ENEM '2023-1_Q041').
-- Esta migration amplia o check pra aceitar um prefixo OPCIONAL de prova:
--
--   Unifor (inalterado):  2023-1_Q41
--   ENEM:                 enem_2023-1_Q091
--
-- ADITIVA: o prefixo é opcional — todos os IDs Unifor existentes continuam
-- válidos. Nenhuma row é alterada. Idempotente (drop + add constraint).
-- =============================================================================

begin;

alter table public.questions
  drop constraint if exists questions_id_format;

alter table public.questions
  add constraint questions_id_format
  check (id ~ '^([a-z][a-z0-9-]*_)?[0-9]{4}-[12]_Q[0-9]+$');

commit;
