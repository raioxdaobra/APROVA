-- =============================================================================
-- 0010_fix_diagnostic_rpc.sql
--
-- Fix: get_diagnostic_questions() em 0009 colidia OUT params da RETURNS TABLE
-- com colunas de public.questions (subtopic, discipline, etc.). Solução:
-- pragma `#variable_conflict use_column` no topo do bloco PL/pgSQL — assim
-- referências não-qualificadas resolvem para a coluna da tabela, não para o
-- OUT param.
-- =============================================================================

create or replace function public.get_diagnostic_questions()
returns table (
  id text,
  discipline text,
  subtopic text,
  subtopic_short text,
  year int,
  semester int,
  question_num int,
  image_url text
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  d text;
begin
  for d in select unnest(array['matematica','fisica','quimica','biologia','humanas']::text[])
  loop
    return query
      select q.id, q.discipline, q.subtopic, q.subtopic_short,
             q.year, q.semester, q.question_num, q.image_url
      from public.questions q
      where q.exam = 'unifor-medicina'
        and not q.annulled
        and q.discipline = d
        and q.subtopic in (
          select subtopic from public.questions
          where exam = 'unifor-medicina'
            and not annulled
            and discipline = d
          group by subtopic
          having count(*) >= 5
        )
      order by random()
      limit 1;
  end loop;
end;
$$;
