-- 0034_fix_trilha_subtopics.sql
--
-- PR 26 seedou as 40 estações da trilha RPG com `subtopic` heurísticos
-- (ex: 'Funções', 'Citologia') que NÃO casam com os subtopics reais do
-- banco (que são strings completas tipo 'Álgebra — Equações e Inequações',
-- 'Citologia e Bioenergética', etc). Resultado: ao iniciar uma estação,
-- o filtro `subtopic = 'Funções'` retornava 0 questões e a action lançava
-- 500 "Sem questões disponíveis".
--
-- Correção: limpa `subtopic` (NULL) em todas as estações. Isso faz a
-- action filtrar APENAS por `discipline`, garantindo pool não-vazio.
-- Cada estação fica como "10 questões aleatórias da disciplina X" — o
-- valor educacional/storytelling vem do título e do tema visual do rank,
-- não do subtopic específico.
--
-- Trade-off conhecido: estações dentro do mesmo rank podem cair em pools
-- iguais. Aceitável pra MVP. Revisita futura: mapear cada estação pra um
-- subtopic real existente (precisaria curadoria humana).
--
-- Idempotente: running 2x não faz nada na 2ª.

begin;

update public.trilha_stations
set subtopic = null
where subtopic is not null;

commit;
