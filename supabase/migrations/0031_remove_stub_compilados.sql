-- 0031_remove_stub_compilados.sql
--
-- Remove os 474 stubs do PR 24 (compilados em OUTROS/) que foram aplicados por
-- engano em produção. Esses stubs têm `description` placeholder porque os PDFs
-- são imagens (não texto extraível) — não podem ser respondidos no quiz.
--
-- Mantém histórico de attempts caso algum user tenha clicado neles, mas remove
-- as questões em si pra limpar o pool de quiz/simulado.
--
-- Idempotente: executar 2x não faz nada na 2ª.

begin;

-- Apaga attempts órfãs nessas questões (fk on delete cascade pode não estar setada)
delete from public.attempts
where question_id in (
  select id from public.questions
  where description like '[Questão em imagem%]'
);

-- Apaga as questões stub
delete from public.questions
where description like '[Questão em imagem%]';

commit;
