-- =============================================================================
-- Migration 0024 — Sub-filtros para Linguagens (PT/ING/ESP) e Humanas (Hist/Geo/Filo/Soc)
-- =============================================================================
-- Esta migration NÃO altera o schema da tabela `questions`. Apenas cria uma
-- view derivada `questions_classified` com 2 colunas extras:
--
--   - language: 'portugues' | 'ingles' | 'espanhol' | null
--                (null quando discipline != 'linguagens')
--   - subject:  'historia' | 'geografia' | 'filosofia' | 'sociologia' | null
--                (null quando discipline != 'humanas')
--
-- A classificação é feita por regex sobre `questions.subtopic`. As MESMAS regex
-- são replicadas no helper TS `src/lib/stats/sub-filters.ts` para que as
-- contagens server e client batam exatamente.
--
-- IMPORTANTE: a view herda automaticamente a Row Level Security (RLS) da
-- tabela `questions` em PostgreSQL — não precisamos recriar policies.
--
-- Idempotente via `create or replace view`.
-- =============================================================================

create or replace view public.questions_classified as
select
  q.*,
  case
    when q.discipline = 'linguagens'
         and q.subtopic ~* '(^|[^a-z])ingl[eê]s' then 'ingles'
    when q.discipline = 'linguagens'
         and q.subtopic ~* '(^|[^a-z])(espanhol|spanish)' then 'espanhol'
    when q.discipline = 'linguagens' then 'portugues'
    else null
  end as language,
  case
    when q.discipline = 'humanas'
         and q.subtopic ~* '^(hist[oó]ria|history)' then 'historia'
    when q.discipline = 'humanas'
         and q.subtopic ~* '^(geografia|geography)' then 'geografia'
    when q.discipline = 'humanas'
         and q.subtopic ~* '^(filosofia|philosophy)' then 'filosofia'
    when q.discipline = 'humanas'
         and q.subtopic ~* '^(sociologia|sociology|cidadania|trabalho|sociedade)' then 'sociologia'
    when q.discipline = 'humanas' then 'historia'
    else null
  end as subject
from public.questions q;

comment on view public.questions_classified is
  'View derivada de questions com sub-classificação de Linguagens (language) '
  'e Humanas (subject). RLS herdada da tabela base.';

-- Funções auxiliares opcionais — agregam contagens para dashboards/admin.
-- O app principal classifica via helper TypeScript (sub-filters.ts) usando os
-- mesmos regex, então essas funções existem só pra queries SQL ad-hoc.

create or replace function public.top_languages_count()
returns table (language text, total bigint)
language sql
stable
security invoker
as $$
  select language, count(*)::bigint as total
  from public.questions_classified
  where language is not null
    and (annulled is null or annulled = false)
  group by language
  order by total desc;
$$;

create or replace function public.top_subjects_count()
returns table (subject text, total bigint)
language sql
stable
security invoker
as $$
  select subject, count(*)::bigint as total
  from public.questions_classified
  where subject is not null
    and (annulled is null or annulled = false)
  group by subject
  order by total desc;
$$;

comment on function public.top_languages_count() is
  'Contagens agregadas por language (portugues/ingles/espanhol). '
  'Apenas questoes nao anuladas. Use para dashboards.';

comment on function public.top_subjects_count() is
  'Contagens agregadas por subject de Humanas. '
  'Apenas questoes nao anuladas. Use para dashboards.';
