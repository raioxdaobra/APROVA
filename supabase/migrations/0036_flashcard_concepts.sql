-- 0036_flashcard_concepts.sql
-- Conceitos extraídos de cada questão pra virarem flashcards de texto puro.
-- Uma linha por question_id. Geração offline via IA (script generate-flashcards.ts).
-- Questões puramente visuais ou que não têm conceito extraível NÃO ganham linha.
--
-- O Anki/SRS (tabela flashcard_reviews da migration 0035) consome esta tabela:
-- só vira card o que tiver linha aqui.
--
-- Idempotente.

begin;

create table if not exists public.flashcard_concepts (
  question_id text primary key references public.questions(id) on delete cascade,
  front_text text not null
    constraint flashcard_concepts_front_nonempty check (length(trim(front_text)) > 0)
    constraint flashcard_concepts_front_max check (length(front_text) <= 600),
  back_text text not null
    constraint flashcard_concepts_back_nonempty check (length(trim(back_text)) > 0)
    constraint flashcard_concepts_back_max check (length(back_text) <= 800),
  generated_at timestamptz not null default now(),
  model text
);

create index if not exists idx_flashcard_concepts_generated
  on public.flashcard_concepts (generated_at desc);

-- Public read (sem RLS — conteúdo derivado de questões já públicas)
alter table public.flashcard_concepts enable row level security;

drop policy if exists flashcard_concepts_read_all on public.flashcard_concepts;
create policy flashcard_concepts_read_all
  on public.flashcard_concepts for select
  using (true);

-- View atualizada: só questões que TÊM conceito gerado entram no pool de revisão.
-- Drop+create porque colunas mudam (description/image_url/correct_answer saem).
drop view if exists public.flashcards_available;

create view public.flashcards_available as
  select
    q.id as question_id,
    q.discipline,
    q.subtopic,
    q.year,
    q.semester,
    fc.front_text,
    fc.back_text
  from public.questions q
  join public.flashcard_concepts fc on fc.question_id = q.id
  where q.annulled = false;

grant select on public.flashcards_available to authenticated, anon;

commit;
