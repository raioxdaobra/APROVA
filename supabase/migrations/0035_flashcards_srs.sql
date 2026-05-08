-- 0035_flashcards_srs.sql
-- Spaced Repetition System (SM-2). Cada linha = estado de uma questão pra um user.
-- Quando o user revê uma questão, upsertamos a linha com novo ease_factor / due_at.
-- Cards "novos" (sem linha) tratam-se como (ease_factor=2.5, reps=0, interval=0, due_at=now()).
--
-- Idempotente: roda 2x sem efeito colateral.

begin;

create table if not exists public.flashcard_reviews (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id),
  ease_factor numeric(4,2) not null default 2.5
    constraint flashcard_reviews_ef_min check (ease_factor >= 1.3),
  interval_days int not null default 0
    constraint flashcard_reviews_interval_nonneg check (interval_days >= 0),
  repetitions int not null default 0
    constraint flashcard_reviews_reps_nonneg check (repetitions >= 0),
  due_at timestamptz not null default now(),
  last_quality smallint
    constraint flashcard_reviews_quality_valid check (last_quality is null or last_quality between 0 and 5),
  total_reviews int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists idx_flashcard_reviews_user_due
  on public.flashcard_reviews (user_id, due_at);

alter table public.flashcard_reviews enable row level security;

drop policy if exists flashcard_reviews_select_own on public.flashcard_reviews;
create policy flashcard_reviews_select_own
  on public.flashcard_reviews for select
  using (auth.uid() = user_id);

drop policy if exists flashcard_reviews_insert_own on public.flashcard_reviews;
create policy flashcard_reviews_insert_own
  on public.flashcard_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists flashcard_reviews_update_own on public.flashcard_reviews;
create policy flashcard_reviews_update_own
  on public.flashcard_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- View: questões disponíveis pra virar flashcard (anuladas excluídas).
create or replace view public.flashcards_available as
  select
    id as question_id,
    discipline,
    subtopic,
    description,
    image_url,
    correct_answer,
    year,
    semester
  from public.questions
  where annulled = false;

grant select on public.flashcards_available to authenticated;

commit;
