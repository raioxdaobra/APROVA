-- =============================================================================
-- 0012_solutions_and_theory.sql
--
-- PR 12 — AI Helper: pre-generated solutions + curated theory by subtopic.
--
--   1. question_solutions  — 1 row per question, markdown body com fórmulas
--      KaTeX + letra de conclusão validada contra o gabarito.
--   2. subtopic_theory     — 1 row por (discipline, subtopic), resumo curto
--      e até 3 links da allowlist (wikipedia, khanacademy, brasilescola, etc.).
--
-- RLS: leitura pública para autenticados (catálogo). Writes apenas via
-- service role nos scripts offline (`scripts/generate-solutions.ts` e
-- `scripts/generate-theory.ts`).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. question_solutions
-- -----------------------------------------------------------------------------
create table if not exists public.question_solutions (
  question_id text primary key references public.questions(id) on delete cascade,
  content_md text not null,
  conclusion char(1) not null
    constraint question_solutions_conclusion_letter
    check (conclusion in ('A','B','C','D','E')),
  generated_by text not null,
  reviewed boolean not null default false,
  generated_at timestamptz default now()
);

alter table public.question_solutions enable row level security;

drop policy if exists question_solutions_select_authenticated on public.question_solutions;
create policy question_solutions_select_authenticated on public.question_solutions
  for select to authenticated
  using (true);

-- (sem políticas de INSERT/UPDATE/DELETE para usuários comuns — apenas service role)

-- -----------------------------------------------------------------------------
-- 2. subtopic_theory
-- -----------------------------------------------------------------------------
create table if not exists public.subtopic_theory (
  discipline text not null,
  subtopic text not null,
  summary_md text not null,
  links jsonb not null default '[]'::jsonb,
  generated_at timestamptz default now(),
  primary key (discipline, subtopic)
);

alter table public.subtopic_theory enable row level security;

drop policy if exists subtopic_theory_select_authenticated on public.subtopic_theory;
create policy subtopic_theory_select_authenticated on public.subtopic_theory
  for select to authenticated
  using (true);

-- (sem políticas de INSERT/UPDATE/DELETE para usuários comuns — apenas service role)
