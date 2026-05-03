-- Adiciona coluna `exam` em questions, com index composto e check de formato.
-- Default 'unifor-medicina' para todo o MVP. Schema preparado para multi-vestibular
-- sem refatoração futura.

alter table public.questions
  add column if not exists exam text not null default 'unifor-medicina';

alter table public.questions
  drop constraint if exists questions_exam_format;
alter table public.questions
  add constraint questions_exam_format check (exam ~ '^[a-z0-9-]+$');

-- Index composto: a maioria das queries filtra por (exam, discipline, subtopic).
create index if not exists idx_questions_exam_discipline_subtopic
  on public.questions (exam, discipline, subtopic);

-- Check de formato no `id`: '{ano}-{semestre}_Q{num}' (ex: 2026-1_Q31)
alter table public.questions
  drop constraint if exists questions_id_format;
alter table public.questions
  add constraint questions_id_format check (id ~ '^[0-9]{4}-[12]_Q[0-9]+$');
