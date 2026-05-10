-- =============================================================================
-- 0042 — Adiciona coluna pedagogy (jsonb) em public.questions
-- =============================================================================
-- Pra analise pedagogica das questoes Unifor: nivel de Bloom, tipo,
-- formato, estrategia dos distratores, complexidade estimada.
--
-- Como em 0041 (alternatives), esta coluna NAO e usada pra renderizar
-- a questao no UI. Existe APENAS para analise estatistica offline e
-- producao do cheat-sheet.
-- =============================================================================

begin;

alter table public.questions
  add column if not exists pedagogy jsonb;

comment on column public.questions.pedagogy is
  'Classificacao pedagogica via OCR multimodal (Groq Llama 4 Scout). '
  'Schema: {bloom, tipo, formato, estrategia_distratores, complexidade, '
  'palavra_chave_enunciado}. Uso EXCLUSIVO para analise estatistica.';

-- Index pra buscar pendentes (pedagogy is null)
create index if not exists idx_questions_pedagogy_pending
  on public.questions (id)
  where pedagogy is null;

commit;
