-- =============================================================================
-- Migration 0026 — Seed de questões dos PDFs compilados (OUTROS/)
-- =============================================================================
-- Gerado por scripts/extract_compilados.ts a partir dos compilados por
-- disciplina em 'PROVAS MEDICINA UNIFOR/OUTROS/' (PR 24).
--
-- Contexto: estes PDFs são catálogos visuais — cada questão é
-- apresentada como imagem 200 DPI da prova original. O texto extraível
-- contém apenas a TABELA DE GABARITO ao final, com os campos:
--   prova (YYYY-S), questão (1-60), subtópico, resposta (A-E)
--
-- Estratégia: gerar IDs canônicos '{ano}-{sem}_Q{NN}' alinhados ao seed
-- principal. INSERT ... ON CONFLICT (id) DO NOTHING garante:
--   - questões oficiais já existentes no banco NÃO são sobrescritas
--   - questões NOVAS (de provas/questões ainda não seedadas) entram
--     como stub (description placeholder, image_url vazia)
--
-- Disciplinas cobertas: biologia, fisica, quimica, matematica, humanas
-- Anuladas/retificações: não aplicáveis (texto-fonte é o gabarito final).
-- =============================================================================

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q26',
  'biologia',
  'Filo Cnidaria — cnidários e nematocistos',
  'Filo Cnidaria',
  2015,
  2,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2015.2 · questão 26).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q27',
  'biologia',
  'Reprodução humana — gametogênese feminina',
  'Reprodução humana',
  2015,
  2,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2015.2 · questão 27).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q28',
  'biologia',
  'HIV — mecanismo de ação de antirretrovirais (3TC)',
  'HIV',
  2015,
  2,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2015.2 · questão 28).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q29',
  'biologia',
  'Erro inato do metabolismo — fenilcetonúria',
  'Erro inato do metabolismo',
  2015,
  2,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2015.2 · questão 29).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q30',
  'biologia',
  'Fisiologia vegetal — maturação e hormônios',
  'Fisiologia vegetal',
  2015,
  2,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2015.2 · questão 30).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q26',
  'biologia',
  'Convergência adaptativa — forma hidrodinâmica',
  'Convergência adaptativa',
  2016,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.1 · questão 26).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q27',
  'biologia',
  'Divisão celular descontrolada — câncer',
  'Divisão celular descontrolada',
  2016,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.1 · questão 27).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q28',
  'biologia',
  'Sistema respiratório — hipóxia/asfixia',
  'Sistema respiratório',
  2016,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.1 · questão 28).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q29',
  'biologia',
  'Metabolismo energético — ATP e transferência de energia',
  'Metabolismo energético',
  2016,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.1 · questão 29).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q30',
  'biologia',
  'Reparo do DNA (Nobel 2015)',
  'Reparo do DNA (Nobel 2015)',
  2016,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.1 · questão 30).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q26',
  'biologia',
  'Moléculas orgânicas — ligações do carbono',
  'Moléculas orgânicas',
  2016,
  2,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.2 · questão 26).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q27',
  'biologia',
  'Sistema digestório — duodeno e hormônios',
  'Sistema digestório',
  2016,
  2,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.2 · questão 27).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q28',
  'biologia',
  'Branqueamento de corais — impactos ambientais',
  'Branqueamento de corais',
  2016,
  2,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.2 · questão 28).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q29',
  'biologia',
  'Fisiologia comparada — euritermia/ectotermos',
  'Fisiologia comparada',
  2016,
  2,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.2 · questão 29).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q30',
  'biologia',
  'Vírus — estrutura e reprodução',
  'Vírus',
  2016,
  2,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2016.2 · questão 30).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q26',
  'biologia',
  'Nutrigenética — Dieta do DNA',
  'Nutrigenética',
  2017,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2017.1 · questão 26).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q27',
  'biologia',
  'Células-tronco e medicina regenerativa',
  'Células-tronco e medicina regenerativa',
  2017,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2017.1 · questão 27).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q28',
  'biologia',
  'Sistema endócrino — esteroides anabolizantes',
  'Sistema endócrino',
  2017,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2017.1 · questão 28).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q29',
  'biologia',
  'APPs e Código Florestal — mata ciliar',
  'APPs e Código Florestal',
  2017,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2017.1 · questão 29).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q30',
  'biologia',
  'Grupos vegetais — morfologia e classificação',
  'Grupos vegetais',
  2017,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2017.1 · questão 30).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q26',
  'biologia',
  'Profilaxia e prevenção de doenças infecciosas',
  'Profilaxia e prevenção de doenças infecciosas',
  2018,
  2,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2018.2 · questão 26).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q27',
  'biologia',
  'Fisiologia animal — respiração de peixes/hipóxia aquática',
  'Fisiologia animal',
  2018,
  2,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2018.2 · questão 27).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q28',
  'biologia',
  'Biotecnologia — edição gênica CRISPR-Cas9',
  'Biotecnologia',
  2018,
  2,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2018.2 · questão 28).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q29',
  'biologia',
  'Resistência bacteriana a antibióticos',
  'Resistência bacteriana a antibióticos',
  2018,
  2,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2018.2 · questão 29).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q30',
  'biologia',
  'Origem da vida — fotossíntese primitiva',
  'Origem da vida',
  2018,
  2,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2018.2 · questão 30).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q26',
  'biologia',
  'Imunologia — anticorpos e plasma convalescente (COVID-19)',
  'Imunologia',
  2021,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2021.1 · questão 26).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q27',
  'biologia',
  'Nutrição e fome — desnutrição e saúde pública',
  'Nutrição e fome',
  2021,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2021.1 · questão 27).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q28',
  'biologia',
  'Biodiversidade — declínio de espécies e impactos ecológicos',
  'Biodiversidade',
  2021,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2021.1 · questão 28).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q29',
  'biologia',
  'Transporte em vegetais — seiva e fluxo xilema/floema',
  'Transporte em vegetais',
  2021,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2021.1 · questão 29).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q30',
  'biologia',
  'Fisiologia animal — adaptações metabólicas ao jejum',
  'Fisiologia animal',
  2021,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2021.1 · questão 30).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q26',
  'biologia',
  'Parasitoses intestinais — áscaris e ancilostomíase',
  'Parasitoses intestinais',
  2022,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2022.1 · questão 26).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q27',
  'biologia',
  'Reprodução humana — gravidez na adolescência',
  'Reprodução humana',
  2022,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2022.1 · questão 27).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q28',
  'biologia',
  'Fisiologia vegetal — sensores e percepção em plantas',
  'Fisiologia vegetal',
  2022,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2022.1 · questão 28).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q29',
  'biologia',
  'Seleção natural — variação de fenótipos em população',
  'Seleção natural',
  2022,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2022.1 · questão 29).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q30',
  'biologia',
  'Adaptações fisiológicas — camelos e conservação de água',
  'Adaptações fisiológicas',
  2022,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2022.1 · questão 30).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q26',
  'biologia',
  'Queimadas e perda de ecossistemas',
  'Queimadas e perda de ecossistemas',
  2024,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.1 · questão 26).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q27',
  'biologia',
  'Sangue — hemácias e transporte de oxigênio',
  'Sangue',
  2024,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.1 · questão 27).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q28',
  'biologia',
  'Demografia humana — pirâmides etárias',
  'Demografia humana',
  2024,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.1 · questão 28).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q29',
  'biologia',
  'Biologia molecular — síntese de RNA e proteínas',
  'Biologia molecular',
  2024,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.1 · questão 29).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q30',
  'biologia',
  'Embriologia e genética — formação de gêmeos',
  'Embriologia e genética',
  2024,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.1 · questão 30).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q26',
  'biologia',
  'Fotossíntese — luz e síntese de compostos de carbono',
  'Fotossíntese',
  2024,
  2,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.2 · questão 26).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q27',
  'biologia',
  'Sistema respiratório — trocas gasosas',
  'Sistema respiratório',
  2024,
  2,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.2 · questão 27).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q28',
  'biologia',
  'Doenças respiratórias — gripe, resfriado e COVID',
  'Doenças respiratórias',
  2024,
  2,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.2 · questão 28).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q29',
  'biologia',
  'Domesticação e seleção artificial — origem do milho',
  'Domesticação e seleção artificial',
  2024,
  2,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.2 · questão 29).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q30',
  'biologia',
  'Tempo geológico e história da vida na Terra',
  'Tempo geológico e história da vida na Terra',
  2024,
  2,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2024.2 · questão 30).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q26',
  'biologia',
  'Arbovirose — febre Oropouche e vetor (maruim)',
  'Arbovirose',
  2025,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.1 · questão 26).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q27',
  'biologia',
  'Biomas brasileiros — habitat e reintrodução',
  'Biomas brasileiros',
  2025,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.1 · questão 27).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q28',
  'biologia',
  'Ciclo da água — distribuição e escassez',
  'Ciclo da água',
  2025,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.1 · questão 28).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q29',
  'biologia',
  'MicroRNAs — regulação gênica (Nobel 2024)',
  'MicroRNAs',
  2025,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.1 · questão 29).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q30',
  'biologia',
  'Sistema endócrino — esteroides anabolizantes',
  'Sistema endócrino',
  2025,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.1 · questão 30).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q26',
  'biologia',
  'Nutrição — desnutrição aguda e consequências',
  'Nutrição',
  2025,
  2,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.2 · questão 26).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q27',
  'biologia',
  'Exercício físico — fisiologia muscular e metabolismo',
  'Exercício físico',
  2025,
  2,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.2 · questão 27).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q28',
  'biologia',
  'Seleção natural — conceito do ''gene egoísta''',
  'Seleção natural',
  2025,
  2,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.2 · questão 28).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q29',
  'biologia',
  'Nova classe de antibióticos — descoberta e resistência',
  'Nova classe de antibióticos',
  2025,
  2,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.2 · questão 29).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q30',
  'biologia',
  'Clonagem — reprodutiva e terapêutica',
  'Clonagem',
  2025,
  2,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2025.2 · questão 30).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q26',
  'biologia',
  'Ecologia — Sustentabilidade ambiental',
  'Ecologia',
  2026,
  1,
  26,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2026.1 · questão 26).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q27',
  'biologia',
  'Evolução — Adaptações: mimetismo, camuflagem, coloração de advertência',
  'Evolução',
  2026,
  1,
  27,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2026.1 · questão 27).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q28',
  'biologia',
  'Genética e Biologia Molecular — DNA mitocondrial e herança materna',
  'Genética e Biologia Molecular',
  2026,
  1,
  28,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2026.1 · questão 28).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q29',
  'biologia',
  'Ecologia — Relações ecológicas / controle biológico',
  'Ecologia',
  2026,
  1,
  29,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2026.1 · questão 29).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q30',
  'biologia',
  'Fisiologia Celular e Bioquímica — Enzimas: temperatura ótima e desnaturação',
  'Fisiologia Celular e Bioquímica',
  2026,
  1,
  30,
  '[Questão em imagem — consulte o PDF compilado de biologia (prova 2026.1 · questão 30).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q16',
  'fisica',
  'Eletrostática / capacitores',
  'Eletrostática',
  2015,
  2,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2015.2 · questão 16).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q17',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2015,
  2,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2015.2 · questão 17).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q19',
  'fisica',
  'Câmara escura / sombras e semelhança',
  'Câmara escura',
  2015,
  2,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2015.2 · questão 19).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q20',
  'fisica',
  'Lançamento vertical — cinemática',
  'Lançamento vertical',
  2015,
  2,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2015.2 · questão 20).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q16',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2016,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.1 · questão 16).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q17',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2016,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.1 · questão 17).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q18',
  'fisica',
  'Dinâmica / Leis de Newton',
  'Dinâmica',
  2016,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.1 · questão 18).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q19',
  'fisica',
  'Hidrostática — pressão hidrostática em fluido',
  'Hidrostática',
  2016,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.1 · questão 19).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q20',
  'fisica',
  'Gráfico v×t — MRUV',
  'Gráfico v×t',
  2016,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.1 · questão 20).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q16',
  'fisica',
  'Dinâmica / Leis de Newton',
  'Dinâmica',
  2016,
  2,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.2 · questão 16).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q17',
  'fisica',
  'Altitude e chute — lançamento oblíquo',
  'Altitude e chute',
  2016,
  2,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.2 · questão 17).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q18',
  'fisica',
  'Calorimetria — kcal e energia alimentar',
  'Calorimetria',
  2016,
  2,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.2 · questão 18).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q19',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2016,
  2,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.2 · questão 19).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q20',
  'fisica',
  'Dinâmica / Leis de Newton',
  'Dinâmica',
  2016,
  2,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2016.2 · questão 20).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q16',
  'fisica',
  'Queda livre — velocidade de impacto',
  'Queda livre',
  2017,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2017.1 · questão 16).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q17',
  'fisica',
  'Óptica / lentes e espelhos',
  'Óptica',
  2017,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2017.1 · questão 17).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q18',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2017,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2017.1 · questão 18).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q19',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2017,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2017.1 · questão 19).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q20',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2017,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2017.1 · questão 20).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q16',
  'fisica',
  'Dinâmica / Leis de Newton',
  'Dinâmica',
  2018,
  2,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2018.2 · questão 16).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q17',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2018,
  2,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2018.2 · questão 17).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q18',
  'fisica',
  'Dinâmica / Leis de Newton',
  'Dinâmica',
  2018,
  2,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2018.2 · questão 18).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q19',
  'fisica',
  'Hidrostática / pressão',
  'Hidrostática',
  2018,
  2,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2018.2 · questão 19).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q20',
  'fisica',
  'Corrente elétrica — carga e elétrons',
  'Corrente elétrica',
  2018,
  2,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2018.2 · questão 20).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q16',
  'fisica',
  'Hidrostática / pressão',
  'Hidrostática',
  2021,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2021.1 · questão 16).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q17',
  'fisica',
  'Eletrostática / capacitores',
  'Eletrostática',
  2021,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2021.1 · questão 17).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q18',
  'fisica',
  'Lançamento oblíquo',
  'Lançamento oblíquo',
  2021,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2021.1 · questão 18).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q19',
  'fisica',
  'Gravitação / MCU',
  'Gravitação',
  2021,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2021.1 · questão 19).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q20',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2021,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2021.1 · questão 20).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q16',
  'fisica',
  'Pêndulo — conservação de energia',
  'Pêndulo',
  2022,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2022.1 · questão 16).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q17',
  'fisica',
  'Gravitação / MCU',
  'Gravitação',
  2022,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2022.1 · questão 17).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q18',
  'fisica',
  'Cobrança de falta — lançamento oblíquo',
  'Cobrança de falta',
  2022,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2022.1 · questão 18).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q19',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2022,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2022.1 · questão 19).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q20',
  'fisica',
  'Rodovia peraltada — força centrípeta',
  'Rodovia peraltada',
  2022,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2022.1 · questão 20).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q16',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2024,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.1 · questão 16).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q17',
  'fisica',
  'Óptica / lentes e espelhos',
  'Óptica',
  2024,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.1 · questão 17).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q18',
  'fisica',
  'Ondas / som',
  'Ondas',
  2024,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.1 · questão 18).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q19',
  'fisica',
  'Atrito / Curling — dinâmica sobre gelo',
  'Atrito / Curling',
  2024,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.1 · questão 19).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q20',
  'fisica',
  'MCU — pás de gerador eólico',
  'MCU',
  2024,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.1 · questão 20).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q16',
  'fisica',
  'Óptica / lentes e espelhos',
  'Óptica',
  2024,
  2,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.2 · questão 16).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q17',
  'fisica',
  'Óptica / lentes e espelhos',
  'Óptica',
  2024,
  2,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.2 · questão 17).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q18',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2024,
  2,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.2 · questão 18).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q19',
  'fisica',
  'Óptica / lentes e espelhos',
  'Óptica',
  2024,
  2,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.2 · questão 19).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q20',
  'fisica',
  'MCU — polia e eixo rotativo',
  'MCU',
  2024,
  2,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2024.2 · questão 20).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q16',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2025,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.1 · questão 16).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q17',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2025,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.1 · questão 17).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q18',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2025,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.1 · questão 18).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q19',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2025,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.1 · questão 19).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q20',
  'fisica',
  'Dinâmica / Leis de Newton',
  'Dinâmica',
  2025,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.1 · questão 20).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q16',
  'fisica',
  'MCU vertical — pêndulo cônico/circular',
  'MCU vertical',
  2025,
  2,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.2 · questão 16).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q17',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2025,
  2,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.2 · questão 17).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q18',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2025,
  2,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.2 · questão 18).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q19',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2025,
  2,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.2 · questão 19).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q20',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2025,
  2,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2025.2 · questão 20).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q16',
  'fisica',
  'Circuitos / potência elétrica',
  'Circuitos',
  2026,
  1,
  16,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2026.1 · questão 16).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q17',
  'fisica',
  'Pêndulo cônico — MCU',
  'Pêndulo cônico',
  2026,
  1,
  17,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2026.1 · questão 17).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q18',
  'fisica',
  'Termodinâmica / calor',
  'Termodinâmica',
  2026,
  1,
  18,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2026.1 · questão 18).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q19',
  'fisica',
  'Velocidade média em arco — cinemática sobre esfera',
  'Velocidade média em arco',
  2026,
  1,
  19,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2026.1 · questão 19).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q20',
  'fisica',
  'Ondas / som',
  'Ondas',
  2026,
  1,
  20,
  '[Questão em imagem — consulte o PDF compilado de fisica (prova 2026.1 · questão 20).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q31',
  'humanas',
  'Movimentos sociais no Brasil',
  'Movimentos sociais no Brasil',
  2015,
  2,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 31).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q32',
  'humanas',
  'Mudanças climáticas globais',
  'Mudanças climáticas globais',
  2015,
  2,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 32).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q33',
  'humanas',
  'Petrobrás e pré-sal — economia brasileira',
  'Petrobrás e pré-sal',
  2015,
  2,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 33).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q34',
  'humanas',
  'Mercosul — bloco econômico',
  'Mercosul',
  2015,
  2,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 34).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q35',
  'humanas',
  'Estado Islâmico (EI/EIIL)',
  'Estado Islâmico (EI/EIIL)',
  2015,
  2,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 35).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q36',
  'humanas',
  'Seca no semiárido nordestino — O Quinze',
  'Seca no semiárido nordestino',
  2015,
  2,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 36).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q37',
  'humanas',
  'Relações EUA–Cuba (reaproximação)',
  'Relações EUA–Cuba (reaproximação)',
  2015,
  2,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 37).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q38',
  'humanas',
  'Colonização portuguesa — pau-brasil e capitanias',
  'Colonização portuguesa',
  2015,
  2,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 38).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q39',
  'humanas',
  'Abolição, imigração e mercado de trabalho livre no séc. XIX',
  'Abolição, imigração e mercado de trabalho livre...',
  2015,
  2,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 39).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q40',
  'humanas',
  'Primeira Guerra Mundial — causas e alianças',
  'Primeira Guerra Mundial',
  2015,
  2,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2015.2 · questão 40).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q31',
  'humanas',
  'Reeleição de Dilma e crise política (2015)',
  'Reeleição de Dilma e crise política',
  2016,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 31).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q32',
  'humanas',
  'Primeira Guerra Mundial — consequências',
  'Primeira Guerra Mundial',
  2016,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 32).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q33',
  'humanas',
  'Segunda Revolução Industrial',
  'Segunda Revolução Industrial',
  2016,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 33).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q34',
  'humanas',
  'Economia e meio ambiente — poluição e recursos',
  'Economia e meio ambiente',
  2016,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 34).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q35',
  'humanas',
  'El Niño — fenômeno climático',
  'El Niño',
  2016,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 35).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q36',
  'humanas',
  'Reforma da Previdência Social',
  'Reforma da Previdência Social',
  2016,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 36).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q37',
  'humanas',
  'PNAD/IBGE — distribuição de renda no Brasil',
  'PNAD/IBGE',
  2016,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 37).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q38',
  'humanas',
  'Ataque em Paris 2015 — Estado Islâmico',
  'Ataque em Paris 2015',
  2016,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 38).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q39',
  'humanas',
  'Desastre de Mariana — rompimento de barragens',
  'Desastre de Mariana',
  2016,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 39).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q40',
  'humanas',
  'Fundamentalismo islâmico e direito de associação',
  'Fundamentalismo islâmico e direito de associação',
  2016,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.1 · questão 40).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q31',
  'humanas',
  'Revolução Francesa e Estado Liberal',
  'Revolução Francesa e Estado Liberal',
  2016,
  2,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 31).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q32',
  'humanas',
  'Jornadas de Junho de 2013',
  'Jornadas de Junho de 2013',
  2016,
  2,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 32).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q33',
  'humanas',
  'Programa Bolsa Família — política pública',
  'Programa Bolsa Família',
  2016,
  2,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 33).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q34',
  'humanas',
  'Iluminismo — Montesquieu e separação dos poderes',
  'Iluminismo',
  2016,
  2,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 34).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q35',
  'humanas',
  'Intolerância e terrorismo contemporâneo',
  'Intolerância e terrorismo contemporâneo',
  2016,
  2,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 35).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q36',
  'humanas',
  'Crise do açúcar e ciclo do ouro (séc. XVII-XVIII)',
  'Crise do açúcar e ciclo do ouro (séc. XVII-XVIII)',
  2016,
  2,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 36).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q37',
  'humanas',
  'Industrialização por Substituição de Importações (pós-1945)',
  'Industrialização por Substituição de Importaçõe...',
  2016,
  2,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 37).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q38',
  'humanas',
  'Desenvolvimento sustentável — Relatório Brundtland',
  'Desenvolvimento sustentável',
  2016,
  2,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 38).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q39',
  'humanas',
  'Redemocratização — Tancredo Neves e Sarney',
  'Redemocratização',
  2016,
  2,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 39).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q40',
  'humanas',
  'Acordo de Paris — aquecimento global',
  'Acordo de Paris',
  2016,
  2,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2016.2 · questão 40).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q31',
  'humanas',
  'Conceito de revolução (séc. XVIII)',
  'Conceito de revolução (séc. XVIII)',
  2017,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 31).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q32',
  'humanas',
  'Apartheid na África do Sul',
  'Apartheid na África do Sul',
  2017,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 32).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q33',
  'humanas',
  'Autoritarismo e paternalismo no Brasil',
  'Autoritarismo e paternalismo no Brasil',
  2017,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 33).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q34',
  'humanas',
  'Viajantes no Brasil séc. XVI–XIX (Debret, Rugendas)',
  'Viajantes no Brasil séc. XVI–XIX (Debret, Rugen...',
  2017,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 34).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q35',
  'humanas',
  'Revolução Industrial (Hobsbawm)',
  'Revolução Industrial (Hobsbawm)',
  2017,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 35).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q36',
  'humanas',
  'Crise migratória europeia — criança síria',
  'Crise migratória europeia',
  2017,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 36).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q37',
  'humanas',
  'Agricultura moderna e indústria rural no Brasil',
  'Agricultura moderna e indústria rural no Brasil',
  2017,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 37).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q38',
  'humanas',
  'Dia Mundial da Limpeza — poluição marinha',
  'Dia Mundial da Limpeza',
  2017,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 38).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q39',
  'humanas',
  'Era Vargas — capital e trabalho',
  'Era Vargas',
  2017,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 39).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q40',
  'humanas',
  'Nordeste colonial — cana e pecuária (séc. XVI-XVII)',
  'Nordeste colonial',
  2017,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2017.1 · questão 40).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q31',
  'humanas',
  'Taylorismo e Segunda Revolução Industrial',
  'Taylorismo e Segunda Revolução Industrial',
  2018,
  2,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 31).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q32',
  'humanas',
  'IDH e Relatório de Desenvolvimento Humano (PNUD)',
  'IDH e Relatório de Desenvolvimento Humano (PNUD)',
  2018,
  2,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 32).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q33',
  'humanas',
  'Políticas públicas durante a Ditadura (1964-1985)',
  'Políticas públicas durante a Ditadura (1964-1985)',
  2018,
  2,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 33).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q34',
  'humanas',
  'Intervenção federal no RJ (2018)',
  'Intervenção federal no RJ',
  2018,
  2,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 34).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q35',
  'humanas',
  'Movimento dos Sem-Teto — moradia urbana',
  'Movimento dos Sem-Teto',
  2018,
  2,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 35).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q36',
  'humanas',
  'SUS — direito universal à saúde',
  'SUS',
  2018,
  2,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 36).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q37',
  'humanas',
  'Liberalismo e racismo científico no Brasil séc. XIX',
  'Liberalismo e racismo científico no Brasil séc....',
  2018,
  2,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 37).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q38',
  'humanas',
  'Revolução Constitucionalista de 1932',
  'Revolução Constitucionalista de 1932',
  2018,
  2,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 38).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q39',
  'humanas',
  'Revolução Russa de 1917',
  'Revolução Russa de 1917',
  2018,
  2,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 39).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q40',
  'humanas',
  'Coreias do Norte e do Sul — aproximação (2018)',
  'Coreias do Norte e do Sul',
  2018,
  2,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2018.2 · questão 40).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q31',
  'humanas',
  'Ataques terroristas na França (2020)',
  'Ataques terroristas na França',
  2021,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 31).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q32',
  'humanas',
  'Neocolonialismo e Conferência de Berlim (1885)',
  'Neocolonialismo e Conferência de Berlim',
  2021,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 32).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q33',
  'humanas',
  'Redes sociais e economia da atenção (Dilema das Redes)',
  'Redes sociais e economia da atenção (Dilema das...',
  2021,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 33).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q34',
  'humanas',
  'Revolta da Vacina (1904)',
  'Revolta da Vacina',
  2021,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 34).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q35',
  'humanas',
  'Democracia em Platão',
  'Democracia em Platão',
  2021,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 35).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q36',
  'humanas',
  'Relação homem–natureza e sustentabilidade',
  'Relação homem–natureza e sustentabilidade',
  2021,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 36).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q37',
  'humanas',
  'Indústria 4.0 — IA, robótica e blockchain',
  'Indústria 4.0',
  2021,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 37).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q38',
  'humanas',
  'Pré-história — caçadoras do Lago Titicaca',
  'Pré-história',
  2021,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 38).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q39',
  'humanas',
  'Dinastia Ming — expansão marítima chinesa',
  'Dinastia Ming',
  2021,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 39).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q40',
  'humanas',
  'Martin Luther King e direitos civis nos EUA',
  'Martin Luther King e direitos civis nos EUA',
  2021,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2021.1 · questão 40).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q31',
  'humanas',
  'Talibã e direitos das mulheres no Afeganistão (2021)',
  'Talibã e direitos das mulheres no Afeganistão',
  2022,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 31).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q32',
  'humanas',
  'Ditadura Militar e repressão',
  'Ditadura Militar e repressão',
  2022,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 32).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q33',
  'humanas',
  'Evolução das concepções de Estado (grego, medieval, moderno)',
  'Evolução das concepções de Estado (grego, medie...',
  2022,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 33).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q34',
  'humanas',
  'Colonização europeia das Américas — ritual de posse',
  'Colonização europeia das Américas',
  2022,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 34).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q35',
  'humanas',
  'Totalitarismo em Hannah Arendt',
  'Totalitarismo em Hannah Arendt',
  2022,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 35).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q36',
  'humanas',
  'Vinda da Corte Portuguesa para o Brasil (1808)',
  'Vinda da Corte Portuguesa para o Brasil',
  2022,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 36).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q37',
  'humanas',
  'Feudalismo — nobreza e servos',
  'Feudalismo',
  2022,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 37).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q38',
  'humanas',
  'Sócrates e a maiêutica',
  'Sócrates e a maiêutica',
  2022,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 38).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q39',
  'humanas',
  'Cidades medievais e rotas comerciais (séc. XI)',
  'Cidades medievais e rotas comerciais (séc. XI)',
  2022,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 39).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q40',
  'humanas',
  'Expansão marítima da dinastia Ming (Zhong Di)',
  'Expansão marítima da dinastia Ming (Zhong Di)',
  2022,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2022.1 · questão 40).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q31',
  'humanas',
  'Balaiada (1838-1841) — revolta regencial',
  'Balaiada (1838-1841)',
  2024,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 31).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q32',
  'humanas',
  'Rui Barbosa e a Conferência de Haia (1907)',
  'Rui Barbosa e a Conferência de Haia',
  2024,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 32).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q33',
  'humanas',
  'Digitalização da Biblioteca do Vaticano',
  'Digitalização da Biblioteca do Vaticano',
  2024,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 33).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q34',
  'humanas',
  'Criação da Funai (1967) e questão indígena',
  'Criação da Funai  e questão indígena',
  2024,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 34).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q35',
  'humanas',
  'Lei Maria da Penha — violência contra a mulher',
  'Lei Maria da Penha',
  2024,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 35).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q36',
  'humanas',
  'Relação homem–meio ambiente',
  'Relação homem–meio ambiente',
  2024,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 36).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q37',
  'humanas',
  'Democracia em Platão',
  'Democracia em Platão',
  2024,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 37).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q38',
  'humanas',
  'Muhammad Yunus — microcrédito e desenvolvimento',
  'Muhammad Yunus',
  2024,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 38).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q39',
  'humanas',
  'Sêneca e o estoicismo',
  'Sêneca e o estoicismo',
  2024,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 39).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q40',
  'humanas',
  'Guerra Israel–Hamas e ajuda humanitária em Gaza (2023)',
  'Guerra Israel–Hamas e ajuda humanitária em Gaza',
  2024,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.1 · questão 40).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q31',
  'humanas',
  'Pré-história — sepultamento de Shanidar (75.000 anos)',
  'Pré-história',
  2024,
  2,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 31).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q32',
  'humanas',
  'Escravidão e formas de resistência no Brasil',
  'Escravidão e formas de resistência no Brasil',
  2024,
  2,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 32).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q33',
  'humanas',
  'Tenentismo e Revolta Paulista de 1924',
  'Tenentismo e Revolta Paulista de 1924',
  2024,
  2,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 33).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q34',
  'humanas',
  'Comando de Caça aos Comunistas (CCC) em Fortaleza',
  'Comando de Caça aos Comunistas (CCC) em Fortaleza',
  2024,
  2,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 34).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q35',
  'humanas',
  'Economia açucareira e tráfico Brasil–Angola',
  'Economia açucareira e tráfico Brasil–Angola',
  2024,
  2,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 35).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q36',
  'humanas',
  'Conjuração Baiana / execução em Salvador (1799)',
  'Conjuração Baiana',
  2024,
  2,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 36).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q37',
  'humanas',
  'Ceará colonial — povos indígenas e colonização',
  'Ceará colonial',
  2024,
  2,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 37).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q38',
  'humanas',
  'Código Criminal de 1830 e defesa da família',
  'Código Criminal de 1830 e defesa da família',
  2024,
  2,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 38).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q39',
  'humanas',
  'França, Egito e Império Otomano (séc. XVIII)',
  'França, Egito e Império Otomano (séc. XVIII)',
  2024,
  2,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 39).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q40',
  'humanas',
  'Dragão do Mar e abolição no Ceará (1881-84)',
  'Dragão do Mar e abolição no Ceará (1881-84)',
  2024,
  2,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2024.2 · questão 40).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q31',
  'humanas',
  'Brasil na UNEF — missão de paz da ONU no Oriente Médio',
  'Brasil na UNEF',
  2025,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 31).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q32',
  'humanas',
  'Max Weber — pensamento sociológico',
  'Max Weber',
  2025,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 32).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q33',
  'humanas',
  'Poder Legislativo e organização do Estado brasileiro',
  'Poder Legislativo e organização do Estado brasi...',
  2025,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 33).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q34',
  'humanas',
  'Suicídio de Vargas e governo Café Filho (1954)',
  'Suicídio de Vargas e governo Café Filho',
  2025,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 34).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q35',
  'humanas',
  'Imprensa negra — O Clarim d''Alvorada (1924)',
  'Imprensa negra',
  2025,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 35).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q36',
  'humanas',
  'Santo Tomás de Aquino e a sindérese',
  'Santo Tomás de Aquino e a sindérese',
  2025,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 36).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q37',
  'humanas',
  'Marco temporal e direitos indígenas (STF, 2023)',
  'Marco temporal e direitos indígenas (STF, 2023)',
  2025,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 37).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q38',
  'humanas',
  'Émile Durkheim — funcionalismo',
  'Émile Durkheim',
  2025,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 38).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q39',
  'humanas',
  'Vinda da família real portuguesa (1808)',
  'Vinda da família real portuguesa',
  2025,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 39).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q40',
  'humanas',
  'Cidades pré-colombianas — Llanos de Mojos (Amazônia)',
  'Cidades pré-colombianas',
  2025,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.1 · questão 40).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q31',
  'humanas',
  'Revolução Industrial — trabalhadores séc. XIX',
  'Revolução Industrial',
  2025,
  2,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 31).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q32',
  'humanas',
  'Idade Média africana — reino de Mali e islamização',
  'Idade Média africana',
  2025,
  2,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 32).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q33',
  'humanas',
  'Tarifas de Trump e protecionismo (2025)',
  'Tarifas de Trump e protecionismo',
  2025,
  2,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 33).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q34',
  'humanas',
  'Renascimento italiano — Botticelli e O Nascimento de Vênus',
  'Renascimento italiano',
  2025,
  2,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 34).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q35',
  'humanas',
  'Revolução Gloriosa e parlamentarismo inglês (1688)',
  'Revolução Gloriosa e parlamentarismo inglês',
  2025,
  2,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 35).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q36',
  'humanas',
  'Era Vargas (1930-45 e 1951-54)',
  'Era Vargas (1930-45 e 1951-54)',
  2025,
  2,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 36).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q37',
  'humanas',
  'Simone de Beauvoir — existencialismo e feminismo',
  'Simone de Beauvoir',
  2025,
  2,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 37).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q38',
  'humanas',
  'Economia açucareira colonial — Brasil e tráfico atlântico',
  'Economia açucareira colonial',
  2025,
  2,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 38).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q39',
  'humanas',
  'Primeira República — Política do Café com Leite',
  'Primeira República',
  2025,
  2,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 39).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q40',
  'humanas',
  'Proclamação da República (1889)',
  'Proclamação da República',
  2025,
  2,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2025.2 · questão 40).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q31',
  'humanas',
  'Brasil Colônia — estrutura administrativa e ocupação',
  'Brasil Colônia',
  2026,
  1,
  31,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 31).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q32',
  'humanas',
  'Justiça, STF e direitos de grupos historicamente marginalizados',
  'Justiça, STF e direitos de grupos historicament...',
  2026,
  1,
  32,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 32).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q33',
  'humanas',
  'Pan-africanismo e luta contra a segregação racial',
  'Pan-africanismo e luta contra a segregação racial',
  2026,
  1,
  33,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 33).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q34',
  'humanas',
  'Segundo Reinado — pintura e nacionalismo romântico',
  'Segundo Reinado',
  2026,
  1,
  34,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 34).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q35',
  'humanas',
  'Primeira República — Política do Café com Leite (charge 1925)',
  'Primeira República',
  2026,
  1,
  35,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 35).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q36',
  'humanas',
  'Movimento pelos direitos civis nos EUA (séc. XX)',
  'Movimento pelos direitos civis nos EUA (séc. XX)',
  2026,
  1,
  36,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 36).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q37',
  'humanas',
  'Revolta da Vacina e Oswaldo Cruz (1904)',
  'Revolta da Vacina e Oswaldo Cruz',
  2026,
  1,
  37,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 37).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q38',
  'humanas',
  'Expansão marítima ibérica (séc. XV)',
  'Expansão marítima ibérica (séc. XV)',
  2026,
  1,
  38,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 38).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q39',
  'humanas',
  'Imperialismo europeu no séc. XIX — África e Ásia',
  'Imperialismo europeu no séc. XIX',
  2026,
  1,
  39,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 39).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q40',
  'humanas',
  'Iluminismo e bases da Revolução Francesa',
  'Iluminismo e bases da Revolução Francesa',
  2026,
  1,
  40,
  '[Questão em imagem — consulte o PDF compilado de humanas (prova 2026.1 · questão 40).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q01',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2015,
  2,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 1).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q02',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2015,
  2,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 2).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 3).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q04',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 4).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q05',
  'matematica',
  'Progressões',
  'Progressões',
  2015,
  2,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 5).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q06',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 6).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q07',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2015,
  2,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 7).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 8).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q09',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 9).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q10',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2015,
  2,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 10).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q11',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 11).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q12',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2015,
  2,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 12).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q13',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 13).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q14',
  'matematica',
  'Trigonometria',
  'Trigonometria',
  2015,
  2,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 14).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2015,
  2,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2015.2 · questão 15).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 1).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q02',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2016,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 2).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 3).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q04',
  'matematica',
  'Análise combinatória',
  'Análise combinatória',
  2016,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 4).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q05',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2016,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 5).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q07',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 7).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q08',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2016,
  1,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 8).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q09',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2016,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 9).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q10',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 10).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q11',
  'matematica',
  'Cônicas (elipse/parábola/hipérbole)',
  'Cônicas (elipse/parábola/hipérbole)',
  2016,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 11).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q12',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 12).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q13',
  'matematica',
  'Cônicas (elipse/parábola/hipérbole)',
  'Cônicas (elipse/parábola/hipérbole)',
  2016,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 13).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q14',
  'matematica',
  'Exponencial / logarítmo',
  'Exponencial',
  2016,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 14).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q15',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2016,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.1 · questão 15).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 1).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q02',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2016,
  2,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 2).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 3).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q04',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2016,
  2,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 4).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q05',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 5).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q06',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2016,
  2,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 6).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q07',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 7).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 8).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q09',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 9).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q10',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 10).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q11',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2016,
  2,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 11).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q12',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 12).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q13',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2016,
  2,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 13).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q14',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2016,
  2,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 14).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q15',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2016,
  2,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2016.2 · questão 15).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2017,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 1).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q02',
  'matematica',
  'Geometria analítica',
  'Geometria analítica',
  2017,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 2).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2017,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 3).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q04',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2017,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 4).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q05',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 5).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q06',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 6).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q07',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 7).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2017,
  1,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 8).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q09',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 9).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q10',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2017,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 10).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q11',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 11).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q12',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2017,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 12).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q13',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 13).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q14',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2017,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 14).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2017,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2017.1 · questão 15).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2018,
  2,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 1).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q02',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2018,
  2,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 2).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q03',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2018,
  2,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 3).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q04',
  'matematica',
  'Trigonometria',
  'Trigonometria',
  2018,
  2,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 4).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q05',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2018,
  2,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 5).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q06',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2018,
  2,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 6).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q07',
  'matematica',
  'Álgebra / equações',
  'Álgebra',
  2018,
  2,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 7).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2018,
  2,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 8).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q09',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2018,
  2,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 9).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q10',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2018,
  2,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 10).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q11',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2018,
  2,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 11).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q12',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2018,
  2,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 12).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q13',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2018,
  2,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 13).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q14',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2018,
  2,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 14).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2018,
  2,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2018.2 · questão 15).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q01',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2021,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 1).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q02',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2021,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 2).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q03',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2021,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 3).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q04',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2021,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 4).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q05',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2021,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 5).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q06',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2021,
  1,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 6).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q07',
  'matematica',
  'Matrizes e determinantes',
  'Matrizes e determinantes',
  2021,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 7).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q09',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2021,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 9).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q10',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2021,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 10).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q11',
  'matematica',
  'Exponencial e logarítmo',
  'Exponencial e logarítmo',
  2021,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 11).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q12',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2021,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 12).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q13',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2021,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 13).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q14',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2021,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 14).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q15',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2021,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2021.1 · questão 15).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q01',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2022,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 1).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q02',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2022,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 2).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 3).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q04',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 4).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q05',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2022,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 5).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q06',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2022,
  1,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 6).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q07',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2022,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 7).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 8).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q09',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 9).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q10',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2022,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 10).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q11',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 11).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q12',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 12).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q13',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 13).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q14',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 14).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2022,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2022.1 · questão 15).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q01',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2024,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 1).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q02',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 2).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q03',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2024,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 3).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q04',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 4).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q05',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 5).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q06',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2024,
  1,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 6).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q07',
  'matematica',
  'Exponencial e logarítmo',
  'Exponencial e logarítmo',
  2024,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 7).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q08',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2024,
  1,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 8).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q09',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 9).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q10',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2024,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 10).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q11',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 11).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q12',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2024,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 12).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q13',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 13).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q14',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 14).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.1 · questão 15).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  2,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 1).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q02',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  2,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 2).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q03',
  'matematica',
  'Estatística descritiva',
  'Estatística descritiva',
  2024,
  2,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 3).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q04',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  2,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 4).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q05',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  2,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 5).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q06',
  'matematica',
  'Análise combinatória',
  'Análise combinatória',
  2024,
  2,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 6).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q07',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  2,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 7).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  2,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 8).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q09',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2024,
  2,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 9).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q10',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  2,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 10).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q11',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2024,
  2,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 11).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q12',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  2,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 12).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q13',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  2,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 13).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q14',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2024,
  2,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 14).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q15',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2024,
  2,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2024.2 · questão 15).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q01',
  'matematica',
  'Estatística descritiva',
  'Estatística descritiva',
  2025,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 1).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q02',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 2).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q03',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2025,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 3).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q04',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2025,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 4).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q05',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2025,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 5).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q06',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  1,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 6).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q07',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2025,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 7).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q08',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  1,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 8).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q09',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2025,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 9).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q10',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 10).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q11',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 11).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q12',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 12).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q13',
  'matematica',
  'Geometria espacial',
  'Geometria espacial',
  2025,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 13).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q14',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 14).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.1 · questão 15).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 1).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q02',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2025,
  2,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 2).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 3).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q04',
  'matematica',
  'Estatística descritiva',
  'Estatística descritiva',
  2025,
  2,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 4).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q05',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  2,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 5).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q06',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 6).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q07',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 7).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q08',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 8).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q09',
  'matematica',
  'Geometria plana',
  'Geometria plana',
  2025,
  2,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 9).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q10',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  2,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 10).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q11',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  2,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 11).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q12',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2025,
  2,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 12).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q13',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 13).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q14',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2025,
  2,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 14).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q15',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2025,
  2,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2025.2 · questão 15).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q01',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2026,
  1,
  1,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 1).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q02',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2026,
  1,
  2,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 2).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q03',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2026,
  1,
  3,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 3).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q04',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2026,
  1,
  4,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 4).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q05',
  'matematica',
  'Matemática financeira',
  'Matemática financeira',
  2026,
  1,
  5,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 5).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q06',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2026,
  1,
  6,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 6).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q07',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2026,
  1,
  7,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 7).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q08',
  'matematica',
  'Exponencial e logarítmo',
  'Exponencial e logarítmo',
  2026,
  1,
  8,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 8).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q09',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2026,
  1,
  9,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 9).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q10',
  'matematica',
  'Trigonometria',
  'Trigonometria',
  2026,
  1,
  10,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 10).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q11',
  'matematica',
  'Problema algébrico',
  'Problema algébrico',
  2026,
  1,
  11,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 11).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q12',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2026,
  1,
  12,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 12).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q13',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2026,
  1,
  13,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 13).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q14',
  'matematica',
  'Probabilidade',
  'Probabilidade',
  2026,
  1,
  14,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 14).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q15',
  'matematica',
  'Aritmética / razões e proporções',
  'Aritmética',
  2026,
  1,
  15,
  '[Questão em imagem — consulte o PDF compilado de matematica (prova 2026.1 · questão 15).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q23',
  'quimica',
  'Quantificação de cloreto na água potável',
  'Quantificação de cloreto na água potável',
  2015,
  2,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2015.2 · questão 23).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q24',
  'quimica',
  'Entalpias e fluidos de refrigeração',
  'Entalpias e fluidos de refrigeração',
  2015,
  2,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2015.2 · questão 24).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q25',
  'quimica',
  'Pilha de Daniell — Zn/Cu',
  'Pilha de Daniell',
  2015,
  2,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2015.2 · questão 25).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q21',
  'quimica',
  'H2 + O2 com ignição — estequiometria e gases',
  'H2 + O2 com ignição',
  2016,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.1 · questão 21).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q22',
  'quimica',
  'Compostos de Grignard — cloreto de etilmagnésio',
  'Compostos de Grignard',
  2016,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.1 · questão 22).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q23',
  'quimica',
  'Energia reticular — ciclo de Born-Haber',
  'Energia reticular',
  2016,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.1 · questão 23).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q24',
  'quimica',
  'Velocidade de reação — formação de Br2',
  'Velocidade de reação',
  2016,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.1 · questão 24).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q25',
  'quimica',
  'Diluição de H2SO4 comercial 90%',
  'Diluição de H2SO4 comercial 90%',
  2016,
  1,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.1 · questão 25).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q21',
  'quimica',
  'Polímeros — Náilon 66',
  'Polímeros',
  2016,
  2,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.2 · questão 21).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q22',
  'quimica',
  'Processo Haber-Bosch — equilíbrio de NH3',
  'Processo Haber-Bosch',
  2016,
  2,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.2 · questão 22).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q23',
  'quimica',
  'Álcool e substituição nucleofílica',
  'Álcool e substituição nucleofílica',
  2016,
  2,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.2 · questão 23).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q24',
  'quimica',
  'H2SO4 50% — expressão de concentração',
  'H2SO4 50%',
  2016,
  2,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.2 · questão 24).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q25',
  'quimica',
  'Entalpia de combustão — n-hexano e n-heptano',
  'Entalpia de combustão',
  2016,
  2,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2016.2 · questão 25).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q21',
  'quimica',
  'H2S em efluentes — reações redox',
  'H2S em efluentes',
  2017,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2017.1 · questão 21).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q22',
  'quimica',
  'Gás ideal — trabalho e variação de energia (gráfico T×V)',
  'Gás ideal',
  2017,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2017.1 · questão 22).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q23',
  'quimica',
  'Titulação de CaCO3 (volumetria de retorno)',
  'Titulação de CaCO3 (volumetria de retorno)',
  2017,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2017.1 · questão 23).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q24',
  'quimica',
  'Propriedades coligativas — pressão de vapor',
  'Propriedades coligativas',
  2017,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2017.1 · questão 24).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q25',
  'quimica',
  'n-butano e anidrido maleico',
  'n-butano e anidrido maleico',
  2017,
  1,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2017.1 · questão 25).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q21',
  'quimica',
  'Antioxidantes — fenóis alquilsubstituídos',
  'Antioxidantes',
  2018,
  2,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2018.2 · questão 21).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q22',
  'quimica',
  'Equilíbrio H2O + C → CO + H2 a 800°C',
  'Equilíbrio H2O + C → CO + H2 a 800°C',
  2018,
  2,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2018.2 · questão 22).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q23',
  'quimica',
  'DQO — Demanda Química de Oxigênio',
  'DQO',
  2018,
  2,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2018.2 · questão 23).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q24',
  'quimica',
  'Hidrogênio como combustível — eletrólise',
  'Hidrogênio como combustível',
  2018,
  2,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2018.2 · questão 24).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q25',
  'quimica',
  'Precipitação química no tratamento de efluentes',
  'Precipitação química no tratamento de efluentes',
  2018,
  2,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2018.2 · questão 25).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q21',
  'quimica',
  'Polímeros — termoplásticos e termorrígidos',
  'Polímeros',
  2021,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2021.1 · questão 21).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q22',
  'quimica',
  'Titulometria volumétrica',
  'Titulometria volumétrica',
  2021,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2021.1 · questão 22).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q23',
  'quimica',
  'Série eletromotriz — potenciais de redução',
  'Série eletromotriz',
  2021,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2021.1 · questão 23).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q24',
  'quimica',
  'Lei de Hess — variação de entalpia',
  'Lei de Hess',
  2021,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2021.1 · questão 24).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q21',
  'quimica',
  'Linguagem química — sais de potássio',
  'Linguagem química',
  2022,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2022.1 · questão 21).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q22',
  'quimica',
  'Isótopos de Si — massa atômica média',
  'Isótopos de Si',
  2022,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2022.1 · questão 22).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q23',
  'quimica',
  'Propriedades coligativas — sacarose em diferentes concentrações',
  'Propriedades coligativas',
  2022,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2022.1 · questão 23).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q24',
  'quimica',
  'pH de soluções ácidas e básicas',
  'pH de soluções ácidas e básicas',
  2022,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2022.1 · questão 24).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q25',
  'quimica',
  'Isomeria — propan-2-ol (álcool isopropílico)',
  'Isomeria',
  2022,
  1,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2022.1 · questão 25).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q21',
  'quimica',
  'Reações de precipitação — identificação de soluções',
  'Reações de precipitação',
  2024,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.1 · questão 21).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q22',
  'quimica',
  'Produção industrial de HNO3',
  'Produção industrial de HNO3',
  2024,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.1 · questão 22).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q23',
  'quimica',
  'Análise centesimal — fórmula mínima de fármaco',
  'Análise centesimal',
  2024,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.1 · questão 23).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q24',
  'quimica',
  'Metilparabeno — funções orgânicas',
  'Metilparabeno',
  2024,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.1 · questão 24).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q25',
  'quimica',
  'Entalpia de formação — cálculo termodinâmico',
  'Entalpia de formação',
  2024,
  1,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.1 · questão 25).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q21',
  'quimica',
  'Fotoprotetores — grupos cromóforos',
  'Fotoprotetores',
  2024,
  2,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.2 · questão 21).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q22',
  'quimica',
  'Solubilidade — hexano, metanol, heptanol',
  'Solubilidade',
  2024,
  2,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.2 · questão 22).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q23',
  'quimica',
  'Glicemia — concentração de glicose no sangue',
  'Glicemia',
  2024,
  2,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.2 · questão 23).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q24',
  'quimica',
  'Fermentação acética — etanol → ácido acético',
  'Fermentação acética',
  2024,
  2,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.2 · questão 24).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q25',
  'quimica',
  'Polietileno — estrutura de polímero de adição',
  'Polietileno',
  2024,
  2,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2024.2 · questão 25).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q21',
  'quimica',
  'Neutralização HNO3 + KOH — cálculo de pH',
  'Neutralização HNO3 + KOH',
  2025,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.1 · questão 21).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q22',
  'quimica',
  'Geometria molecular — técnicas espectroscópicas',
  'Geometria molecular',
  2025,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.1 · questão 22).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q23',
  'quimica',
  'Biogás — decomposição anaeróbica da matéria orgânica',
  'Biogás',
  2025,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.1 · questão 23).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q24',
  'quimica',
  'Calor de fusão — paracetamol',
  'Calor de fusão',
  2025,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.1 · questão 24).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q25',
  'quimica',
  'Ésteres — aromas, alimentos e cosméticos',
  'Ésteres',
  2025,
  1,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.1 · questão 25).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q21',
  'quimica',
  'Filtros solares orgânicos fotoestáveis',
  'Filtros solares orgânicos fotoestáveis',
  2025,
  2,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.2 · questão 21).]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q22',
  'quimica',
  'CCS — captura e armazenamento de CO2',
  'CCS',
  2025,
  2,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.2 · questão 22).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q23',
  'quimica',
  'Metais pesados — contaminação por Pb, Hg e As',
  'Metais pesados',
  2025,
  2,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.2 · questão 23).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q24',
  'quimica',
  'Dureza da água — íons Ca, Mg, Na',
  'Dureza da água',
  2025,
  2,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.2 · questão 24).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q25',
  'quimica',
  'Combustão completa do metano — balanço energético',
  'Combustão completa do metano',
  2025,
  2,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2025.2 · questão 25).]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q21',
  'quimica',
  'Cinética — decomposição catalítica do H2O2',
  'Cinética',
  2026,
  1,
  21,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2026.1 · questão 21).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q22',
  'quimica',
  'Tampão sanguíneo — pH e hiperventilação',
  'Tampão sanguíneo',
  2026,
  1,
  22,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2026.1 · questão 22).]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q23',
  'quimica',
  'Metanol — oxidação a formaldeído e ácido fórmico',
  'Metanol',
  2026,
  1,
  23,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2026.1 · questão 23).]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q24',
  'quimica',
  'Enzimas como biocatalisadores verdes',
  'Enzimas como biocatalisadores verdes',
  2026,
  1,
  24,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2026.1 · questão 24).]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q25',
  'quimica',
  'Biorredução de compostos carbonílicos',
  'Biorredução de compostos carbonílicos',
  2026,
  1,
  25,
  '[Questão em imagem — consulte o PDF compilado de quimica (prova 2026.1 · questão 25).]',
  '',
  'D',
  false
) on conflict (id) do nothing;
