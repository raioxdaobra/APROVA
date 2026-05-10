-- =============================================================================
-- 0041 — Adiciona coluna alternatives (jsonb) em public.questions
-- =============================================================================
-- Pra analise estatistica de padroes da banca Unifor: comprimento medio da
-- correta vs erradas, frequencia de termos absolutos, etc.
--
-- IMPORTANTE: NAO usado pra renderizacao da questao no UI — o image_url
-- continua sendo a fonte de verdade visual. Esta coluna existe APENAS para
-- analise textual offline. Se houver erro de OCR aqui, nao impacta o user.
-- =============================================================================

begin;

alter table public.questions
  add column if not exists alternatives jsonb;

comment on column public.questions.alternatives is
  'Texto transcrito das 5 alternativas via OCR multimodal (Groq Llama 4 Scout). '
  'Formato: {"a": "...", "b": "...", "c": "...", "d": "...", "e": "..."}. '
  'Uso EXCLUSIVO para analise estatistica de padroes — NUNCA para renderizar '
  'a questao (renderizacao continua via image_url).';

-- Index pra buscar questoes ainda nao processadas (alternatives is null)
create index if not exists idx_questions_alternatives_pending
  on public.questions (id)
  where alternatives is null;

commit;
