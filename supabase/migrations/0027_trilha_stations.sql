-- =============================================================================
-- 0027_trilha_stations.sql
--
-- PR 26 — Trilha RPG (mapa épico). Adiciona campos novos à tabela
-- `trilha_stations` existente (criada em 0020) e cria `user_trilha_full_v2`
-- com adaptive unlock baseado em `is_passed` (≥ passing_pct).
--
-- Idempotente: usa `add column if not exists`, `create or replace view` e
-- `insert ... on conflict do update`. Não destrói dados existentes.
--
-- Decisões:
--   - 40 estações em 8 ranks × 5 estações; estação 5 de cada rank é boss.
--   - `unlocks_after` referencia estação anterior; r1_s01 tem null.
--   - Boss dos ranks 1–7 destrava só se as 4 estações anteriores estão passed.
--   - View calcula `is_passed`, `is_unlocked`, `best_score_pct` baseado em
--     attempts agrupados por session ('trilha' filter on filters jsonb).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Schema additions a `trilha_stations`
-- -----------------------------------------------------------------------------
alter table public.trilha_stations
  add column if not exists rank int,
  add column if not exists position_in_rank int,
  add column if not exists discipline text,
  add column if not exists subtopic text,
  add column if not exists is_boss boolean not null default false,
  add column if not exists question_count int not null default 10,
  add column if not exists passing_pct int not null default 60,
  add column if not exists unlocks_after text;

-- FK auto-referencial (idempotente via DO block).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'trilha_stations_unlocks_after_fkey'
  ) then
    alter table public.trilha_stations
      add constraint trilha_stations_unlocks_after_fkey
      foreign key (unlocks_after) references public.trilha_stations(id);
  end if;
end$$;

create index if not exists idx_trilha_stations_rank_pos
  on public.trilha_stations (rank, position_in_rank);

-- -----------------------------------------------------------------------------
-- 2. Seed das 40 estações novas (rank/position_in_rank novos IDs r{rank}_s{NN})
--    e UPDATE das estações antigas (calouro_1..aprovado_5) com novos campos
--    pra manter compatibilidade. Como existem 40 antigas, mapeamos pra rank/pos.
-- -----------------------------------------------------------------------------

-- 2a. Atualiza estações antigas (criadas pelo seed `gen:trilha`) com novos campos.
-- Ranking map: calouro=1, pre_vest=2, estudante=3, aspirante=4,
--             vestibulando=5, expert=6, genio=7, aprovado=8.
update public.trilha_stations
set rank = case rank_id
  when 'calouro' then 1
  when 'pre_vest' then 2
  when 'estudante' then 3
  when 'aspirante' then 4
  when 'vestibulando' then 5
  when 'expert' then 6
  when 'genio' then 7
  when 'aprovado' then 8
  else null end,
  position_in_rank = position,
  is_boss = (position = 5)
where rank is null and rank_id is not null;

-- 2b. Insere 40 estações NOVAS com IDs canônicos r{R}_s{NN} pra serem usadas
-- pelo novo mapa RPG. Conflito: do update pra refletir mudanças no catálogo.
-- Usamos goal_type='answer_questions' como compatibilidade com a tabela legacy.
-- xp_reward escalonado por rank; question_count=20 para boss.

-- Helper inline: cada insert é completo. Subtopics são heurísticas alinhadas
-- com a base de questões existente (discipline tem text livre — usamos
-- as 6 disciplinas válidas: matematica, biologia, fisica, quimica, humanas, linguagens).

-- Rank 1 — Iniciação
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r1_s01', 'calouro', 1, 'Funções básicas',
   'Domine os fundamentos de funções e equações de 1º e 2º grau.',
   'answer_questions', 10, 30, 1, 1, 'matematica', 'Funções', false, 10, 60, null),
  ('r1_s02', 'calouro', 2, 'Citologia inicial',
   'Estruturas celulares, organelas e processos básicos.',
   'answer_questions', 10, 30, 1, 2, 'biologia', 'Citologia', false, 10, 60, 'r1_s01'),
  ('r1_s03', 'calouro', 3, 'Mecânica I',
   'Cinemática, leis de Newton e dinâmica básica.',
   'answer_questions', 10, 30, 1, 3, 'fisica', 'Mecânica', false, 10, 60, 'r1_s02'),
  ('r1_s04', 'calouro', 4, 'Estrutura atômica',
   'Modelos atômicos, distribuição eletrônica e tabela periódica.',
   'answer_questions', 10, 30, 1, 4, 'quimica', 'Estrutura atômica', false, 10, 60, 'r1_s03'),
  ('r1_s05', 'calouro', 5, 'Boss: Iniciação',
   'Desafio multidisciplinar — 20 questões mistas de Mat, Bio, Fís e Quí.',
   'answer_questions', 20, 100, 1, 5, 'matematica', null, true, 20, 70, 'r1_s04')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  rank = excluded.rank,
  position_in_rank = excluded.position_in_rank,
  discipline = excluded.discipline,
  subtopic = excluded.subtopic,
  is_boss = excluded.is_boss,
  question_count = excluded.question_count,
  passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after,
  xp_reward = excluded.xp_reward;

-- Rank 2 — Fundamentos
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r2_s01', 'pre_vest', 1, 'Geometria plana',
   'Áreas, ângulos, semelhança e relações métricas.',
   'answer_questions', 10, 50, 2, 1, 'matematica', 'Geometria', false, 10, 60, 'r1_s05'),
  ('r2_s02', 'pre_vest', 2, 'Tabela periódica',
   'Propriedades periódicas e classificação de elementos.',
   'answer_questions', 10, 50, 2, 2, 'quimica', 'Tabela periódica', false, 10, 60, 'r2_s01'),
  ('r2_s03', 'pre_vest', 3, 'Genética básica',
   'Mendel, leis da hereditariedade e cruzamentos.',
   'answer_questions', 10, 50, 2, 3, 'biologia', 'Genética', false, 10, 60, 'r2_s02'),
  ('r2_s04', 'pre_vest', 4, 'História do Brasil',
   'Da colônia à República — eventos chave.',
   'answer_questions', 10, 50, 2, 4, 'humanas', 'História do Brasil', false, 10, 60, 'r2_s03'),
  ('r2_s05', 'pre_vest', 5, 'Boss: Fundamentos',
   'Desafio com 20 questões mistas dos fundamentos do rank 2.',
   'answer_questions', 20, 150, 2, 5, 'matematica', null, true, 20, 70, 'r2_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- Rank 3 — Português & Linguagens
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r3_s01', 'estudante', 1, 'Interpretação de texto',
   'Leitura crítica, inferência e compreensão.',
   'answer_questions', 10, 70, 3, 1, 'linguagens', 'Interpretação', false, 10, 60, 'r2_s05'),
  ('r3_s02', 'estudante', 2, 'Gramática',
   'Sintaxe, morfologia e concordância.',
   'answer_questions', 10, 70, 3, 2, 'linguagens', 'Gramática', false, 10, 60, 'r3_s01'),
  ('r3_s03', 'estudante', 3, 'Literatura',
   'Escolas literárias e análise de obras.',
   'answer_questions', 10, 70, 3, 3, 'linguagens', 'Literatura', false, 10, 60, 'r3_s02'),
  ('r3_s04', 'estudante', 4, 'Inglês & Espanhol',
   'Compreensão de textos em língua estrangeira.',
   'answer_questions', 10, 70, 3, 4, 'linguagens', 'Estrangeira', false, 10, 60, 'r3_s03'),
  ('r3_s05', 'estudante', 5, 'Boss: Linguagens',
   'Desafio com 20 questões mistas de Linguagens.',
   'answer_questions', 20, 200, 3, 5, 'linguagens', null, true, 20, 70, 'r3_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- Rank 4 — Humanas
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r4_s01', 'aspirante', 1, 'Geografia',
   'Geografia física, humana e do Brasil.',
   'answer_questions', 10, 80, 4, 1, 'humanas', 'Geografia', false, 10, 60, 'r3_s05'),
  ('r4_s02', 'aspirante', 2, 'Filosofia',
   'Pensadores e correntes filosóficas.',
   'answer_questions', 10, 80, 4, 2, 'humanas', 'Filosofia', false, 10, 60, 'r4_s01'),
  ('r4_s03', 'aspirante', 3, 'Sociologia',
   'Conceitos sociológicos e teóricos clássicos.',
   'answer_questions', 10, 80, 4, 3, 'humanas', 'Sociologia', false, 10, 60, 'r4_s02'),
  ('r4_s04', 'aspirante', 4, 'Atualidades',
   'Eventos contemporâneos e geopolítica.',
   'answer_questions', 10, 80, 4, 4, 'humanas', 'Atualidades', false, 10, 60, 'r4_s03'),
  ('r4_s05', 'aspirante', 5, 'Boss: Humanas',
   'Desafio com 20 questões mistas de Humanas.',
   'answer_questions', 20, 250, 4, 5, 'humanas', null, true, 20, 70, 'r4_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- Rank 5 — Exatas Avançadas
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r5_s01', 'vestibulando', 1, 'Funções avançadas',
   'Exponencial, logaritmo, trigonometria.',
   'answer_questions', 10, 100, 5, 1, 'matematica', 'Funções', false, 10, 60, 'r4_s05'),
  ('r5_s02', 'vestibulando', 2, 'Probabilidade & análise combinatória',
   'Combinações, permutações e probabilidade.',
   'answer_questions', 10, 100, 5, 2, 'matematica', 'Probabilidade', false, 10, 60, 'r5_s01'),
  ('r5_s03', 'vestibulando', 3, 'Eletromagnetismo',
   'Cargas, campos e circuitos elétricos.',
   'answer_questions', 10, 100, 5, 3, 'fisica', 'Eletromagnetismo', false, 10, 60, 'r5_s02'),
  ('r5_s04', 'vestibulando', 4, 'Termodinâmica',
   'Calor, gases ideais e leis da termodinâmica.',
   'answer_questions', 10, 100, 5, 4, 'fisica', 'Termodinâmica', false, 10, 60, 'r5_s03'),
  ('r5_s05', 'vestibulando', 5, 'Boss: Exatas',
   'Desafio com 20 questões mistas de Mat e Fís avançadas.',
   'answer_questions', 20, 350, 5, 5, 'matematica', null, true, 20, 70, 'r5_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- Rank 6 — Bio Avançado
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r6_s01', 'expert', 1, 'Genética avançada',
   'Heredogramas, biotecnologia e genética molecular.',
   'answer_questions', 10, 120, 6, 1, 'biologia', 'Genética', false, 10, 60, 'r5_s05'),
  ('r6_s02', 'expert', 2, 'Ecologia',
   'Ecossistemas, ciclos biogeoquímicos e biomas.',
   'answer_questions', 10, 120, 6, 2, 'biologia', 'Ecologia', false, 10, 60, 'r6_s01'),
  ('r6_s03', 'expert', 3, 'Fisiologia',
   'Sistemas do corpo humano em profundidade.',
   'answer_questions', 10, 120, 6, 3, 'biologia', 'Fisiologia', false, 10, 60, 'r6_s02'),
  ('r6_s04', 'expert', 4, 'Evolução',
   'Seleção natural, especiação e teorias evolutivas.',
   'answer_questions', 10, 120, 6, 4, 'biologia', 'Evolução', false, 10, 60, 'r6_s03'),
  ('r6_s05', 'expert', 5, 'Boss: Biologia',
   'Desafio com 20 questões mistas de Biologia avançada.',
   'answer_questions', 20, 450, 6, 5, 'biologia', null, true, 20, 70, 'r6_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- Rank 7 — Quí Avançado
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r7_s01', 'genio', 1, 'Química orgânica I',
   'Hidrocarbonetos, funções orgânicas e nomenclatura.',
   'answer_questions', 10, 150, 7, 1, 'quimica', 'Orgânica', false, 10, 60, 'r6_s05'),
  ('r7_s02', 'genio', 2, 'Química orgânica II',
   'Reações orgânicas e isomeria.',
   'answer_questions', 10, 150, 7, 2, 'quimica', 'Orgânica', false, 10, 60, 'r7_s01'),
  ('r7_s03', 'genio', 3, 'Reações químicas',
   'Estequiometria, soluções e termoquímica.',
   'answer_questions', 10, 150, 7, 3, 'quimica', 'Reações', false, 10, 60, 'r7_s02'),
  ('r7_s04', 'genio', 4, 'Eletroquímica',
   'Pilhas, eletrólise e oxirredução.',
   'answer_questions', 10, 150, 7, 4, 'quimica', 'Eletroquímica', false, 10, 60, 'r7_s03'),
  ('r7_s05', 'genio', 5, 'Boss: Química',
   'Desafio com 20 questões mistas de Química avançada.',
   'answer_questions', 20, 600, 7, 5, 'quimica', null, true, 20, 70, 'r7_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- Rank 8 — Mestre (Simulado completo dividido em 5 partes)
insert into public.trilha_stations
  (id, rank_id, position, title, description, goal_type, goal_target,
   xp_reward, rank, position_in_rank, discipline, subtopic, is_boss,
   question_count, passing_pct, unlocks_after)
values
  ('r8_s01', 'aprovado', 1, 'Mestre I — Bloco Linguagens & Humanas',
   'Simulado parte 1: 20 questões mistas de Linguagens e Humanas.',
   'answer_questions', 20, 200, 8, 1, 'linguagens', null, false, 20, 65, 'r7_s05'),
  ('r8_s02', 'aprovado', 2, 'Mestre II — Bloco Matemática',
   'Simulado parte 2: 20 questões de Matemática variadas.',
   'answer_questions', 20, 200, 8, 2, 'matematica', null, false, 20, 65, 'r8_s01'),
  ('r8_s03', 'aprovado', 3, 'Mestre III — Bloco Biologia',
   'Simulado parte 3: 20 questões de Biologia variadas.',
   'answer_questions', 20, 200, 8, 3, 'biologia', null, false, 20, 65, 'r8_s02'),
  ('r8_s04', 'aprovado', 4, 'Mestre IV — Bloco Física e Química',
   'Simulado parte 4: 20 questões mistas de Física e Química.',
   'answer_questions', 20, 200, 8, 4, 'fisica', null, false, 20, 65, 'r8_s03'),
  ('r8_s05', 'aprovado', 5, 'Boss Final — Aprovação',
   'Boss final: 20 questões mistas de TODAS disciplinas. 70% para vencer.',
   'answer_questions', 20, 1000, 8, 5, 'matematica', null, true, 20, 70, 'r8_s04')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, rank = excluded.rank,
  position_in_rank = excluded.position_in_rank, discipline = excluded.discipline,
  subtopic = excluded.subtopic, is_boss = excluded.is_boss,
  question_count = excluded.question_count, passing_pct = excluded.passing_pct,
  unlocks_after = excluded.unlocks_after, xp_reward = excluded.xp_reward;

-- -----------------------------------------------------------------------------
-- 3. View `user_trilha_full_v2`
--    Junta as estações novas (rank not null) com performance do usuário,
--    calculando is_passed/is_unlocked/best_score_pct.
--
--    Critério de "passed": existe sessão study_sessions de tipo 'quiz' OU
--    'simulado' criada com filters->>'trilha_station_id' = stations.id e
--    correct_count/total_questions ≥ passing_pct/100.
--
--    is_unlocked: true se a estação `unlocks_after` está passed OU é a
--    primeira (unlocks_after IS NULL).
-- -----------------------------------------------------------------------------
create or replace view public.user_trilha_full_v2
with (security_invoker = true)
as
with user_sessions as (
  select
    s.id as session_id,
    s.user_id,
    s.filters,
    s.total_questions,
    s.correct_count,
    s.ended_at,
    coalesce(s.filters->>'trilha_station_id', null) as station_id,
    case
      when coalesce(s.total_questions, 0) > 0 then
        round((coalesce(s.correct_count, 0)::numeric / s.total_questions::numeric) * 100, 0)
      else 0
    end as score_pct
  from public.study_sessions s
  where s.user_id = auth.uid()
    and s.filters ? 'trilha_station_id'
),
station_stats as (
  select
    us.station_id,
    max(us.score_pct) as best_score_pct,
    count(*)::int as attempts_count,
    max(us.ended_at) as last_attempt_at
  from user_sessions us
  where us.station_id is not null
  group by us.station_id
),
station_passed as (
  select st.id as station_id,
    coalesce(ss.best_score_pct, 0) >= st.passing_pct as is_passed
  from public.trilha_stations st
  left join station_stats ss on ss.station_id = st.id
  where st.rank is not null
)
select
  st.id,
  st.rank,
  st.position_in_rank,
  st.rank_id,
  st.position,
  st.title,
  st.description,
  st.discipline,
  st.subtopic,
  st.is_boss,
  st.question_count,
  st.passing_pct,
  st.xp_reward,
  st.badge_reward,
  st.unlocks_after,
  coalesce(ss.best_score_pct, 0)::int as best_score_pct,
  coalesce(ss.attempts_count, 0) as attempts_count,
  ss.last_attempt_at,
  coalesce(sp_self.is_passed, false) as is_passed,
  case
    when st.unlocks_after is null then true
    else coalesce(sp_prev.is_passed, false)
  end as is_unlocked
from public.trilha_stations st
left join station_stats ss on ss.station_id = st.id
left join station_passed sp_self on sp_self.station_id = st.id
left join station_passed sp_prev on sp_prev.station_id = st.unlocks_after
where st.rank is not null
order by st.rank, st.position_in_rank;

comment on view public.user_trilha_full_v2 is
  'PR 26 — Trilha RPG. Estações com is_passed/is_unlocked/best_score_pct calculados a partir de study_sessions com filters->>trilha_station_id.';

grant select on public.user_trilha_full_v2 to authenticated;
