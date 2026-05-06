-- =============================================================================
-- Migration 0023 — Seed de questões de Linguagens (Português)
-- =============================================================================
-- Gerado por scripts/extract_linguagens.ts a partir das provas oficiais
-- UNIFOR Medicina 2015.1–2026.1 (PDFs em
-- 'PROVAS MEDICINA UNIFOR/PROVA/'). Idempotente via ON CONFLICT.
--
-- Campos:
--   description: enunciado + alternativas (A..E) concatenados em texto.
--                Schema atual de questions não tem coluna 'options', então
--                guardamos tudo aqui — o pipeline de UI já trata enunciado
--                rico via markdown.
--   image_url: '' (texto extraído, sem imagem por enquanto). Schema exige
--              NOT NULL mas aceita string vazia. Pipeline futuro pode
--              gerar a imagem.
--   correct_answer: extraído do GABARITO oficial (PDF), com retificações
--              aplicadas a partir do PDF de QUESTÕES ANULADAS quando existir.
--   subtopic / subtopic_short: heurística simples baseada em palavras-chave
--              (Figuras de linguagem / Funções da linguagem / Literatura /
--              Análise sintática / Coesão / Gêneros visuais / Artes /
--              Interpretação).
--
-- Anuladas: descartadas durante extração; este seed não as inclui.
-- =============================================================================

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q41',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  1,
  41,
  'Cecília Meireles recebeu uma homenagem do
Goodle na sexta-feira (7/11/2014). A imagem
comemora o 113º aniversário da escritora
carioca. Cecília foi poetisa, pintora, professora e
jornalista brasileira, além de ter sido considerada
uma das vozes líricas mais importantes da língua
portuguesa.
Em relação às obras de Cecília Meireles,
considere as afirmações abaixo:
I - Giroflê Giroflá - livro de contos quase
crônicas, breves comentários e memórias da
autora, sobre personagens de sua infância.
II - Romanceiro da Inconfidência – obra que tem
como tema principal a Guerra de Canudos.
III - Ou Isto ou Aquilo – livro que traz poemas
infantis.
IV - Espectro - primeiro livro de poesias de
Cecília Meireles que traz um conjunto de
sonetos simbolistas.
É verdadeiro apenas o que se afirma em:

(A) I e III.
(B) II e IV.
(C) III e IV.
(D) I, II e IV.
(E) I, III e IV.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q42',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2015,
  1,
  42,
  'I, III e IV.
Em relação à poesia “Retrato” de Cecília
Meireles, considere as afirmações abaixo:
I - O primeiro verso “Eu não tinha este rosto de
hoje”, o pronome demonstrativo intensifica a
volta ao passado.
II - O segundo verso da 1ª estrofe dá um ritmo
lento sugerindo que a passagem do tempo
fosse quase imperceptível para o eu-lírico.
III - Na segunda estrofe, “eu não tinha este
coração/que nem se mostra”, a palavra
coração está empregada como uma elipse
para sentimentos.
IV - A terceira estrofe traz a transitoriedade
ressaltada na repetição da palavra “tão”,
mostrando a certeza da evolução e a
passagem da vida.
V - A autora aborda o tema da passagem da
vida e da sua transitoriedade de maneira
filosófica, particular e simples.
É verdadeiro apenas o que se afirma em:

(A) I e III.
(B) II e IV.
(C) III e IV.
(D) I, II e IV.
(E) I, II e III.
Retrato
Eu não tinha este rosto de hoje,
assim calmo, assim triste, assim magro,
nem estes olhos tão vazios,
nem o lábio amargo.
Eu não tinha estas mãos sem força,
tão paradas e frias e mortas;
eu não tinha este coração
que nem se mostra.
Eu não dei por esta mudança,
tão simples, tão certa, tão fácil:
- Em que espelho ficou perdida
a minha face?
Cecília Meireles MEIRELES, C. Antologia
Poética. Rio de Janeiro: Editora Nova
Fronteira, 2001.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q43',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2015,
  1,
  43,
  'I, II e III.
Retrato
Eu não tinha este rosto de hoje,
assim calmo, assim triste, assim magro,
nem estes olhos tão vazios,
nem o lábio amargo.
Eu não tinha estas mãos sem força,
tão paradas e frias e mortas;
eu não tinha este coração
que nem se mostra.
Eu não dei por esta mudança,
tão simples, tão certa, tão fácil:
- Em que espelho ficou perdida
a minha face?
Cecília Meireles MEIRELES, C. Antologia
Poética. Rio de Janeiro: Editora Nova
Fronteira, 2001.

Questão 43 Questão 44
O corpo é o lugar fantástico onde mora,
adormecido, um universo inteiro. Como na terra
moram adormecidos os campos e suas mil
formas de beleza, e também as monótonas e
previsíveis monoculturas; como na lagarta mora
adormecida uma borboleta, e na borboleta, uma
lagarta; como nos sapos moram príncipes e nos
príncipes moram sapos; como em obedientes
funcionários que fazem o que deles se pede
moram Leonardos que voam por espaços sem
fim dos sonhos... Tudo adormecido... O que
vai acordar é aquilo que a Palavra vai chamar.
As palavras são entidades mágicas [...] que
despertam os mundos que jazem dentro dos
nossos corpos, num estado de hibernação, como
sonhos. Nossos corpos são feitos de palavras...
Assim podemos ser príncipes ou sapos,
borboletas ou lagartas, campos selvagens
ou monoculturas, Leonardos ou monótonos
funcionários.
(ALVES, Rubens. A alegria de ensinar. 3. ed. s.n. Ars
Poética Editora Ltda, 1994.)
Rubem Alves, ao se reportar à força da palavra
na construção de significados à vida humana,
produz um texto cuja linha de raciocínio da tese,
dos argumentos e da conclusão podem ser
expressos, respectivamente, pelas figuras de
linguagem:

(A) Pleonasmo, antítese e paradoxo.
(B) Eufemismo, metonímia e paradoxo.
(C) Paradoxo, metáfora e antítese.
(D) Hipérbole, paradoxo e antítese.
(E) Metonímia, catacrese, prosopopeia.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q44',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2015,
  1,
  44,
  'Metonímia, catacrese, prosopopeia.
A redução da corrupção a níveis mínimos em
uma sociedade se concretiza, como revela a
experiência dos países mais evoluídos nesta
área, com a criação de órgãos e instituições
estatais independentes, com recursos humanos
preparados e bem remunerados, e a cobrança
de resultados pela sociedade. Isso exige um
elevado nível de cidadania, em que se repudia
a impunidade e as distinções, consciente de que
não é possível existir um Estado honesto sem
uma sociedade íntegra. Considerando esses
pré-requisitos, pode-se concluir que o combate
à corrupção somente terá sucesso no Brasil se
houver, além de estrutura estatal preparada para
enfrentar o problema, mudança da cultura social
que conduza a um controle social efetivo dos
governantes e políticos.
(José Matias-Pereira. É possível existir um Estado honesto
sem uma sociedade íntegra? Revista Jurídica Consulex,
ano XVIII – nº 425, 1º out. 2014).
De acordo com o texto, é correto afirmar que

(A) a redução da corrupção só se concretizará
se tivermos órgãos estatais independentes
para fiscalizar, independente de uma
sociedade organizada.
(B) um Estado honesto está diretamente ligado
a uma sociedade íntegra.
(C) a permanência da cultura social
preestabelecida é importante para o
fortalecimento do Estado.
(D) a importância da cobrança por resultados
pela sociedade é ínfima, pois ela não tem o
poder de fiscalização.
(E) o combate à corrupção terá êxito se o País
tiver uma estrutura estatal preparada para
enfrentar o problema.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q45',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2015,
  1,
  45,
  'o combate à corrupção terá êxito se o País
tiver uma estrutura estatal preparada para
enfrentar o problema.

Questão 45 Questão 46
“Quando escrevo, repito o que já vivi antes.
E para estas duas vidas, um léxico só não é
suficiente.
Em outras palavras, gostaria de ser um crocodilo
vivendo no rio São Francisco. Gostaria de ser
um crocodilo porque amo os grandes rios,
pois são profundos como a alma de um homem.
Na superfície são muito vivazes e claros,
mas nas profundezas são tranquilos e escuros
como o sofrimento dos homens.”
João Guimarães Rosa
De acordo com o texto, pode-se inferir que:

(A) Como os rios os sentimentos do homem são
eternos.
(B) Só existem crocodilos nos grandes rios.
(C) Os sentimentos verdadeiros nunca afloram
a consciência do homem.
(D) Todos os rios podem ser considerados
eternos.
(E) Comparação que possibilita conclusões
poéticas verdadeiras.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q46',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2015,
  1,
  46,
  'Comparação que possibilita conclusões
poéticas verdadeiras.
O trabalho infantil artístico ocorre principalmente
em programas de televisão e na publicidade.
Nessa seara, é regra o incentivo e interesse dos
pais ou responsável legal na realização do trabalho
da criança e do adolescente, seja pela projeção
social que representa, seja pelas possibilidades
econômicas que propicia. Por isso, não tem
sido rara a participação ou omissão dos pais em
situações de trabalho artístico que caracterizam
abuso e desrespeito. Diante disso, considere as
afirmativas abaixo:
I - A criança ainda não tem seus ossos e
músculos completamente desenvolvidos,
correndo maior risco de sofrer deformações
nos ossos, cansaço muscular.
II - crianças têm maior frequência cardíaca que
os adultos para o mesmo esforço e, por isso,
ficam mais cansados do que eles, ainda que
exercendo a mesma atividade.
III - a exposição das crianças às pressões do
mundo do trabalho pode provocar diversos
sintomas, por exemplo, dores de cabeça,
insônias, tonteiras.
IV - o trabalho infantil prova uma tríplice exclusão:
na infância, quando a criança perde a
oportunidade de brincar, estudar e aprender;
na idade adulta, quando perde oportunidades
de trabalho por falta de qualificação
profissional; na velhice, pela consequente
falta de condições dignas de sobrevivência.
É verdadeiro apenas o que se afirma em:

(A) I e III.
(B) II e IV.
(C) III e IV.
(D) I, II e IV.
(E) I, II, III e IV.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q47',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2015,
  1,
  47,
  'I, II, III e IV.

Questão 47 Questão 49
Mas não desisto da rosa
Que plantei no meu jardim
Nem da poesia ou da prosa
Que trago dentro de mim.
(João Soares Lôbo)
De acordo com o texto, assinale a alternativa
correta:

(A) Os dois “quês” que aparecem no quarteto
são conjunção.
(B) “da rosa” é objeto indireto.
(C) “no meu jardim” é objeto direto.
(D) Cada “que” é um sujeito.
(E) “Dentro de mim” é adjunto adnominal.
A Rua dos Cataventos',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q48',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  1,
  48,
  'Efemeridade da vida.
Questão 48
Em relação ao poema “A rua dos cataventos”
de Mario Quintana, marque a afirmação correta
quanto à sua característica formal.

(A) Soneto.
(B) Poema em prosa.
(C) Cantiga de roda.
(D) Poema em verso livre.
(E) Acalantos.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q49',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  1,
  49,
  '“Dentro de mim” é adjunto adnominal.
A Rua dos Cataventos
Da vez primeira em que me assassinaram,
Perdi um jeito de sorrir que eu tinha.
Depois, a cada vez que me mataram,
Foram levando qualquer coisa minha.
Hoje, dos meus cadáveres eu sou
O mais desnudo, o que não tem mais nada.
Arde um toco de vela amarelada,
Como único bem que me ficou.
Vinde! Corvos, chacais, ladrões de estrada!
Pois dessa mão avaramente adunca
Não haverão de arrancar a luz sagrada!
Aves da noite! Asas do horror! Voejai!
Que a luz trêmula e triste como um ai,
A luz de um morto não se apaga nunca!
Mario Quintana
Disponível em http://www.revistabula.com/2329-os-10-
melhores-poemas-de-mario-quintana/
Mario Quintana apresenta em seus textos uma
crítica à nossa época, com temas centrais como
a infância, o amor, o tempo, a morte, a poesia,
em composições que justapõem imagens
surrealistas ao registro dos fatos mais cotidianos,
e nas quais o tom humorístico predominante
mal disfarça um sentimento trágico diante da
existência.
Luiz Antonio de Assis Brasil et al. Pequeno Dicionário
da Literatura do Rio Grande do Sul. Porto Alegre: Novo
Século, 1999.
No poema “A rua dos cataventos”, transcrito na
questão anterior, o tema predominante é:

(A) A morte.
(B) Crítica à era da Modernidade, à massificação.
(C) Pessimismo diante da vida.
(D) Sentimento trágico diante da existência.
(E) Efemeridade da vida.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q50',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2015,
  1,
  50,
  'Acalantos.

Questão 50 Questão 51
Vítima da moda
ALGUÉM, EM algum beco escuro da internet,
acha que os seguintes itens têm a ver comigo:
saias curtas na altura das coxas, camisetas se
mangas e bem cavadas, chapéus com detalhes
metálicos, t-shirts estampadas com letras
enormes e dizeres irônicos.
Tudo moderno, descolado e... feminino. Por
quê? Sou um senhor de meia-idade, grisalho,
heterossexual e que, com todo respeito ao
genial “crossdresser” Laerte, se veste com
roupas masculinas. Mas esse tipo de moda me
bombardeia.
Entro em um site sério de notícias, como o da
própria Folha, e está lá um anúncio divulgando a
última coleção da marca. Navego pelo “New York
Times”, idem: essa mesma publicidade preenche
os espaços em branco e se oferece para mim,
justamente o ser menos interessado da Via
Láctea nos tais produtos.
Pode ser um bobo ranço geracional, mas tenho
enorme dificuldade para aceitar que conteúdo
informativo e publicidade se transformem em
uma coisa só.
Álvaro Pereira Júnior. Folha de S. Paulo,
Ilustrada, sábado, 11 out. 2014 (texto
adaptado)
De acordo com o texto, pode-se inferir que:

(A) O autor ficou ofendido por ser um homem
de meia-idade que teve de se submeter à
publicidade de roupas femininas.
(B) A indignação do autor se deu porque
propaganda não deveria estar em sites de
notícia.
(C) O autor teve receio de ser comparado com
seu colega de trabalho Laerte, que assumiu
sua homossexualidade.
(D) A revolta foi ter se sentido enganado, na era
da Internet, por que a publicidade estava
disfarçada de jornalismo.
(E) A parte que está em maiúscula indica
surpresa do autor.
O Pavão
(Rubem Braga)',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q51',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  1,
  51,
  'A parte que está em maiúscula indica
surpresa do autor.
O Pavão
(Rubem Braga)
Eu considerei a glória de um pavão ostentando
o esplendor de suas cores; é um luxo imperial.
Mas andei lendo livros, e descobri que aquelas
cores todas não existem na pena do pavão. Não
há pigmentos. O que há são minúsculas bolhas
d’água em que a luz se fragmenta, como em um
prisma. O pavão é um arco-íris de plumas. Eu
considerei que este é o luxo do grande artista,
atingir o máximo de matizes com o mínimo de
elementos. De água e luz ele faz seu esplendor;
seu grande mistério é a simplicidade. Considerei,
por fim, que assim é o amor, oh! Minha amada;
de tudo que ele suscita e esplende e estremece
e delira em mim existem apenas meus olhos
recebendo a luz de teu olhar. Ele me cobre de
glórias e me faz magnífico.
(Crônicas de Rubem Braga. Disponível em: < http://
pensador.uol.com.br/cronicas_de_rubem_braga/ >
Acesso em: 01/08/2014)
No que se refere ao assunto, modo de
apresentar e finalidade, respectivamente, pode-
se considerar que a crônica de Rubem Braga
apresenta:

(A) Informação colhida, descrição objetiva e
provoca o riso.
(B) Caso imaginário, narrativa sugestiva e
promove a reflexão.
(C) Experiência pessoal, exposição
argumentativa e promove a reflexão.
(D) Caso imaginário, narrativa sugestiva e
define um sentimento.
(E) Experiência pessoal, narrativa sugestiva e
define um sentimento.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q52',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  1,
  52,
  'Experiência pessoal, narrativa sugestiva e
define um sentimento.

Questão 52
MULHER: - Que é que vocês estão combinando aí?
JOÃO GRILO: - Estou dizendo que, se é desse jeito, vai ser difícil cumprir o testamento do cachorro, na
parte do dinheiro que ele deixou para o padre e para o sacristão.
SACRISTÃO - Que é isso? Que é isso? Cachorro com testamento?
JOÃO GRILO: - Esse era um cachorro inteligente. Antes de morrer, olhava para a torre da igreja toda vez
que o sino batia. Nesses últimos tempos, já doente para morrer, botava uns olhos bem compridos para os
lados daqui, latindo na maior tristeza. Até que meu patrão entendeu, com a minha patroa, e é claro que ele
queria ser abençoado pelo padre e morrer como cristão. Mas nem assim ele sossegou. Foi preciso que o
patrão prometesse que vinha encomendar a bênção e que, no caso dele morrer, teria um enterro em latim.
Que em troca do enterro acrescentaria no testamento dele dez contos de réis para o padre e três para o
sacristão.
SACRISTÃO: - (enxugando uma lágrima) Que animal inteligente! Que sentimento nobre!
(SUASSUNA, Ariano. Auto da Compadecida. 31.ed. Rio de Janeiro: Agir, 1997)
A leitura das peças teatrais de Ariano Suassuna nos faz mergulhar nas nossas origens culturais. Suassuna
é um contador de histórias que pratica a intertextualidade na construção de suas narrativas e prepara o leitor
para uma moral conforme a filosofia medieval cristã. Especificamente sobre a peça “Auto da Compadecida”
NÃO é correto afirmar que:

(A) a peça faz uma sátira aos poderosos e aos religiosos que se preocupam apenas com questões
materiais e, ainda, exalta os humildes.
(B) o enredo da peça retoma elementos dos autos medievais de Gil Vicente e da literatura de cordel.
(C) a peça apresenta texto introdutório que objetiva orientar a encenação e explicar, em linhas gerais, o
espírito da obra.
(D) o “Auto da Compadecida” traz a figura do anti-herói, uma espécie de personagem folclórica que vive
ao sabor das aventuras e do acaso.
(E) o “Auto da Compadecida” busca inspiração nos mamulengos, tradicional teatro de bonecos nordestino.

(D) O Ovo Cósmico
(E) A Senhora de Avignon
(A) A Tentação de Santo Antônio
(B) Persistência de Memória
(C) Galetea',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q53',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2015,
  1,
  53,
  'As variadas formas de humor são produtos da capacidade que o ser humano tem de poder ver graça nas
pessoas e situações. O humor se manifesta por meio de gestos, encenações, olhares, sons e textos. Num
momento inspirado ele faz uma crítica de costumes, de moral, de comportamento social, seja cantando,
imitando, encenando uma situação que reflete aquilo que viu e/ou sentiu. Claro que às vezes ele distorce e
exagera o fato para dar um toque cômico à sua demonstração, com o intuito apenas de obter o riso. Quando
consegue isso, fica satisfeito, pois seu objetivo foi alcançado. Quando não consegue contar, encenar ou
cantar, o homem usa o desenho.
(MORETTI, F. A. (Adaptado). Disponível em: < http://www.aleph.com.br/moretti/artigos_diferenca.htm>. Acesso em 10 de nov. 2014.
Levando-se em consideração os gêneros textuais relacionados ao humor, analise as imagens a seguir:
Assinale o item em que está corretamente relacionado o tipo textual à imagem.

(A) I. Cartum. II. Charge. III. Caricatura. IV. Quadrinho.
(B) I. Charge. II. Cartum. III. Caricatura. IV. Tirinha.
(C) I. Caricatura. II. Cartum. III. Quadrinho. IV. Tirinha.
(D) I. Charge. II. Charge. III. Cartum. IV. Tirinha.
(E) I. Cartum. II. Cartum. III. Charge. IV. Quadrinho.
I. II.
III. IV.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q54',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2015,
  1,
  54,
  'I. Cartum. II. Cartum. III. Charge. IV. Quadrinho.
I. II.
III. IV.

Questão 55 Questão 56
ATENÇÃO: As questões de números 55 a 60 estão apresentadas para as questões de Língua
Inglesa e Língua Espanhola. Você deverá respondê-las de acordo com a escolha já feita por ocasião
da inscrição ao Processo Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA
A polícia mundial tenta criar aparelhos para facilitar
a identificação de indivíduos que ameacem
o direito de ir e vir dos habitantes das grandes
cidades. Leia o texto a seguir e marque a opção
correta de acordo com a sequência da numeração
apresentada no texto.
CAUGHT – by a lamp post
Cities in the UK like London, Glasgow, and
Birmingham are fitting a new device to lamp
posts in areas which have a crime problem1. It’s
called Flashcam2 and has been developed by
an American company, Q Star. It consists of a
camera with a motion sensor3. If it detects a group
of people in an area where there is no reason for
them to be, it shouts a warning at them such as:
Stop! If you are engaging in an illegal activity, your
photograph will be taken. Please leave the area. If
people don’t move, it goes off with a very intense
flash and a loud shot4. They have had a positive
effect in some parts of London5 in reducing crime
and anti-social behaviour.

(A) where it is used; how it works; what the
device is called; what it does; how successful
it is.
(B) what the device is called; what it does; how
it works; where it is used; how successful it
is.
(C) how it works; what the device is called; what
it does; where it is used; how successful it is.
(D) where it is used; what the device is called;
how it works; what it does; how successful it
is.
(E) where it is used; what the device is called;
what it does; how it works; how successful it
is.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  1,
  56,
  'Os conectivos das sentenças 1 e 3 ligam
uma vantagem à uma desvantagem.

We will not stop until Ebola is stopped’: Anthony Banbury,
second left, head of the UN’s emergency health mission,
arrives in Liberia. Photograph: Reuters
Anthony Banbury is a man with an unprecedented,
unenviable mission – and he knows it. The head of
the first UN emergency health mission, which was
created in September to fight Ebola, compares the
task to fighting a raging blaze.
“It’s like a forest fire, it keeps spreading and
spreading. And when the firefighters come in,
they get embers on their backs, which fly around
as they try to put [the fire] out,” Banbury said in
an interview in the Ghanaian capital Accra, where
the UN Mission for Ebola Emergency Response
(Unmeer) is based.
“The biggest challenge we have is to play the role
of complex crisis manager. That’s one of the things
that’s been lacking so far. There has been some
really good work done by national governments,
UN agencies, NGOs and – increasingly – foreign
military, but they are all acting in their certain area,”
he added.
Announcing the creation of Unmeer in mid-
September, the UN secretary general Ban Ki-
moon said the unprecedented situation required
“unprecedented steps to save lives and safeguard
peace and security”.
Unmeer has five priorities: stopping the outbreak,
treating the infected, ensuring essential services,
preserving stability and preventing further
outbreaks. To achieve these daunting goals1,
it needs to bring together the full range of UN
actors and expertise to help the national efforts of
countries struggling to control the disease. It will
also work with the African Union and the Economic
Community of West African States, (Ecowas).
Ban has also warned that, as Ebola patients
overwhelm poorly equipped health facilities, other
people are dying from endemic diseases.
“In the three most affected countries – Guinea,
Liberia and Sierra Leone – the disease is destroying
health systems. More people are now dying in
Liberia from treatable ailments2 and common
medical conditions than from Ebola,” he said.
Banbury, an American who has worked for the
White House National Security Council and the
US defence department, as well as with the World
Food Programme, is acutely aware of this ancillary
demand3. He also acknowledges that the crisis is
affecting people’s ability to feed themselves: “We
want to make sure that even as we are working to
stop Ebola, people aren’t starving on the street.”
According to the World Bank, the Ebola outbreak
could cost the economies of west Africa $32.6bn
(£20.1bn) by the end of 2015, devastating fragile
nations still recovering from decades of intertwined,
resource-led wars.
Unmeer will coordinate the arrival of protective gear,
medical supplies, vehicles and generators to the
region. It will also help develop existing healthcare
facilities in the affected countries, including testing
centres, community care facilities4, treatment
centres and training centres for healthcare workers.
“The UN is uniquely positioned to help governments
with the role of complex crisis manager and to do
that across the region; Accra is the perfect place for
us,” Banbury said.
The UN has established a $988m Ebola response
multi-partner trust fund to provide a common,
coherent financing mechanism.
Banbury has already visited the affected countries.
He told reporters in Liberia last week that, despite
“good results”, much remained to be done. He
praised the work of district health officials and
frontline NGO workers.
With the scale of the crisis ever more apparent –
already Ebola has claimed more than 3,800 lives –
Banbury vowed Unmeer was in it for the long haul5 .
“We will stay in place for 42 days – twice as long as
the incubation period – after the last case, to make
sure,” he said. “There is a lot of work to do. But we
will not stop until Ebola is stopped.”
http://www.theguardian.com/global-development/2014/
oct/10/un-emergency-mission-chief-battle-ebola
Leia atentamente o texto sobre “EBOLA” e responda as questões 57 e 58.
HEALTH: EBOLA
Anthony Banbury nasceu em 1964 nos Estados Unidos. Atualmente ele é o representante especial e chefe da
Missão das Nações Unidas de Resposta Emergencial ao Ebola (UNMEER).
5
10
15
20
25
30
35
40
45
50
55
60
65
70
75

Questão 57 Questão 59
Questão 58
Marque a opção que melhor resume a ideia geral
do texto “EBOLA”.

(A) A capital de Gana será a base para a cura
da doença onde 3.800 vidas serão ceifadas
até o fim de 2015.
(B) O número de famintos nas ruas das cidades
deve ser combatido através de empréstimos
do Banco Mundial.
(C) A epidemia é como brasas de um fogo
florestal que se espalha rapidamente .
(D) A missão das Nações Unidas coordenada
por Anthony Banbury tem como objetivo
parar o surto de ebola, tratar os infectados,
garantir serviços essenciais, preservar a
estabilidade e prevenir surtos adicionais.
(E) O sucesso do trabalho de Anthony',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  1,
  57,
  'O sucesso do trabalho de Anthony
Banbury depende do esforço conjunto
do Departamento de Defesa Americano
juntamente com o Programa de Alimentação
Mundial.
Marque a alternativa que retrata corretamente
a ideia das ações verbais das sentenças
enumeradas no texto?

(A) 1. doenças tratáveis; 2. objetivos
assustadores; 3. a longo prazo; 4. Instalações
comunitárias; 5. demandas adicionais.
(B) 1. objetivos assustadores; 2. doenças
tratáveis; 3. demandas adicionais; 4.
instalações comunitárias; 5. a longo prazo.
(C) 1. demandas adicionais; 2. doenças
tratáveis; 3. objetivos assustadores; 4.
Instalações comunitárias; 5. a longo prazo.
(D) 1. doenças tratáveis; 2. demandas
adicionais; 3. objetivos assustadores; 4.
instalações comunitárias; 5. a longo prazo.
(E) 1. objetivos assustadores; 2. a longo prazo;
3. demandas adicionais; 4. instalações
comunitárias; 5. doenças tratáveis.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q58',
  'linguagens',
  'Artes',
  'Artes',
  2015,
  1,
  58,
  '1. at; 2. on; 3. with; 4. at. 5. on; 6. in; 7. on;
8. at; 9. on; 10. at

Questão 60
Billy Steinberg escreveu originalmente a música “True Colors” sobre a sua própria mãe. A canção foi incluída
no segundo álbum solo da cantora e atriz norte-americana Cyndi Lauper e chegou ao #1 da Billboard. “True
Colors” foi interpretada pelo elenco de Glee no episódio 11 da primeira temporada, “Hairography”.
TRUE COLOURS
You with the sad eyes
Don’t be discouraged til I realize
It’s hard to take courage1
In a world, full of people
You can lose sight2 of it
And the darkness, inside you makes you feel small
But I’ll see your true colours3, shining through you
I see your true colours, and that’s why I love you
So don’t be afraid, to let them show
Your true colours, true colours
Are beautiful, ooh like a rainbow
Show me a smile
Don’t be unhappy can’t remember when
I last saw you laughing
When this world makes you crazy
And you’ve taken all you can bear4
Just call me up5, cos you know I’ll be there
As expressões numeradas apresentam os seguintes significados:

(A) ter coragem1; pode perder de vista2; verei como você é3; pode aguentar4; ligue-me5 .
(B) ter coragem1; pode perder os olhos2; verei seu colorido3; pode sustentar4; erga-me5 .
(C) trazer coragem1;pode perder a vista2; verei a sua verdade3; pode suportar4; chame-me5 .
(D) levar coragem1; pode perder o olhar2; verei as suas cores3; pode segurar4; telefone-me5 .
(E) pegar coragem1; pode perder a visão2; verei o seu colorido3; pode sustentar4; levante-me5 .',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  1,
  59,
  '1. objetivos assustadores; 2. a longo prazo;
3. demandas adicionais; 4. instalações
comunitárias; 5. doenças tratáveis.
Mr. Anthony Banbury planejou sua visita a
Gana. Assim, complete sua agenda usando as
preposições corretas.
Anthony Banbury is flying to Accra. He’s
arriving there _____1 Wednesday, November
5th, because he couldn’t get the flight _____2
the fourth. He’s flying from JFK airport _____3
American Airlines and he’s arriving _____4 Accra
airport _____5 18.00. He’s staying there _____ 6
a month and he’s going back _____7 Friday,
December the 5 th leaving _____8 19.30. He’s
staying _____ 9 a small but clean hotel _____ 10
the downtown area.
Marque a alternativa que indica a sequenvia
correta das preposições utilizadas.

(A) 1. in; 2. on; 3. with; 4. in; 5. at; 6. for; 7. in; 8.
on; 9. In; 10. on
(B) 1. on; 2. on; 3. with; 4. at; 5. at; 6. for; 7. on;
8. at; 9. at; 10. in.
(C) 1. in; 2. in; 3. with; 4. at; 5. at; 6. in; 7. on; 8.
at; 9. in; 10. in
(D) 1. on; 2. at; 3. with; 4. in; 5. on; 6. for; 7. in;
8. in; 9. at; 10. at.
(E) 1. at; 2. on; 3. with; 4. at. 5. on; 6. in; 7. on;
8. at; 9. on; 10. at',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-1_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  1,
  60,
  'Escolha a opção que relaciona corretamente a coluna de frases célebres com seus respectivos autores.
1. Os poderosos podem matar uma, duas ou três
rosas, mas jamais conseguirão deter a primavera
inteira.
a) Alfredo Bryce Echenique. Escritor e
professor peruano de grande popularidade e
reconhecimento mundial.
2. El principio de no intervención es una de las
primeras obligaciones de los gobiernos, es el
respeto debido a la libertad de los pueblos y a los
derechos de las naciones.
b) Benito Juárez, Presidente mexicano. Por sua
defesa da liberdade foi nomeado “Benemérito
de las Américas”.
3. Dicen que soy un hombre de éxito. Yo no me he
enterado. En los instantes en que me he sentido
hombre de éxito, me he sentido profundamente
solo y abandonado. La fama no da sino soledad.
Yo le tengo terror...
c) Che Guevara, guerrilheiro revolucionário e
homem político.
http://elcomercio.pe/luces/libros/alfredo-bryce-echenique-15-frases-noticia-1710551/10
http://www.frasecelebre.net/profesiones/politicos/benito_juarez.html
http://pensador.uol.com.br/autor/che_guevara/ Acessos em 10/11/2014.

(A) 1 – c); 2 – b); 3 – a).
(B) 1 – a); 2 – b); 3 – c).
(C) 1 – c); 2 – a); 3 – b).
(D) 1 – a); 2 – c); 3 – b).
(E) 1 – b); 2 – c); 3 – a).',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q41',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  2,
  41,
  'Se acaso me quiseres
Sou dessas mulheres
Que só dizem sim
Por uma coisa à toa
Uma noitada boa
Um cinema, um botequim
E, se tiveres renda
Aceito uma prenda
Qualquer coisa assim
Como uma pedra falsa
Um sonho de valsa
Ou um corte de cetim [...]
(HOLANDA, Chico Buarque de. Folhetim. Disponível em:
<http://letras.mus.br/chico-buarque/85968/> Acesso em:
07/05/2015.
A personagem da literatura que melhor se
aproxima do perfil feminino descrito na canção
de Chico Buarque de Holanda é:

(A) Aurélia, de José de Alencar.
(B) Gabriela, de Jorge Amado.
(C) Antígona, de Sófocles.
(D) Marcela, de Machado de Assis.
(E) Marília, de Tomás Antônio Gonzaga.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q42',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2015,
  2,
  42,
  'Marília, de Tomás Antônio Gonzaga.
O provérbio que melhor traduz a ideia central da
tirinha é:

(A) Dos males o menor.
(B) Antes tarde do que nunca.
(C) Pior cego é o que não quer ver.
(D) A palavra é prata, o silêncio é ouro.
(E) Não deixes para amanhã o que podes fazer
hoje.

21 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q43',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  2,
  43,
  'Não deixes para amanhã o que podes fazer
hoje.

21 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Ao longo da história, a noção de cultura teve
diversos significados e matizes. Durante muitos
séculos foi um conceito inseparável da religião
e do conhecimento teológico; na Grécia, este foi
marcado pela filosofia, e em Roma, pelo direito,
ao passo que no Renascimento foi impregnado
principalmente pela literatura e pelas artes. Em
épocas mais recentes, como o Iluminismo, foram
a ciência e as grandes descobertas científicas
que deram o rumo principal à ideia de cultura.
Mas, apesar dessas variantes, até nossa época
cultura sempre significou uma soma de fatores
e disciplinas que, segundo amplo consenso
social, a constituíam e eram por ela implicados:
reivindicação de um patrimônio de ideias, valores
e obras de arte, de conhecimentos históricos,
religiosos, filosóficos e científicos em constante
evolução, fomento da exploração de novas
formas artísticas e literárias e da investigação
em todos os campos do saber.
(LLOSA, Mario Vargas. A civilização do espetáculo:
uma radiografia do nosso tempo e da nossa cultura.
Rio de Janeiro: Objetiva, 2013, p. 59)
A ideia principal expressa no texto de Mario
Vargas Llosa é:

(A) o conceito de cultura foi inseparável da
religião durante muitos séculos.
(B) o conceito de cultura teve diversos
significados e matizes ao longo da história.
(C) o Renascimento apresentou um conceito de
cultura impregnado pela literatura e pelas
artes.
(D) a ciência e as grandes descobertas
científicas deram o rumo principal ao
conceito de cultura no Iluminismo.
(E) a cultura, na contemporaneidade, sempre
significou uma soma de fatores e disciplinas
que a constituíam.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q44',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  2,
  44,
  'a cultura, na contemporaneidade, sempre
significou uma soma de fatores e disciplinas
que a constituíam.
Questão 43
Questão 44
Questão 45
Cena da Paixão de Cristo, no Santuário de Bom Jesus
do Matosinhos, em Congonhas (Foto: Pedro Ângelo/
G1). Disponível em: < http://g1.globo.com/minas-gerais/
noticia/2014/11/bicentenario-de-morte-de-aleijadinho-e-
celebrado-nesta-terca-feira.html>. Acesso em 06/05/2015.
A arte barroca nasceu em oposição à arte
renascentista, que se baseava na razão e
nos modelos greco-romanos de equilíbrio e
simplicidade. Entre os maiores artistas da época
está Antônio Francisco Lisboa, o Aleijadinho. Foi
o maior artista do período colonial e suas criações
vão de projetos inteiros de igrejas a esculturas e
entalhes delicados. As características próprias
do Barroco adquirem em seus trabalhos uma
feição particular, tais como:
I – Os olhos são expressivos, espaçados
e amendoados e apresentam certa
semelhança aos orientais.
II – As maçãs do rosto mostram forte semelhança
com as esculturas dos anjos barrocos.
III – O nariz é reto e alongado, o que dá muita
força às fisionomias.
IV – Os lábios são entreabertos, o que traz uma
ideia de movimento e vida à figura.
V – O queixo é sutilmente retangular, o que
confere altivez à imagem esculpida.
É correto apenas o que se afirma em:

(A) I, II, III.
(B) II, III, V.
(C) I, III, IV.
(D) II, IV, V.
(E) I, IV, V.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q45',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2015,
  2,
  45,
  'I, IV, V.
TEXTO PARA AS QUESTÕES 44 e 45.
No que se refere aos elementos coesivos no
texto, na frase “[...] na Grécia, este foi marcado
pela filosofia [...]” (l. 4), o pronome demonstrativo
faz referência

(A) a Grécia.
(B) à noção de cultura.
(C) ao conhecimento teológico.
(D) ao conceito.
(E) ao Iluminismo.

22 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q46',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2015,
  2,
  46,
  'ao Iluminismo.

22 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Questão 46 Questão 48
Questão 47
“O que eu vi, sempre, é que toda ação principia
mesmo é por uma palavra pensada. Palavra
pegante, dada ou guardada que vai rompendo
rumo.”
Guimarães Rosa
A partícula “o” grifada, no texto acima, classifica-
se como:

(A) Artigo.
(B) Pronome oblíquo.
(C) Pronome demonstrativo.
(D) Substantivo.
(E) Numeral.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q47',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2015,
  2,
  47,
  'A redução da maioridade penal seria
“pecado”, uma vez que se ancora no
sentimento de vingança da sociedade para
com o adolescente, “não na ideia de justiça”.
Aos navegantes
Aos que pretendem empreender essa viagem, o
autor pede que levem consigo, para o caso de
se perderem, três distinções básicas: ciúme é
querer manter o que se tem; cobiça é querer o
que não se tem; inveja é não querer que o outro
tenha.
E que prestem atenção: a inveja é um vírus
que se caracteriza pela ausência de sintomas
aparentes. O ódio espuma. A preguiça se
derrama. A gula engorda. A avareza acumula. A
luxúria se oferece. O orgulho brilha. Só a inveja
se esconde.
E que tomem cuidado: como adverte uma
personagem desse livro, a emergente Vera
Loyola, “o verdadeiro amigo não é o que é solidário
na desgraça, mas o que suporta o seu sucesso”.
Ou, como constatou outro personagem, o Padre:
“A solidariedade na alegria é muito rara.”.
VENTURA, Zuenir. Mal Secreto. Rio de
Janeiro: Objetiva, s/d. p.11.
A utilização das aspas em “o verdadeiro amigo
não é o que é solidário na desgraça, mas o que
suporta o seu sucesso” (l. 15-16) refere-se:

(A) ao realce dado pelo autor.
(B) à citação indireta.
(C) à citação direta curta.
(D) à ironia.
(E) a citações de textos legais.

23 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q48',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2015,
  2,
  48,
  'Numeral.
Disponível em: <http://negrobelchior.cartacapital.com.
br/2014/02/18/senado-pode-votar-reducao-da-maioridade-
penal/>. Acesso em: 09/05/2015
Em relação à charge, marque a assertiva que
traduz corretamente a imagem.

(A) A redução da maioridade penal vai promover
a reinserção do cidadão apenado depois
que cumprir sua pena.
(B) A medida trará a criminalização do excluído.
(C) O que se pretende é suspender a cidadania
dos jovens e sua condição humana.
(D) As medidas socioeducativas seriam
“pessimamente aplicadas” pelos municípios.
(E) A redução da maioridade penal seria
“pecado”, uma vez que se ancora no
sentimento de vingança da sociedade para
com o adolescente, “não na ideia de justiça”.
Aos navegantes',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q49',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2015,
  2,
  49,
  'a citações de textos legais.

23 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Questão 49
DEFORMAÇÃO CULTURAL
O novo Secretário de Cultura do Rio de Janeiro está preocupado em valorizar as manifestações mais
populares daquilo que, grosso modo, pode-se chamar de cultura. Fiel às suas origens, substituiu o maestro
Edino Krieger da presidência do Museu da Imagem e do Som por uma neta de Cartola. E nomeou a bisneta
de Donga para outro cargo de sua secretaria.
Sem entrar no julgamento de valor da neta e da bisneta de dois grandes compositores populares, a atitude
do novo secretário tem alguma coisa de nepotismo, não de nepotismo de sangue, mas um tipo de nepotismo
cultural inédito até agora na administração pública. O mesmo secretário promete procurar as emissoras de
rádio para darem espaço ao “som” de Monarco, Dona Ivone Lara “e tantos outros”.
Novamente sem entrar no mérito dos escolhidos (pessoalmente, sou fã incondicional de Monarco), creio
que a função do Estado está mais acima da concorrência comercial dos diversos gêneros da nossa
música. As emissoras programam-se de acordo com o mercado. Ao Estado competiria complementar as
manifestações musicais e culturais que não se enquadram na grade de uma programação destinada à
onda ditada pelo momento.
[...]
Cultura é um conceito abrangente que deixa de ser cultura quando se limita a manifestações setorizadas,
por melhores e mais dignas que sejam.
Carlos Heitor Cony
Disponível: <http://www1.folha.uol.com.br/folha/pensata/ult505u245.shtml>. Acesso em 10/05/2015.
O artigo de opinião, como o próprio nome já diz, é um texto em que o autor expõe seu posicionamento
diante de algum tema atual e de interesse de muitos. As escolhas feitas pelo autor conferem ao texto:

(A) Leitura breve e simples, pois são textos pequenos com linguagem objetiva.
(B) Argumentos consistentes, vocabulário rebuscado, pois visa a um público específico.
(C) Ponto de vista com característica peculiar para descrição, com os verbos no imperativo.
(D) Texto dissertativo com informações coerentes e inadmissíveis.
(E) Linguagem objetiva e aparecem repletas de sinais de exclamação, os quais incitam à posição de
reflexão favorável ao enfoque do autor.

24 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q50',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2015,
  2,
  50,
  'Linguagem objetiva e aparecem repletas de sinais de exclamação, os quais incitam à posição de
reflexão favorável ao enfoque do autor.

24 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Questão 50
Matilda. Disponível em: < https://www.google.com.br/search?hl=pt-BR&site=imghp&tbm=isch&source=hp&biw=1366
&bih=651&q=tirinhas+mafalda&oq=TIRINHAS > Acesso em: 11/01/2015.
Com base no texto original que possibilita o recurso da intertextualidade presente na tirinha da personagem
Matilda, analise as afirmações a seguir quanto ao gênero:
I. Apresenta narrativa linear e curta, tanto em extensão quanto no tempo em que se passa.
II. Envolve poucas personagens e as que existem se movimentam em torno de uma única ação.
III. Utiliza ações que se passam em torno de um só espaço, constituem um só eixo temático e um só
conflito.
IV. Traz linguagem é simples e direta, não se utiliza de muitas figuras de linguagem ou de expressões com
pluralidade de sentidos.
V. Defende um ponto de vista diferente do que a maioria percebe.
É correto apenas o que se afirma em:

(A) I e II.
(B) IV e V.
(C) I, III e V.
(D) II, IV e V.
(E) I, II, III e IV.

25 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q51',
  'linguagens',
  'Literatura',
  'Literatura',
  2015,
  2,
  51,
  'I, II, III e IV.

25 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

A poesia de Manuel Bandeira caracterizou-
se pela variedade criadora, desde o soneto
parnasiano, pela prática do verso livre, até por
experiências com a poesia concretista. De
acordo com as características do texto, pode-se
afirmar que a poesia “A onda” tem traços do:

(A) Romantismo.
(B) Simbolismo.
(C) Naturalismo/Realismo.
(D) Concretismo.
(E) Parnasianismo.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q52',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  2,
  52,
  'Considerações finais.
Considere a situação de comunicação abaixo:
“Um médico em conversa com um paciente de
baixa escolaridade, em uma Unidade de Pronto
Atendimento (UPA)”.
Selecione a alternativa que apresenta o texto
mais adequado para o contexto relatado.

(A) Você apresenta uma coronariopatia severa.
(B) Ao tomar a medicação, podem ocorrer
tontura, náuseas e cefaleia.
(C) Vixe, tu tá é frito, macho, com essa tosse de
cachorro!
(D) Pelo seu exame, você apresenta água no
pulmão.
(E) A origem das cefalalgias ainda não é bem
conhecida.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q53',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2015,
  2,
  53,
  'Parnasianismo.
Questão 51
Questão 53
Questão 54
Questão 52
TEXTO PARA AS QUESTÕES 51 e 52.
A onda
a onda anda
aonde anda
a onda?
a onda ainda
ainda onda
ainda anda
aonde?
aonde?
a onda a onda.
Manuel Bandeira (In BERALDO, Alda. Trabalhando com
poesia. São Paulo: Ática, 1998. p.32)
De acordo com o texto, pode-se afirmar que a
poesia “A onda” traz como recursos:
I – Paronomásia – consiste em usar palavras
ou frases semelhantes (som ou grafia), de
sentidos diferentes, para efeito retórico ou
poético.
II – Aliteração – consiste na repetição de
consoantes ou de sílabas - especialmente as
sílabas tônicas - em duas (ou mais) palavras,
dentro do mesmo verso, estrofe, ou numa
frase.
III – Assonância - é a repetição de sons vocálicos,
em sílabas tônicas de palavras distintas ou
na mesma frase para obter certos efeitos de
estilo.
IV – Onamatopeia – Consiste na imitação, por
palavras, do som natural das coisas.
É correto apenas o que se afirma em:

(A) I e II.
(B) I e III.
(C) II e III.
(D) II e IV.
(E) III e IV.
“Sempre fui avesso aos prólogos. Em meu
conceito eles fazem à obra o mesmo que o
pássaro à fruta antes de colhida: roubam as
primícias do sabor literário.”
José de Alencar',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q54',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  2,
  54,
  'III e IV.
“Sempre fui avesso aos prólogos. Em meu
conceito eles fazem à obra o mesmo que o
pássaro à fruta antes de colhida: roubam as
primícias do sabor literário.”
José de Alencar
De acordo com o texto, o termo “prólogos” tem o
sentido de:

(A) Conclusões.
(B) Provérbios.
(C) Prospectos.
(D) Prefácios.
(E) Considerações finais.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2015,
  2,
  55,
  'A origem das cefalalgias ainda não é bem
conhecida.

Questão 55 Questão 56
ATENÇÃO: As questões de números 55 a 60 estão apresentadas para as questões de Língua
Inglesa e Língua Espanhola. Você deverá respondê-las de acordo com a escolha já feita por ocasião
da inscrição ao Processo Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA
O cantor inglês George Ezra afirma ter recebido
influências de Bob Dylan e Woody Guthrie para
compor suas músicas. O sucesso Budapest
confirma o grande interesse do público por sua
voz grave e rítmica.
And give me one more reason
Why I should never make a change
Baby if you hold me
Then all of this will go away1
Oh, to you
Ooh, you
Ooh, I’d leave2 it all
Assim, as sentenças numeradas no refrão da
música apresentam os seguintes significados,
respectivamente:

(A) uma possibilidade no futuro1; uma situação
hipotética2 .
(B) uma decisão no futuro1; uma situação
hipotética2 .
(C) uma situação hipotética1; uma possibilidade
no futuro2 .
(D) uma situação irreal1; uma situação irrea2 .
(E) uma promessa no futuro1; uma situação
irreal2 .',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q56',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2015,
  2,
  56,
  'uma promessa no futuro1; uma situação
irreal2 .
Peanuts é uma tirinha americana escrita e
ilustrada por Charles M. Schulz. Foi uma das
tirinhas mais populares e influentes com 17,897
publicações – o maior número na história da
humanidade.
Considerando essa tirinha, o sentido da
expressão “...I’d much rather...” é:

(A) “...eu pensaria muito mais...”
(B) “...eu pretenderia muito mais...”
(C) “...eu imaginaria muito mais...”
(D) ”...eu preferiria muito mais...”
(E) “...eu tentaria muito mais...”

27 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  2,
  57,
  '“...eu tentaria muito mais...”

27 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Leia atentamente o texto sobre “Blood Pattern Analysis” e responda as questões 57 e 58.
HEALTH: Blood Pattern Analysis
Even a tiny drop of blood at the scene of a violent crime can give important information to the police. Blood
is there either because it has dripped out1 of a small wound, sprayed out from an artery, oozed out2 through
a large wound, or flown off a weapon. Using blood pattern analysis, police can learn a lot about what
happened from the shape of the blood drops.
Sometimes a murderer cleans the crime scene very carefully, and if detectives cannot see any blood they
spray a chemical called Luminol across the scene. This makes it possible to see the blood in the dark.
Luminol can show up3 very small drops of blood.
From blood at the scene of a crime, police can learn about the person the blood came from. They can tell
the person’s blood type and, because male and female blood cells are different, they can also work out4
if the blood comes from a man or woman. Also, 80% of us are ‘secretors’, which means our blood type is
contained in other bodily fluids. This can also help identify suspects.
In 1984 a man, Graham Backhouse, was found injured near his home with deep cuts
across his face and chest. A neighbour lay dead nearby. Backhouse said the neighbour
attacked him, and so he shot the neighbour to defend himself. But the shape of the blood
drops showed that Backhouse was standing still when he was wounded, and there was
also no blood from Backhouse on his gun or near the victim. Police were sure Backhouse
shot his victim and then wounded himself. He was found guilty of murder.
Após a leitura do texto, escreva (V) se a sentença for verdadeira e (F) se for falsa nos parênteses ao lado.
1. Blood from a cut artery drips out. ( )
2. Blood pattern analysis looks at the shape of drops of blood. ( )
3. Luminol tells you the blood type. ( )
4. Male blood is different from female blood. ( )
5. Graham Backhouse’s neighbour shot himself. ( )
Marque a altermativa que traz a sequência correta.

(A) 1. (V); 2. (V); 3. (V); 4. (F); 5. (V)
(B) 1. (F); 2. (V); 3. (V); 4. (F); 5. (F)
(C) 1. (V); 2. (V); 3. (F); 4 (V); 5. (V)
(D) 1. (F); 2. (V); 3. (F); 4.(V); 5. (F)
(E) 1. (F); 2. (V); 3. (V); 4. (V); 5. (F)',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  2,
  58,
  '1. (F); 2. (V); 3. (V); 4. (V); 5. (F)
Com base no texto, as expressões numeradas apresentam os seguintes significados:

(A) 1.pingou; 2.descobriu; 3.pingar; 4.revelar.
(B) 1.pingou; 2. escorreu; 3.revelar; 4.descobrir.
(C) 1.escorreu; 2. pingou; 3.revelar; 4.descobrir.
(D) 1.pingou; 2.escorreu; 3.descobrir; 4.revelar.
(E) 1.descobriu; 2. revelou; 3.descobrir; 4.revelar.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  2,
  59,
  '1.descobriu; 2. revelou; 3.descobrir; 4.revelar.
Questão 57
Questão 58

28 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Leia atentamente o texto sobre “Rescued Migrant hopes...” e responda as questões 59 e 60.
THE WORLD: Rescued migrant hopes for better life in Europe for baby born on warship
Stephanie Samuel and baby Francesca Marina soon to be transferred from Sicilian hospital to
immigration centre.
Francesca Marina, who was born on an Italian navy vessel in the Mediterranean. Photograph: AP
A woman who gave birth on a warship after the Italian navy rescued her from a migrant boat has said her
daughter will have a better life in Europe after surviving the dangerous voyage.
Baby Francesca Marina, named after St Francis and the Italian navy, was delivered aboard the Bettica naval
vessel in the Mediterranean a week ago. Once ashore, she suffered seizures and was put in intensive care1 .
A week on, Francesca and her mother, Stephanie Samuel, 24, have recovered and doctors in Sicily said
they would probably be transferred to an immigration centre2 for families with small children in a few days’
time.
The story of the migrant baby born aboard a navy ship captured international media attention at the end of
one of the busiest weekends for sea crossings from Libya to Europe this year, during which about 6,800
people were rescued3 and dozens are said to have drowned.
Samuel, who is Nigerian, worked for two years in Tripoli as a housemaid to save money to pay smugglers
for the trip. The boat she set off in with about 90 others stalled after three hours at sea.
By the time they were picked up by the Bettica4 off the Libyan coast seven hours later, she was unconscious
after suffering epileptic seizures and had gone into labour.
“I didn’t expect the baby, you know, but she just came,” Samuel said. “I just wanted to leave Libya. Italy is
better than Libya and Nigeria is the worst.”
Of her daughter, she said: “God decides, not me … but I believe she will have a more good future in Europe.”
So far this year more than 30,000 people have reached Italy by sea from North Africa, mostly from Libya.

29 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

People smugglers using Facebook to lure migrants into ‘Italy trips’
More than 170,000 came last year. The interior ministry has said 200,000 might make it to Italy’s shores in
2015.
Many are political refugees such as Syrians fleeing civil war or Eritreans escaping forced military conscription,
while others like Samuel are economic migrants in search of a better life.
Samuel said her husband, who was still working in Libya, was ready to risk the sea crossing to be with her
and their daughter as soon as he could afford to pay the smugglers, who demand up to £1,000 for passage
on overcrowded, rickety boats.
http://www.theguardian.com/world/2015/may/11/rescued-migrant-mother-better-life-europe-baby
Questão 59
Qual a opção que melhor resume a ideia do texto
“Rescued migrant hopes for better life in Europe
for baby born on warship”?

(A) Relatar a estória do bebê migrante
Francesca Marina, ressaltando o sofrimento
de milhares de migrantes que atravessam o
Mar Mediterrâneo para escapar não apenas
de recrutamento militar, mas também em
procura de uma vida melhor.
(B) Narrar como os bebês nascidos a bordo
de navios da marinha são capturados e
transferidos para centros de imigração de
famílias com crianças no norte da Itália.
(C) Demonstrar todo o trabalho desenvolvido
pela marinha italiana e os governos mundiais
para solucionar o problema dos migrantes
africanos na região do Mediterrâneo.
(D) Apresentar a ação dos contrabandistas no
mercado de migração dos países africanos
em guerra, ludibriando a boa fé dos
refugiados e ao mesmo tempo contradizendo
o direito de cidadãos civis.
(E) Mostrar o percurso seguido por um dos
barcos de refugiados na costa Italiana e suas
consequências na vida de seus tripulantes e
familiares na busca de uma vida melhor.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2015-2_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2015,
  2,
  60,
  '33 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase

Questão 60
Se terminó el egoísmo, el narcisismo selfie, la obsesión por el consumo y la pasividad que conlleva.
Hay una generación que quiere salvar el mundo, pero todavía no sabe cómo. Han nacido o crecido en
plena recesión, en un mundo azotado por el terrorismo, índices de paro galopantes y una sensación
apocalíptica provocada por el cambio climático. Son más realistas que sus hermanos mayores, señalan
todas las consultoras de marketing (siempre preocupadas por sus futuros consumidores). Han visto cómo
sus predecesores malgastaban el tiempo acumulando títulos universitarios y másteres para malbaratar
entrevistas de trabajo por su sobrecualificación.
http://politica.elpais.com/politica/2015/05/02/actualidad/1430576024_684493.html, acesso em 03/05/2015
Marque a opção que apresenta o seguimento da ideia exposta na matéria acima:

(A) Los socialistas fían su opción de formar Gobiernos a que el líder de Ciudadanos no facilite completar
mayorías en Madrid y Valencia, las dos comunidades con más casos de corrupción.
(B) Son la generación Z, el grupo demográfico nacido entre 1994 y 2010 y que representa el 25,9% de la
población mundial. Los expertos ya analizan todos los rasgos de su personalidad. Básicamente porque
son el mercado que se avecina.
(C) La ofensiva se inscribe en una larga y enloquecida guerra emprendida por el Cártel Jalisco-Nueva
Generación contra las autoridades. Esta organización ya dio muestras de su poder, cuando desató su
venganza por la muerte de Heriberto Acevedo, alias El Gringo, uno de sus jefes sicarios.
(D) Hace cuatro años, quienes afirmaban tener como fuente única de ingresos un contrato de cero horas
no llegaba ni por asomo al 1%; hoy son el 2,3% de los trabajadores en este país –unas 700.000
personas--, según la Oficina Nacional de Estadísticas británica. Mujeres, menores de 25 años y
mayores de 65 son, según la ONS, los perfiles mayoritarios bajo este sistema.
(E) En este contexto, subraya que, en la actualidad, se reclama a los representantes políticos eficacia
en la gestión de los recursos públicos y advierte de que está “constatado que nuestra organización
institucional actual duplica gastos en materias iguales y que, sobre todo, no es eficiente a la hora de
responder al ciudadano”.

34 UNIfOR – P r o c e s s o S e l e t i v o 2015.2 – M E D I C I N a - 1ª fase',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q41',
  'linguagens',
  'Literatura',
  'Literatura',
  2016,
  1,
  41,
  'Sonhar mais um sonho impossível
Lutar quando é fácil ceder
Vencer o inimigo invencível
Negar quando a regra é vender
Sofrer a tortura implacável
Romper a incabível prisão
Voar num limite improvável
Tocar o inacessível chão
É minha lei, é minha questão
Virar esse mundo, cravar esse chão
Não me importa saber
Se é terrível demais
Quantas guerras terei que vencer
Por um pouco de paz
E amanhã se esse chão que eu beijei
For meu leito e perdão
Vou saber que valeu
Delirar e morrer de paixão
E assim, seja lá como for
Vai ter fim a infinita aflição
E o mundo vai ver uma flor
Brotar do impossível chão.
Sonho Impossível. Versão de Chico Buarque de Holanda e Ruy Guerra. Disponível em: <
http://letras.mus.br/chico-buarque/86054/>. Acesso em: 26/10/2015.
A figura do herói, na versão de Chico Buarque de Holanda e Ruy Guerra, traz em seu perfil o potencial de
luta, força e coragem que o identifica com uma postura de nobreza acima do bem e do mal.
Com base na leitura do texto, assinale a opção que apresenta a reflexão encontrada na visão do herói
clássico abordada na canção.

(A) Vencer o inimigo invencível.
(B) Delirar e morrer de paixão.
(C) Brotar do impossível chão.
(D) Tocar o inacessível chão.
(E) Romper a incabível prisão.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q42',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  1,
  42,
  'Romper a incabível prisão.

Questão 42
TEXTO 1
A Volkswagen alemã anunciou nesta terça-feira (22) que vai ter que modificar milhões de carros a diesel em
todo o mundo por causa de um software que afeta as emissões de gases poluentes dos motores.
A montadora alemã reconheceu o problema nos motores a diesel tipo EA 189. Nos veículos equipados com
esse motor, existe um programa de computador que, nas vistorias, faz com que o motor solte muito menos
poluentes do que quando usado normalmente nas estradas.
Nos Estados Unidos, cerca de meio milhão de veículos Volkswagen têm esse motor. A agência de proteção
ambiental americana afirma que o software engana os inspetores nas vistorias. E o Departamento de
Justiça abriu uma investigação criminal.
A Volks separou o equivalente a R$ 29 bilhões para modificar 11 milhões de veículos em todo o mundo.
Esse valor corresponde à metade do lucro global previsto para esse ano.
O presidente mundial da Volkswagen, Martin Winterkorn, disse que as irregularidades com os carros a
diesel contradizem tudo que a empresa representa. “Dou minha palavra de que vamos lidar com tudo de
forma transparente, e sinto muito que tenhamos ferido a confiança de vocês”, prometeu o executivo [...].
(Preço Volkswagen admite software que engana inspetores em vistorias, Portal G1)
TEXTO 2
(Jean Galvão, Folha de S.Paulo)
A partir da comparação e relação entre os dois textos, a notícia e a charge, podemos inferir que o efeito
cômico gerado pelo texto II explora

(A) a descoberta de novas alternativas de combustível que podem mudar o panorama atual do setor
aumentando a demanda.
(B) o aumento no preço dos combustíveis gerado pelo repasse das refinarias para os postos e,
consequentemente, para os consumidores.
(C) o desempenho de veículos da montadora alemã em testes de emissão de poluentes devido a um
software adulterado.
(D) o aumento na venda dos carros da montadora alemã devido ao novo sistema que reduz a emissão de
poluentes.
(E) o problema no software responsável por calcular a emissão de poluentes nos carros da montadora
movidos a gasolina.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q43',
  'linguagens',
  'Artes',
  'Artes',
  2016,
  1,
  43,
  'o problema no software responsável por calcular a emissão de poluentes nos carros da montadora
movidos a gasolina.

Questão 43 Questão 44
TEXTO 1
Uma vez investido sobre o mundo humano,
o medo adquire um ímpeto e uma lógica de
desenvolvimento próprios e precisa de poucos
cuidados e praticamente nenhum investimento
adicional para crescer e se espalhar –
irrefreavelmente. Nas palavras de David L.
Altheide, o principal não é o medo do perigo, mas
aquilo no qual esse medo pode se desdobrar, o
que ele se torna. A vida social se altera quando
as pessoas vivem atrás de muros, contratam
seguranças, dirigem veículos blindados, portam
porretes e revólveres, e frequentam aulas
de artes marciais. O problema é que essas
atividades reafirmam e ajudam a produzir o
senso de desordem que nossas ações buscam
evitar.
(BAUMAN, Sygmunt. Tempos líquidos.
Trad. Carlos Alberto Medeiros. Rio de
Janeiro: Zahar, 2007)
TEXTO 2
Mesmo antes da emoção do medo, como
se observa na arqueologia linguística do
termo, havia o Medo, puro, simples. Ele existe
objetivamente no mundo, quer gostemos disso
ou não, como um produto, uma qualidade de que
são dotados certos fenômenos. Um precipício
batido pelo vento é de dar medo, como uma fera
predatória faminta. É o fato de que o mundo está
cheio desses medos que nos ensina a sensação
de pavor com que nos aproximamos deles. O
medo é a reação adequada a estas ameaças.
[...]. Os medos nos ensinam que nosso habitat
é minado de potencialidades desastrosas,
mais precisamente porque o medo representa
as coisas ruins que podem acontecer, mas
igualmente as que podem não acontecer, ele
também nos vence ao nos fazer temer o que não
existe e o inexplicado.
(WALTON, Stuart. Uma história das
emoções. Trad. Ryta Vinagre. Rio de
Janeiro: Record, 2007.
O elo entre o texto I e II pode ser verificado por
meio da relação estabelecida de

(A) causalidade.
(B) consequência.
(C) explicação.
(D) condição.
(E) concessão.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q44',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  1,
  44,
  'concessão.
O balão que o oficial entrega para o sargento no
último quadrinho possui uma série de símbolos e,
dentro do contexto das histórias em quadrinhos,
possui uma função definida.
O uso de tal recurso faz com que a tirinha
apresente elementos

(A) metalinguísticos.
(B) metafóricos.
(C) fáticos.
(D) poéticos.
(E) prosaicos.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q45',
  'linguagens',
  'Literatura',
  'Literatura',
  2016,
  1,
  45,
  'prosaicos.

Questão 45 Questão 46
O realismo exaustivo
Para definir o Realismo Literário seria preciso
primeiro definir o que é a realidade. Se os filósofos
ainda não chegaram a um acordo sobre esta,
não podemos esperar muita coisa em relação
àquele. Jorge Luis Borges dizia que as literaturas
de todos os povos em todos os tempos tinham
uma tendência para o fantástico, e o realismo é
“uma excentricidade recente”.
O chamado realismo evoluiu nos séculos 18, 19
e 20, principalmente no que se refere a técnicas
de observação e descrição, ao uso do ponto de
vista (pela técnica do autor, o leitor “vê” o que
o personagem não percebe ou compreende), à
naturalidade do diálogo (que aos poucos passa a
incorporar a fala cotidiana e o monólogo interior,
e não depender apenas da retórica escrita), à
percepção das forças econômicas, políticas,
ideológicas que se exprimem pelas ações dos
personagens, e assim por diante.
Ao mesmo tempo, o realismo foi vítima da ânsia
de reproduzir na página o mundo como ele
realmente é, o que não passa de uma armadilha
conceitual.
TAVARES, Braulio. O realismo exaustivo.
Língua Portuguesa. Ano 9. Nº 116. Junho
de 2015, p. 28-29.
Em relação ao texto, considere as afirmações a
seguir.
I. Realismo Literário propôs uma
representação materialista mais objetiva e
fiel da vida humana.
II. O termo esta (l. 2) se refere à realidade; e
àquele (l. 3), ao Realismo Literário.
III. Segundo Jorge Luis Borges, os povos
gostam do realismo por ser excêntrico.
IV. O título do texto “O realismo exaustivo”
encontra-se justificado no terceiro parágrafo.
V. O texto afirma que a técnica do realismo é
exagerar na descrição da realidade.
É verdadeiro apenas o que se afirma em:

(A) I e III.
(B) II e IV.
(C) III e IV.
(D) I, II e IV.
(E) I, II e III.
Soneto presunçoso',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q46',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2016,
  1,
  46,
  'I, II e III.
Soneto presunçoso
Que forma luminosa me acompanha
quando, entre o lusco e o fusco, bebo a voz
do meu tempo perdido, e um rio banha
tudo o que caminhei da fonte à foz?
Dos homens desde o berço enfrento a sanha
que os difere da abelha e do albatroz.
Meu irmão, meu algoz! No perde-e-ganha
quem ganhou, quem perdeu, não fomos nós.
O mundo nada pesa. Atlas, sinto
a leveza dos astros nos meus ombros.
Minha alma desatenta é mais pesada.
Quer ganhe ou perca, sou verdade e minto.
Se pergunto, a resposta é dos assombros.
No sol a pino finjo a madrugada.
Ledo Ivo. Disponível em: <http://www.
casadobruxo.com.br/poesia/l/ledo13.htm>.
Acesso em 10/10/2015.
Sobre o poema de Ledo Ivo, Modernismo de 45,
pode-se inferir que

(A) a temática é sobre angústia e questões
perante a vida e o tempo.
(B) a linguagem utilizada na segunda estrofe é
metalinguística.
(C) o eu-lírico apresenta aflições amorosas e
reflexões existenciais.
(D) o verso livre é predominante para descrever
a valorização do cotidiano.
(E) a base da poesia é construída em uma
revisão crítica cultural e social.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q47',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  1,
  47,
  'a base da poesia é construída em uma
revisão crítica cultural e social.

Questão 47 Questão 48
A charge faz referência a uma famosa pintura de
Tarsila do Amaral. Nesse tipo de intertextualidade,
encontramos o seguinte recurso:

(A) paródia, explícita, pois altera o sentido
original e se encontra na superfície textual
com efeito de sentido cômico.
(B) paráfrase, explícita, pois ratifica o sentido do
texto fonte e se encontram elementos da
intertextualidade na superfície do texto.
(C) pastiche, implícita, pois não se encontra na
superfície textual efeito de sentido irônico.
(D) citação, explícita, pois se encontra na
superfície textual indicação da autoria.
(E) tradução, implícita, pois não se encontra
na superfície textual o efeito de sentido de
denúncia.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q48',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  1,
  48,
  'tradução, implícita, pois não se encontra
na superfície textual o efeito de sentido de
denúncia.
Filhos de mães que trabalham fora de casa
se dão melhor na vida
Um novo estudo da Harvard Business School
prova que ter uma mãe que trabalha fora de casa
tem vantagens, ao contrário do que diz o senso
comum. A pesquisa, liderada pela professora
Kathleen McGinn, aponta que filhas de mães
que trabalham ganham salários 23% mais altos e
33% delas ocupam cargos de supervisão, contra
apenas 25% das rebentas de mães que ficam
em casa. Para os filhos de trabalhadoras, os
efeitos são diferentes, mas ainda assim positivos:
eles gastam mais tempo cuidando da casa e da
família - uma média de 16 horas por semana,
contra 8 horas do outro grupo. Os resultados
liberam as mães que se sentem culpadas de
voltar para o escritório. “Filhas de mães que
trabalham enxergam que é ok ir trabalhar, e não é
ok passar o tempo todo limpando a casa. E filhos
enxergam que não tem como manter o controle
da vida pessoal e profissional, se todo mundo não
trabalhar junto”, disse McGinn em uma entrevista.
FERNANDES, Ana Luísa. Filhos de mães que trabalham fora de
casa se dão melhor na vida. Disponível em: < http://super.abril.
com.br/comportamento/filhos-de-maes-que-trabalham-fora-de-casa-
se-dao-melhor-na-vida >. Acesso em: 28/10/2015.
Em relação ao texto, considere as afirmações a
seguir.
I. Apresenta o resultado de uma pesquisa sobre
mães que trabalham fora de casa.
II. Argumenta a importância de mães trabalharem
fora de casa para o melhor desenvolvimento
de seus filhos.
III. As aspas indicam o depoimento da professora
Kathleen McGinn a Havard Business School.
IV. O senso comum é contrário ao estudo
realizado pela Havard Business School.
V. A pesquisa aponta que é maior a porcentagem
de filhas de mães que trabalham fora com
salários melhores do que as filhas de mães
que trabalham em casa.
É correto apenas o que se afirma em:

(A) I e II.
(B) IV e V.
(C) II, III e IV.
(D) I, II, III e V.
(E) I, III, IV e V.
ESTÃO
PEGANDO NO
MEU PÉ...',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q49',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  1,
  49,
  'I, III, IV e V.
ESTÃO
PEGANDO NO
MEU PÉ...

Questão 49
Um povo, que depende do governo para se manter vivo, é como o cordeiro que depende do lobo.
Poder Popular - Site de notícias/mídia. Disponível em https://www.facebook.com/Poder Popular01/ photos/a.700349200027820.1073741827. 7003447
03361603/1027035510692519/>. Acesso em: 15/11/2015
A partir da análise do contexto apresentado acima, pode-se inferir que

(A) a sociedade é independente do governo, quando há projetos sociais de transferência de renda.
(B) o povo não necessita do poder público para resolver os problemas da sociedade.
(C) a permanência da desigualdade social mantém o povo subjugado ao um Estado paternalista.
(D) o povo confia em um governo paternalista, pois este é comprometido com o bem-estar social.
(E) os benefícios sociais são importantes para o povo viver sem auxílio governamental.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q50',
  'linguagens',
  'Literatura',
  'Literatura',
  2016,
  1,
  50,
  'os benefícios sociais são importantes para o povo viver sem auxílio governamental.

Questão 50
Questão 51
CRÔNICA DE UM AMOR ANUNCIADO
Martha Medeiros
Toda pessoa apaixonada é um publicitário em potencial. Não anuncia cigarros, hidratantes ou máquinas de
lavar, mas anuncia seu amor, como se vivê-lo em segredo diminuísse sua intensidade.
O hábito começa na escola. O caderno abarrotado de regras gramaticais, fórmulas matemáticas e lições
de geografia, e lá, na última página, centenas de corações desenhados com caneta vermelha. Parece
aula de ciências, mas é introdução à publicidade. Em breve se estará desenhando corações em árvores,
escrevendo atrás da porta do banheiro e grafitando a parede do corredor: Suzana ama João.
A partir de uma certa idade, a veia publicitária vai tornando-se mais discreta. Já não anunciamos nossa
paixão em muros e bancos de jardim. Dispensa-se a mídia de massa e parte-se para o telemarketing.
Contamos por telefone mesmo, para um público selecionado, as últimas notícias da nossa vida afetiva.
Mas alguns não resistem em seguir propagando com alarde o seu amor. Colocam anúncios de verdade no
jornal, geralmente nos classificados: Kika, te amo. Beto, volta pra mim. Everaldo, não me deixe por essa
loira de farmácia. Joana, foi bom pra você também?
.........................
O amor é uma coisa íntima, mas todos nós temos a necessidade de torná-lo público. É a nossa vitória
contra a solidão. Assim como as torcidas de futebol comemoram seus títulos com buzinaços, foguetório
e cantorias, queremos também alardear nossa conquista pessoal, dividir a alegria de ter alguém que faz
nosso coração bater mais forte. É por isso que, mesmo não sendo adepta do estardalhaço, me consterno
por aqueles que amam escondido, amam em silêncio, amam clandestinamente. Mesmo que funcione como
fetiche, priva o prazer de ter um amor compartilhado.
Disponível em: <http://pensador.uol.com.br/cronicas_de_marta_medeiros_sobre_amor/.>. Acesso em 15/10/2015.
Sobre as demonstrações da paixão, o texto expressa

(A) crítica à publicização do sentimento amoroso em locais inadequados.
(B) solidariedade aos que amam escondido em silêncio, clandestinamente.
(C) tristeza por aqueles que não noticiam o sentimento, não divulgam com os outros.
(D) repúdio àqueles que partem para o telemarketing para mostrar a conquista pessoal.
(E) vergonha por aqueles que anunciam o amor por necessidade de torná-lo público.
[...]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q51',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2016,
  1,
  51,
  'vergonha por aqueles que anunciam o amor por necessidade de torná-lo público.
[...]
Há sem dúvida quem ame o infinito,
Há sem dúvida quem deseje o impossível,
Há sem dúvida quem não queira nada –
Três tipos de idealistas, e eu nenhum deles:
Porque eu amo infinitamente o finito,
Porque eu desejo impossivelmente o possível,
Porque eu quero tudo, ou um pouco mais, se puder ser,
Ou até se não puder ser... [...]
(Fernando Pessoa. O que há. In.: Poesia de Álvaro Campos. São Paulo: FTD, 1992)
Sobre os versos de Álvaro de Campos, um dos heterônimos de Fernando Pessoa, pode-se afirmar que

(A) os três primeiros versos trazem oração sem sujeito e oração com sujeito indeterminado.
(B) os três primeiros versos trazem oração com sujeito indeterminado e oração com sujeito oculto.
(C) os três primeiros versos trazem oração sem sujeito e oração com sujeito simples.
(D) os três primeiros versos trazem oração com sujeito indeterminado e oração com sujeito simples.
(E) os três primeiros versos trazem oração com sujeito composto e oração com sujeito indeterminado.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q52',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2016,
  1,
  52,
  'os três primeiros versos trazem oração com sujeito composto e oração com sujeito indeterminado.

Questão 52
Questão 53
A crítica contida na tirinha do personagem Armandinho aborda uma sociedade consumista que

(A) supre a ausência do afeto paterno com presentes materiais.
(B) substitui a presença dos pais pelos presentes natalinos.
(C) troca a presença materna por presentes no Natal.
(D) acredita compensar a ausência do afeto com o apelo material.
(E) sonha poder dar presentes no Natal a seus filhos.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q53',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  1,
  53,
  'sonha poder dar presentes no Natal a seus filhos.
Suricate Seboso. Disponível em: < https://www.facebook.com/suricateseboso/photos/pb.255108341285168.-
2207520000.1447686871./822769367852393/?type=3&theater>. Acesso em 16/11/2015.
A língua escrita, assim como a falada, compreende diferentes níveis, de acordo com o uso que dela se faça.
No texto acima, observamos uma opção linguística típica do cearense. A partir do “cearensês” apresentado
e do conceito de “língua x fala”, avalie as afirmações a seguir.
I. A fala (língua x fala – Ferdinand de Saussure) é formada por signos, os quais podem ser modificados
individualmente por um falante.
II. O objetivo maior da comunicação não foi atingido, pois os signos linguísticos apresentados no texto
não unem um elemento concreto (significante) a um elemento inteligível (significado).
III. A língua não é essencial para a construção de uma identidade.
IV. Há, no Brasil, preconceito linguístico com os falantes cearenses, já que os termos citados são utilizados
somente por pessoas de baixa escolaridade.
É verdadeiro apenas o que se afirma em:

(A) I.
(B) II.
(C) II, III.
(D) III e IV.
(E) I e IV.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q54',
  'linguagens',
  'Coesão e coerência',
  'Coesão',
  2016,
  1,
  54,
  'I e IV.

O período que, além de apresentar coesão e coerência, está redigido de acordo com as normas do padrão
culto da língua é:

(A) Deu negativo, o resultado do primeiro exame para saber se um paciente isolado do Rio de Janeiro tem
ebola. A informação da Fundação Oswaldo Cruz (Fiocruz) foi divulgada na noite desta quinta-feira (12),
como mostrou o RJTV. As análises serão repetidas em 48 horas.
(B) O paciente pode apresentar resultado negativo em um primeiro momento e na contraprova ter um
resultado diferente. Então precisa-se de dois resultados negativos para retirar ele do isolamento.
Enquanto isso ele continua recebendo o mesmo tratamento.
(C) Rodrigo Stabeli, vice-presidente de pesquisa e laboratório de referência, afirmou que o paciente tem
quadro estável e sem febre. Ele se alimentou normalmente e não precisou tomar anti-térmicos, mas
está recebendo hidratação intravenosa pois apresentou uma leve desedratação.
(D) Ele está recebendo medicamentos para prevenção de malária, a qual tem os mesmos sintomas do
ebola. O paciente não apresenta piora, está lúcido, afebril e alimentou-se. O tratamento irá continuar
para descartar a infecção de malária.
(E) O paciente estar em isolamento no Hospital Evandro Chagas, que fica na Fiocruz, em Manguinhos, no
Subúrbio do Rio. Ele é acompanhado por um médico, um enfermeiro, e um a gente de desinfecção,
que cuida da limpeza da área de isolamento onde estar o paciente.
G1. Exame de paciente dá negativo para suspeita de Ebola, diz Fiocruz. Adaptado.
Disponível em: < http://g1.globo.com/rio-de-janeiro/noticia/2015/11/exame-de-paciente-da-negativo-para-suspeita-de-ebola-diz-
fiocruz.html >. Acesso: 12/11/2015.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q56',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  1,
  56,
  'I, III, IV e V.
Scottish woman claims she can smell
Parkinson’s disease
A Scottish woman says she can smell Parkinson’s
disease — and scientists say her claim doesn’t
stink.
Joy Milne’s husband battled Parkinson’s for 20
years before passing away earlier this year. She
told BBC News that his odor changed even years
before he was diagnosed.
“His smell changed and it seemed difficult to
describe,” she told the British news website. “It
wasn’t all of a sudden. It was very subtle — a
musky smell. I got an occasional smell.”
However, she didn’t realize there was a distinct
smell to Parkinson’s until she and her husband
attended a support group.
“It wasn’t until we moved back to Scotland, to
Perth, and we went to the Parkinson’s group and
when I went into the room, I thought ‘Oh the smell
is stronger,’” she told Sky News. “I realized that
then other people smelt. It could be strong with
somebody, it could be weaker with somebody
else, so that in actual fact whether they were
controlled, or their disease was getting worse
or their actual medication was working, I could
actually identify.”
Milne caught the eye of the organization
Parkinson’s UK, which decided to try out her
“skill” in a special study. The organization enlisted
six people with Parkinson’s and six without, BBC
News reported. They all wore T-shirts for a day,
and Milne was then given the shirts and told to
say which ones had Parkinson’s and which ones
didn’t.
“Her accuracy was 11 out of 12. We were quite
impressed,” Dr. Tilo Kunath told the BBC.
Actually, make that 12 out of 12. A man from the
“non-Parkinson’s group” actually was diagnosed
with the disease eight months later, according to
the news website
That really impressed us and we had to dig further
into this phenomenon,” Dr Kunath said.
So now Parkinson’s UK is doing a 200-person

Questão 56
Questão 57
O gato Garfield é estrela de uma das tirinhas mais famosas da história, sendo publicado em 2570 jornais de
todo o mundo. Garfield é criação de Jim Davis, que tirou o nome de seu avô James Garfield Davis.
Leia a tirinha abaixo.
Qual a alternativa corresponde ao pensamento final de Garfield?

(A) Nós somos mais altos do que vocês, humanos.
(B) Nós somos tão altos quanto vocês, humanos.
(C) Nós somos tão altos quanto queremos ser.
(D) Nós somos altos, quando queremos ser.
(E) Nós somos mais altos do que vocês.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q57',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2016,
  1,
  57,
  'Nós somos mais altos do que vocês.
Maggie enviou um e-mail para Jane. Complete-o usando os pronomes reflexivos.
From: Margie
To: Jennifer
Subject: Thomas
Attachments
Hi Jennifer
Yes, Thoma’s a lot better, thanks. Pretty much back to his old (1) _______. We got vaccinated (2) ______
against hepatitis before we went to Angola, so Thomas was just unlucky to get it. He went into work after we
got back although he was feeling bad, and some of his colleagues were worried about getting it (3) ______.
I know that some of them had (4)______ checked by their doctors. By coincidence, his boss said that he’d
got caught hepatitis (5) ______ when he was in Nigeria a few years ago. When he’s completely recovered,
Thomas and (6) _____ are off to Belgium for a few weeks, and we’re going to occupy (7) _____ with looking
at the art galleries and having a rest.
Must go now. The kids have just shouted that they want some juice and they can’t reach it (8) _____.
Will be in touch,
Margie
Assinale a alternativa que corresponde adequadamente aos pronomes pessoais no e-mail.

(A) 1. himself. 2.ourself; 3. themself; 4. themself; 5. himself; 6. himself; 7. ourself; 8. themself.
(B) 1. self; 2. ourselves; 3. themselves; 4. themselves; 5. himself; 6. myself; 7. ourselves; 8. themselves.
(C) 1. self; 2. ourselves; 3. themself; 4. theyselves; 5. himselves; 6. himselves; 7. ourself; 8. themself.
(D) 1. himself; 2. ourselves; 3. themselves; 4. themselves; 5. himself; 6. myself; 7. ourselves; 8. themselves.
(E) 1. self; 2. yourself; 3. itself; 4. myself; 5. himself; 6. myself; 7. ourselves; 8. themselves.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q58',
  'linguagens',
  'Artes',
  'Artes',
  2016,
  1,
  58,
  '1. self; 2. yourself; 3. itself; 4. myself; 5. himself; 6. myself; 7. ourselves; 8. themselves.

Questão 58
Em 2012, a banda inglesa The Rolling Stones ou simplesmente The Stones, comemorou seus 50 anos de
sucesso. Keith Richards, aos 21 anos, a criou com apenas três notas de sua guitarra, enquanto Mick Jagger, aos
22 anos, escreveu sua letra em uma noite, em 1962.
Satisfaction
I can’t get no satisfaction
I can’t get no satisfaction
‘Cause I try and I try and I try
and I try
I can’t get no, I can’t get no
When I’m drivin’ in my car
And that man comes on the radio
He’s tellin’ me more and more
About some useless information
Supposed to fire my imagination
I can’t get no, oh no, no, no
Hey hey hey, that’s what I say
I can’t get no satisfaction
I can’t get no satisfaction
‘Cause I try and I try and I try and I try
I can’t get no, I can’t get no
When I’m watchin’ my T.V.
And that man comes on to tell me
How white my shirts can be
But he can’t be a man ‘cause he doesn’t smoke
The same cigarettes as me
I can’t get no, oh no, no, no
Hey hey hey, that’s what I say
I can’t get no satisfaction
I can’t get no girl with action
‘Cause I try and I try and I try and I try
I can’t get no, I can’t get no
When I’m ridin’ round the world
And I’m doin’ this and I’m signing that
And I’m tryin’ to make some girl
Who tells me baby better come back later next week
‘Cause you see I’m on a losing streak
I can’t get no, oh no, no, no
Hey hey hey, that’s what I say
I can’t get no, I can’t get no
I can’t get no satisfaction
No satisfaction, no satisfaction, no satisfaction
A partir da leitura da música, avalie as afirmações a seguir.
I. O autor está insatisfeito com o consumismo imposto pela mídia.
II. O autor não está satisfeito com sua vida, mas não quer tentar mudar.
III. O autor não está satisfeito porque não sabe lidar com o sucesso e está perdendo suas namoradas.
IV. O autor não está satisfeito porque está dirigindo seu carro, sua camisa está suja e está cansado de
tentar mudar.
V. O autor não está satisfeito porque embora tente, não aceita os apelos impostos pela sociedade de
consumo e da mídia.
É correto APENAS o que se afirma em:

(A) I e V.
(B) IV e V.
(C) I, II e III.
(D) I, II, III e IV.
(E) II, III, IV e V.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q59',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  1,
  59,
  'II, III, IV e V.

Questão 59
Dilbert é um personagem das tiras diárias criadas por Scott Adams, o qual era economista na Pacific Bell,
o que lhe deu uma enorme experiência em burocracia e na generalidade das “coisas absurdas” da vida
empresarial.
Leia a tirinha abaixo observando o uso do auxiliar “WILL”.
https://pt.wikipedia.org/wiki/Dilbert
Marque a opção que mellhor expressa o uso do auxiliar “WILL” na tirinha.

(A) 1. Intenção; 2. Plano.
(B) 1. Decisão; 2. Decisão.
(C) 1. Intenção; 2. Intenção.
(D) 1. Predição; 2. Predição.
(E) 1. Decisão; 2. Predição.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-1_Q60',
  'linguagens',
  'Literatura',
  'Literatura',
  2016,
  1,
  60,
  'La irrupción de la complejidad en la teorización científica conmueve la epistemología de la ciencia. Sin
embargo, en cierto modo, tal irrupción no constituye una novedad. Al menos desde Dilthey y más o menos
explícitamente, la reivindicación de una especificidad de las ciencias humanas, como la historia y la
sociología, frente a las ciencias de la naturaleza, se ha venido basando en la complejidad.
MUNNÉ, F. Complejidad y caos: más alla de una ideologia del orden y del desorden. En M. Montero, coord.,
Conocimiento, realidad e ideología. Caracas: Avepso, 1994.
Marque a opção que apresenta a continuação mais adequada do texto acima.

(A) La novedad en la caricia un te quiero-de un quizas a un mas bueno-de reir o de llorar.-La novedad-de
un viento nuevo en tu cara-y que el mar-con olas bravas-no confunda tu mirar.-La novedad-la novedad-
en la caricia un te quiero-de un quizas a un mas bueno-de reir o de llorar.
(B) Lo que si es novedad es que ya te olvide, ya no me interesas, me arte de serte fiel, de besarte los pies
y de estar tras tus rejas. Y como lo ves, dejamos caer nuestro orgullo a pedazos. Hay que reconocer,
lo nuestro no se dió. Fuimos todo un fracaso.
(C) La principal novedad sería el estreno de Baku, la capital azerbaiyana, que albergaría el décimo Gran
Premio del año, el 17 de julio. Malasia, habitualmente en las primeras fechas del calendario, pasaría
al 25 de septiembre y sería la decimosexta carrera de la temporada, justo siete días después del Gran
Premio de Singapur. México albergaría, el 30 de octubre, la antepenúltima carrera de una temporada
que se cerrará el 27 de noviembre en Abu Dabi, dos semanas después del Gran Premio de Brasil, en
Sao Paulo.
(D) Lo que si es nuevo son los significados que el mundo presenta a quien conoce, aparecen a lo largo
de la obra bonaventuriana, claramente por ejemplo en el Itinerarium, bajo la forma de un simbolismo
universal que se despliega en instancias de luminosidad que permite el acceso a la belleza de los entes.
Así, tenemos las siguientes caracterizaciones: sombra es todo ente que representa a Dios en forma
lejana y confusa, por medio de lo cual accedemos a nociones comunes como ser, vivir y entender.
(E) Lo que sí es novedad es el hecho de que ahora la complejidad es reclamada desde éstas últimas
ciencias. (En otro aspecto, éstas siguen a aquéllas: la especificidad de las ciencias humanas también
se basa en la coincidencia entre el objeto a conocer y el sujeto conocedor. Y a partir de la mecánica
cuántica, entre observador y observado, o lo que es lo mismo el conocedor y el conocido, han dejado
de ser entidades separables.)',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q42',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  2,
  42,
  'Recorrência de termos.
Disponível em http://www.usp.br/cje/jorwiki/exibir.php?id_texto=250. Acesso 6/05/2016.
Com relação à publicidade infantil, avalie as afirmações a seguir.
I. A publicidade infantil é considerada abusiva, pois a criança é mais vulnerável ao discurso persuasivo.
II. A estratégia publicitária consiste na aproximação entre linguagem empregada nos anúncios e a
cotidiano, a fim de que a mensagem seja compreendida.
III. O discurso publicitário tem afetado positivamente na construção das escolhas das crianças, tornando-
as consumistas precoces.
IV. A mensagem na publicidade infantil é criada a partir do repertório da criança cuja intenção é persuadi-
la para o consumo de qualquer produto ou serviço.
É correto apenas o que se afirma em:

(A) I e II.
(B) II e III.
(C) I e IV.
(D) II, III e IV.
(E) I, III e IV.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q43',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2016,
  2,
  43,
  'Saudade é não saber. Não saber o que fazer com os dias que ficaram mais compridos, não saber
como encontrar tarefas que lhe cessem o pensamento, não saber como frear as lágrimas diante de uma
música, não saber como vencer a dor de um silêncio que nada preenche.
Marta Medeiros. Disponível em https://www.facebook.com/marta.medeiros.9085?fref=ts . Acesso 20/04/2016
Em relação aos termos em negrito no texto, pode-se dizer que o tipo de coesão textual que ocorre é:

(A) Referencial por substituição.
(B) Referencial por reiteração.
(C) Sequencial por conexão.
(D) Sequencial por reiteração.
(E) Recorrência de termos.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q44',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  2,
  44,
  'I, III e IV.

Questão 44 Questão 45
TEXTO
Eu quero uma casa no campo
Onde eu possa compor muitos rocks rurais
E tenha somente a certeza
Dos amigos do peito e nada mais
Eu quero uma casa no campo
Onde eu possa ficar no tamanho da paz
E tenha somente a certeza
Dos limites do corpo e nada mais
Eu quero carneiros e cabras pastando solenes
No meu jardim
Eu quero o silêncio das línguas cansadas
Eu quero a esperança de óculos
Meu filho de cuca legal
Eu quero plantar e colher com a mão
A pimenta e o sal
Eu quero uma casa no campo
Do tamanho ideal, pau-a-pique, sapé
Onde eu possa plantar meus amigos
Meus discos e livros
E nada mais
(TAVITO; ZÉ RODRIX. Casa no Campo. Intérprete: Elis
Regina. Disponível em: < http://www.vagalume.com.br/ze-
rodrix/casa-no-campo.html > Acesso em: 11/04/2016)
A composição de Tavito e Zé Rodrix traduz
a idealização da vida no campo, a mesma
representada nos versos de Cláudio Manuel da
Costa assinalados no item:

(A) “Ao campo me recolho/Que não há maior
bem que a soledade”.
(B) “Lembrado estou, ó penhas, que algum
dia/Na muda solidão deste arvoredo/
Comuniquei convosco meu segredo”.
(C) “Mas que modo, que acento, que harmonia/
Bastante pode ser, gentil pastora/Para
explicar afetos de alegria”.
(D) “Que eu tenho que acolher-me sempre ao
lado/Do velho desengano apercebido”.
(E) “Ou já fujas do abrigo da cabana/Ou sobre
os altos montes mais te assomes/faremos
imortais nossos nomes”.
TEXTO
Poeta cantô de rua,
Que na cidade nasceu,
Cante a cidade que é sua,',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q45',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2016,
  2,
  45,
  '“Ou já fujas do abrigo da cabana/Ou sobre
os altos montes mais te assomes/faremos
imortais nossos nomes”.
TEXTO
Poeta cantô de rua,
Que na cidade nasceu,
Cante a cidade que é sua,
Que eu canto o sertão que é meu.
Se aí você teve estudo,
Aqui, Deus me ensinou tudo,
Sem de livro precisá
Por favô, não mêxa aqui
Que eu também não mexo aí
Cante lá, que eu canto cá.
(PATATIVA DO ASSARÉ (Antônio Gonçalves da Silva).
Cante lá, que eu canto cá. Petrópolis: Vozes, 1978).
A variação linguística é inerente a todas as
línguas porque a variabilidade e a diversidade
são da essência da vida social e cultural da
humanidade. Há fatores que determinam o
desvio no padrão da norma culta.
Na leitura dos versos de Patativa do Assaré,
pode-se apontar que a variação do padrão culto
da língua se dá por aspectos associados às
diferenças

(A) sintáticas.
(B) morfológicas.
(C) lexicais.
(D) fonéticas.
(E) semânticas.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q46',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2016,
  2,
  46,
  'semânticas.

Questão 46
Até agora
Conheci quem não conhecia
namorei minha conhecida
casei com minha namorada
separei de minha esposa
e a história progride assim:
fiquei viúvo pra ela
que está viúva pra mim.
(BRITO, Antônio Carlos de. Lero-lero. São Paulo: Cosac Naify, 2012. p.162.)
O eu lírico utiliza, nos dois últimos versos do poema, as palavras “viúvo” e “viúva” para destacar uma
condição do casal descrito no texto.
De acordo com o poema, as palavras mencionadas, neste contexto, exemplificam uma

(A) morte parcial do eu lírico que se culpa pelo final do relacionamento.
(B) figura de linguagem, como uma espécie de hipérbole para a separação.
(C) ironia, pois o eu lírico já superou o processo de afastamento da ex-mulher.
(D) antítese, pois os conceitos de viuvez apresentados são diferentes.
(E) metáfora de como o eu lírico se sente sozinho após o final da relação.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q47',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2016,
  2,
  47,
  'metáfora de como o eu lírico se sente sozinho após o final da relação.

Questão 47
TEXTO 1
Soneto de Santa Cruz
Há um descompasso no tempo
no asfalto e no peso do passo
o acaso perdendo terreno
a alegria faltando pedaço
O ar virando veneno
o sol virando carrasco
há um descompasso no tempo
há um descompasso no espaço
Choveu o dia inteiro lá em casa
não teve som de obra
não teve sol na sala
Choveu o dia inteiro lá em casa
não teve pipoqueiro
nem tristeza tava
(LINS, Cícero Rosa. Soneto de Santa Cruz. Intérprete: Cícero. In: CÍCERO. A Praia. São Paulo: Deckdisc, 2015. 1 CD. Faixa 6.)
TEXTO 2
Cidadezinha qualquer
Casas entre bananeiras
mulheres entre laranjeiras
pomar amor cantar.
Um homem vai devagar.
Um cachorro vai devagar.
Um burro vai devagar.
Devagar... as janelas olham.
Eta vida besta, meu Deus.
(ANDRADE, Carlos Drummond de. Alguma poesia. 7.ed. Rio de Janeiro: Record, 2005. p.71.)
A letra da canção de Cícero e o poema de Carlos Drummond de Andrade fazem referência ao cotidiano.
Ainda que possuam uma mesma temática, os dois textos divergem quanto à maneira que retratam a
passagem mais lenta do tempo.
Pode-se afirmar que tal diferença

(A) está fundamentada no fato do primeiro texto ser um soneto e o segundo não possuir uma forma fixa.
(B) é percebida pela predominância de elementos não concretos, no texto 1, e por elementos materiais,
no texto 2.
(C) fundamenta-se na referência explícita ao termo “tempo” que é feita em alguns versos do texto 1.
(D) tem por base as características fundamentais do segundo momento do Modernismo brasileiro.
(E) é perceptível pela oposição entre a instância divina, no texto 2, e a instância profana, no texto 1.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q48',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  2,
  48,
  'é perceptível pela oposição entre a instância divina, no texto 2, e a instância profana, no texto 1.

Questão 48
(TELLES, Pedro. Um verão global está só no começo. Greenpeace, 16 mar. 2016. Disponível em: <http://www.
greenpeace.org/brasil/pt/Blog/um-vero-global-est-s-no-comeo/blog/55883/>. Acesso em: 30 abr. 2016.)
O cartaz do grupo Greenpeace, composto por ativistas pelo meio ambiente, alude para a questão do
aquecimento global. No enunciado do cartaz, um recurso argumentativo torna a peça publicitária interessante
porque evoca

(A) o fato de o Greenpeace usar imagens da Terra que representam as matas e os mares do nosso
planeta.
(B) as lutas passadas do grupo por legitimidade ao combater a poluição e como isso hoje é visto de forma
diferente.
(C) as características pouco conhecidas do aquecimento global, fenômeno climático relativamente recente.
(D) a negação ao fenômeno, caracterizada pelo termo “não”, em confronto com o enfrentamento da causa
– “vamos”.
(E) um jogo de palavras com uma expressão utilizada para substituir algo quando a primeira opção não
deu certo.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q49',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  2,
  49,
  'um jogo de palavras com uma expressão utilizada para substituir algo quando a primeira opção não
deu certo.

Questão 49
Calvin e Haroldo. Disponível em: <http://tiras-do-calvin.tumblr.com/image/26502915396>.
Acesso em: 05/05/2016.
Sobre a tirinha acima, analise as afirmativas a seguir.
I. A lógica da tirinha está concentrada em uma narrativa sequencial, numa ordem temporal, com texto
pertinente à imagem de cada quadrinho.
II. A tirinha visa principalmente informar o leitor e fazê-lo refletir sobre fatos do cotidiano.
III. A tirinha mobiliza o humor do leitor na medida em que aborda um tema lúdico.
IV. A formalidade da linguagem utilizada por Calvin provocou confusão e dificultou o entendimento.
V - As personagens da tirinha utilizam sinais devidamente organizados para produzir um discurso
inteligível.
É correto apenas o que se afirma em

(A) I e V.
(B) II e IV.
(C) I, III e V.
(D) I, II, III e IV.
(E) II, III, IV e V.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q50',
  'linguagens',
  'Coesão e coerência',
  'Coesão',
  2016,
  2,
  50,
  'II, III, IV e V.

Questão 50
Questão 51
Os trechos abaixo foram adaptados do site da Unifor.
O trecho que, além de apresentar coesão e coerência, está redigido de acordo com as normas do padrão culto
da língua é:

(A) A ideia da criação da Universidade de Fortaleza, concebida pelo industrial Edson Queiroz, não foi motivada
meramente por estudos de mercado que revelavam a carência do sistema educacional do estado. Edson
Queiroz, seu primeiro chanceler, planejava uma instituição ‘viva’, atuando decisivamente no processo de
desenvolvimento da região.
(B) A Universidade de Fortaleza e a Galerie Agnès Monplaisir, de Paris, apresenta a exposição Lendas &
Aparições do artista francês Daniel Hourdé. De 23 de março a 29 de maio será possível conferir, pelo
campus da Universidade, oito esculturas em bronzes e aços, além de desenhos feitos de carvão sob
papel e instalações de papel no hall da Biblioteca.
(C) A Fundação Edson Queiroz sempre incentivou à cultura e as manifestações artísticas locais e nacionais.
Após grande reforma, foi reinaugurado no dia 22 de setembro de 2004, para a realização de amostras de
arte na condução ideal para visitação, formentando as atividades sócio-culturais no estado.
(D) Localizado no 2º andar do prédio da Reitoria, o Espaço Cultural Airton Queiroz ocupa uma área total de
1.200m². O ambiente segue padrões mundiais compatíveis com as melhores galerias de arte existentes,
com infra-estrutura adotada de sistemas de refrigeração e climatização do ambiente, controle rigoroso
dos indices internos de umidade e de iluminação, sistema de proteção contra incêndios e saídas de
emergência de fácil identificação.
(E) O Parque Desportivo da Universidade de Fortaleza conta com uma estrutura moderna, dentro dos
padrões das confederações brasileiras e até internacionais de cada modalidade esportiva. Neste, são
oferecidas instalações e equipamentos que estimulam à prática desportiva e promovem a revelação de
novos talentos, complementam as atividades acadêmicas e sediam projetos sociais e abrigam eventos de
porte regional, nacional e internacional.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q51',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2016,
  2,
  51,
  'O Parque Desportivo da Universidade de Fortaleza conta com uma estrutura moderna, dentro dos
padrões das confederações brasileiras e até internacionais de cada modalidade esportiva. Neste, são
oferecidas instalações e equipamentos que estimulam à prática desportiva e promovem a revelação de
novos talentos, complementam as atividades acadêmicas e sediam projetos sociais e abrigam eventos de
porte regional, nacional e internacional.
Disponível: www.luizberto.com . Acesso 19/04/2016.
Ditado popular ou provérbios são expressões consagradas pelo uso popular. Diante da charge, marque a
opção que pode traduzi-la.

(A) “Os políticos são como as fraldas... Devem ser trocados com frequência, e sempre pelo mesmo motivo...”.
(B) “Gato escaldado tem medo de água fria”.
(C) “Farinha do mesmo saco”.
(D) “À noite, todos os gatos são pardos”.
(E) “Balaio de gatos”.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q52',
  'linguagens',
  'Literatura',
  'Literatura',
  2016,
  2,
  52,
  '“Balaio de gatos”.

Você vai começar a ler o novo romance de Italo Calvino, Se um viajante numa noite de inverno. Relaxe.
Concentre-se. Afaste todos os outros pensamentos. Deixe que o mundo a sua volta se dissolva no indefinido.
É melhor fechar a porta; do outro lado há sempre um televisor ligado. Diga logo aos outros: “Não quero ver
televisão! ”. Se não ouvirem, levante a voz: “Estou lendo! Não quero ser perturbado! ”. Com todo aquele
barulho, talvez ainda não o tenham ouvido; fale mais alto, grite: “Estou começando a ler o novo romance
de Italo Calvino!”. Se preferir, não diga nada; tomara que o deixem em paz.
CALVINO, Italo. Se um Viajante numa Noite de Inverno. São Paulo: Planeta de Agostini, 2003, p.11.
De acordo com o texto, há predominância do tipo textual

(A) narrativo.
(B) descritivo.
(C) dissertativo.
(D) injuntivo.
(E) expositivo.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q53',
  'linguagens',
  'Literatura',
  'Literatura',
  2016,
  2,
  53,
  'expositivo.
Questão 52
Texto para as questões 53 e 54
Eu sei que vou te amar
Por toda a minha vida eu vou te amar
Em cada despedida eu vou te amar
Desesperadamente
Eu sei que vou te amar
E cada verso meu será pra te dizer
Que eu sei que vou te amar
Por toda a minha vida
Eu sei que vou chorar
A cada ausência tua eu vou chorar,
Mas cada volta tua há de apagar
O que essa ausência tua me causou
Eu sei que vou sofrer
A eterna desventura de viver a espera
De viver ao lado teu
Por toda a minha vida.
(JOBIM, Tom; MORAES, Vinícius. Eu sei que vou te amar. Disponível em: < https://www.letras.mus.br/tom-
jobim/49040/>. Acesso em: 01/03/2016)

Questão 53
Questão 54
O romance que representa o estilo literário
presente na canção de Vinícius de Moraes e Tom
Jobim pode ser assinalado na opção:

(A) A Moreninha, de Joaquim Manuel de
Macedo.
(B) Memórias Póstumas de Brás Cubas, de
Machado de Assis.
(C) Gabriela, Cravo e Canela, de Jorge Amado.
(D) O Tempo e o Vento, de Érico Veríssimo.
(E) Angústia, de Graciliano Ramos.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2016,
  2,
  55,
  'III e IV.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA
David Bowie: nome artístico de David Robert Jones, (Brixton, Londres, 8
de janeiro de 1947 — Manhattan, Nova Iorque, 10 de janeiro de 2016).
Foi um cantor, compositor, ator e produtor musical inglês, foi uma importante
figura na música popular durante cinco décadas e foi considerado um dos
músicos populares mais inovadores e influentes de todos os tempos... por um
vocal característico e pela profundidade intelectual de sua obra. Morreu na
noite do dia 10 de janeiro, dois dias após o seu sexagésimo nono aniversário
e o lançamento do álbum Blackstar, em Nova Iorque.
https://pt.wikipedia.org/wiki/David_Bowie
Leia a letra de um de seus sucessos com a Banda Queen, e responda as questões 55 e 56.
Under Pressure
Pressure pushing down1 on me
Pressing down on you no man ask for
Under pressure - that burns a building down
Splits a family in two
Puts people on streets
that’s o.k.
It’s the terror of knowing
What the world is about
Watching some good friends
Screaming ‘Let me out’
Pray tomorrow - gets me higher
Pressure on people - people on streets
O.k.
Chippin’ around2
Kick my brains3 around the floor
These are the days it never rains but it pours
People on streets
People on streets
Chorus
Pray tomorrow - gets me higher high high
Pressure on people - people on streets
Turned away4 from it all like a blind man
Sat on a fence but it don’t work
Keep coming up5 with love
but it’s so slashed and torn
Why - why - why ?
Love love love love love
Insanity laughs under pressure we’re cracking
Can’t we give ourselves one more chance
Why can’t we give love that one more chance
Why can’t we give love give love give love give
love
give love give love give love give love give love
‘Cause love’s such an old fashioned word
And love dares you to care for
The people on the edge of the night
And loves dares you to change our way
Of caring about ourselves
This is our last dance
This is our last dance
This is ourselves
Under pressure
Under pressure
Pressure
https://www.vagalume.com.br/david-bowie/

Questão 55
Questão 56
De acordo com a letra da música, avalie as afirmações a seguir.
I. O autor considera o mundo muito solidário.
II. O autor crê que o ser humano perdeu seus valores.
III. O autor apenas sente a falta de amor entre os homens.
IV. O autor mostra a sua insatisfação com o corre-corre da vida atual.
V. O autor mostra que o ser humano precisa amar mais as pessoas que a si próprio.
É correta apenas o que se afirma em

(A) I e V.
(B) III e V.
(C) I, IV e V.
(D) II, IV e V.
(E) II, III e IV.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  2,
  56,
  'II, III e IV.
Combine as expressões com seus significados.
1. To crack a) pirar
2. To turn away b) chutar
3. To push down c) afastar
4. To chip around d) derrubar
5. To kick one’s brains e) chutar o cérebro
A combinação correta é:

(A) 1-d; 2-a; 3-b; 4-c; 5-e
(B) 1-a; 2-d; 3-e; 4-b; 5-c
(C) 1-a; 2-c; 3-b; 4-d; 5-e
(D) 1-b; 2-d; 3-e; 4-a; 5-c
(E) 1-a; 2-c; 3-d; 4-b; 5-e',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  2,
  57,
  '1-a; 2-c; 3-d; 4-b; 5-e

Questão 57
Com base no diálogo entre Mafalda e sua mãe, analise as afirmativas.
I) Mafalda ought not to open the door.
II) Mafalda mustn’t open the door.
III) Mafalda has to open the door.
IV) Mafalda might open the door.
V) Mafalda must open the door.
É correto apenas o que se afirma em:

(A) I e III.
(B) II e V.
(C) II e IV.
(D) I, III, e IV
(E) II, III e V.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  2,
  58,
  'II, III e V.

Rio Olympics: South Korea unveils anti-Zika uniform
(CNN) The Rio Olympics are less than 100 days away and it seems South
Korean athletes are taking no chances when it comes to the threat of
contracting the Zika virus.
South Korea’s stars will wear tracksuits which have been infused with
insect repellant designed to keep mosquitoes away, as well as long pants
and blazers for the opening and closing ceremonies.
Athletes are not allowed to have their actual kit infused but will be able to spray themselves with repellent
before competing.
The World Health Organization declared Zika a global public health emergency three months ago. The virus
has been shown to cause microcephaly in babies and is linked to some cases of muscle-weakening disease
Guillain-Barré syndrome in adults. The U.S. Centers for Disease Control and Prevention has told pregnant
women to stay away from areas where Zika is prevalent and has issued guidelines for those who may wish
to become pregnant.
Other nations, such as Germany, have yet to adopt South Korea’s approach, instead of taking a more casual
approach to leisurewear.
The Olympics run from August 5-21 with the Paralympics starting on September 7 and concluding on
September 18th.
http://edition.cnn.com/2016/04/29/sport/rio-olympics-zika-south-korea/#
Escolha a opção que melhor resume a ideia do texto:

(A) Faltam menos de 100 dias para o início das Olimpíadas e os atletas receiam contrair o vírus da Zica.
(B) Os atletas sul coreanos usarão uniformes infundidos em repelente nas cerimônias de abertura e
encerramento das Olimpíadas no Rio de Janeiro.
(C) Os atletas sul coreanos estão proibidos de usar não apenas uniformes infundidos em repelente como
também sprays durante as competições olímpicas.
(D) Os jogos Olímpicos e as Paraolimpíadas acontecerão nos meses de agosto e setembro.
(E) Grande parte das nações participantes das Olimpíadas no Brasil farão uso de uniformes infundidos
com repelente.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  2,
  59,
  'Grande parte das nações participantes das Olimpíadas no Brasil farão uso de uniformes infundidos
com repelente.
Na sentença: The Rio Olympics are less than 100 days away… podemos afirmar que:

(A) There are more than a hundred days for the Olympics.
(B) There are at least a hundred days for the Olympics.
(C) There are hundreds of days away for the Olympics.
(D) There are a hundred days for the Olympics.
(E) The Olympics are getting closer.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2016-2_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2016,
  2,
  60,
  'La civilización industrial contemporánea, que en gran medida afirmó su ideología por medio de sus sistemas
educativos, comienza a dar muestras de saturación e inviabilidad. Esto hace que, en muchos aspectos,
programas de estudio encaminados a atender esa ideología se adviertan anacrónicos y poco interesantes.
www.unifor.br/eventos, acesso em 22/04/2016
Marque a opção que apresenta a continuação lógica do texto acima.

(A) La lógica estoica introdujo el término complexum para designar cualquier proposición compuesta por
más de una sentencia. Después la filosofía ha venido entendiendo la complejidad de un modo similar,
esto es cuantitativo.
(B) Es sabido que, en aquella etapa prefilosófica dominada por el mito y el Oráculo, el conocimiento
profundo de la naturaleza lo proporcionaba el saber mítico dotado de ambigüedad y por ello capaz de
asumir los múltiples aspectos contradictorios de la realidad.
(C) Todo esto puede parecer exagerado. En cualquier caso, estas teorías manejan unos términos para
describir y explicar la realidad que se mueven en unas coordenadas muy distintas a las tradicionales.
(D) Es imperativo que, en vista de nuevos planeamientos, se proceda al análisis profundo y transversal de
la coyuntura, a fin de que nuevas propuestas permitan a sus agentes el constante ajuste de posturas
y preceptos a las particularidades del medio, al cual se procura responder.
(E) El saber es enemigo de la reflexión. Si yo le digo a alguien: Míralo -y me responde- ¿para qué lo voy
a mirar de nuevo si yo se cómo es? No hay reflexión posible. Mientras más creemos que sabemos,
menos reflexionamos.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q41',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  1,
  41,
  'Procissão
Gilberto Gil
Olha lá vai passando a procissão
Se arrastando que nem cobra pelo chão
As pessoas que nela vão passando acreditam nas coisas lá do céu
As mulheres cantando tiram versos, os homens escutando tiram o chapéu
Eles vivem penando aqui na Terra
Esperando o que Jesus prometeu
E Jesus prometeu coisa melhor
Prá quem vive nesse mundo sem amor
Só depois de entregar o corpo ao chão, só depois de morrer neste sertão
Eu também tô do lado de Jesus, só que acho que ele se esqueceu
De dizer que na Terra a gente tem
De arranjar um jeitinho prá viver
Muita gente se arvora a ser Deus e promete tanta coisa pro sertão
Que vai dar um vestido prá Maria, e promete um roçado pro João
Entra ano, sai ano, e nada vem, meu sertão continua ao Deus dará
Mas se existe Jesus no firmamento, cá na Terra isso tem que se acabar.
Disponível https://www.vagalume.com.br/gilberto-gil/procissao.html
Gilberto Gil, cantor, compositor e poeta baiano, gravou “Procissão” em 1967. A música revela uma visão do
poeta sobre a realidade do povo nordestino. Com relação ao texto, avalie as afirmações a seguir em que
o poeta faz uma
I - denúncia ao abandono do homem que reside no sertão nordestino.
II – referência à presença da fé como única fonte de esperança no sertão.
III – descrição preconceituosa sobre a religiosidade do sertanejo.
IV – crítica àqueles que tiram proveito das adversidades do povo do sertão.
É correto apenas o que se afirma em:

(A) I e II.
(B) I e IV.
(C) I, II e IV.
(D) I, III e IV.
(E) II, III e IV.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q42',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2017,
  1,
  42,
  'II, III e IV.

Questão 42 Questão 43
Questão 44
Canção do exílio
Minha terra tem macieiras da Califórnia
onde cantam gaturamos de Veneza.
Os poetas da minha terra
são pretos que vivem em torres de ametista,
os sargentos do exército são monistas, cubistas,
os filósofos são polacos vendendo a prestações.
A gente não pode dormir
com os oradores e os pernilongos.
Os sururus em família têm por testemunha a
Gioconda.
Eu morro sufocado
em terra estrangeira.
Nossas flores são mais bonitas
nossas frutas mais gostosas
mas custam cem mil réis a dúzia.
Ai quem me dera chupar uma carambola de
verdade e ouvir um sabiá com certidão de idade!
Murilo Mendes (In: MENDES, Murilo.
MENDES, Murilo. Poesia completa e prosa.
Rio de Janeiro: Nova Aguiar, 1994)
Dos vários recursos textuais utilizados no poema
acima, destaca-se:

(A) a intertextualidade, que consiste na retomada
e reelaboração de outro(s) texto(s).
(B) a prosopopeia, que se caracteriza por
personificar coisas inanimadas.
(C) o paradoxo, que é a presença de elementos
que se anulam num texto, trazendo à tona
uma situação que foge da lógica.
(D) a hipérbole, que consiste no emprego de
palavras que expressam uma ideia de
exagero de forma intencional.
(E) a onomatopeia, que ocorre quando há o uso
de palavras que reproduzem os sons de
seres vivos e objetos.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q43',
  'linguagens',
  'Literatura',
  'Literatura',
  2017,
  1,
  43,
  'a onomatopeia, que ocorre quando há o uso
de palavras que reproduzem os sons de
seres vivos e objetos.
O progresso da ciência é medido pelos seus
resultados e a isso o Curso de Linguística Geral
responde satisfatoriamente na medida em que,
neste século de sua existência, ele se desgasta
e se renova com igual vigor, experiência que o
consagra como um clássico entre as áreas de
conhecimento que reconhecem na linguagem o
seu eixo (...)
Revista Cult, ano 19, no.216, setembro
2016, p.58.
No trecho apresentado, há cinco termos
destacados. Assinale a alternativa em que
todos os termos em negrito estão corretamente
analisados em sua função sintática, na ordem
em que aparecem.

(A) Objeto direto, adjunto adverbial, agente da
passiva, sujeito, objeto indireto.
(B) Adjunto adnominal, predicativo do sujeito,
sujeito, objeto direto, objeto indireto.
(C) Objeto indireto, adjunto adverbial, sujeito,
sujeito, objeto direto.
(D) Sujeito, adjunto adnominal, sujeito, objeto
direto, objeto direto.
(E) Objeto indireto, adjunto adverbial, sujeito,
sujeito, objeto indireto.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q44',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2017,
  1,
  44,
  'Objeto indireto, adjunto adverbial, sujeito,
sujeito, objeto indireto.
Entre os valores semânticos da conjunção que
nas orações abaixo, expressos entre parênteses,
apenas um não está corretamente indicado.
Assinale a alternativa em que isso ocorre.

(A) Guarda tão bem a carteira de dinheiro que
muitas vezes não a encontra quando precisa.
(Consequência)
(B) Triste que estava, não tinha ânimo sequer
para cuidar do filho de três anos. (Causa)
(C) Fez-me sinal que parasse a discussão.
(Finalidade)
(D) Uma oraçãozinha que seja, já acalenta o
espírito (concessão)
(E) Chorava que dava pena! (Causa)',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q45',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2017,
  1,
  45,
  'Chorava que dava pena! (Causa)

Questão 45
Questão 46
Na fala de Hagar, temos uma figura de linguagem denominada:

(A) prosopopeia.
(B) hipérbole.
(C) eufemismo.
(D) metonímia.
(E) metáfora.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q46',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2017,
  1,
  46,
  'metáfora.
O anúncio utiliza a comunicação visual com recursos formais inspirados no Concretismo e procura atingir
uma expressividade que se caracteriza pela
I - disposição das palavras para representar as cidades verticalizadas.
II – elaboração artística em busca da forma precisa.
III – união entre a forma e o conteúdo.
IV – busca pela participação ativa do leitor.
É correto apenas o que se afirma em

(A) I e II.
(B) I e III.
(C) I, III e IV.
(D) II e III
(E) II, III e IV.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q47',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  1,
  47,
  'II, III e IV.

TRÊS INGREDIENTES PARA VIVER MELHOR
É muito comum criticarmos algumas fases da
nossa vida, tentar apagá-las da nossa história
e, por mais que pensemos no que aconteceu,
encontramos apenas lembranças amargas:
falhas, erros e impotência. Situações complicadas
que enfrentamos cedo demais, oportunidades
perdidas, o amor que não conseguimos identificar
e viver.
Aprender e ser responsável pelas decisões que
tomamos nos torna livres para enfrentar a vida.
Tudo começa com a aceitação de quem somos
e de por que agimos de uma determinada forma.
Mas existem na nossa cultura muitas pessoas
que constantemente nos impelem a questionar
as nossas escolhas, levando-nos a acreditar que
estamos sempre errados ou que “não somos
bons o suficiente”.
Quando isso acontece, podemos nos tornar
vítimas das nossas próprias crenças negativas
que criamos e alimentamos ao longo da vida.
Os pensamentos são como a chuva, são
especialistas em encontrar brechas na nossa
autoestima para nos enfraquecer; para negarmos
a nós mesmos.
Muitas vezes levamos a vida “cozinhando em
fogo brando”, (às vezes forte demais), com
muitos ingredientes que vamos colocando na
nossa mochila aos poucos, na nossa panela, ao
nosso gosto. Se quiser viver bem, é preciso jogar
fora alguns ingredientes.
Fonte: COSTA, Paula. Três ingredientes para viver
melhor. Revista Pazes. 11/09/2016. Disponível em:
http://amenteemaravilhosa.com.br/3-ingredientes-viver-
melhor/?utm_medium=post&utm_source=website&utm_
campaign=popular Acessado em: 20/09/2016.
Segundo o texto, é correto afirmar QUE

(A) a vida não nos permite errar muitas vezes,
por isso é preciso pensar antes de agir.
(B) quando julgamos os outros e a nós mesmos,
estamos aprendendo com os erros.
(C) é preciso vivenciar as experiências com
estabilidade emocional e bom senso.
(D) todas as escolhas fazem parte de nossa
vida e de quem somos.
(E) pedir a opinião de pessoas próximas é uma
maneira de avaliar nossas próprias ações.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q48',
  'linguagens',
  'Literatura',
  'Literatura',
  2017,
  1,
  48,
  'pedir a opinião de pessoas próximas é uma
maneira de avaliar nossas próprias ações.
Questão 47
Questão 48
Divina Comédia Humana
Belchior
Estava mais angustiado que um goleiro na hora
do gol
Quando você entrou em mim como um Sol no
quintal
Aí um analista amigo meu disse que desse jeito
Não vou ser feliz direito
Porque o amor é uma coisa mais profunda que
um encontro casual
Aí um analista amigo meu disse que desse jeito
Não vou viver satisfeito
Porque o amor é uma coisa mais profunda que
uma transa sensual
Deixando a profundidade de lado
Eu quero é ficar colado à pele dela noite e dia
Fazendo tudo de novo e dizendo sim à paixão
morando na filosofia
Eu quero gozar no seu céu, pode ser no seu
inferno
Viver a divina comédia humana onde nada é
eterno
Ora direis, ouvir estrelas, certo perdeste o senso
Eu vos direi no entanto:
Enquanto houver espaço, corpo e tempo e algum
modo de dizer não
Eu canto
Disponível: https://www.letras.mus.br/belchior/44454/
Na música de Belchior, pode-se estabelecer um
diálogo com três famosos textos fontes, sendo
dois da literatura universal e um da literatura
brasileira. Assinale a alternativa que traz os
autores desses três textos fontes.

(A) Dante Alighieri; Honoré de Balzac; Olavo
Bilac.
(B) William Shakespeare; Edgar Allan Poe;
Gonçalves Dias.
(C) Dante Alighieri; Marcel Proust; Carlos
Dummond de Andrade.
(D) Franz Kafka; Fiódor Dostoiévski; Cecília
Meireles.
(E) Luis de Camões; Gabriel Garcia Márquez;
Gonçalves Dias.
Texto para as questões 48 e 49',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q49',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  1,
  49,
  'Luis de Camões; Gabriel Garcia Márquez;
Gonçalves Dias.
Texto para as questões 48 e 49

Questão 49 Questão 51
Questão 50
A expressão destacada no texto, “cozinhando
em fogo brando” significa:

(A) Ser aprazível com as pessoas.
(B) Aprender com os erros da vida.
(C) Viver sem grandes emoções.
(D) Viver as emoções de maneira intensa.
(E) Manter as emoções sob controle.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q50',
  'linguagens',
  'Literatura',
  'Literatura',
  2017,
  1,
  50,
  'Duas orações coordenadas assindéticas e
uma coordenada sindética aditiva.
“Ai, gramática. Ai, vida.” Esse é o título de um
texto de Moacyr Scliar que, de forma criativa, nos
fala da pontuação. E vai pontuando a vida com
os sinais ortográficos. A vírgula, tão controversa,
são “as pausas receosas” do jovem adulto. Ela
está a serviço da expressividade do discurso,
mas há casos ditados pela gramática em que ela
é expressamente proibida.
Assinale a alternativa em que se encontra o uso
indevido da vírgula.

(A) É lógico, meus amigos, que eu quero ir
embora, aliás, eu já deveria ter ido, mas,
como vocês sabem, não tive coragem
suficiente, e, além do mais, faltou-
me dinheiro para tal empreendimento,
entendem?
(B) As alcunhas “coxinhas” e “petralhas”
marcaram, maniqueisticamente, a cena
política em 2016.
(C) Amigas, podem falar tudo o que pensam.
(D) Amigas podem falar tudo o que pensam.
(E) A biografia do escritor cearense Moacir
Costa Lopes a ser publicada pela Fundação
Demócrito Rocha, corrige o descaso, com
esse autor, de tão valiosa obra para a
literatura cearense.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q51',
  'linguagens',
  'Literatura',
  'Literatura',
  2017,
  1,
  51,
  'Manter as emoções sob controle.
Eu perguntei. Eles responderam. Eu escrevi.”
Sebastian Junger
Disponível: http://www.revistabula.
com/1787-30-contos-de-ate-100-caracteres/
No texto acima, têm-se:

(A) Três orações subordinadas.
(B) Três orações coordenadas assindéticas.
(C) Duas orações coordenadas e uma
subordinada.
(D) Uma oração principal e duas orações
subordinadas.
(E) Duas orações coordenadas assindéticas e
uma coordenada sindética aditiva.
“Ai, gramática. Ai, vida.” Esse é o título de um
texto de Moacyr Scliar que, de forma criativa, nos
fala da pontuação. E vai pontuando a vida com
os sinais ortográficos. A vírgula, tão controversa,
são “as pausas receosas” do jovem adulto. Ela
está a serviço da expressividade do discurso,
mas há casos ditados pela gramática em que ela
é expressamente proibida.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q52',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2017,
  1,
  52,
  'A biografia do escritor cearense Moacir
Costa Lopes a ser publicada pela Fundação
Demócrito Rocha, corrige o descaso, com
esse autor, de tão valiosa obra para a
literatura cearense.

Questão 52
Questão 53
“Corro e levo o tempo. Dou uma passada, agora,
dou outra passada, outra agora, e continuo: agora,
agora, agora. Já não tenho medo. Sou iluminado
pelas minhas certezas ” (José Luís Peixoto,
Cemitério de Pianos)
Sobre o procedimento linguístico da repetição
usado nesse fragmento de texto, pode-se afirmar
que

(A) o emprego reiterado do advérbio agora tem a
função de marcar o tempo presente, como o
único que interessa ao narrador.
(B) a repetição do termo agora sugere a
dinamicidade do tempo. Repete-se a forma,
mas não o sentido, como se cada “agora”
fosse um “agora” diferente.
(C) a palavra “agora”, por meio do procedimento
da repetição adquire valor alternativo.
(D) ao recurso da repetição empregado no texto
damos o nome de pleonasmo.
(E) agora é uma conjunção que faz uma restrição
ao que foi dito anteriormente e sua repetição
é apenas enfática.
Estrela-do-mar
Um pequenino grão de areia,
Que era um terno sonhador,
olhando o céu, viu uma estrela,
imaginou coisas de amor
Passaram anos, muitos anos,
Ela no céu e ele no mar.
Dizem que nunca o pobrezinho
Pôde com ela se encontrar.
Se houve ou se não houve
Alguma coisa entre eles dois,',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q53',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2017,
  1,
  53,
  'agora é uma conjunção que faz uma restrição
ao que foi dito anteriormente e sua repetição
é apenas enfática.
Estrela-do-mar
Um pequenino grão de areia,
Que era um terno sonhador,
olhando o céu, viu uma estrela,
imaginou coisas de amor
Passaram anos, muitos anos,
Ela no céu e ele no mar.
Dizem que nunca o pobrezinho
Pôde com ela se encontrar.
Se houve ou se não houve
Alguma coisa entre eles dois,
Ninguém soube até hoje explicar.
O que há de verdade
É que depois, muito depois,
Apareceu a estrela-do-mar.
(Marino Pinto e Paulo Soledade)
Marque a alternativa que traz a classificação
correta do texto acima.

(A) Descritivo.
(B) Narrativo.
(C) Dissertativo.
(D) Preditivo.
(E) Opinativo.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q54',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2017,
  1,
  54,
  'Opinativo.
Questão 54
“O fato de os verbos terem tempos verbais
indica que o tempo é relevante para seu uso”.
Com essa frase, o filósofo da linguagem Zeno
Vendler começa uma reflexão sobre os verbos e
o tempo que mostra, através de uma análise dos
significados dos verbos – atividades, estados,
eventos e processos –, que seus usos sugerem
os modos particulares através dos quais um
verbo pressupõe e envolve a noção de tempo.
Seu texto, Verbos e Tempos (Verbs and Times),
publicado em 1957, é hoje, mais de meio século
após a sua publicação, pertinente e repleto de
intuições sobre a semântica dessa classe de
palavra.
(Fragmento do texto “Verbo, Pessoa
e tempo”. Kleiman, Angela B. e
Sepulveda,Cida. Oficina de Gramática –
Metalinguagem para Principiantes . p.101)
Sobre o emprego dos tempos verbais no texto “A
cigarra e a formiga”, é correto afirmar que

(A) “fizeste” indica uma ação não concluída no
passado.
(B) “chega”, embora no passado, está se
referindo a algo que ocorre no momento da
fala.
(C) “passou” indica uma ação hipotética
concluída no passado.
(D) “pago” indica uma ação costumeira no
pretérito perfeito.
(E) “cantava” expressa uma ação no pretérito
imperfeito.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  1,
  55,
  '“cantava” expressa uma ação no pretérito
imperfeito.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA
https://www.google.com.br/search?q=cartoons+new+york+times+pokemon&biw
Com base no desenho acima, podemos concluir que

(A) todas as personagens procuram o Pokemon.
(B) ninguém sabe informar a localização da biblioteca.
(C) apenas um transeunte informa o caminho a seguir.
(D) os passageiros do carro estão a procura do Pokemon.
(E) os passageiros do carro estão a procura de uma livraria.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  1,
  56,
  'os passageiros do carro estão a procura de uma livraria.
Questão 55
Tom Janssen (Breda , 1950 ) é um cartunista político holandês, cujos desenhos são publicados tanto no
jornal nacional Trouw, como também no Brabants Dagblad, no Utrecht Nieuwsblad e no The New York
Times. Ele assina seu trabalho como Tom.

Questão 56 Questão 57
Shakespeare - Soneto 8
You’re like music to listen to,
so, why listening to music makes you sad?
Delightful and joyful things should complement one another.
So1 why do you like things that make you unhappy, and2 enjoy things that
are bad for you?
If music played well and in tune sounds bad to you,
it’s because that music is rebuking you for not playing your own part – not
making your own harmony – by getting married and having children.
Notice how the song of two strings vibrating together in harmony is like3 a father and child and happy
mother, who all sing one pleasing note together.
Though4 their music has no words, the unity of their voices sings this warning to you: if you stay single,
you’ll be a childless nobody.
O mundo celebra os quatrocentos e cinquenta anos do poeta inglês, William Shakespeare – muito mais
famoso por suas peças que seus sonetos, porém sua obra é atemporal.
A ideia que o poema apresenta é um (a):
I - convite.
II - ameaça.
III - descrição.
IV - solicitação.
V - comparação.
Está correto apenas o que se afirma em:

(A) III e V.
(B) II, III e V.
(C) III, IV e V.
(D) I, II e IV.
(E) I, II, III, IV e V.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q58',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  1,
  58,
  '1.consequência; 2. adição; 3. comparação;
4. contraste.
Leia o Soneto 8 e responda às questões 56 e 57.

Yoshinori Ohsumi of Japan Wins Nobel Prize for Study of ‘Self-Eating’ Cell
by Gina Kolata and Sewell Chan
Oct. 3, 2016
Yoshinori Ohsumi, a Japanese cell biologist, was awarded the Nobel Prize in Physiology or Medicine on
Monday for his discoveries on how cells recycle their content, a process known as autophagy, a Greek term
for “self-eating.”
It is a crucial process. During starvation, cells break down proteins and nonessential components and reuse
them for energy. Cells also use autophagy to destroy invading viruses and bacteria, sending them off for
recycling. And cells use autophagy to get rid of damaged structures. The process is thought to go awry
in cancer, infectious diseases, immunological diseases and neurodegenerative disorders. Disruptions in
autophagy are also thought to play a role in aging.
But little was known about how autophagy happens, what genes were involved, or its role in disease and
normal development until Dr. Ohsumi began studying the process in baker’s yeast.
Why did he win?
The process he studies is critical for cells to survive and to stay healthy. The autophagy
genes and the metabolic pathways he discovered in yeast are used by higher organisms1,
including humans. And mutations in those genes can cause disease. His work led to a
new field and inspired hundreds of researchers around the world to study the process and
opened a new area of inquiry.
“Without him, the whole field doesn’t exist,” said Seungmin Hwang, an assistant professor
in
the department of pathology at the University of Chicago. “He set up the field.”
Who is he?
Dr. Ohsumi, who was born in 1945 in Fukuoka, Japan, and received a Ph.D. from the University of Tokyo
in 1974, floundered at first, trying to find his way. He started out in chemistry but decided it was too
established a field with few opportunities.
So he switched to molecular biology. But his Ph.D. thesis was unimpressive, and he could not find a job. His
adviser suggested a postdoctoral position at Rockefeller University in New York, where he was to study in
vitro fertilization in mice.
“I grew very frustrated,” he told the Journal of Cell Biology in 2012. He switched to studying the duplication
of DNA in yeast. That work led him to a junior professor position at the University of Tokyo where he picked
up a microscope and started peering at sacks in yeast where cell components are degraded2 — work that
eventually brought him, at age 43, to the discoveries that the Nobel Assembly recognized on Monday. Dr.
Ohsumi later moved to the National Institute for Basic Biology, in Okazaki, and since 2009, he has been a
professor at the Tokyo Institute of Technology.
“All I can say is, it’s such an honor,” Dr. Ohsumi told reporters at the Tokyo Institute of Technology after
learning he had been awarded the Nobel, according to the Japanese broadcaster NHK. “I’d like to tell young
people that not all can be successful in science, but it’s important to rise to the challenge.”
What’s he like?
“He is a quiet man,” said Dr. Beth Levine, director of autophagy research at the University of Texas
Southwestern Medical Center in Dallas. But he also is quietly daring.
“Unfortunately, these days, at least in Japan, young scientists want to get a stable job, so they are afraid
to take risks,” he told the Journal of Cell Biology. “Most people decide to work on the most popular field
because they think that is the easiest way to get a paper published.”
As for himself, he said: “I am not very competitive, so I always look for a new subject to study, even if it is not
so popular. If you start from some sort of basic, new observation, you will have plenty to work on.”
LEIA ATENTAMENTE O TEXTO E RESPONDA ÀS QUESTÕES 58, 59 E 60.

Questão 58
Reactions
Dr. Ohsumi’s Nobel Prize “was inevitable,” Dr. Levine said. Dr. Ohsumi, she said, “is venerated in the
autophagy field3.”
Autophagy researchers around the world were delighted by the recognition4. “This is an exciting day for all of
us,” said Dr. Ana Maria Cuervo, an autophagy researcher and co-director of the Institute for Aging at Albert
Einstein College of Medicine in the Bronx. “His work is some of the most elegant you can imagine for the
knowledge and the beauty of how cells work.”
Kay F. Macleod, a cancer researcher at the University of Chicago, said, “It is super exciting that autophagy
has been recognized in and of itself5.” Even more so, she added, because Dr. Ohsumi’s work was basic
research. When Dr. Ohsumi and his colleagues began, she said, “I doubt they for one moment thought
that this fundamental process would ultimately be shown to be so important in disease mechanisms and
potential therapies.”
Dr. David H. Perlmutter, dean of the School of Medicine at Washington University in St. Louis, said Dr.
Ohsumi’s work opened a field that has now exploded, with implications that are “the stuff of science fiction.” If
the autophagy system is knocked out, he said, the result is premature aging, with ailments like cardiovascular
disease, skeletal weakness, glucose intolerance and cognitive decline. Now drugs that stimulate this system
are being studied. “If you take a drug and stimulate the system, you will make the organism live longer in a
cancer-free way,” he said.
The Japanese prime minister, Shinzo Abe, called Dr. Ohsumi to congratulate him, saying “your research
gave light to the people who suffer from serious diseases.”
Who was overlooked for the prize?
Speculation had it that the Nobel would go to researchers whose work was instrumental in developing
new treatments that unleash the immune system to attack cancer cells. The list is long. Front-runners had
included James P. Allison at the University of Texas M.D. Anderson Cancer Center; Craig B. Thompson of
Memorial Sloan Kettering Cancer Center in New York; Gordon J. Freeman of Dana-Farber Cancer Institute;
and Tasuku Honjo of Kyoto University. Another scientist often mentioned as a Nobel contender is Jeffrey
Bluestone of the University of California, San Francisco, who works on the immune system in disorders in
which it attacks normal cells.
http://www.nytimes.com/2016/10/04/science/yoshinori-ohsumi-nobel-prize-medicine.html
A opção que melhor resume a ideia principal do texto é a que estabelece que Yoshionori Ohsumi, um
biólogo celular japonês, ganhou o prêmio Nobel em Fisiologia ou Medicina por

(A) inspirar centenas de pesquisadores pelo mundo afora para estudar o processo de autofagia e abrir
uma nova área de pesquisa.
(B) ter se mudado para o Instituto Nacional de Biologia Básica in Okazaki, e desde 2009, tem sido professor
no Instituto da Tecnologia de Tokyo.
(C) não ser competitivo; por procurar novos assuntos para pesquisar mesmo por não serem conhecidos.
Se você começar por algo básico, por novas observações, você terá muito o que fazer.
(D) ter aberto a área que agora estourou com implicações que são “as coisas da ficção da ciência”.
Se o sistema da autofagia for derrubado, o resultado é envelhecimento precoce, como doenças
cardiovasculares, fraqueza esqueletal...
(E) suas descobertas em como as células reciclam seus conteúdos, um processo conhecido como
autofagia, um termo grego, que se refere a “digerir partes de si mesmas”. O processo que ele estuda
é critico para as células sobreviverem ou ficarem doentes.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q59',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  1,
  59,
  'suas descobertas em como as células reciclam seus conteúdos, um processo conhecido como
autofagia, um termo grego, que se refere a “digerir partes de si mesmas”. O processo que ele estuda
é critico para as células sobreviverem ou ficarem doentes.

Questão 59
Questão 60
Analise as frases abaixo:
I. Higher organisms use the autophagy genes and the metabolic pathways he discovered in yeast.
II. ... he degrades cell components...
III. People venerate Dr. Ohsumi in the autophagy field.
IV. The recognition delighted authophagy autophagy researchers around the world.
V. People has recognized autophagy in and of itself that is super exciting.
Marque a opção que corresponde às frases corretas da voz ativa das sentenças enumeradas nessa ordem
no texto.

(A) Apenas II e IV estão corretas.
(B) Apenas III e V estão corretas.
(C) Apenas I e V estão corretas.
(D) Apenas I, III e IV estão corretas.
(E) I, II, III, IV e V estão corretas.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-1_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  1,
  60,
  'A tientas
Mario Benedetti
Se retrocede con seguridad
pero se avanza a tientas
uno adelanta manos como un ciego
ciego imprudente por añadidura
pero lo absurdo es que no es ciego
y distingue el relámpago la lluvia
los rostros insepultos la ceniza
la sonrisa del necio las afrentas
un barrunto de pena en el espejo
la baranda oxidada con sus pájaros
la opaca incertidumbre de los otros
enfrentada a la propia incertidumbre
se avanza a tientas / lentamente
por lo común a contramano
de los convictos y confesos
en búsqueda tal vez
de amores residuales
que sirvan de consuelo y recompensa
o iluminen un pozo de nostalgias
se avanza a tientas / vacilante
no importan la distancia ni el horario
ni que el futuro sea una vislumbre
o una pasión deshabitada
a tientas hasta que una noche
se queda uno sin cómplices ni tacto
y a ciegas otra vez y para siempre
se introduce en un túnel o destino
que no se sabe dónde acaba

(A) Os cegos são imprudentes sempre, dado que, para distinguir os objetos, devem aproximar-se a ponto
de conseguir apalpá-los.
(B) Os saberes da humanidade se referem sempre ao passado, pois o futuro é um mistério insondável e,
no entanto, instigante e sedutor.
(C) A humanidade deveria sempre retroceder, já que é esse o único movimento seguro. Querer avançar
implica enfrentar o futuro, que é muito incerto.
(D) O poema conta a história de um cego que, num dia de chuva, extraviou a varanda que usava como
guia e perdeu-se ao entrar num túnel.
(E) Mario Benedetti está desanimado por descobrir que seu amor era residual, uma paixão vazia. Portanto
saiu numa noite escura e entrou num túnel, às apalpadelas.
http://www.poesi.as/mb97b01014.htm, acesso em 04/10/2016',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q41',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  2,
  41,
  'Uso a palavra para compor meus silêncios.
Não gosto das palavras
fatigadas de informar.
Dou mais respeito
às que vivem de barriga no chão
tipo água pedra sapo.
Entendo bem o sotaque das águas
Dou respeito às coisas desimportantes
e aos seres desimportantes.
Prezo insetos mais que aviões.
Prezo a velocidade
das tartarugas mais que a dos mísseis.
Tenho em mim um atraso de nascença.
Eu fui aparelhado
para gostar de passarinhos.
Tenho abundância de ser feliz por isso.
Meu quintal é maior do que o mundo.
Sou um apanhador de desperdícios:
Amo os restos
como as boas moscas.
Queria que a minha voz tivesse um formato
de canto.
Porque eu não sou da informática:
eu sou da invencionática.
Só uso a palavra para compor meus silêncios.
(BARROS, Manoel de. O apanhador de desperdícios.
In. PINTO, Manuel da Costa. Antologia comentada da
poesia brasileira do século 21. São Paulo: Publifolha,
2006. p. 73-74)
A leitura do poema acima sugere que a palavra
do poeta serve especialmente para

(A) informar os sentimentos do poeta.
(B) inventar outras palavras para romper o
silêncio e, assim, compor outras realidades.
(C) entender o mundo que está a sua volta.
(D) amar o seu semelhante.
(E) respeitar os seres vivos.
Gota d’água
Chico Buarque',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q42',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2017,
  2,
  42,
  'respeitar os seres vivos.
Gota d’água
Chico Buarque
Já lhe dei meu corpo, minha alegria
Já estanquei meu sangue quando fervia
Olha a voz que me resta
Olha a veia que salta
Olha a gota que falta pro desfecho da festa
Por favor
Deixe em paz meu coração
Que ele é um pote até aqui de mágoa
E qualquer desatenção, faça não
Pode ser a gota d’água
Disponível em: <http://www.chicobuarque.com.br
No texto, há quatro ocorrências da palavra que.
É correto classificá-la, respectivamente, como

(A) pronome relativo, pronome relativo, pronome
relativo, conjunção subordinativa causal.
(B) conjunção integrante, pronome relativo,
pronome relativo, conjunção subordinativa
causal.
(C) pronome relativo nas quatro ocorrências.
(D) conjunção integrante nas quatro ocorrências.
(E) pronome relativo, pronome relativo, pronome
relativo, conjunção integrante.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q43',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2017,
  2,
  43,
  'pronome relativo, pronome relativo, pronome
relativo, conjunção integrante.

Questão 43 Questão 45
Questão 44
Ao desconcerto do mundo
Os bons vi sempre passar
No mundo graves tormentos;
E para mais me espantar,
Os maus vi sempre nadar
Em mar de contentamentos
Cuidando alcançar assim
O bem tão mal ordenado,
Fui mau, mas fui castigado.
Assim que, só para mim
Anda o mundo concertado.
(CAMÕES, Luís de Camões – Lítica. 5.ed.
São Paulo: Cultrix, 1976. p.90)
Considerando o texto apresentado, avalie as
afirmações a seguir.
I - Foi escrito em prosa.
II - Os versos desse poema são chamados de
redondilhas maiores.
III - O eu lírico, na primeira parte do poema,
acredita que não vale a pena ser bom.
É correto apenas o que se afirma em

(A) III.
(B) I e II.
(C) II e III.
(D) I e III.
(E) I, II e III.
Texto para as questões 43 e 44',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q44',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  2,
  44,
  'Injustiça.
Fonte: Facebook
Considerando a imagem, infere-se que

(A) a pichação é uma expressão que dá voz aos
excluídos, aos marginalizados dos grandes
espaços urbanos.
(B) a prática de pichar é condenada pelo artigo
65, da Lei dos Crimes Ambientais, número
9.605/98.
(C) os rastros das pichações estão em todas as
partes das cidades brasileiras, sujando as
ruas, prédios públicos e particulares.
(D) os pichadores cometem crime pelo dano que
causam ao ambiente em razão da poluição
visual.
(E) a diferença entre grafite e pichação é que
grafite é considerado uma arte de rua, já a
pichação é uma atitude de vandalismo.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q45',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  2,
  45,
  'I, II e III.
Texto para as questões 43 e 44
Assinale a alternativa que contém o tema do
poema “Ao desconcerto do mundo” de Camões.

(A) Alegria.
(B) Bondade.
(C) Maldade.
(D) Tristeza.
(E) Injustiça.
Fonte: Facebook',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q46',
  'linguagens',
  'Educação Física',
  'Ed. Física',
  2017,
  2,
  46,
  'a diferença entre grafite e pichação é que
grafite é considerado uma arte de rua, já a
pichação é uma atitude de vandalismo.

Questão 46 Questão 47
A LUTA E A LIÇÃO
Carlos Heitor Cony
Um brasileiro de 38 anos, Vítor Negrete, morreu
no Tibete após escalar pela segunda vez o
ponto culminante do planeta, o monte Everest.
Da primeira, usou o reforço de um cilindro de
oxigênio para suportar a altura. Na segunda
(e última), dispensou o cilindro, devido ao seu
estado geral, que era considerado ótimo.
As façanhas dele me emocionaram, a bem-
sucedida e a malograda. Aqui do meu canto,
temendo e tremendo toda a vez que viajo no
bondinho do Pão de Açúcar, fico meditando
sobre os motivos que levam alguns heróis a se
superarem. Vitor já havia vencido o cume mais
alto do mundo. Quis provar mais, fazendo a
escalada sem a ajuda do oxigênio suplementar.
O que leva um ser humano bem-sucedido a
vencer desafios assim?
Ora, dirão os entendidos, é assim que caminha
a humanidade. Se cada um repetisse meu
exemplo, ficando solidamente instalado no chão,
sem tentar a aventura, ainda estaríamos nas
cavernas, lascando o fogo com pedras, comendo
animais crus e puxando nossas mulheres pelos
cabelos, como os trogloditas --se é que os
trogloditas faziam isso. Somos o que somos hoje
devido a heróis que trocam a vida pelo risco.
Bem verdade que escalar montanhas, em si, não
traz nada de prático ao resto da humanidade que
prefere ficar na cômoda planície da segurança.
Mas o que há de louvável (e lamentável) na
aventura de Vítor Negrete é a aspiração de ir
mais longe, de superar marcas, de ir mais alto,
desafiando os riscos. Não sei até que ponto ele
foi temerário ao recusar o oxigênio suplementar.
Mas seu exemplo --e seu sacrifício- é uma lição
de luta, mesmo sendo uma luta perdida.
Fonte:http://www1.folha.uol.com.br/folha/
pensata/ult505u247.shtml
A análise do texto apresentado evidencia

(A) ambição em atingir o reconhecimento e a
fama no meio esportivo.
(B) importância, nesse esporte, de levar um
cilindro de oxigênio suplementar.
(C) autodeterminação em superar limites.
(D) desperdício de uma jornada por uma luta
perdida.
(E) preservação do status quo da humanidade.
Tecendo a manhã',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q47',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  2,
  47,
  'preservação do status quo da humanidade.
Tecendo a manhã
Um galo sozinho não tece uma manhã:
ele precisará sempre de outros galos.
De um que apanhe esse grito que ele
e o lance a outro; de um outro galo
que apanhe o grito que um galo antes
e o lance a outro; e de outros galos
que com muitos outros galos se cruzem
os fios de sol de seus gritos de galo,
para que a manhã, desde uma teia tênue,
se vá tecendo, entre todos os galos.
E se encorpando em tela, entre todos,
se erguendo tenda, onde entrem todos,
se entretendendo para todos, no toldo
(a manhã) que plana livre de armação.
A manhã, toldo de um tecido tão aéreo
que, tecido, se eleva por si: luz balão.
MELO NETO, Cabral.Obra Completa.Rio
de Janeiro: Nova Aguilar, 1994.
Sobre o poema de João Cabral, assinale a
altenativa INCORRETA:

(A) Os seres humanos estão ligados por fios de
solidariedade.
(B) Não há necessidade das relações
interpessoais para viver.
(C) Em todas as atividades humanas há, de
alguma forma, a contribuição de outras
pessoas.
(D) As realizações constituem uma produção
humano-social.
(E) A identidade coletiva se manifesta através
de uma realização.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q48',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2017,
  2,
  48,
  'A identidade coletiva se manifesta através
de uma realização.

Questão 48 Questão 50
Questão 49
A missão chinesa surpreendeu o mundo, que
estava esperando uma investida tripulada
somente em 2018, e provou que o país entrou
para valer na corrida espacial do futuro. Não
faltam projetos. Um deles, anunciado na semana
passada, dá conta de uma estação espacial
produzida 100% na China. O objetivo é “realizar
experiências científicas de grande escala” e criar
uma “sólida base para utilização pacífica do
espaço e exploração de seus recursos”. Essa
estação ajudará o país a avançar em projetos
muito mais ambiciosos. Em 2017, por exemplo,
a sua agência espacial lançará missão com robô
para a lua. Se tudo correr bem, em 2020 serão
os próprios taikonautas que pisarão o solo lunar.
E o passo seguinte já está previsto: Marte, até
2040.
Revista Istoé, 08/10/2008.
Considerando o texto acima, marque a opção
que indica a função da linguagem predominante.

(A) Conativa
(B) Metalinguística
(C) Referencial
(D) Poética
(E) Fática
Vai namorar?',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q49',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2017,
  2,
  49,
  'trata-se de um texto injuntivo, pois está
centrado no leitor e as formas verbais
incitam à ação.
Leia a frase a seguir.
“Seguro sem corretor credenciado não é
seguro.”
Sobre a palavra seguro, pode-se dizer que

(A) classifica-se, nas duas ocorrências, como
substantivo.
(B) classifica-se, na primeira ocorrência, como
adjetivo e, na segunda, como substantivo.
(C) classifica-se, na primeira ocorrência, como
substantivo e, na segunda, como adjetivo.
(D) em sua primeira ocorrência, significa
confiável.
(E) em sua segunda ocorrência, significa
acordo.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q50',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2017,
  2,
  50,
  'Fática
Vai namorar?
O vinho é uma bebida amiga do amor. Num
jantar a dois, seja num restaurante, seja em
casa, é preciso fazer as escolhas certas, e a
primeira ideia que vem à cabeça é o champanhe
ou espumante. Perfeito! Mas existem outras
sugestões também sedutoras.
É só pensar um pouco: pratos pesados, como
carnes vermelhas e molhos fortes, definitivamente
não combinam com namoro. Ainda bem, pois
assim estão descartados todos os vinhos
encorpados e tânicos (aqueles que amarram a
boca – já pensou que desastre?). Sendo assim,
ficou bem mais fácil escolher o vinho.
Suzamara Santos. Pequeno livro do vinho,
guia para toda hora. Campinas, SP: Verus
Editora, 2006, p. 74
Os tipos textuais se definem pelas escolhas
lexicais, os aspectos sintáticos, o emprego de
tempos verbais, pela sua natureza linguística
intrínseca de sua composição, portanto.
Levando em consideração as características do
texto acima e o suporte em que ele foi veiculado,
pode-se afirmar que

(A) trata-se de um texto descritivo, pois orienta
um comportamento.
(B) o tipo textual predominante é o narrativo,
dadas as ações de agentes no tempo e no
espaço.
(C) o texto é dissertativo-argumentativo, pois o
objetivo principal é convencer, persuadir.
(D) o texto é expositivo, pois apresenta conceitos
e informações.
(E) trata-se de um texto injuntivo, pois está
centrado no leitor e as formas verbais
incitam à ação.
Leia a frase a seguir.
“Seguro sem corretor credenciado não é
seguro.”',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q51',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2017,
  2,
  51,
  'em sua segunda ocorrência, significa
acordo.

Questão 51 Questão 52
Questão 49
Fonte: https://br.pinterest.com/
pin/760263980815399619/
Em relação à perspectiva defendida pela charge,
avalie as afirmações a seguir.
I. A tecnologia induz a pessoa a ficar
desconectada do mundo a sua volta.
II. O uso dos eletrônicos não traz riscos à
saúde, aliás, é bom para os jovens se
socializarem.
III. A pessoa fica dependente dos jogos virtuais,
pois eles produzem a sensação de bem-
estar e euforia.
IV. As consequências da exposição prolongada
às parafernálias eletrônicas não afetam a
socialização.
É correto apenas o que se afirma em

(A) I e II.
(B) I e III.
(C) II e IV.
(D) III e IV.
(E) I, II, III e IV.
A ESTRANHA VIDA REAL
Jacaré Banguela
– Então, o senhor sofre de reumatismo?
– É claro. O que o senhor queria? Que eu
usufruísse do reumatismo, que eu desfrutasse
do reumatismo, que eu fruísse do reumatismo,
que eu gozasse o reumatismo?',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q52',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2017,
  2,
  52,
  'I, II, III e IV.
A ESTRANHA VIDA REAL
Jacaré Banguela
– Então, o senhor sofre de reumatismo?
– É claro. O que o senhor queria? Que eu
usufruísse do reumatismo, que eu desfrutasse
do reumatismo, que eu fruísse do reumatismo,
que eu gozasse o reumatismo?
Fonte: Platão e Fiorin. Lições de texto. São
Paulo: Ática, 2010.
Os textos de humor fazem largo uso da dupla
possibilidade de leitura. Marque a opção em que
se encontra o recurso humorístico utilizado no
texto.

(A) A dupla possibilidade de leitura é sugerida
pelo uso da palavra reumatismo.
(B) O duplo sentido desse texto evidencia-se na
repetição da palavra reumatismo.
(C) O verbo sofrer possibilita apenas uma
interpretação.
(D) O verbo sofrer possibilita mais de uma
interpretação, pois assume dois sentidos:
“ter” e “padecer” respectivamente.
(E) O duplo sentido evidencia-se na pergunta
feita ao interlocutor.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q53',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2017,
  2,
  53,
  'O duplo sentido evidencia-se na pergunta
feita ao interlocutor.

Questão 53 Questão 54
Metonímia – a palavra me ficou na memória
desde o ano de 1930, quando publiquei o
meu livro de estreia, aquele romance de seca
chamado “O Quinze”. Um crítico, examinando
a obrinha, censurava-me porque, em certo
trecho da história, eu falava que o galã saíra
a andar “com o peito entreaberto na blusa”.
“Que disparate é esse?”, indagava o sensato
homem. “Deve-se dizer é: blusa entreaberta
no peito”. Aceitei a correção com humildade e
acanhamento, mas aí o meu ilustre professor de
Latim, Dr. Matos Peixoto, acudiu em meu consolo.
Que estava direito como eu escrevera; que na
minha frase eu utilizara uma figura de retórica,
a chamada metonímia – tropo que consiste em
transladar-se a palavra do seu sentido natural
da causa para o efeito, ou do continente para
o conteúdo. E citava o exemplo clássico: “taça
espumante” – continente pelo conteúdo, pois
não é a taça que espuma e sim o vinho. Assim
sendo, “peito entreaberto” estava certo, era um
simples emprego de metonímia. E juntos, numa
nota de jornal, meu mestre e eu silenciamos o
crítico. Não sei se o zoilo aprendeu a lição. Eu
fui que a não esqueci mais. Volta e meia lá aplico
a metonímia – acho mesmo que é ela a minha
única ligação com a velha retórica.
QUEIROZ, Raquel de. Metonímia, ou vingança do
enganado. In_____ Cenas brasileiras.9. ed. São
Paulo: Ática,2003. p.75-83
Em relação à metonímia, avalie os pares a
seguir.
I. “Os aviões semeavam a morte” – continente
pelo conteúdo.
II. “Que as armas cedam à toga.” – sinal pela
coisa significada.
III. “Não resistir ao apelo daquela meiguice” –
espécie pelo indivíduo.
IV. “Ganharás o pão com o suor do teu rosto” –
efeito pela causa.
É correto apenas o que se afirma em

(A) I e II.
(B) I e III.
(C) II e IV.
(D) III e IV.
(E) I, II, III e IV.
Poema brasileiro',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q54',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  2,
  54,
  'I, II, III e IV.
Poema brasileiro
No Piauí de cada 100 crianças que nascem
78 morrem antes de completar 8 anos de idade
No Piauí
de cada 100 crianças que nascem
78 morrem antes de completar 8 anos de idade
No Piauí
de cada 100 crianças
que nascem
78 morrem
antes
de completar
8 anos de idade
antes de completar 8 anos de idade
antes de completar 8 anos de idade
antes de completar 8 anos de idade
antes de completar 8 anos de idade
Ferreira Gullar. Dentro da noite veloz, 1975.
O poema acima consta de uma única frase,
repetida algumas vezes em diferentes estruturas
de versos. Essa estratégia se deve à:

(A) busca pela relevância das informações que
o poeta quer privilegiar.
(B) referência à falta de educação formal das
crianças do Piauí.
(C) mostra do descaso dos órgãos públicos
para com as crianças do Nordeste.
(D) tentativa de chamar atenção para o número
de crianças que morrem no Piauí.
(E) necessidade de destaque dos desequilíbrios
regionais existentes no Brasil.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  2,
  55,
  'necessidade de destaque dos desequilíbrios
regionais existentes no Brasil.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA
Leia o texto sobre o vírus da Zika e responda às questões 55 e 56.
Reporting on Zika Families — and Their Resilience
By STEPHEN HILTNER MARCH 11, 2017
It was the mothers’ tenacity that struck Adriana Zehbrauskas more than anything else.
Ms. Zehbrauskas, the photographer who captured the images published in today’s front-page article about
Brazil’s Zika epidemic, wasn’t sure what to expect when she arrived in Escada.
On one hand, this was a homecoming of sorts: Ms. Zehbrauskas, who lives in Mexico City but was born and
raised in Brazil, knew that her familiarity with the language and the culture there would come in handy when
working with her subjects.
On the other hand, she knew this would be an especially difficult assignment, one that would force her to
confront the uncertainties and hardships faced by families whose children are afflicted with microcephaly
and other Zika-related illnesses.
But what she found, to her surprise, was a transformative sense of resilience.
“These women, they’re incredible,” Ms. Zehbrauskas said. “Their routines are so intense, so difficult, that I
felt I had to work 20 hours a day to do justice to their stories.”
Far from shying away from the spotlight, many of the women profiled in the article were eager, in the end,
to share their experiences — though it often took several visits to gain their trust.
“There was a lot of press a year ago, and many women got a lot of financial help — people would send
donations,” Ms. Zehbrauskas explained. “But people don’t talk about Zika like they used to. Many families
now feel that they’re facing this alone.”
Pam Belluck, who wrote today’s article, also felt a poignant sense of hope throughout her time in Brazil. Ms.
Belluck, after all, has two daughters who are close in age to one of the women, Íris Adriane do Nascimento
Santos, profiled in the piece. (Íris gave birth, at age 14, to a daughter who exhibits microcephaly and a range
of other complications, including seizures.)
“Here’s this girl, who’s the same age as my kids, and who’s had to give up on her schooling and completely
change her life for a future that’s so different than what you’d want for any teenager,” Ms. Belluck said. “I’m
full of admiration for how strong she is, and how self-assured she seems to be about her baby’s treatment
— asking question after question, getting up at dawn and going to four appointments a day.”
Tenacity, though, wasn’t all Ms. Zehbrauskas and Ms. Belluck witnessed. There were challenging moments,
too — as when Íris described the depression she felt shortly after giving birth.
“In the moment, when I’m photographing, my camera works as a shield,” Ms. Zehbrauskas explained. “I
have to be very attentive to details, to technical details — and for me that dulls the emotions a bit.”
“It’s only afterwards that everything sinks in,” she said.
As a reporter, Ms. Belluck had no such shield. And because she conducted most of her interviews through
Íris Adriane do Nascimento Santos and her
baby daughter, Alícia.

an interpreter, she had more time — when waiting to understand what someone had said — to experience
a given moment’s emotional freight.
“The waiting made it feel like I was somehow more involved, and more exposed,” she said. “All of
these other sensations — things I was seeing, hearing, smelling — had time to seep in. It all felt more
visceral.”
Ms. Zehbrauskas traveled to Brazil twice for the story, first on a 10-day trip this past September with Ms.
Belluck and Tania Franco, an interpreter, and again on a five-day solo trip in January.
Between the two trips, she kept in contact with the women she’d photographed, talking and exchanging
messages via WhatsApp. Many of the women sent updates on their babies’ health; Ms. Zehbrauskas also
shared stories with them about her own son, who’s 14.
“They’re very present in my life,” Ms. Zehbrauskas said. “All of them.”
And she plans to keep in touch with the women in the months and years ahead. “I hope that this story might
help in some way, that it might bring some ongoing attention to the situation,” Ms. Zehbrauskas said.
“Because for many of these women,” she added, “this is just the start of a new life. For them it’s a story that’s
just beginning.”
https://www.nytimes.com/2017/03/11/insider/reporting-on-zika-families-and-their-resilience.html
Escolha a opção que corresponde à tradução das palavras em negrito abaixo mantendo o mesmo sentido
do texto.
1. shying away 2. give up 3. getting up 4. seep in

(A) 1. ser absorvido; 2. desistir; 3. esquivar-se; 4. levantando-se.
(B) 1. esquivar-se; 2. ser absorvido; 3. desistir; 4. levantando-se.
(C) 1. esquivar-se; 2. desistir; 3. levantando-se ; 4. ser absorvido.
(D) 1. ser absorvido; 2. esquivar-se; 3. levantando-se; 4. desistir.
(E) 1. levantando-se; 2. esquivar-se; 3. ser absorvido; 4. desistir.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  2,
  56,
  '1. levantando-se; 2. esquivar-se; 3. ser absorvido; 4. desistir.
Questão 55
Selecione a opção que melhor resume a ideia principal do texto.

(A) Apresentar o artigo escrito pela repórter brasileira Adriana Zehbrauskas, que não sabia o que a
aguardava quando chegou em Escada.
(B) Mostrar o trabalho de duas repórteres internacionais descrevendo a realidade de uma jovem
adolescente com filho portador do vírus da Zika e microcefalia.
(C) Mostrar a dificuldade de famílias brasileiras no combate ao vírus da Zika na visão do repórter Stephen
Hiltner em sua viagem ao Brasil em 2016.
(D) Apresentar o trabalho de duas repórteres sobre a resiliência de uma família brasileira no interior do
Brasil, mostrando suas dificuldades, medos e conquistas.
(E) Mostrar a tenacidade e a resiliência de mães brasileiras na luta para sobreviver ao vírus da Zika e
a microcefalia e, trazer atenção para atual situação na experiência vivida por uma fotógrafa e uma
jornalista.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q57',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  2,
  57,
  'Mostrar a tenacidade e a resiliência de mães brasileiras na luta para sobreviver ao vírus da Zika e
a microcefalia e, trazer atenção para atual situação na experiência vivida por uma fotógrafa e uma
jornalista.
Questão 56

Questão 57
Questão 58
Beauty and the Beast é uma trilha sonora do filme de 2017 da Walt
Disney Pictures, Beauty and the Beast. Contém em sua maior parte
regravações de canções originais do filme de mesmo nome lançado
em 1991, compostas por Howard Ashman e Alan Menken.
Tale as old as time
True as it can be
Barely even friends
Then somebody bends
Unexpectedly
Just a little change
Small, to say the least
Both a little scared
Neither one prepared
Beauty and the Beast
Ever just the same
Ever a surprise
Ever as before
Ever just as sure
As the sun will rise
Tale as old as time
Tune as old as song
Bittersweet and strange
Finding you can change
Learning you were wrong
Certain as the sun (Certain as the sun)
Rising in the east
(Tale as old as time)
Song as old as rhyme
Beauty and the beast
(Tale as old as time)
Song as old as rhyme
Beauty and the beast
Oh, oh, whoa
Ooh
Beauty and the beast
Marque a opção que corresponde à ideia da música.

(A) O amor e o ódio andam juntos nas relações.
(B) Uma relação amarga e estranha entre desconhecidos.
(C) Descobrir para mudar e aprender para acertar no amor.
(D) O sol nasce para todos no lado oeste da vida amorosa.
(E) As relações são sempre as mesmas como as velhas rimas.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2017,
  2,
  58,
  'As relações são sempre as mesmas como as velhas rimas.
Leia a canção e responda as questões 57 e 58.
As estruturas apresentadas “Tale as old as time” e “Song as old as time” exemplificam

(A) comparativo de igualdade e superioridade.
(B) comparativo de superioridade.
(C) comparataivo de inferioridade.
(D) comparativo de igualdade
(E) superlativo.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q59',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2017,
  2,
  59,
  'superlativo.

Questão 59
Questão 60
Leia a entrevista com Dermot Kincaid e relacione as perguntas abaixo com as respostas de cada parágrafo:
a. What is a normal day like?
b. What’s your favorite task?
c. Is your work the same every day?
d. Can you talk about your responsibilities?
Dermot Kincaid
Age: 21 Job: Secretary Nationality: Irish
1_________________________________?
I am in charge of the day-to-day running of the office. I am responsible for keeping my boss’s appointment
diary up to date. I answer the phone and deal with enquiries from our customers.
2_________________________________?
In the morning I open, sort, and distribute the mail. During the day I type letters and answer the phone. I also
send and receive emails and faxes. I take care of the filing and I keep records of expenditure such as travel
or purchases. At the end of the day I prepare the outgoing mail.
3_________________________________?
Not really. We get a lot of visitors and I enjoy meeting new people. I go and meet them at reception, tell them
about the company, and look after them.
4_________________________________?
I really like arranging business trips for my colleagues. I enjoy finding the flights, booking the hotels, and
getting information about the places.
A correspondência correta entre pergunta e resposta é:

(A) 1.d; 2.c; 3.a; 4.b.
(B) 1.b; 2.c; 3.a; 4.d.
(C) 1.d; 2.a; 3.c; 4.b.
(D) 1.b; 2.d; 3.a; 4.c.
(E) 1.d; 2.b; 3.c; 4.a.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2017-2_Q60',
  'linguagens',
  'Artes',
  'Artes',
  2017,
  2,
  60,
  'El Miserere
Gustavo Adolfo Bécquer
Hace algunos meses que, visitando la célebre abadía de Fitero y ocupándome en revolver algunos
volúmenes en su abandonada biblioteca, descubrí en uno de sus rincones dos o tres cuadernos de música
bastante antiguos cubiertos de polvo y hasta comenzados a roer por los ratones.
Era un Miserere.
Yo no sé la música, pero la tengo tanta afición que, aun sin entenderla, suelo coger a veces la partitura de
una ópera y me paso las horas muertas hojeando sus páginas, mirando los grupos de notas más o menos
apiñadas, las rayas, los semicírculos, los triángulos y las especies de etcéteras que llaman claves, y todo
esto sin comprender una jota ni sacar maldito el provecho.
Consecuente con mi manía, repasé los cuadernos, y lo primero que me llamó la atención fue que, aunque
en la última página había esta palabra latina, tan vulgar en todas las obras, finis, la verdad era que el
Miserere no estaba terminado porque la música no alcanzaba sino hasta el décimo versículo.
Esto fue, sin duda, lo que me llamó la atención primeramente; pero luego que me fijé un poco en las
hojas de música me chocó más aún el observar que, en vez de esas palabras italianas que ponen en
todas, como maestoso, allegro, ritardando, più vivo, a piacere, había unos renglones escritos con letra
muy menuda y en alemán, de los cuales algunos servían para advertir cosas tan difíciles de hacer como
esta: Crujen..., crujen los huesos, y de sus médulas han de parecer que salen los alaridos, o esta otra: La
cuerda aúlla sin discordar, el metal atruena sin ensordecer; por eso suena todo y no se confunde nada,
y todo es la humanidad que solloza y gime, o la más original de todas, sin duda, recomendaba al pie del
último versículo: Las notas son huesos cubiertos de carne; lumbre inextinguible, los cielos y su armonía...;
¡fuerza!..., fuerza y dulzura.
-¿Sabéis qué es esto? -pregunté a un viejecito que me acompañaba al acabar de medio traducir estos
renglones, que parecían frases escritas por un loco.
http://www.cervantesvirtual.com/portales/gustavo_adolfo_becquer, acesso em 03/05/2017.
Escolha a frase que melhor se relaciona com a natureza deste texto.

(A) Gustavo Adolfo Bécquer se interessava somente pela língua escrita, mesmo se compreendesse a
música escrita, para ele seria um conjunto de folhas mortas.
(B) Quando o autor chegou à velhice não sabia mais a música que sedutoramente cantava quando, jovem,
via-se num triângulo amoroso.
(C) O visitante da abadia de Fitero não sabia ler a música, mas gostava tanto dela que passava horas
apenas admirando suas grafias.
(D) A música da história era uma marcha fúnebre, tocada por ocasião da exumação dos ossos dos padres
fundadores da abadia.
(E) As partituras encontradas na abadia eram enfeitiçadas, quando foram lidas, as pessoas ficaram surdas
e seus ossos se partiram.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q41',
  'linguagens',
  'Educação Física',
  'Ed. Física',
  2018,
  2,
  41,
  'A DIETA CERTA
Não dá para negar. A consciência de uma vida mais
saudável está cada vez mais presente nas pessoas,
independentemente da idade. Além da questão do
peso (acima ou abaixo do adequado) e do desejo
de investir em hábitos saudáveis, fatores como
uma rotina corrida que impede uma alimentação
adequada, o início da prática de uma atividade
física ou o diagnóstico de alguma doença crônica
fazem com que surja a necessidade de buscar
profissionais que orientem tanto nas atividades
físicas, como um personal trainer, quanto na
alimentação. Nesta área, a responsabilidade é
do nutricionista.
VIEGAS, Larissa. A dieta certa. In: Revista
Onda Beach Park. Ano 4, nº 7, 2017, p. 77
(trecho).
A partir da leitura do texto acima e, observando
os argumentos utilizados, é possível inferir que o
objetivo do texto é

(A) defender a prática de exercícios físicos como
prerrogativa para não adoecer.
(B) esclarecer como a consciência por uma vida
saudável levou pessoas de todas as idades
a práticas saudáveis.
(C) mostrar a necessidade da orientação de
profissionais da área para a prática de hábitos
mais saudáveis.
(D) refutar a ideia de que apenas pessoas jovens
praticam atividades físicas.
(E) conscientizar as pessoas a mudarem seus
hábitos.
COM QUE ROUPA?
Agora vou mudar minha conduta',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q42',
  'linguagens',
  'Artes',
  'Artes',
  2018,
  2,
  42,
  'conscientizar as pessoas a mudarem seus
hábitos.
COM QUE ROUPA?
Agora vou mudar minha conduta
Eu vou pra luta pois eu quero me aprumar
Vou tratar você com a força bruta
Pra poder me reabilitar
Pois esta vida não está sopa
E eu pergunto: com que roupa?
Com que roupa que eu vou
Pro samba que você me convidou?
Com que roupa que eu vou
Pro samba que você me convidou?
Agora eu não ando mais fagueiro
Pois o dinheiro não é fácil de ganhar
Mesmo eu sendo um cabra trapaceiro
Não consigo ter nem pra gastar
Eu já corri de vento em popa
Mas agora com que roupa?
Com que roupa que eu vou
Pro samba que você me convidou?
Com que roupa que eu vou
Pro samba que você me convidou?
(...)
ROSA, Noel. Com que roupa? (1930)
In: https://www.letras.mus.br/noel-rosa-
musicas. Acesso em: 17/04/2018
Lançada em 1930, é possível perceber, na
composição, o registro de variedade linguística de
tempo, presentes nos versos abaixo, EXCETO em:

(A) Eu vou pra luta pois eu quero me aprumar
(B) Pois esta vida não está sopa
(C) Agora eu não ando mais fagueiro
(D) Mesmo eu sendo um cabra trapaceiro
(E) Eu já corri de vento em popa
Texto para as questões 42 e 43',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q43',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2018,
  2,
  43,
  'Eu já corri de vento em popa
Texto para as questões 42 e 43

Questão 43
A composição “Com que roupa” representa,
segundo o próprio Noel Rosa, “um Brasil de tanga,
pobre e maltrapilho”. Analisando o contexto social
brasileiro a partir dos recursos literários expressos
no texto, é correto dizer:

(A) O texto apresenta a luta de classes a partir
de quem convida para o samba e de quem é
convidado.
(B) A vida e o trabalho só são difíceis se o
brasileiro não leva seu ofício com seriedade
e responsabilidade.
(C) A estrutura poética tradicional, marcada com o
ritmo melódico contradiz o eu-lírico, que trata
de dificuldades do trabalhador brasileiro.
(D) A repetição de versos rompe a estrutura padrão
e desarticula a continuidade do conteúdo.
(E) A linguagem coloquial, própria do cotidiano,
gera empatia com o leitor, que se identifica
com as misérias e sofrimentos do eu-lírico,
ampliando-os para uma realidade possível.
o golpe mais efetivo contra a saudade. é quando
a gente se encaixa perfeitamente um no outro.
quando a minha alma beija a sua. é a ação de
encostar um coração no outro. a dívida mais
gostosa de se pagar. a melhor forma de salvar
alguém da tristeza.
é sorrir com os braços.
(JOÃO DOEDERLEIN)
https://br.pinterest.com/pin/213146994843777630/
Texto II',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q44',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2018,
  2,
  44,
  'A linguagem coloquial, própria do cotidiano,
gera empatia com o leitor, que se identifica
com as misérias e sofrimentos do eu-lírico,
ampliando-os para uma realidade possível.
o golpe mais efetivo contra a saudade. é quando
a gente se encaixa perfeitamente um no outro.
quando a minha alma beija a sua. é a ação de
encostar um coração no outro. a dívida mais
gostosa de se pagar. a melhor forma de salvar
alguém da tristeza.
é sorrir com os braços.
(JOÃO DOEDERLEIN)
https://br.pinterest.com/pin/213146994843777630/
Texto II
O texto I e o texto II comunicam-se e interligam-se,
embora sejam de gêneros diferentes. Confrontando
os textos, analise as afirmações:
I - No texto I, a ação do cachorrinho descontrói a
expectativa dos personagens humanos.
II - No texto II, o conceito do substantivo abraço
desconstrói a expectativa trazida pelo gênero
utilizado.
III - Nos textos I e II, há a desconstrução do conceito
de abraço como ação de encontro entre seres.
IV - O texto II apresenta recursos não-verbais que
reforçam o conceito verbalizado.
É correto apenas o que se afirma em:

(A) IV.
(B) I e II.
(C) I, II e IV.
(D) III e IV.
(E) I, II, III e IV.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q45',
  'linguagens',
  'Literatura',
  'Literatura',
  2018,
  2,
  45,
  'I, II, III e IV.
Questão 44
https://deposito-de-tirinhas.tumblr.com/post/119490365292/
por-charles-schulz-wwwpeanutscom
Texto I

Questão 45 Questão 46
Terceiro livro da escritora nigeriana Chimamanda
Ngozi Adichie, originalmente publicado em 2009,
No seu pescoço (The Thing Around Your Neck)
nos apresenta um conjunto de instantâneos da
diáspora nigeriana. Publicada cinco anos antes
do êxito avassalador de Americanah (2013), os
contos anunciam os temas que viriam a marcar a
obra de Adichie, em particular, as tensões entre
a vida em África e a vida na América; e também
prenunciam o lugar central das suas narradoras,
de um modo geral jovens mulheres afastadas da
Nigéria em busca de uma educação e de melhores
condições de vida; ou gente jovem tentando a sua
sorte num limbo entre o futuro e a circunstância.
Adichie é impiedosa na descrição da Nigéria do
presente, facto realçado pelo seu estilo sem fogo
de artifícios. A sua prosa tem o compasso de uma
história antiga e a fluência sem constrangimento
das páginas de diário de uma mulher segura de
si. Lugar onde reina a arbitrariedade, a sua Lagos
natal surge-nos no cruzamento entre dois polos – a
família e o Estado – na qual as suas narradoras
testemunham o vexame dos seus familiares às
mãos do poder.
Djaimilia Pereira de Almeida – Quatro cinco
um, setembro 2017, p.6-7.
A resenha é um tipo de texto que serve
para divulgar e apresentar uma obra que o(a)
leitor(a) geralmente não leu ou não conhece. Ela
pode, assim, atualizar o público leitor de modo
breve sobre produções científicas, literárias, filmes
etc., especialmente, recentes. Com relação à
resenha sobre a obra da autora nigeriana, pode-
se afirmar que é do tipo

(A) Descritivo.
(B) Narrativo.
(C) Crítico.
(D) Ficcional.
(E) Informativo.
http://www.nominuto.com/
blogdemarcospedroza/humor-charge/6189/',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q46',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2018,
  2,
  46,
  'Informativo.
http://www.nominuto.com/
blogdemarcospedroza/humor-charge/6189/
Na charge, encontra-se uma figura de linguagem
que procura passar uma conotação mais agradável.
Essa figura é

(A) Antítese.
(B) Paradoxo.
(C) Eufemismo.
(D) Metáfora.
(E) Ironia.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q47',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2018,
  2,
  47,
  'Ironia.

Questão 47
A um poeta
Longe do estéril turbilhão da rua,
Beneditino escreve! No aconchego
Do claustro, na paciência e no sossego,
Trabalha e teima, e lima, e sofre, e sua!
Mas que na forma se disfarce o emprego
Do esforço: e trama viva se construa
De tal modo, que a imagem fique nua
Rica mas sóbria, como um templo grego
Não se mostre na fábrica o suplício
Do mestre. E natural, o efeito agrade
Sem lembrar os andaimes do edifício:
Porque a Beleza, gêmea da Verdade
Arte pura, inimiga do artifício,
É a força e a graça na simplicidade.
Olavo Bilac
Considerando a poesia, avalie as afirmações a seguir
I. A poesia é um soneto decassílabo com rimas ricas.
II. O texto utiliza a função de linguagem conativa por meio de verbos no imperativo.
III. O poeta expressa o desgaste para escrever com perfeição formal.
IV. A última estrofe faz uma crítica ao Modernismo.
É correto apenas o que se afirma em:

(A) I.
(B) II.
(C) I e III.
(D) II e IV.
(E) I e IV.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q48',
  'linguagens',
  'Literatura',
  'Literatura',
  2018,
  2,
  48,
  'I e IV.

Questão 48
Observe o seguinte texto:
Conto de mistério
Com a gola do paletó levantada e a aba do chapéu abaixada, caminhando pelos cantos escuros, era
quase impossível a qualquer pessoa que cruzasse com ele ver seu rosto. No local combinado, parou e fez
o sinal que tinham já estipulado à guisa de senha. Parou debaixo do poste, acendeu um cigarro e soltou a
fumaça em três baforadas compassadas. Imediatamente um sujeito mal-encarado, que se encontrava no
café em frente, ajeitou a gravata e cuspiu de banda.
Era aquele. Atravessou cautelosamente a rua, entrou no café e pediu um guaraná. O outro sorriu e se
aproximou: “Siga-me!” - foi a ordem dada com voz cava. Deu apenas um gole no guaraná e saiu. O outro
entrou num beco úmido e mal iluminado e ele - a uma distância de uns dez a doze passos - entrou também.
Ali parecia não haver ninguém. O silêncio era sepulcral. Mas o homem que ia à frente olhou em volta,
certificou-se de que não havia ninguém de tocaia e bateu numa janela. Logo uma dobradiça gemeu e a
porta abriu-se discretamente.
Entraram os dois e deram numa sala pequena e enfumaçada onde, no centro, via-se uma mesa
cheia de pequenos pacotes. Por trás dela um sujeito de barba crescida, roupas humildes e ar de agricultor
pareciam ter medo do que ia fazer. Não hesitou - porém - quando o homem que entrara na frente apontou
para o que entrara em seguida e disse: “É este”.
O que estava por trás da mesa pegou um dos pacotes e entregou ao que falara. Este passou o pacote
para o outro e perguntou se trouxera o dinheiro. Um aceno de cabeça foi à resposta. Enfiou a mão no bolso,
tirou um bolo de notas e entregou ao parceiro. Depois se virou para sair. O que entrara com ele disse que
ficaria ali.
Saiu então sozinho, caminhando rente às paredes do beco. Quando alcançou uma rua mais clara,
assoviou para um táxi que passava e mandou tocar a toda pressa para determinado endereço. O motorista
obedeceu e, meia hora depois, entrava em casa a berrar para a mulher:
- Julieta! Ó Julieta... consegui.
A mulher veio lá de dentro enxugando as mãos em um avental, a sorrir de felicidade. O marido colocou
o pacote sobre a mesa, num ar triunfal. Ela abriu o pacote e verificou que o marido conseguira mesmo. Ali
estava: um quilo de feijão.
Stanislaw Ponte Preta. Dois amigos e um chato. São Paulo: Moderna, 1986, p.65-66.
A narrativa de Stanislaw Ponte Preta, por tratar de um assunto ligado ao cotidiano, pode ser classificada como
crônica, mas tem em seu título a palavra conto. Desta forma, analise as afirmativas que podem explicar isso:
I – Há uma crítica social.
II – Observa-se o pouco diálogo.
III – Têm muitas personagens.
IV – Imita de forma humorística os livros de mistério.
É correto apenas o que se afirma em:

(A) II e III.
(B) III e IV.
(C) I, II e III.
(D) I, II e IV.
(E) II, III e IV.
Texto para as questões 48 e 49',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q49',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2018,
  2,
  49,
  'II, III e IV.
Texto para as questões 48 e 49

Questão 49
Questão 50
Questão 51
O mistério da narrativa de Stanislaw Ponte Preta
não se manifesta apenas no desenvolvimento das
ações das personagens, mas também no uso dos
advérbios de modo.
Observe os trechos abaixo e assinale a opção que
está corretamente sublinhado o advérbio de modo.

(A) (...) soltou a fumaça em três baforadas
compassadas.
(B) Atravessou cautelosamente a rua, entrou no
café e pediu um guaraná.
(C) O outro entrou num beco úmido e mal
iluminado e ele - a uma distância de uns dez
a doze passos - entrou também.
(D) (...) certificou-se de que não havia ninguém
de tocaia e bateu numa janela
(E) Quando alcançou uma rua mais clara, assoviou
para um táxi que passava (...)',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q50',
  'linguagens',
  'Artes',
  'Artes',
  2018,
  2,
  50,
  'Quando alcançou uma rua mais clara, assoviou
para um táxi que passava (...)
Reparei desde pequena que os adultos vivem muito
em casais. Mesmo que nem sempre sejam óbvios,
porque algumas pessoas têm par mas andam
avulsas como as solteiras, há casais de mulher
com homem, há de homem com homem e outros
de mulher com mulher. Há também casais de
pássaros, coelhos, elefantes, besouros, pinguins
– que são absurdamente fiéis -, quero dizer: há
casais de pinguins, e até golfinhos podem ser
casais. Tudo por causa do amor.
O amor constrói. Gostamos de alguém, mesmo
quando estamos parados durante o tempo de
dormir, é como fazer prédios ou cozinhar para
mesas de mil lugares.
Mas amar é um trabalho bom. A minha mãe diz.
MÃE. V.H. O paraíso são os outros. São
Paulo: Cosac Naify, 2014
De acordo com a narradora,

(A) o amor é um sentimento tão fácil que até os
animais vivenciam-no.
(B) todas as pessoas que não têm par andam
avulsas.
(C) o amor é uma incessante construção e dá
trabalho.
(D) os casais humanos são infiéis.
(E) devemos respeitar os casais homossexuais.
Rápido e rasteiro
Vai ter uma festa
que eu vou dançar
até o sapato pedir pra parar.
Aí eu paro
tiro o sapato
e danço o resto da vida.
(In: Italo Moriconi, org. Os cem melhores
poemas brasileiros do século. São Paulo:
Objetiva, 2001. p. 271)',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q51',
  'linguagens',
  'Artes',
  'Artes',
  2018,
  2,
  51,
  'devemos respeitar os casais homossexuais.
Rápido e rasteiro
Vai ter uma festa
que eu vou dançar
até o sapato pedir pra parar.
Aí eu paro
tiro o sapato
e danço o resto da vida.
(In: Italo Moriconi, org. Os cem melhores
poemas brasileiros do século. São Paulo:
Objetiva, 2001. p. 271)
Leia as seguintes afirmações sobre o texto Rápido
e rasteiro.
I - O eu lírico é uma pessoa decidida.
II - O sapato representa a censura sofrida pelo
eu lírico.
III - O eu lírico busca sua liberdade.
É correto apenas o que se afirma em:

(A) I.
(B) I e II.
(C) I e III.
(D) II e III.
(E) I, II e III.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q52',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  2,
  52,
  'I, II e III.

Questão 52
Dia do professor de anacolutos
Levantei-me, corri a pegar o giz, aqui está professor. Ele me olhou agradecido, o rosto cansado. Já
naquela época, o rosto cansado. Dava aulas em três escolas diferentes e ainda levava para casa uma
maçaroca de provas para corrigir.
O aluno preparava-se para sentar, ele, o olhar fino:
- Aproveitando que o moço está de pé, me diga: sabe o que é anacoluto?
É o que dá a gente querer ser legal. Vai-se apanhar o giz do chão, e o professor vem e pergunta o que
é anacoluto. Por que não pergunta àquela turma que ficou rindo do bolso traseiro rasgado das calças dele?
- Anacoluto... Anacoluto é... Anacoluto.
- Pode se sentar. Vou explicar o que é anacoluto. Muito obrigado por ter apanhado o giz do chão. Estou
ficando enferrujado.
Agora era ele, no bar, tomando café.
Lembra de mim, professor?
Também estou de cabelos brancos. Menos que ele, claro.
Com o indicador da mão esquerda acerta o gancho dos óculos no alto do nariz fino e cheio de pintas
pretas e veiazinhas azuladas, me encara, deve estar folheando o livro de chamada, verificando um a um o
rosto da cambada da segunda fila da classe.
- Fui seu aluno, professor.
DIAFÉRIA, Lourenço. O imitador de gato. 2. ed. São Paulo: Ática, 2003. Fragmento.
Encontramos um exemplo de anacoluto em:

(A) Aquele vestido que está na moda, você que gosta de estar na moda deveria comprar um.
(B) Meu tio é médico, meu pai, enfermeiro.
(C) Cursava engenharia meu filho na Unifor.
(D) Gosto de todas as matérias: português, matemática, ciências, geografia, história.
(E) “É pau, é pedra, é o fim do caminho” (Tom Jobim)',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q53',
  'linguagens',
  'Literatura',
  'Literatura',
  2018,
  2,
  53,
  '“É pau, é pedra, é o fim do caminho” (Tom Jobim)

Questão 53
As Caravanas
É um dia de real grandeza, tudo azul
Um mar turquesa à la Istambul
enchendo os olhos
E um sol de torrar os miolos
Quando pinta em Copacabana
A caravana do Arará - do Caxangá,
da Chatuba
A caravana do Irajá,
o comboio da Penha
Não há barreira que retenha
esses estranhos
Suburbanos tipo muçulmanos
do Jacarezinho
A caminho do Jardim de Alá -
É o bicho, é o buchicho, é a charanga
Diz que malocam seus facões
e adagas
Em sungas estufadas e calções
disformes
Diz que eles têm picas enormes
E seus sacos são granadas
Lá das quebradas da Maré
Com negros torsos nus
deixam em polvorosa
A gente ordeira e virtuosa que apela
Pra polícia despachar de volta
O populacho pra favela
Ou pra Benguela, ou pra Guiné
Sol, a culpa deve ser do sol
Que bate na moleira, o sol
Que estoura as veias, o suor
Que embaça os olhos e a razão
E essa zoeira dentro da prisão
Crioulos empilhados no porão
De caravelas no alto mar
Tem que bater, tem que matar,
engrossa a gritaria
Filha do medo, a raiva é mãe da covardia
Ou doido sou eu que escuto vozes
Não há gente tão insana
Nem caravana do Arará
BUARQUE, Chico. As Caravanas. Rio de
Janeiro: Biscoito Fino, 2017. 1CD
Sobre o texto acima, letra da canção As Caravanas,
do álbum homônimo de Chico Buarque, é
INCORRETO apenas o que se afirma na opção:

(A) O texto tematiza, por meio de um olhar acurado
de cronista, as belezas do Rio de Janeiro, com
ênfase na Praia de Copacabana, com seu mar
turquesa de encher os olhos.
(B) O texto narra a tensão social entre dois
universos cariocas, tendo como palco a Praia
de Copacabana.
(C) O texto retrata uma parcela da sociedade nos
dias de hoje, segregante, preconceituosa e
adepta da intervenção policial como solução
para os problemas sociais.
(D) O texto permite várias associações, uma delas
se encontra nos versos “E essa zoeira dentro
da prisão / Criolos empilhados no porão/De
caravelas no alto mar”, que remetem ao tempo
da escravidão no Brasil.
(E) O texto possibilita extrair um olhar irônico do
narrador em alguns momentos, entre eles, a
culpa pelo conflito social ser atribuída ao sol.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q54',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2018,
  2,
  54,
  'O texto possibilita extrair um olhar irônico do
narrador em alguns momentos, entre eles, a
culpa pelo conflito social ser atribuída ao sol.

Questão 54
Sobre este cartum de Laerte, é CORRETO afirmar que o efeito humorístico:

(A) está no fato de a imagem desnudar algo que os telespectadores não veem: a desordem que é a mesa
dos jornalistas.
(B) está no fato de a imagem mostrar uma espécie de “falha nossa”, pois houve uma pane nos equipamentos
de leitura dos jornalistas e eles ficaram sem saber o que dizer diante das câmeras: um momento de
constrangimento.
(C) advém do modo como os jornalistas foram retratados em suas posturas, como se fossem dois robozinhos.
(D) é obtido pelo recurso da contradição entre o que os jornalistas dizem e o que fazem. Imagens e palavras
se contradizem.
(E) está na representação estereotipada dos apresentadores, feita sempre por um homem e uma mulher.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição no Processo
Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2018,
  2,
  55,
  'está na representação estereotipada dos apresentadores, feita sempre por um homem e uma mulher.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição no Processo
Seletivo. A mudança de opção NÃO será permitida neste momento.
LÍNGUA INGLESA
Questão 55
INQUEST TOLD OF HOSPITAL ERROR
A HOSPITAL error left a dying man on the wrong ward for two days as deep
vein thrombosis (DVT) ravaged his body, an inquest heard. Stephen Melvin
Newbold suffered massive brain damage when a blood clot formed in his
veins. Now his family are considering legal action against York Hospital,
saying that his death was ‘untimely and unnecessary’.
Mr Newbold, a 52-year-old maintenance worker, went to York Hospital on
November 3 complaining of a swollen right foot. He should have been sent
to a surgical ward where he would have been treated with Fragmin, a drug which counters the effects of DVT.
However, hospital staff wrongly admitted him to an orthopaedic ward, where he stayed for two days, before
finally being transferred to the care of a consultant vascular surgeon. Twenty-four hours later, on November
6, doctors decided they would have to operate to remove his leg below the knee.
The operation went ahead on November 10, but two days later Mr Newbold suffered a cardiac arrest. A scan
revealed he had a pulmonary embolism, a condition related to DVT. Mr Newbold suffered brain damage and
died in the hospital on November 16.
Giving evidence, the surgeon said he could not explain why Mr Newbold had been admitted to an orthopaedic
ward where it was not policy to administer Fragmin. He did not know why his medical team had not given Mr
Newbold the drug later.
York coroner Donald Coverdale said, ‘From November 3 until the day of the operation, no Fragmin was given to
Mr Newbold. If he had been admitted to a consultant vascular surgeon’s care day one, it is clear that Fragmin
would have been prescribed. Fragmin reduces the risk of DVT, but does not eliminate it. It is impossible to
say whether Mr Newbold would have suffered this DVT if he had received the Fragmin.’ He recorded a verdict
of death by misadventure.
Kim Daniells, Mr Newbold’s family lawyer, said, ‘The family hope the hospital will learn from the errors, and
that no other families will have to suffer in the future.’
A spokeswoman for York Hospital’s NHS Trust said, ‘We would like to extend our sincere sympathies to the
family of Stephen Newbold during this difficult time.’
Leia o texto e analise as afirmações abaixo.
I - O paciente foi internado com um pé inchado.
II - O paciente foi internado no setor cirúrgico.
III - O paciente não recebeu a medicação correta.
IV - O paciente morreu antes de ser operado.
V - O paciente morreu em decorrência de uma lesão cerebral.
É correto apenas o que se afirma em:

(A) III e V.
(B) II e IV.
(C) I e V.
(D) I, IV e V.
(E) II, III e IV.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q56',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2018,
  2,
  56,
  'II, III e IV.

Questão 56
A cartunista americana Kate Selley Palmer iniciou sua carreira como ilustradora de livros infantis. Suas
tirinhas geralmente comentam problemas sociais tais como política, educação e desemprego.
https://www.google.com.br/search?biw=1366&bih=662&tbm=isch&sa=1&ei=Len4WuasFsH_wQSW1qzIAw
Sobre a ideia que a tirinha apresenta, analise as seguintes afirmações:
I. um elogio ao trabalho do governo em prol da política educacional.
II. um conselho aos jovens sobre as vantagens da educação gratuita.
III. um alerta sobre a necessidade de investimentos na educação pública.
IV. a possibilidade de duas formas de pagamento na área da educação pública.
V. uma crítica à falta de investimentos na educação pública e suas consequências.
É correto apenas o que se afirma em:

(A) I e V.
(B) II e V.
(C) III e V.
(D) I, IV e V.
(E) I, II e V.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  2,
  57,
  'I, II e V.

Questão 57 Questão 58
Leia a letra de Photograph, um grande sucesso de
Ed Sheeran, que está nas paradas internacionais
e responda:
So you can keep me inside the pocket
Of your ripped jeans
Holding me close until our eyes meet
You won’t ever be alone1
Wait for me to come home
Loving can heal2
Loving can mend your soul3
And it’s the only thing that I know
I swear it will get easier4
Remember that with every piece of you
And it’s the only thing we take with us when we die.
Marque a alternativa correta:

(A) Todas as opções estão relacionadas a
promessas.
(B) Todas as opções estão relacionadas a
possibilidades.
(C) As opções 1 e 2 estão relacionadas
a promessas e as opções 3 e 4 estão
relacionadas a possibilidades.
(D) As opções 1 e 2 estão relacionadas a
possibilidades e as opções 3 e 4 estão
relacionadas a promessas.
(E) As opções 1 e 4 estão relacionadas
a promessas e as opções 2 e 3 estão
relacionadas a possibilidades.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q58',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2018,
  2,
  58,
  'As opções 1 e 4 estão relacionadas
a promessas e as opções 2 e 3 estão
relacionadas a possibilidades.
Harley Schwadron é um americano cujo trabalho
aparece regularmente no Wall Street Journal, revista
Barron, Forbes, Harvard Business Review, bem
como em muitas publicações menores. Desenhos
animados de editorial do Schwadron aparecem em
publicações como o Washington Post, Christian
Science Monitor, Washington Times, Semana de
opinião Liberal e muitos outros. Ele vive e trabalha
em Ann Arbor, Michigan.
Observe a tirinha a seguir:
“Good news. Your cholesterol has stayed the same,
but the research findings have changed.” significa:

(A) Boas notícias. Seu colesterol permanece o
mesmo, mas os resultados das pesquisas
mudaram.
(B) Boas notícias. Seu colesterol ficou o mesmo,
mas, no encontro, os pesquisadores mudaram
de opinião.
(C) Boas notícias. Seu colesterol tem sido igual,
mas os achados nas pesquisas têm mudado.
(D) Boas novas. Seu colesterol tem sido o mesmo,
mas os resultados das pesquisas têm mudado.
(E) Boas notícias. Seu colesterol ficou o mesmo,
mas, nos resultados das pesquisas, tem
continuado a subir.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  2,
  59,
  'Boas notícias. Seu colesterol ficou o mesmo,
mas, nos resultados das pesquisas, tem
continuado a subir.

Questão 59
Maryn McKenna é uma escritora e jornalista americana que escreveu para a National
Geographic e falou sobre antibióticos no TED (Technology, Entertainment and
Design Conference) 2015. Recebeu o Prêmio Byron H. Waksman de Excelência
em Comunicação Pública de Ciências da Vida em 2013 e o Prêmio de Liderança da
Aliança pelo Uso Prudente de Antibióticos em 2014.
Leia parte de um artigo de autoria de Maryn McKenna a seguir:
It’s Official: Zika Is a Sexually Transmitted Infection
Public health experts now know that Zika can be passed in bodily fluids between one man and another,
between a man and a woman, and from a woman to a man—and though no case _______ (make)1 public,
they assume it _______ (transmit)2 between female partners as well.
So far, in the continental United States, 15 cases of Zika are confirmed to have been transmitted by sexual
contact. That’s out of 1,657 cases of infection. (In Puerto Rico, where Zika is spreading very rapidly—4,684
cases as of July 29—analysis for sexual transmission hasn’t been done.)
The CDC’s updated advice—a result of the discovery two weeks ago that a woman in New York City passed
Zika to a man she _______ (have)3 sex with—expands advice the agency previously gave about protecting
pregnant women. Now it: “Men and women who want to reduce the risk for sexual transmission of Zika virus
_______ (use)4 barrier methods against infection consistently and correctly during sex or abstain from sex
when one sex partner has traveled to or _______ (live)5 in an area with active Zika virus transmission.”
The point of the new advice is twofold: to protect pregnant women, or ones about to become pregnant, from
_______ (risk)6 a devastating birth defect; and also _______ (slow down)7 the transmission of Zika from
infected travelers into the rest of the population. But it emphasizes the tricky nature of _______ (detect)8 and
_______ (prevent)9 the advance of Zika, since four out of five people infected _______ (show)10 no symptoms.
A opção que preenche corretamente as lacunas é:

(A) 1. have been made; 2. cans be transmitted; 3. had; 4. would use; 5. live; 6. risk; 7. slow down; 8. detect;
9. prevent; 10. show
(B) 1. was made; 2. could be transmitted; 3. has had; 4. has to use; 5. had lived; 6. risking;7. slowing down;
8. detect; 9. prevent; 10. showing
(C) 1. has been made; 2. can be transmitted; 3. had; 4. should use; 5. lives; 6. risking; 7. to slow down;
8. detecting; 9. preventing; 10. show
(D) 1. was made; 2. can transmit; 3. has had; 4. can use; 5. used to live; 6. risking; 7. to slow down;
8. detecting; 9. preventing; 10. show
(E) 1. has been made; 2. can be transmitted; 3. has had; 4. might use; 5. lives; 6. risk; 7. slowing down;
8. detecting; 9. prevent; 10. showing',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-2_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  2,
  60,
  'https://elpais.com/agr/el_pais_semanal_entrevistas/a/, acesso em 10/05/2018
Escolha a opção que relaciona as frases a seus autores e respectivas entrevistas em que foram pronunciadas.

(A) I – c, II – d, III – a, IV – f, V – b, VI – e.
(B) I – b, II – c, III – a, IV – d, V – e, VI –f.
(C) I – f, II – d, III – c, IV – b, V – e, VI – a.
(D) I – d, II – e, III – f, IV – a, V – c, VI – b.
(E) I – f, II – c, III – d, IV – a, V – e, VI – b.
a) “Hay algo heroico en la figura del hombre solitario,
como en las películas de Bogart. Una mujer sola
levanta sospechas, tiene un halo de fracaso”.
b) “Siento que quizás estamos confundiendo las
prioridades y hablando solo del acoso desde la
perspectiva de la mujer blanca y privilegiada”
c) “El nacionalismo entraña una forma de racismo y
conduce a la violencia. El desvanecimiento de las
fronteras es lo más progresista de nuestro tiempo”
d) “La diferencia entre un cerebro que se ejercita
en la escuela de forma ordenada y otro que no lo
hace es la misma que existe entre un árbol visto
en otoño y en primavera”
e) “Una de las funciones del artista es recordar al
espectador que cuando mira una obra no está
viendo una verdad, sino una proyección. Se ve a
sí mismo”
f) “De resucitar a un ser humano, yo me centraría
en los denisovanos, de los que no tenemos más
que dos dientes y la punta de un dedo de la mano.
Sería fascinante”',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q41',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2019,
  1,
  41,
  'Tocando em Frente
Almir Sater / Renato
Teixeira
Ando devagar
Porque já tive pressa
E levo esse sorriso
Porque eu já chorei demais
Hoje me sinto mais forte
Mais feliz, quem sabe
Eu só levo a certeza
De que muito pouco eu sei
Ou nada sei
Conhecer as manhas
E as manhãs
O sabor das massas
E das maçãs
É preciso amor
Pra poder pulsar
É preciso paz pra poder sorrir
É preciso a chuva para florir
Penso que cumprir a vida
Seja simplesmente
Compreender a marcha
E ir tocando em frente
Como um velho boiadeiro
Levando a boiada
Eu vou tocando os dias
Pela longa estrada, eu vou
Estrada eu sou
Todo mundo ama um dia
Todo mundo chora
Um dia a gente chega
E no outro vai embora
Cada um de nós compõe
A sua própria história
E cada ser em si
Carrega o dom de ser capaz
De ser feliz
O gênero música, como outros textos, está inter-
relacionado com outros discursos que podem
apresentar uma complexidade social e histórica do
sujeito. Em relação à letra da música de Almir Sater
e Renato Teixeira, analise as seguintes afirmações.
I. No título “Tocando em Frente”, o verbo tocar
não se refere apenas ao seu significado
lexical, mas também à condução do gado, à
vida conduzida e ao próprio sujeito.
II. Na primeira estrofe, apresenta uma fase
da vida marcada pela individualidade, a
necessidade imediata própria da juventude.
III. Na terceira estrofe, ainda na primeira pessoa,
apresenta as rimas “manhas/manhãs”, em
que se percebe na primeira palavra – o que
se aprende; e na segunda palavra – o que
está posto.
IV. No trecho “cada um de nós compõe a sua
história”, percebe-se um indivíduo consciente
de sua posição social, mesmo sob uma
ideologia, pode reverter sua história.
É correto apenas o que se afirma em

(A) I, II e IV.
(B) I e IV.
(C) II, III e IV.
(D) II e IV.
(E) III e IV.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q42',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2019,
  1,
  42,
  'III e IV.

Questão 42
Amor Proibido
Cartola
Sabes que vou partir
Com os olhos rasos d’água
E o coração ferido
Quando lembrar de ti
Me lembrarei também
Deste amor proibido
Fácil demais
Fui presa
Servi de pasto
Em tua mesa
Mas fique certa que jamais
Terás o meu amor
Porque não tens pudor
Faço tudo para evitar o mal
Sou pelo mal perseguido
Só o que faltava era esta
Fui trair meu grande amigo
Mas vou limpar a mente
Sei que errei
Errei inocente
Disponível em: https://www.letras.mus.br. Acesso em: 25 set. 2018.
As marcas linguísticas disseminadas pelo texto permitem identificar o seu locutor, ou o falante desse amor
proibido. Assinale a opção em que essas marcas linguísticas asseguram o gênero do locutor.

(A) Trata-se de uma figura feminina, como pode ser comprovado no verso “fui presa”.
(B) Trata-se de uma figura masculina, como atesta o verso “Sou pelo mal perseguido”.
(C) Trata-se de uma figura feminina, devido ao adjetivo certa em “mas fique certa...”.
(D) Trata-se de uma figura masculina, como autoriza o verso “Errei inocente”.
(E) Trata-se de uma figura feminina, identificada nos versos “Servi de pasto”.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q43',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2019,
  1,
  43,
  'Trata-se de uma figura feminina, identificada nos versos “Servi de pasto”.

Questão 43 Questão 44
Costuma-se acreditar que, quando se relatam
dados da realidade, não pode haver nisso
subjetividade alguma e que relatos desse tipo
merecem toda a nossa confiança porque são
reflexo da neutralidade do produtor do texto e de
sua preocupação com a verdade objetiva dos fatos.
Mas não é bem assim. Mesmo relatando dados
objetivos, o produtor do texto pode ser tendencioso
e ele, mesmo sem estar mentindo, insinua seu
julgamento pessoal pela seleção dos fatos que
está reproduzindo ou pelo destaque maior que
confere a certos pormenores.
A essa escolha dos fatos e à ênfase atribuída a
certos tipos de pormenores dá-se o nome de viés.
(...)
Nas campanhas políticas, órgãos da imprensa,
dizendo-se imparciais e comprometidos com a
neutralidade da informação, não podem manifestar
claramente suas preferências partidárias. Mas
estes acabam encontrando maneiras veladas de
fazer propaganda, como, por exemplo, a prática
do viés.
(...)
Para não cair na ingenuidade e para não se deixar
levar pela malícia do produtor do texto, o leitor
atento deve procurar reconhecer todo tipo de viés,
pois essa é uma das formas de manipular o texto,
pela qual o escritor cria uma imagem positiva ou
negativa de um certo dado da realidade, fingindo
estar sendo neutro.
PLATÃO e FIORIN. Para entender o texto – leitura e
redação. São Paulo: Ática, 1992 (fragmentos)
Considerando a natureza didática desse texto, os
autores objetivam

(A) fazer uma crítica à falta de informação do
eleitorado brasileiro.
(B) explanar uma estratégia de produção de texto.
(C) denunciar a falta de neutralidade da imprensa.
(D) chamar a atenção para o descuido com a
leitura.
(E) alertar os leitores sobre a malícia dos textos
publicitários.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q44',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  44,
  'alertar os leitores sobre a malícia dos textos
publicitários.
De acordo com o infográfico “A desigualdade de
gênero no Brasil em 2016”, é correto afirmar que

(A) as mulheres estudam mais, entretanto têm
salário compatível com o dos homens.
(B) a taxa de frequência média do ensino médio
entre os homens brancos é maior do que a
taxa das mulheres.
(C) a proporção de mulheres pretas ou pardas
com representação política na Câmara é de
10,5%.
(D) o percentual de tempo dedicado aos afazeres
domésticos é igual entre homens pretos ou
pardos e as mulheres brancas.
(E) a s m u l h e r e s e m g e r a l t r a b a l h a m
18,1h semanais em afazeres domésticos e
os homens, 10,5h semanais.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q45',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  45,
  'a s m u l h e r e s e m g e r a l t r a b a l h a m
18,1h semanais em afazeres domésticos e
os homens, 10,5h semanais.

Como opera a máfia que transformou o
Brasil num dos campeões da fraude de
medicamentos
É um dos piores crimes que se podem cometer.
As vítimas são homens, mulheres e crianças
doentes — presas fáceis, capturadas na esperança
de recuperar a saúde perdida. A máfia dos
medicamentos falsos é mais cruel do que as
quadrilhas de narcotraficantes. Quando alguém
decide cheirar cocaína, tem absoluta consciência
do que coloca no corpo adentro. Às vítimas dos que
falsificam remédios não é dada oportunidade de
escolha. Para o doente, o remédio é compulsório.
Ou ele toma o que o médico lhe receitou ou passará
a correr risco de piorar ou até morrer. Nunca como
hoje os brasileiros entraram numa farmácia com
tanta reserva.
PASTORE, Karina. O Paraíso dos Remédios Falsificados.
Veja, nº 27. São Paulo: abril, 8 jul. 1998, p. 40-41.
No trecho “Nunca como hoje os brasileiros
entraram numa farmácia com tanta reserva”,
o termo destacado pode ser substituído, sem
alteração de sentido, por

(A) estoque.
(B) cautela.
(C) economia.
(D) retenção.
(E) acúmulo.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q46',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  46,
  'acúmulo.
Questão 45
Questão 46
Questão 47
Elogio da memória
O funil da ampulheta
Apressa, retardando-a
A queda
Da areia.
Nisso imita o jogo
Manhoso
De certos momentos
Que se vão embora
Quando mais queríamos
Que ficassem.
PAES, José Paulo. Socráticas: poemas. São
Paulo: Companhia das Letras, 2011. p.49
Com base na leitura do poema, considere as
seguintes afirmações.
I. Não é possível ir contra o fluxo do tempo.
II. Precisamos da memória para resgatar os
momentos que se foram.
III. O poeta gostaria de eternizar os bons
momentos.
IV. O texto pode ser considerado uma poesia
concreta.
É correto apenas o que se afirma em

(A) I e II.
(B) III e IV.
(C) I, II e III.
(D) II, III e IV.
(E) I, II, III e IV.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q47',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2019,
  1,
  47,
  'I, II, III e IV.
Texto para as questões 46 e 47.
No período "Às vítimas dos que falsificam
remédios não é dada oportunidade de escolha",
o termo destacado exerce a função sintática de

(A) sujeito.
(B) objeto direto.
(C) objeto indireto.
(D) complemento nominal.
(E) agente da passiva.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q48',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  48,
  'agente da passiva.

Questão 48 Questão 49
Assaltos insólitos
[...]
— É um assalto, fica quieto senão leva chumbo.
Ele já se preparava para toda sorte de tragédias
quando um dos ladrões pergunta:
— Cadê o patrão?
Num rasgo de criatividade, respondeu:
— Saiu, foi com a família ao mercado, mas já volta.
— Então vamos lá dentro, mostre tudo.
Fingindo-se, então, de empregado de si mesmo,
e, ao mesmo tempo para livrar sua cara, começou
a dizer:
— Se quiserem levar, podem levar tudo, estou
me lixando, não gosto desse patrão. Paga mal,
é um pão-duro. Por que não levam aquele rádio
ali? Olha, se eu fosse vocês, levava aquele som
também. Na cozinha tem uma batedeira ótima da
patroa. Não querem uns discos? Dinheiro não tem,
pois ouvi dizerem que botam tudo no banco, mas
ali dentro do armário tem uma porção de caixas
de bombons, que o patrão é tarado por bombom.
Os ladrões recolheram tudo o que o falso
empregado indicou e saíram apressados.
Daí a pouco chegavam a mulher e os filhos.
Sentado na sala, o marido ria, ria, tanto nervoso
quanto aliviado do próprio assalto que ajudara a
fazer contra si mesmo.
SANTANNA, Affonso Romano. Porta de colégio
e outras crônicas, São Paulo: Ática 1995.
O texto “Assaltos insólitos” é uma crônica porque

(A) expressa a opinião de um jornal ou de uma
revista sobre um assunto da atualidade.
(B) apresenta relatos de fatos com acréscimo de
entrevistas e comentários.
(C) retrata acontecimentos do cotidiano com
caráter crítico.
(D) sua função principal é a de divulgar uma
informação visualmente.
(E) apresenta uma moral no final do texto.
Fonte: Facebook',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q49',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  49,
  'apresenta uma moral no final do texto.
Fonte: Facebook
No texto publicitário, o termo "que" se justifica
pelo fato de

(A) inferir que há outras Marias iguais a ela.
(B) ressaltar a singularidade da Maria.
(C) recuperar o termo “eu”.
(D) explicar a situação da Maria.
(E) apresentar versões da Maria.

Mãos Dadas',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q50',
  'linguagens',
  'Literatura',
  'Literatura',
  2019,
  1,
  50,
  'O poeta foge do individual e se volta para o
coletivo e a solidariedade.
Questão 51
Questão 50
Texto para as questões 50 e 51
Drummond expressa neste poema aspectos do
fazer poético, deixando claras suas intenções e a
direção que sua poesia irá tomar. Esse processo de
escrever desnudando o ato de escrever constitui
uma das principais características da literatura
moderna.
Assinale a alternativa que indica essa característica.

(A) Intertextualidade.
(B) Metalinguagem.
(C) Discurso Indireto.
(D) Dialogismo.
(E) Intencionalidade.

Leitura',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q51',
  'linguagens',
  'Literatura',
  'Literatura',
  2019,
  1,
  51,
  'apresentar versões da Maria.

Mãos Dadas
Não serei o poeta de um mundo caduco.
Também não cantarei o mundo futuro.
Estou preso à vida e olho meus companheiros.
Estão taciturnos mas nutrem grandes esperanças.
Entre eles, considero a enorme realidade.
O presente é tão grande, não nos afastemos.
Não nos afastemos muito, vamos de mãos dadas.
Não serei o cantor de uma mulher, de uma história,
não direi os suspiros ao anoitecer,
a paisagem vista da janela,
não distribuirei entorpecentes ou cartas de suicida,
não fugirei para as ilhas nem serei raptado por
serafins.
O tempo é a minha matéria, o tempo presente, os
homens presentes,
a vida presente.
ANDRADE, C Drummond. Obra Completa
e Prosa. Rio de Janeiro: Nova Aguilar, 1974,
p. 111.
Sobre o poema de Drummond, assinale a altenativa
CORRETA:

(A) A volta ao passado é o principal tema do
poema.
(B) Há vários versos que enaltecem temas caros
ao Romantismo.
(C) O poema faz apologia ao mundo futuro.
(D) O lirismo contemplativo, o escapismo
romântico e o pessimismo decadentista
constituem a essência do poema.
(E) O poeta foge do individual e se volta para o
coletivo e a solidariedade.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q52',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  52,
  'Intencionalidade.

Leitura
Era um quintal ensombrado, murado alto de pedras.
As macieiras tinham maçãs temporãs, a casca
vermelha do escuríssimo vinho,
o gosto caprichado das coisas fora do seu tempo
desejadas.
Ao longo do muro eram talhas de barro.
Eu comia maçãs, bebia a melhor água, sabendo
que lá fora o mundo havia parado de calor.
Depois encontrei meu pai, que me fez festa e não
estava doente e nem tinha
morrido, por isso ria, os lábios de novo e a cara
circulados de sangue, caçava
o que fazer para gastar sua alegria: onde está
meu formão, minha vara de pescar,
cadê minha binga, meu vidro de café?
Eu sempre sonho que uma coisa gera, nunca
nada está morto.
O que não parece vivo, aduba.
Ao que parece estático, espera.
PRADO, Adélia – Bagagem,1976.
Com base na leitura do poema, considere as
seguintes afirmações.
I. O eu-lírico descreve recordações de uma
cena doméstica, familiar.
II. Há um mergulho no sonho, na imaginação.
III. As imagens: “quintal ensombrado”, “maçãs
temporãs”, “melhor água” constituem apenas
reminiscências.
IV. Observa-se o uso de metalinguagem: o sonho
gerou o poema
É correto apenas o que se afirma em

(A) I, II e III.
(B) I, II e IV.
(C) I e II.
(D) II, III e IV.
(E) I, II, III e IV.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q53',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  53,
  'I, II, III e IV.
Questão 52
Questão 53
Do ponto de vista da composição do poema
Leitura de Adélia Prado,é CORRETO afirmar que

(A) É predominantemente dissertativo, servindo
as imagens como fundo para a digressão.
(B) É predominantemente descritivo, construído
apenas com termos concretos: quintal,
maçãs, macieiras, muro, água, retratando
um cenário familiar específico.
(C) Equilibra em harmonia descrição, narração e
dissertação à medida que suas recordações
saem do plano das reminiscências, sofrem
transformações e dão margem a digressões.
(D) É predominantemente narrativo, visto que
o eu-lírico evoca os acontecimentos que
marcaram o encontro com seu pai.
(E) Equilibra narração e dissertação, com o uso
de imagens que servem como fundo para a
digressão.
Texto para as questões 52 e 53',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q54',
  'linguagens',
  'Artes',
  'Artes',
  2019,
  1,
  54,
  'Equilibra narração e dissertação, com o uso
de imagens que servem como fundo para a
digressão.
Texto para as questões 52 e 53

Questão 54
Entenda por que o letramento precoce pode ser prejudicial
Juliana Duarte
Aprender a ler e a escrever antes do tempo pode excluir etapas decisivas no desenvolvimento das crianças
O letramento precoce é um assunto permeado por controvérsias. Enquanto algumas instituições de ensino
apostam em atividades ligadas à leitura e à escrita, outras defendem a ideia de que é preciso preparar a
criança antes de abordar esse tipo de assunto.
Introduzida pelo filósofo e educador austríaco Rudolf Steiner (1861-1925) em 1919, a pedagogia Waldorf
defende que os pequenos (com até 7 anos de idade) tenham apenas uma responsabilidade na escola: brincar.
Ao participar de jogos e atividades lúdicas, meninos e meninas desenvolvem diversas habilidades, entre
físicas e motoras, além de um estímulo essencial para a vida: a confiança. Segundo a teoria, nessa fase o
aluno tende a gastar muita energia e se prepara fisicamente – isso é fundamental para o seu desenvolvimento
neurológico e sensorial. Tais capacidades refletem em domínio corporal, linguagem oral e, principalmente,
contribuem para a inteligência da criança.
Em poucas palavras: na educação infantil, aprimorar essas características é mais importante do que
aprender a ler o próprio nome. “Eliminar atividades que favorecem a criatividade e o pensamento pode ter
consequências graves. Infelizmente, muitas dessas práticas estão sendo substituídas pela escolarização
antecipada”, alerta Luiz Carlos de Freitas, diretor da Faculdade de Educação da Universidade Estadual de
Campinas (Unicamp).
Disponível em:<http://www.revistaeducacao.com.br/por-que-o-letramento-precoce-pode-ser-prejudicial/>. Acesso
em 16 Out 2018.
De acordo com o texto, é correto afirmar que

(A) aprender a ler e a escrever pode excluir etapas decisivas no desenvolvimento da criança.
(B) a criança com 7 anos de idade já pode ser alfabetizada sem prejuízo em sua formação.
(C) a educação infantil deve ter jogos e práticas lúdicas que favoreçam a escolarização.
(D) as atividades lúdicas e os jogos na educação infantil são mais importantes do aprender a ler.
(E) aprender a ler o próprio nome na educação infantil aprimora o desenvolvimento mental da criança.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2019,
  1,
  55,
  'aprender a ler o próprio nome na educação infantil aprimora o desenvolvimento mental da criança.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55 Questão 56
This happened two or three years ago in Indonesia
on a business trip... and I was invited to the Area
Manager’s house for dinner, which was lovely. I met
his wife and children. The kids were terribly sweet.
Especially his son was only ten years old. He was
so cute! Anyway, I patted the boy on his head …
and I noticed that everybody looked embarrassed.
I knew I’d done something wrong, but I didn’t know
what it was. I learnt afterwards that in Indonesia
you must never touch someone’s head, because
it’s rude. Anyway, my hosts were really nice and
I had an enjoyable evening. In fact, I saw them
again earlier this year. Their son is a lot taller now
and I can’t even touch his head.
O narrador desse comentário mostra-se
impressionado com o fato de, na Indonésia,

(A) ser proibido o toque de adultos na cabeça de
crianças.
(B) não se deve nunca acariciar a cabeça de
crianças.
(C) não ser permitido toques na cabeça de
crianças.
(D) não ser permitido carícias na cabeça de
alguém.
(E) não se deve nunca tocar na cabeça de alguém.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  56,
  'não se deve nunca tocar na cabeça de alguém.
Well, this wasn’t a big cultural faux pas, but it was
interesting. I had to go to Australia last year. I was
travelling around a lot – I had lots of meetings – so
I often took taxis. I give generous tips when I travel
– after all, they’re all expenses – but I realized that
nearly all the taxi drivers seemed offended by me.
You see, in Australia it’s always best to sit in the
front seat of a taxi. You know, actually next to the
driver. If you sit in the back, they think you are being
superior – that you think you are better than them.
A presente narrativa propõe-se a

(A) divulgar a melhor maneira de mobilidade
urbana na Austrália.
(B) informar aos turistas a importância da gorjeta
ao tomar um táxi.
(C) divulgar que atualmente devemos evitar sentar
ao lado do motorista de táxi na Austrália.
(D) recomendar o melhor local para um passageiro
ao usar um táxi na Austrália.
(E) reforçar que na Austrália o turista considera-se
melhor que o motorista de táxi.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q57',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2019,
  1,
  57,
  'reforçar que na Austrália o turista considera-se
melhor que o motorista de táxi.
Questão 57
Com base na leitura do cartum, conclui-se que

(A) amar não é querer alguém construído, mas
construir alguém querido.
(B) diz-me com quem andas e te direi quem és.
(C) o amor não envelhece, morre menino.
(D) quem ama perdoa.
(E) o amor é lindo.

ASK THE NURSE',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  58,
  'o amor é lindo.

ASK THE NURSE
Nurse Anthea answers your questions. This week’s
topic is bacteria.
Question - “I’m worried about my baby. She is
crawling around on the floor and putting all sorts
of things into her mouth.”
Nurse Anthea - Don’t worry. Children who live
in spotlessly clean houses do not have much
exposure to bacteria, so their immune systems
don’t get the practice of fighting bacteria. Research
shows that children living in houses that are not
spotlessly clean, who have contact with animals
and faecal matter, get fewer illnesses than children
living in spotless homes. And there’s evidence that
children who live with pets get fewer allergies.
Question - Is there a cure for MRSA (methicillin-
resistant Staphylococcus aureus)?
Nurse Anthea - There’s an antibiotic called
Vancomycin. This is our last weapon against
MRSA, but in time it will be useless too. One type
of Staphylococcus aureus is now resistant to
Vancomycin – so it is VRSA - Vancomycin resistant.
There is a possibility of a bacterium which will be
resistant to all antibiotics.
We have been winning the war against bacteria
for about fifty years, but soon bacteria will make
a comeback and we will be where we were in
the nineteenth century – with no protection from
bacteria.
Após a leitura do texto, concluímos que

(A) a sujeira é definitivamente saudável para o
ser humano.
(B) crianças que convivem com animais
domésticos têm menos alergias.
(C) crianças que convivem com animais
domésticos e fezes são mais susceptíveis
às alergias.
(D) é imprescindível a perfeita higienização das
residências para evitar o desenvolvimento de
alergias nas crianças.
(E) o sistema imunológico das crianças ainda não
está preparado para exposições à animais
domésticos e à fezes animais.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  1,
  59,
  'o sistema imunológico das crianças ainda não
está preparado para exposições à animais
domésticos e à fezes animais.
Questão 58
Texto para as questões 58 e 59. Questão 59
Após a leitura do texto, é possível concluir que

(A) antibióticos matam todas as bactérias.
(B) Vancomycin terá sempre 100% de efeito.
(C) VRSA é uma bactéria mais poderosa que
MRSA.
(D) estamos perdendo a guerra contra as
bactérias.
(E) o homem venceu a guerra contra as bactérias
há cinquenta anos.
Any suggestions?',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q42',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2019,
  2,
  42,
  'Leia a tirinha abaixo:
FONTE: www.urucumdigital.com.br
Relacionando a frase e as imagens presentes na tirinha, está correto afirmar, segundo o texto, que:

(A) a humanidade está sem direcionamento.
(B) as novas gerações estão desconstruindo o legado das gerações anteriores.
(C) após uma ascensão, a humanidade vive um retrocesso.
(D) em determinado momento da vida, os jovens seguem seu próprio caminho.
(E) existem vários caminhos a seguir e cada um decide qual deles é o melhor.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q43',
  'linguagens',
  'Artes',
  'Artes',
  2019,
  2,
  43,
  'existem vários caminhos a seguir e cada um decide qual deles é o melhor.

Questão 43
A Revista Cult, de 17 de setembro de 2017, publicou um dossiê intitulado Réquiem para uma Nação, destinado
à reflexão, um balanço crítico da tragédia anunciada e permitida em nosso país, com o surgimento de um
Estado que não é favorável à vida, desde 2016. Diante de assuntos tão fortes, como o que está presente
no texto de Ruy Braga, que trata da massa trabalhadora que passa, “a partir da reforma trabalhista, a ficar
desassistida e totalmente à mercê das manobras conservadoras que tomaram de assalto a política e a
economia do país nos últimos meses". O dossiê foi ilustrado com a partitura original de Wolfgang Amadeus
Mozart, Réquiem, de 1791, considerada uma obra-prima.
Com relação a esse recurso visual utilizado pela Revista Cult, assinale a alternativa correta.

(A) O uso do recurso da ilustração constitui apenas um elemento decorativo do dossiê.
(B) Ao ilustrar o dossiê com a partitura de Mozart, o conteúdo da matéria foi alterado.
(C) A ilustração constitui um recurso intertextual, pois a partitura pertence a uma composição musical
fúnebre, remetendo às mudanças referidas pelo autor.
(D) Dossiê e ilustração não dialogam entre si.
(E) A partitura de Mozart não endossa a proposta do dossiê.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q44',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2019,
  2,
  44,
  'A partitura de Mozart não endossa a proposta do dossiê.

Questão 44 Questão 45
Francisco contou para Aécio, que contou para a
namorada, que contou para Madeinusa, que pediu
a Adriano que a levasse urgente até a casa dos
pais de Francisco. Entrou sem pedir licença na
casa de Chico Coveiro, interrompendo a conversa,
de supetão:
– É verdade que você escuta uma voz cantar às
cinco da manhã, todo dia?
ACIOLI, Socorro. A cabeça do santo. São Paulo:
Companhia das Letras, 2014, p.128.
No excerto destacado, a urgência da situação é
passada por um recurso estilístico que é

(A) a comparação, dando valor aos homens que
conversa no caminho.
(B) o paradoxo, por ter adentrado de forma
repentina e abrupta na casa.
(C) a metáfora, reduzindo a personagem Chico
ao seu cargo de coveiro.
(D) o eufemismo, pois Madeinusa teria entrado
na casa com violência.
(E) a gradação, elencando a passagem de etapas
para reforçar algo.
Hortelã
Todas as noites
ela esperava a noite chegar
trazendo o pai do trabalho.
Às vezes era o pai
que trazia a noite
num saquinho de bala de hortelã.
Ela gostava da noite
porque a noite trazia
o suor do pai
Ela gostava da noite
porque a noite trazia
o suor do pai.
Ela gostava da noite
porque, à noite, ela e o pai
brincavam de dar nome às estrelas.
(NETHO, Paulo. Poesia Futebol Clube e outros poemas.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q45',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2019,
  2,
  45,
  'a gradação, elencando a passagem de etapas
para reforçar algo.
Hortelã
Todas as noites
ela esperava a noite chegar
trazendo o pai do trabalho.
Às vezes era o pai
que trazia a noite
num saquinho de bala de hortelã.
Ela gostava da noite
porque a noite trazia
o suor do pai
Ela gostava da noite
porque a noite trazia
o suor do pai.
Ela gostava da noite
porque, à noite, ela e o pai
brincavam de dar nome às estrelas.
(NETHO, Paulo. Poesia Futebol Clube e outros poemas.
São Paulo: Formato. 2007. p. 22)
No texto, há várias ocorrências da palavra noite.
Considerando essas ocorrências, avalie as
afirmativas.
I - Em todas as ocorrências, a palavra noite
exerce a mesma função sintática.
II - Em “ela esperava a noite chegar”, o termo
destacado é complemento nominal.
III - Em “Ela gostava da noite”, o termo destacado
exerce a função sintática de objeto indireto.
IV - Em “Às vezes era o pai/ que trazia a noite”, o
termo destacado exerce a função de sujeito.
V - Em “porque, à noite, ela e o pai/ brincavam
de dar nome às estrelas”, o termo destacado
exerce a função de adjunto adverbial.
Está correto o que se afirma apenas em

(A) I.
(B) II e V.
(C) III e V.
(D) II, III e V.
(E) II, III, IV e V.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q46',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  46,
  'II, III, IV e V.

Questão 46
Questão 47
GALHARDO, Caco. Daiquiri. Folha de S.Paulo, 10 nov. 2018.
Disponível em: <http://www.folha.uol.com.br/>. Acesso em: 7 nov. 2018.
A quebra de expectativa se dá pelo fato de

(A) o primeiro cão fazer uma pergunta retórica no primeiro quadro.
(B) a passagem do segundo quadro para o terceiro ser irônica.
(C) um utilizar a palavra “não” e o outro utilizar o termo “nem”.
(D) os cães terem feições animais mesmo que antropomorfizados.
(E) as personagens centrais discordarem no segundo quadrinho.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q47',
  'linguagens',
  'Literatura',
  'Literatura',
  2019,
  2,
  47,
  'as personagens centrais discordarem no segundo quadrinho.
Párias da bagaceira, vítimas de uma emperrada organização do trabalho e de uma dependência que os
desumanizava, eram os mais insensíveis ao martírio das retiradas.
A colisão dos meios pronunciava-se no contato das migrações periódicas. Os sertanejos eram malvistos nos
brejos. E o nome de brejeiro cruelmente pejorativo.
Lúcio responsabilizava a fisiografia paraibana por esses choques rivais. A cada zona correspondiam tipos e
costumes marcados.
Essa diversidade criava grupos sociais que acarretavam os conflitos de sentimentos.
ALMEIDA, José Américo de. A bagaceira. 45.ed. Rio de Janeiro: José Olympio, 2017,p.87
Precursor do romance de 30, A bagaceira personifica, segundo o trecho destacado, a cruel realidade que

(A) tensiona as relações entre alguns grupos mais humildes.
(B) afeta moradores escravizados do semiárido nordestino.
(C) leva moradores dos brejos a migrarem de forma periódica.
(D) acontece porque as zonas paraibanas são homogêneas.
(E) desperta a empatia naquelas que observam as retiradas.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q48',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2019,
  2,
  48,
  'desperta a empatia naquelas que observam as retiradas.

Questão 48
Considerando a tirinha acima, de autoria do famoso cartunista Quino, criador da personagem Mafalda,
avalie as afirmações a seguir.
I - O efeito de humor produzido está na coragem de uma menina de mexer nas armas de um policial.
II - O humor está no fato de o policial estar desatento, pois não percebe que estavam mexendo em sua
arma.
III - O efeito de humor está na metáfora usada por Mafalda para se referir ao cassetete usado pelo policial.
IV - A tirinha expressa uma crítica à repressão policial a quem defendia ideologia diferente a do Estado.
V - A tirinha contesta todo e qualquer desrespeito às leis do Estado argentino.
É correto apenas o que se afirma em

(A) III e IV.
(B) IV e V.
(C) II e IV.
(D) I e III.
(E) I, II e III.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q49',
  'linguagens',
  'Literatura',
  'Literatura',
  2019,
  2,
  49,
  'I, II e III.

Questão 49 Questão 50
Todos os anos, nas férias da escola, Conceição
vinha passar uns meses com a avó (que a criara
desde que lhe morrera a mãe), no Logradouro, a
velha fazenda da família, perto do Quixadá.
Ali tinha a moça o seu quarto, os seus livros, e,
principalmente, o velho coração amigo de Mãe
Nácia.
Chegava sempre cansada, emagrecida pelos dez
meses de professorado; e voltava mais gorda com
o leite ingerido à força, resposta de corpo e espírito
graças ao carinho cuidadoso da avó.
Conceição tinha vinte e dois anos e não falava
em casar. As suas poucas tentativas de namoro
tinham-se ido embora com os dezoito anos e
o tempo de normalista; dizia alegremente que
nascera solteirona.
Ouvindo isso, a avó encolhia os ombros e
sentenciava que mulher que não casa é um
aleijão...
- Esta menina tem umas ideias!
Estaria com razão a avó? Porque, de fato,
Conceição talvez tivesse umas ideias; escrevia
um livro sobre pedagogia, rabiscara dois sonetos,
e às vezes lhe acontecia citar o Nordau ou Renan
da biblioteca do avô.
Chegara até a se arriscar em leituras socialistas,
e justamente dessas leituras é que lhe saíam as
piores das tais ideias, estranhas e absurdas à avó.
(QUEIROZ, Rachel de. O quinze. 103. ed. Rio de Janeiro:
José Olympio, 2016, p.13-14)
Publicado em 1930, o romance O Quinze é o
primeiro romance da escritora Rachel de Queiroz
e traz a temática da grande seca de 1915, da qual
a autora foi testemunha. É possível inferir com
base na leitura do trecho,

(A) o retrato cultural de uma época.
(B) o preconceito da época com mulheres que
trabalhavam.
(C) a desilusão de Conceição diante do casamento.
(D) o medo de Mãe Nácia da vida que Conceição
levava como professora.
(E) o conflito cultural entre gerações.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q50',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  50,
  'o conflito cultural entre gerações.
Leia o texto a seguir, retirado do discurso de O
grande ditador, filme de Charles Chaplin:
“Criamos a época da velocidade, mas nos sentimos
enclausurados dentro dela. A máquina, que
produz abundância, tem-nos deixado na penúria.
Nossos conhecimentos fizeram-nos céticos; nossa
inteligência, empedernidos e cruéis. Pensamos
em demasia e sentimos bem pouco. Mais do que
de máquinas, precisamos de humanidade. Mais
do que de inteligência, precisamos de afeição
e doçura. Sem essas virtudes, a vida será de
violência e tudo estará perdido”.
Com base na leitura, assinale a alternativa correta.

(A) Esse texto é figurativo, pois é composto
basicamente de termos concretos, como
velocidade, abundância, conhecimentos,
inteligência, humanidade, afeição etc.
(B) O termo máquina está usado em sentido
concreto significando “capacidade produtiva
da máquina”.
(C) No trecho, está presente o tema da proteção
do Estado aos indefesos.
(D) O tema central do texto é a paralisação do
homem apesar da velocidade.
(E) O tema geral do texto é: o excesso de
racionalidade sufoca o sentimento e conduz
à perdição da humanidade.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q51',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2019,
  2,
  51,
  'O tema geral do texto é: o excesso de
racionalidade sufoca o sentimento e conduz
à perdição da humanidade.

Questão 51
Questão 52
Em “Minha terra tem Corinthians, onde canta o sabiá!”, o termo destacado é

(A) conjunção adversativa.
(B) conjunção integrante.
(C) conjunção explicativa
(D) conjunção subordinativa condicional.
(E) pronome relativo.
Ética no jornalismo',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q52',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2019,
  2,
  52,
  'pronome relativo.
Ética no jornalismo
A regra de ouro do jornalismo deve ser a oitiva das partes não acreditando em nenhuma delas, pois jornalista
não pode e nem deve tomar partido dos fatos. Quando uma notícia é divulgada de forma equivocada, por
qualquer que seja a intenção, acaba arremessando toda a nobilíssima categoria jornalística ao crivo da
opinião pública. A independência não é alguma coqueluche no jornalismo e a mídia não percebeu ainda
que a opinião pública não é tão ingênua como parece ser e que os temas divulgados diuturnamente na
Imprensa são debatidos por dias sem fim.
MELO, Luís Olímpio Ferraz. Pensamento Contemporâneo. Fortaleza: ABC Editora, 2010. p. 30-31
O fragmento do texto traz um entendimento sobre o jornalismo, utilizando argumentos que

(A) refutam a parcialidade do papel do jornalista diante da notícia divulgada.
(B) evidenciam a neutralidade dos veículos de comunicação ao dar a notícia ao cidadão.
(C) denunciam que, às vezes, a mídia é usada como sinônimo de meios de comunicação.
(D) alertam para veiculação de notícias parciais e tendenciosas sob a ótica do jornalista.
(E) ratificam a vulnerabilidade da opinião pública diante dos meios de comunicação.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q53',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  53,
  'ratificam a vulnerabilidade da opinião pública diante dos meios de comunicação.

Questão 53
O apanhador de desperdícios
Uso a palavra para compor meus silêncios.
Não gosto das palavras
fatigadas de informar.
Dou mais respeito
às que vivem de barriga no chão
tipo água pedra sapo.
Entendo bem o sotaque das águas
Dou respeito às coisas desimportantes
e aos seres desimportantes.
Prezo insetos mais que aviões.
Prezo a velocidade
das tartarugas mais que a dos mísseis.
Tenho em mim esse atraso de nascença.
Eu fui aparelhado
para gostar de passarinhos.
Tenho abundância de ser feliz por isso.
Meu quintal é maior do que o mundo.
Sou um apanhador de desperdícios:
Amo os restos
como as boas moscas.
Queria que a minha voz tivesse um formato
de canto.
Porque eu não sou da informática:
eu sou da invencionática.
Só uso a palavra para compor meus silêncios.
BARROS, Manuel de. Poesia Completa. São Paulo: Leya, 2011
Com base na leitura do poema, avalie as afirmações a seguir.
I. O eu lírico é uma pessoa comedida e só fala o suficiente para satisfazer o seu interlocutor.
II. O eu lírico ama e valoriza as pessoas excluídas pela sociedade e as coisas simples da natureza.
III. O trecho que é usado para comprovar o título é “Meu quintal é maior do que o mundo.”
IV. O eu lírico é um apreciador das novas tecnologias.
Está correto o que se afirma apenas em

(A) I e III.
(B) I e II.
(C) II e III.
(D) I, II e III.
(E) I, II, III e IV.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q54',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2019,
  2,
  54,
  'I, II, III e IV.

Questão 54
Entre a barbárie e a civilização: o que nos une?
Vivemos atualmente um paradoxo histórico. As novas tecnologias produziram uma aceleração rumo ao
passado. As mutações decisivas das relações políticas, dos processos econômicos e das trocas intersubjetivas
miram em uma única direção: o abandono das conquistas civilizatórias. As novas tecnologias são usadas
para isso enquanto prometem publicamente apenas facilitar a vida das pessoas. Mas de que pessoas elas
realmente facilitam a vida quando vemos o número crescente de desempregados substituídos em todos os
setores por robôs e máquinas? Caixas eletrônicos de bancos, de supermercados e farmácias são apenas o
exemplo mais visível desse descarte de seres humanos por um sistema que visa o lucro e não o bem-estar
e a sobrevivência das pessoas.
O Estado explicitamente comprometido com os detentores do poder econômico, serve não ao povo, mas ao
capital. Desaparecem os limites e laços sociais que permitiam uma convivência minimamente harmoniosa e
o Estado que poderia fazer um papel de sustentação da sociedade humana segundo valores democráticos
cancela o seu sentido. Valores como a verdade, a fraternidade e a esperança passaram a ser tratadas
como mercadorias sem valor, enquanto a mentira, o egoísmo e o discurso de que não existem alternativas à
sociedade passaram a ser naturalizadas, quando não tratadas como virtudes. Práticas inquisitoriais voltaram
à moda enquanto governantes cada vez mais se revelam anti-iluministas e antidemocráticos. Vivemos sem
memória e no atraso. Tempos pós-históricos que parecem pré-históricos.
Marcia Tiburi
Disponível em: https://revistacult.uol.com.br/home/entre-a-barbarie-e-a-civilizacao-o-que-nos-une/
Com base na leitura do texto, considere as afirmativas.
I. A mutação das relações políticas aceleram o desenvolvimento das novas tecnologias.
II. A tecnologia facilita a vida das pessoas, porém provoca o desemprego.
III. O Estado e os detentores do poder econômico possuem um antagonismo explícito.
IV. A inversão dos valores morais passa a ser naturalizada pela sociedade.
V. As novas tecnologias são responsáveis pelo rompimento dos laços sociais.
É correto apenas o que se afirma em

(A) I e II.
(B) I e III.
(C) II e IV.
(D) I, II e IV.
(E) II, III e V.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2019,
  2,
  55,
  'II, III e V.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
Leonard Albert Kravitz (Nova Iorque, 26 de Maio de 1964), mais conhecido pelo seu nome artístico, Lenny
Kravitz, é um cantor, multi-instrumentista, produtor, arranjador e ator norte-americano, cujo estilo incorpora
elementos de rock, soul, reggae, hard rock, Rock psicodélico, Folk Rock, e baladas. abalou em sua apresentação
no Loola Pallosa-Brasil.
Are You Gonna Go My Way?
Lenny Kravitz
I don''t know why we always cry
This we must leave and get undone
We must engage and rearrange
And turn this planet back to one
So tell me why we got to die
And kill each other one by one
we''ve got to love and rub-a-dub
We''ve got to dance and be in love
Em seus versos, o autor

(A) tenta descobrir a razão do choro.
(B) quer união e mudanças no planeta através da união e amor.
(C) questiona a dificuldade da leveza da dança e do amor.
(D) questiona a morte e a paixão avassaladora.
(E) teme o fim do amor e da humanidade',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q56',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2019,
  2,
  56,
  'teme o fim do amor e da humanidade
Observe as tirinhas e marque a resposta correta:
Na sentença: “I’ve decided to sell my vacuum cleaner because it’s just collecting dust", o texto em
destaque significa:

(A) "Eu acabei de decidir vender o meu aspirador..."
(B) "Eu venderei o meu aspirador..."
(C) "Eu vou vender o meu aspirador..."
(D) "Eu tenho decidido vender o meu aspirador..."
(E) "Eu decidi vender o meu aspirador..."',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  57,
  '"Eu decidi vender o meu aspirador..."
Questão 56

Questão 57
Leia o texto abaixo e marque a ideia central.
Astronomers have evidence for black holes in nearly every galaxy in the universe
Although1 no black hole is close enough to Earth to pull the planet into its depths, there are so many black
holes in the universe that counting them is impossible. Nearly every galaxy — our own Milky Way as well as
the 100 billion or2 so other galaxies visible from Earth — shows signs of a black hole.
Of the billions of stars in the Milky Way, about one in every thousand new stars is massive enough to become
a black hole. Our sun isn’t. But3 a star 25 times heavier is. Stellar-mass black holes result from the death of
these stars, and4 can exist anywhere in the galaxy.
Supermassive black holes — a million to a billion times more massive than our sun — exist only in the center
of a galaxy. At the center of the Milky Way, 26,000 light-years from Earth, scientists are hoping to make an
image of Sagittarius A*, which is believed to be our own supermassive black hole, with the mass of four
million suns. How supermassive black holes form is still a mystery.
https://www.nytimes.com/interactive/2015/06/08/science/space/guide-to-black-holes.html
Segundo os astrônomos:
I - Há milhões de estrelas na Via Láctea.
II - Há buracos negros em todas as galáxias do universo.
III - Cerca de uma em cada mil novas estrelas pode tornar-se um buraco negro.
IV - O centro da Via Láctea encontra-se a cerca de 26.000 anos luz da Terra.
V - Acredita-se que Sagittarius A* seja o nosso buraco negro supermassivo com uma massa de quatro
milhões de sóis.
É correto apenas o que se afirma em

(A) I, IV e V.
(B) II, III e V.
(C) III, IV e V.
(D) I, III e IV.
(E) I, II, III, IV e V.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  58,
  'I, II, III, IV e V.

BRUMADINHO, Brazil — Luiz de Castro was installing lamps at a mining complex in Brazil late last month
when a loud blast split the air. He figured it was just a truck tire popping, but a friend knew better.
“No, it’s not that!” the friend said. “Run!”
Dashing up a staircase, caked in mud and pelted by flying rocks, Mr. Castro
clambered to safety. But as he watched, a wall of mud unleashed by the collapse
of a mining dam swallowed his co-workers, he said. Tiago, George, Icaro — they
and at least 154 others, all buried alive.
The deluge of toxic mud stretched for five miles, crushing homes, offices and
people — a tragedy, but hardly a surprise, experts say.
There are 87 mining dams in Brazil built like the one that failed — enormous
reservoirs of mining waste held back by little more than walls of sand and silt. And
all but four of the dams have been rated by the government as equally vulnerable,
or worse.
Even more alarming, at least 27 sit directly uphill from cities or towns, with more
than 100,000 people living in especially risky areas if the dams failed, an estimate
by The New York Times found.
In the disaster last month, all the elements for catastrophe were there: A bare-
bones reservoir of mining waste built on the cheap, sitting above a large town nestled underneath. Overlooked
warnings of structural problems that could lead to a collapse. Monitoring equipment that had stopped working.
And perhaps above all, a country where a powerful mining industry has been free to act more or less unchecked.
The threat of poorly constructed mining dams in Brazil goes far beyond one company. The latest deadly
failure — the second in Brazil in three years — has made it clear that neither the mining industry nor regulators
have the situation under control.
Vale S.A., the world’s largest iron ore producer, says it will close all 10 of its dams in Brazil with a design
similar to the one it ran in the town, Brumadinho. Still, the company, which bought the mining complex in
2001, defended its management of the dam, which had been sitting there, inactive, since 2016.
This article is by Shasta Darlington, James Glanz, Manuela Andreoni, Matthew Bloch, Sergio Peçanha, Anjali Singhvi and Troy
Griggs.
https://www.nytimes.com/interactive/2019/02/09/world/americas/brazil-dam-collapse.html
A ideia central do texto é

(A) mostrar como Luiz Castro conseguiu salvar-se do desastre ecológico de Brumadinho, embora seus 154
colegas não tenham tido a mesma sorte.
(B) relatar a tragédia que varreu casas, escritórios e pessoas, que foi uma grande surpresa para a Vale
S.A. e toda a população da região.
(C) mostrar o descaso do governo brasileiro com os resíduos tóxicos ao permitir a construção de reservatórios
baratos, acima das cidades, negligenciando os sinais de problemas estruturais que poderiam levar ao
colapso dos reservatórios e a falta de monitoramento deixando a empresa agir como bem quisesse.
(D) apresentar o plano que a Vale S.A desenvolverá não apenas em Brumadinho, mas em todo o território
nacional, nos próximos dez anos, salvando e protegendo as áreas atingidas pela avalanche de lama
tóxica.
(E) denunciar os próximos desastres, pois, sendo este o segundo acidente nos últimos três anos, nem a
indústria de mineração nem as agências reguladoras têm a situação sob controle.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  59,
  'denunciar os próximos desastres, pois, sendo este o segundo acidente nos últimos três anos, nem a
indústria de mineração nem as agências reguladoras têm a situação sob controle.
Questão 58

Questão 59
Leia o texto e escreva (V) se a sentença for verdadeira e (F) se for falsa.
Sandy McGuire
I operate the telephone helpline on the graveyard shift-that’s the one from midnight through to the
morning. Although it’s quiet and still in the streets outside, it’s not so quiet in the office. The early
hours of the morning are sometimes the busiest time, when the telephone never stops ringing.
People call the helpline for information or advice, or sometimes they just need to hear a friendly
voice. We talk to people who are depressed and worried, and sometimes in pain. Sometimes
we get some funny enquiries – yesterday, a teenager phoned because he had swallowed some
chewing gum and he was afraid he was going to die!
We can’t see our patients, so we have to be very good on the phone. We have to learn how to do it, because
it doesn’t come naturally. We have to know how to ask the right questions so that we get clear and accurate
answers, and we have to be able to speak in language anyone can understand.
Sobre o texto, analise as afirmações a seguir:
I - Sandy works at night.
II - Her shift is a quiet one.
III - Some people phone because they are lonely.
IV - Sandy only gives information – not advice.
V - Helpline nurses have to speak foreign languages.
É correto apenas o que se afirma em:

(A) I e III
(B) II, III e IV
(C) II, III, IV e V
(D) I, II, III e V
(E) I, II, III e IV',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2019-2_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2019,
  2,
  60,
  'Disponível em: www.espanolconarte.com/blog/piropos, acesso em 06/04/2019
Na ilustração, a adulação dirigida à senhora fracassou no âmbito da linguagem, entretanto,

(A) o velho insistiu tanto que acabou sendo grosseiro e ofensivo.
(B) todos sabemos atualmente que as “cantadas” na rua são mal vistas.
(C) abriu, a nível perceptivo, a possibilidade de um relacionamento mais amplo.
(D) as crianças deram um jeito de suavizar o incômodo provocado pela cena.
(E) a senhora, que não é boba, não perdeu a oportunidade de recriminar o velho.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q41',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2020,
  1,
  41,
  'Desenvolvimento humano
O Brasil enfrenta, neste momento, um desafio difícil de superar: “o de criar trabalho para milhões de
brasileiros”. Ao dizer que o crescimento econômico, com base no aumento do PIB, irá resolver o problema,
o governo esquece que o avanço tecnológico está ditando as normas e que o Brasil tem milhões de
analfabetos funcionais. As inovações tecnológicas, com base na robótica e automação, que os complexos
industriais e agroindustriais estão adotando para controlar seus processos produtivos, e com isso aumentar
sua produtividade, estão provocando o surgimento de indústrias e agronegócios sem trabalhadores.
(Ariosto Holanda, JORNAL O POVO, 09/05/2017)
Infere-se, do artigo de opinião acima, que

(A) o Brasil, atualmente, vem substituindo a mão-de-obra humana menos qualificada pela robótica.
(B) apesar do avanço tecnológico produzido pela robótica e a automação, não se percebem alterações no
mercado de trabalho brasileiro.
(C) a mão-de-obra qualificada no Brasil vem aumentando, rapidamente, na atualidade.
(D) as inovações tecnológicas estão ampliando as chances do trabalhador no mercado de trabalho brasileiro.
(E) a robótica e a automação, apesar de representarem um grande avanço tecnológico, jamais substituirão
o homem.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q42',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2020,
  1,
  42,
  'a robótica e a automação, apesar de representarem um grande avanço tecnológico, jamais substituirão
o homem.
Questão 42
Mente quieta, corpo saudável
A meditação ajuda a controlar a ansiedade e aliviar a dor? Ao que tudo indica, sim. Nessas duas áreas os
cientistas encontraram as maiores evidências da ação terapêutica da meditação, medida em dezenas de
pesquisas. Nos últimos 24 anos, só a Clínica de Redução do Estresse da Universidade de Massachussets
monitorou 14 mil portadores de câncer, aids, dor crônica e complicações gástricas. Os técnicos descobriram
que, submetidos a sessões de meditação que alteraram o foco de sua atenção, os pacientes reduziram o
nível de ansiedade e diminuíram ou abandonaram o uso de analgésicos.
(Revista Superinteressante, outubro de 2003)
Considerando o texto, pode-se afirmar que

(A) o texto apresenta o propósito comunicativo de instruir o público leitor.
(B) o conteúdo do texto é de natureza científica, cuja finalidade é a denúncia.
(C) o texto informa aos leitores sobre os benefícios da meditação e tem como objetivo emocionar o público.
(D) o texto visa informar aos leitores sobre os benefícios da meditação.
(E) o texto é um artigo de opinião, pois expressa o pensamento do autor.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q43',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2020,
  1,
  43,
  'o texto é um artigo de opinião, pois expressa o pensamento do autor.

Questão 43
Texto 1
COMIDA (Titãs)
bebida é água.
comida é pasto.
você tem sede de quê?
você tem fome de quê?
a gente não quer só comida,
a gente quer comida, diversão e arte.
a gente não quer só comida,
a gente quer saída para qualquer parte.
a gente não quer só comida,
a gente não quer bebida, diversão, balé.
a gente não quer só comida,
a gente quer a vida como a vida quer.
bebida é água.
comida é pasto.
você tem sede de quê?
você tem fome de quê?
a gente não quer ser só comer,
a gente quer comer e quer fazer amor.
a gente não quer só comer,
a gente quer prazer pra aliviar a dor.
a gente não quer só dinheiro,
a gente quer dinheiro e felicidade.
a gente não quer só dinheiro,
a gente quer inteiro e não pela metade.
Disponível em https://www.letras mus.br>
Disponível em https://br.pinterest.com/
pin/98164466849547260/
Sobre o cartaz de Jukka Veistola, de 1969, feito
para uma publicidade do UNICEF, e a música
''Comida'' dos Titãs, pode-se afirmar que:

(A) o cartaz dialoga integralmente com a canção
dos Titãs – “Comida”.
(B) o cartaz não apresenta qualquer relação com
a canção dos Titãs.
(C) depreende-se do cartaz o mesmo tema da
canção “Comida”.
(D) o cartaz dialoga parcialmente com a canção
dos Titãs.
(E) o cartaz poderia ilustrar a reivindicação contida
na canção dos Titãs na sua totalidade.
Texto 2',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q44',
  'linguagens',
  'Literatura',
  'Literatura',
  2020,
  1,
  44,
  'o cartaz poderia ilustrar a reivindicação contida
na canção dos Titãs na sua totalidade.
Texto 2

Questão 44 Questão 45
Avis rara
Na caixinha de joia
da menina
faísca um anel
de pedra azul.
Na cabeça aturdida
da menina
faísca uma palavra
mais azul
que a pedrinha
do anel:
avis rara
que a menina
guarda
como guarda
o anel.
Para usar em dia de festa.
GUTIÉRREZ, A. In: Canção da Menina. Fortaleza: UFC
– Casa José de Alencar: Programa Editorial, 1997
Nesse poema, a faiscante expressão “avis rara”,
cujo uso se associa a dia de festa, remete à

(A) linguagem não literária, composta de
elementos referenciais, como o anel de pedra
azul.
(B) poesia, cuja linguagem deve ser enfeitada,
difícil e assemelhar-se a um anel de pedra
azul.
(C) escrita memorialística, que narra eventos,
sobretudo, da primeira fase da vida: a infância.
(D) literatura, em que a palavra, utilizando-se da
denotação, reveste os eventos humanos.
(E) literatura, em que a linguagem evidencia uma
clara intenção estética ao retratar a realidade.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q45',
  'linguagens',
  'Literatura',
  'Literatura',
  2020,
  1,
  45,
  'literatura, em que a linguagem evidencia uma
clara intenção estética ao retratar a realidade.
O estresse é um inimigo do coração. As tensões
emocionais propiciam doenças cardiovasculares
aos montes. Já foi comprovado cientificamente
que a alta liberação de hormônios em situações
estressantes perturba o organismo, provocando
reações que englobam desde o aumento da
pressão arterial a um fulminante ataque cardíaco.
O termo em destaque acima é um pronome relativo,
pois retoma a função do termo antecedente na
oração. Nas orações abaixo, assinale a alternativa
em que o pronome relativo (que) exerce uma
função sintática diferente da exercida no texto.

(A) Já foi comprovado cientificamente que a
alta liberação de hormônios em situações
estressantes perturba o organismo.
(B) Quem vive uma rotina estressante libera
altos níveis de hormônios que provocam
instabilidade no organismo.
(C) O estresse libera hormônios que detonam o
coração e aumentam o risco de infarto.
(D) Homens que passam por altos níveis
de estresse podem dobrar os riscos de
desenvolverem diabetes tipo 2.
(E) Em pessoas que têm histórico de doenças
do coração, o aumento nos níveis do cortisol
eleva o risco de morte.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q46',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2020,
  1,
  46,
  'Em pessoas que têm histórico de doenças
do coração, o aumento nos níveis do cortisol
eleva o risco de morte.

Questão 46
Sobre o texto de José Paulo Paes, pode-se afirmar
que

(A) o sentido global do poema é a importância do
salário.
(B) o poema traz como ideia central a oposição
entre salário e trabalho.
(C) o poema faz uma crítica aos assalariados.
(D) o pão de cada dia é fruto do trabalho do
homem análogo ao de escravo.
(E) o poema é uma apologia ao trabalho escravo.
1º de maio
ETIMOLOGIA
No suor do rosto
o gosto
do nosso pão diário
sal: salário',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q47',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2020,
  1,
  47,
  'o poema é uma apologia ao trabalho escravo.
1º de maio
ETIMOLOGIA
No suor do rosto
o gosto
do nosso pão diário
sal: salário
PAES, José Paulo. Um por todos: poesia
reunida, 1968.
Maior tragédia do trabalho brasileira, o rompimento
da represa da Vale em Brumadinho coloca em
xeque o posicionamento do novo governo federal
sobre questões socioambientais.
Fonte: Planeta, 546, fev. /mar.2019.
O efeito de sentido da ilustração da capa da revista
Planeta se dá pela junção de informações visuais
e recursos linguísticos.
No contexto da ilustração, o termo em destaque
recorre a

(A) ironia, pois consiste no emprego de uma
palavra ou expressão de forma que ela tenha
um sentido diferente do habitual.
(B) polissemia, ou seja, os múltiplos sentidos do
termo “vale”.
(C) comparação, pois consiste na ideia de
relacionar dois termos diferentes numa mesma
oração: “Vale e a vida”.
(D) personificação, a qual consiste em atribuir
a objetos inanimados ou seres irracionais
sentimentos ou ações próprias dos seres
humanos.
(E) hipérbole, pois caracteriza-se pelo exagero
de uma ideia com o objetivo de expressar
intensidade, como, por exemplo, o sangue
jorrando.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q48',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2020,
  1,
  48,
  'hipérbole, pois caracteriza-se pelo exagero
de uma ideia com o objetivo de expressar
intensidade, como, por exemplo, o sangue
jorrando.
Questão 47

Questão 48 Questão 49
O esquema acima representa os vários
componentes do desenvolvimento sustentável. As
palavras que melhor substituem os termos Viável
e Equitativo, sem que haja alteração de sentido,
são, respectivamente:

(A) Provável e Digno.
(B) Possível e Igualitário.
(C) Previsível e Isento.
(D) Favorável e Justo.
(E) Praticável e Distributivo.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q49',
  'linguagens',
  'Literatura',
  'Literatura',
  2020,
  1,
  49,
  'Praticável e Distributivo.
Estão querendo nos matar pela boca. Comer tudo
o que se quer e o de que se gosta, os médicos
garantem, equivale a morrer cedo, contrair
doenças, suicidar-se a cada garfada. Controlar a
comida, fazer dieta, garantem agora os psicólogos,
equivale a perda de desejo sexual, infelicidade,
sentimento de culpa.
Os psicólogos que tentam nos abater com mais
essa bordoada comportamental foram contratados
para realizar a pesquisa pelo Conselho Britânico
de Manteiga, que reúne os fabricantes do país.
Ninguém duvida de que o resultado só poderia ser
desfavorável às dietas, cujo primeiro e invariável
item é a abolição da manteiga. Mas pesquisa é
assim mesmo, vamos a ela.
Mais da metade das 533 pessoas pesquisadas,
homens e mulheres entre 18 e 65 anos, revelou
sentimento de culpa ocasional durante as refeições.
E poderia ser de outra forma? Comer sem culpa
tornou-se uma forma flagrante de alienação.
Pois você tem o direito de devorar uma feijoada
com suas carnes e ainda regá-las a cachaça e
cerveja, mas não tem mais o direito de ignorar as
camadas de gordura que se depositam nas veias,
a sobrecarga que impõe ao estômago, as toxinas
que se depositam no fígado. Você pode comer
carnes e peixes, mas não pode desconhecer o
lento extermínio das espécies animais. E pode
restringir-se a vegetais, mas não desconhecer os
efeitos dos agrotóxicos.
COLASANTI, Marina. Dieta, sexo e culpa. In ___Eu sei,
mas não devia. 2. ed. Rio de Janeiro: Rocco, 1999. p.
73-75.
Marina Colasanti, uma das maiores escritoras da
literatura brasileira, tem publicados mais de 40
títulos, entre eles literatura infantil e poesia, mas na
literatura adulta, reflete sobre os fatos cotidianos.
No trecho da crônica Dieta, Sexo e Culpa, o
objetivo do texto é

(A) apoiar a dieta saudável para evitar a morte
cedo.
(B) criticar quem come feijoada regada a cachaça
ou cerveja.
(C) mostrar o perigo de sobrecarregar o estômago
de camadas de gordura.
(D) apresentar um conflito dos psicólogos para
realizar a pesquisa do consumo da manteiga.
(E) descrever com o humor o conflito que as
pessoas estão passando para se alimentar.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q50',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2020,
  1,
  50,
  'descrever com o humor o conflito que as
pessoas estão passando para se alimentar.

Questão 50 Questão 51
Questão 52
Me chamem de velha
Sugeri a uma amiga que trocasse a palavra
“idosas” por “velhas” em um texto. E fui informada
de que era impossível, porque as pessoas sobre as
quais ela escrevia se recusavam a ser chamadas
de “velhas”: só aceitavam ser “idosas”. Pensei:
“roubaram a velhice”. As palavras escolhidas –
e mais ainda as que escapam – dizem muito,
como Freud já nos alertou há mais de um século.
Se testemunhamos uma epidemia de cirurgias
plásticas na tentativa da juventude para sempre
(até a morte), é óbvio esperar que a língua seja
atingida pela mesma ânsia. Acho que “idoso” é
uma palavra fotoshopada – ou talvez um lifting
completo na palavra “velho”. E saio aqui em defesa
do “velho” – a palavra e o ser /estar de um tempo
que, se tivermos sorte, chegará para todos.
Desde que a juventude virou não mais uma fase
da vida, mas uma vida inteira, temos convivido
com essas tentativas de tungar a velhice tam-
bém no idioma. Vale tudo. Asilo virou casa de
repouso, como se isso mudasse o significado
do que é estar apartado do mundo. Velhice virou
terceira idade e, a pior de todas, “melhor idade”.
Tenho anunciado a amigos e familiares que, se
alguém me disser, em um futuro não tão distan-
te, que estou na “melhor idade”, vou romper meu
pacto pessoal de não violência. O mesmo vale
para o primeiro que ousar falar comigo no dimi-
nutivo, como se eu tivesse voltado a ser criança.
Insuportável.
BRUM, Eliane. A menina quebrada. Porto Alegre:
Arquipélago Editorial, 2013.
Diante das ideias contidas no texto, podemos
afirmar que, para a autora,

(A) “melhor idade” diz bem o que é a velhice.
(B) as palavras refletem os modos de pensar.
(C) as palavras também envelhecem.
(D) idoso e velho são sinônimos.
(E) os velhos voltam a ser crianças.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q51',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2020,
  1,
  51,
  'os velhos voltam a ser crianças.
A partir da leitura do infográfico, percebe-se que a
situação da população abaixo da linha da pobreza

(A) ficou pior em 2014.
(B) melhorou em 2017.
(C) regrediu em 2011.
(D) aumentou em 2017.
(E) acelerou em 2013.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q52',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2020,
  1,
  52,
  'acelerou em 2013.
Nunca imaginara o acontecimento daquilo, que se
inventava de repente – iô Liodoro, ele, tão verdadeiro
e gratamente enleado no real. E ela. Suspirou, por
querer. Admirava-o. Numa criatura humana, quase
sempre há tão pouca coisa. Tanto se desperdiçam,
incompletos, bulhentos, na vãidade de viver.
ROSA, Guimarães. Buriti. In: Noites do Sertão (Corpo
de Baile). Rio de Janeiro: Nova Fronteira, 1988.
Guimarães Rosa, ao explorar as virtualidades
lexicais da língua portuguesa, revitalizando, assim,
a linguagem, utiliza vários e conhecidos recursos
linguísticos.
Considerando o processo de formação do
neologismo “vãidade”, no texto, é correto afirmar
que se trata de

(A) nasalização da vogal a, em oposição de
sentido à palavra vaidade.
(B) composição por justaposição de um adjetivo
mais substantivo.
(C) composição por aglutinação de um adjetivo
mais substantivo.
(D) composição por justaposição de substantivo
mais substantivo.
(E) composição por aglutinação de substantivo
mais adjetivo.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q53',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2020,
  1,
  53,
  'composição por aglutinação de substantivo
mais adjetivo.

Questão 53
PALAVRAS
As palavras se completam,
Se misturam, se separam, se embolam.
Muitas não se decifram
Nem se aprende na escola.
Umas eu nunca esqueci
Que aprendi na hora da cola.
De amigo, surgiu amizade.
De feliz, felicidade.
De onde surgiu família,
Carinho, compreensão?
Muitas surgiram do amor
Que se tem no coração.
De onde surgiu saudade,
Palavra bem brasileira,
Que não tem tradução
Em outras línguas estrangeiras?
Do amor que a gente sente
Pelos entes mais queridos,
Familiares e amigos.
Das pessoas que admiro,
Que a distância separou.
Mas nunca são esquecidos.
Uns que ainda encontramos
Outros que pra nunca mais.
Despedem-se desta vida
Sem mesmo olhar pra trás
Estão muito bem guardados
Não esquecemos jamais.
MACEDO, Naide. Disponível em: <https://pagina20.
net/ palavras-2/>. Acesso em: 11 dez. 2018.
As funções da linguagem são formas de utilização
da comunicação que atuam segundo a intenção do
falante. Assinale a alternativa que indica o tipo de
linguagem predominante no texto ao lado.

(A) A linguagem emotiva predomina no texto, pois
o interlocutor expressa, de maneira nostálgica,
os seus próprios sentimentos.
(B) A linguagem é apelativa, pois está centrada
no emissor, que revela seus sentimentos,
tentando influenciar o leitor.
(C) A função da linguagem predominante é
metalinguística, pois explica o próprio código
da língua portuguesa.
(D) No texto acima, predomina a função poética,
revelando cuidado com o ritmo das frases, a
sonoridade e o jogo das ideias.
(E) Predomínio da função apelativa da linguagem,
pois revela seus sentimentos em forma de
apelo emotivo.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q54',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2020,
  1,
  54,
  'Predomínio da função apelativa da linguagem,
pois revela seus sentimentos em forma de
apelo emotivo.

Questão 54
Isidoro da flauta é, por acaso, preto. Fino; música é com ele; Isidoro flauteia a vida inteira; seu canto menor
aplaca por instantes ódio, inveja, libidinagem, alguns trovões. Que idade tem Isidoro? É intemporal, como
tantos da sua resistente raça. Não pacifista, antes pacífico.
MENDES, Murilo. A idade do serrote. São Paulo: Companhia das Letras, 2018
Murilo Mendes, em seu livro de memórias, apresenta um acervo afetivo de pessoas. Nesse fragmento, o
autor mineiro dá a conhecer Isidoro da flauta. Sobre Isidoro, pode-se concluir que

(A) não se reconhece preto.
(B) apresenta traços beligerantes.
(C) tornou-se músico profissional.
(D) ama a paz, sem partidarismo.
(E) é adepto do pacifismo.

Leia a tirinha a seguir.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q55',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2020,
  1,
  55,
  'é adepto do pacifismo.

Leia a tirinha a seguir.
O verbo ‘pretended’ na tirinha acima significa:

(A) fingi
(B) fingia
(C) pretendi
(D) pretendia
(E) pretendeu
ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q56',
  'linguagens',
  'Artes',
  'Artes',
  2020,
  1,
  56,
  'pretendeu
ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
Questão 56
A música Rocket Man, recitada por William Shatner em StarTrek, foi escrita em parceria por Taupin (letra)
e Elthon John (arranjos) e está presente no filme biográfico de Elthon John. Leia os versos dessa canção
a seguir.
And I think it''s gonna be a long, long, time
''Til touchdown brings me ''round again to find
I''m not the man they think I am at home
Ah, no no no...
I''m a rocket man
Rocket man
Burnin'' out his fuse up here alone
A estrofe acima apresenta o sentimento de um astronauta

(A) por ter perdido um amor no passado.
(B) sentindo-se confuso sobre seu papel no mundo.
(C) desejando seu retorno ao lar e mudar de profissão.
(D) convicto de seu sucesso na carreira em prol da humanidade.
(E) sentindo a profunda solidão que atravessará em suas missões espaciais.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q57',
  'linguagens',
  'Artes',
  'Artes',
  2020,
  1,
  57,
  'sentindo a profunda solidão que atravessará em suas missões espaciais.

Samsung developing technology to create fake videos from one single photo.
With new technology like this in development, seeing will no longer mean believing.
news.com.au MAY 28, 2019
Researchers at Samsung’s Artificial Intelligence (AI) Centre in Moscow have created an algorithm that can
generate videos using only one image.
The development has caused some worry among technology experts and commentators, 1who see it as a
worrying step towards making fake content creation easier.
In a paper published in the preprint journal ArXiv, and in an accompanying video demo, the algorithm creates
a video using a single still image, such as the Mona Lisa painting or a photo of Salvador Dali.
The video can be created using one single image but the more images are used, the better the quality.
A sample of 32 images produces a video of near lifelike accuracy.
Current AI systems usually require the algorithm to scan large sets of data of a body and face before it can
produce a moving picture based on it.
With this new technology, however, creating fake videos will become a lot easier.
The Samsung algorithm was trained using the publicly available VoxCeleb database which has more than
7000 images of celebrities from YouTube videos.
Since the algorithm recognises common characteristics of a person’s face and body, as opposed to specific
traits of a subject, it’s able to quickly extrapolate images with little input.
This method also means that the technology is applicable toward non-celebrities and can be used on anyone,
even people 2who died a long time ago and were never captured on video.
The AI is currently only able to produce “talking head” style videos from the shoulders up.
Skeptics of deepfake technology, as it is referred to, worry it will be used to spread misinformation and fake
news or to steal people’s identity.
Sobre o texto acima, pode-se afirmar que:

(A) pesquisadores de Inteligência Artificial da Samsung em Moscou criaram um algoritmo capaz de escanear
somente partes do rosto de celebridades antes de produzir um vídeo, facilitando assim a produção de
notícias falsas.
(B) a Samsung criou um algoritmo que pode criar vídeos de vários rostos de celebridades da base de dados
da VoxCeleb de YouTube vídeos, facilitando assim a produção de notícias falsas de celebridades.
(C) pesquisadores de Inteligência artificial da Samsung em Moscou criaram um algoritmo capaz de gerar
vídeos apenas do rosto de pessoas que já faleceram, causando preocupação, pois essa descoberta
facilitará a criação de conteúdos falsos e o roubo da identidade dessas pessoas.
(D) a Samsung lançou um algoritmo que possibilitará o reconhecimento de rostos de celebridades. Para
isso será necessário cerca de 32 imagens da mesma celebridade para que o vídeo possa ser produzido
com eficiência.
(E) pesquisadores de Inteligência Artificial da Samsung em Moscou criaram um algoritmo capaz de gerar
vídeos com apenas uma imagem, entretanto essa descoberta está causando preocupação, pois a
mesma facilitará a criação e a divulgação de conteúdos falsos e o roubo da identidade de pessoas.
Texto para as questões 57 e 58.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q58',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2020,
  1,
  58,
  'pesquisadores de Inteligência Artificial da Samsung em Moscou criaram um algoritmo capaz de gerar
vídeos com apenas uma imagem, entretanto essa descoberta está causando preocupação, pois a
mesma facilitará a criação e a divulgação de conteúdos falsos e o roubo da identidade de pessoas.
Texto para as questões 57 e 58.
Questão 57

Questão 58 Questão 60
Questão 59
O pronome relativo ‘who’, em negrito no texto,
refere-se, respectivamente, a:

(A) 1. especialistas em tecnologia e comentaristas;
2. povos
(B) 1. especialistas em tecnologia e comentaristas;
2. pessoas
(C) 1. analistas em tecnologia e especialistas; 2.
pessoas comuns
(D) 1. analistas em tecnologia e comentaristas;
2. pessoas comuns
(E) 1. comentaristas em tecnologia e especialistas;
2. pessoas comuns',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2020-1_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2020,
  1,
  60,
  '1. comentaristas em tecnologia e especialistas;
2. pessoas comuns
Walt Whitman foi um poeta, ensaísta e jornalista
norte-americano, considerado por muitos como o
“pai do verso livre” e o grande poeta da Revolução
americana.
Leia a seguir alguns versos de CARPE DIEM de
Walt Whitman e marque a opção correta.
Do not let the day end without having grown a
bit, without being happy, without having risen
your dreams.
Do not let overcome by disappointment.
Do not let anyone you remove the right to
express yourself, which is almost a duty.
Do not forsake the yearning to make your life
something special.
…Learn from those who can teach you.
Do not let life pass you live without that.
O poema acima apresenta

(A) uma mensagem sobre como viver as
experiências da vida.
(B) uma mensagem sugerindo que as frustrações
da vida podem ser evitadas.
(C) uma mensagem que devemos viver as
experiências de hoje e evitar pensar no
amanhã.
(D) uma mensagem que devemos viver o hoje e
aprender com os mais experientes.
(E) uma mensagem que devemos viver o hoje e
contar com a ajuda dos mais experientes.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q41',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2021,
  1,
  41,
  'Texto
Maniçoba, 19 de junho de 1911. Minha mãe: Aqui
cheguei em paz e livramento, graças a Nosso
Senhor Jesus Cristo. Isto aqui é bom como o
diabo; acorda-se às cinco da manhã, leva-se o dia
lendo, fumando, comendo e rezando; dorme-se às
nove horas da noite. Uma vida de anjo. Quando
chegar aí – está compreendendo? – hei de ter o
corpo pesando 70 quilos e a alma leve de pecados,
tão leve como vagons que levam material para a
construção da estrada de ferro de Palmeira.
Graciliano Ramos
DISCINI. Comunicação nos Textos. São
Paulo: Contexto, 2005, p.180.
Analise as seguintes afirmações:
I – O emprego do itálico, na primeira linha, sugere
que a expressão “paz e livramento” é um
neologismo.
II – Na expressão “Isto aqui é bom como o diabo”,
encontra-se uma comparação paradoxal.
III – No trecho “Em uma vida de anjo”, identifica-se
uma ironia.
IV – Em “e a alma leve de pecados, tão leve como
vagons...” encontra-se uma metonímia.
É correto apenas o que se afirma em

(A) I e II.
(B) II e III.
(C) I, II e III.
(D) II e IV.
(E) III e IV.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q42',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2021,
  1,
  42,
  'III e IV.
Ponciá Vicêncio achava que os homens falavam
pouco. O pai e o irmão tinham sido exemplos
do estado de quase mudez dos homens no
espaço doméstico. Agora, aquele, o dela, ali
calado, confirmava tudo. Ele também só falava
o necessário. Só que o necessário dele era bem
pouco, bem menos do que a precisão dela. Quantas
vezes quis ouvir, por exemplo, se o dia dele tinha
sido difícil, se o pequeno machucado que ele
trazia na testa tinha sido causado por algum
tijolo, ou mesmo saber quando começaria a nova
obra. Muitas vezes quis dizer das tonturas e do
desejo de comer estrelas de que era acometida
todas as vezes que ficava grávida. Quis saber se
ele também sofria do mal do medo, se ele vivia
também agonias. Quis que o homem lhe falasse
dos sonhos, dos planos, das esperanças que ele
depositava na vida. Mas ele era quase mudo.
EVARISTO. Ponciá Vicêncio. Rio de
Janeiro: Pallas, 2017.
Assinale a alternativa em que todas as palavras
apontam para o mesmo referente no texto.

(A) Pai, irmão, tudo, lhe
(B) Aquele, ali, tudo, ele.
(C) Aquele, tudo, dele, lhe, que.
(D) Pai, irmão, aquele, tudo, dele.
(E) Aquele, o (terceiro período), ele.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q43',
  'linguagens',
  'Literatura',
  'Literatura',
  2021,
  1,
  43,
  'Aquele, o (terceiro período), ele.

Questão 43 Questão 44
Sinceramente, não tenho palavras para definir
este momento do futebol brasileiro. Ou, por outra,
tenho, sim. Vou buscá-las noutro campo. Um
velho amigo, ilustre psicanalista, certa vez fez
um concurso entre os pacientes de um asilo de
loucos, no subúrbio do Rio. A prova era simples:
ganharia um presente de fim de ano aquele que
desse, numa frase, a melhor definição de vida. A
pergunta era singela: “Como você define a vida?”
Venceu o concurso a frase lapidar: “A vida não é
senão aquela cuja nós vivemos o qual...”
NOGUEIRA. A. In: Platão e Fiorin. Lições
de texto: leitura e redação. São Paulo:
Ática, 1996.
Nesse texto, de forma bem humorada, o cronista

(A) muda de assunto ao reconhecer que não tem
palavras para definir o momento do futebol
brasileiro.
(B) redefine o conteúdo do primeiro enunciado e
define, implicitamente, o momento do futebol
brasileiro.
(C) compara o momento do futebol brasileiro a
uma situação crítica dos asilos de loucos.
(D) conta um caso inteiramente adverso à questão
posta a ele, gerando assim uma desconexão
textual.
(E) desconstrói a relação entre vida e futebol, por
meio da frase final sem nenhuma lógica.
Texto I',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q44',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2021,
  1,
  44,
  'desconstrói a relação entre vida e futebol, por
meio da frase final sem nenhuma lógica.
Texto I
Passei o dia a mexer-me do vagão para o restaurante,
bebi alguns cálices de conhaque, os últimos que
me permitiram durante longos meses. À noitinha
percebi construções negras num terreno alagado.
Que seria aquilo?
— Mocambos, informou Tavares.
Bem, os célebres mocambos que José Lins havia
descrito em Moleque Ricardo. Conheceria José
Lins aquela vida? Provavelmente não conhecia.
Acusavam-no de ser apenas um memorialista, de
não possuir imaginação, e o romance mostrava
exatamente o contrário. Que entendia ele de
meninos nascidos e criados na lama e na miséria,
ele filho de proprietários? Contudo a narração tinha
verossimilhança. Eu seria incapaz de semelhante
proeza: só me abalanço a expor a coisa observada
e sentida. Tornaria esse amigo a compor outra
história assim, desigual, desleixada, mas onde
existem passagens admiráveis, duas pelo menos
a atingir o ponto culminante da literatura brasileira?
RAMOS. Memórias do Cárcere. Rio de
Janeiro: Record, 2020.
Texto II
Enquanto certos escritores se tornam grandes
engolfando na subjetividade, José Lins do Rego
se realizou integralmente à medida que dela se
libertou, destacando uma visão objetiva do mundo
dentre as penumbras do tateio autobiográfico. Por
isso, seria o caso de arriscar um paradoxo e dizer
que apenas aparentemente a memória constitui o
elemento fundamental na sua arte, pois ele cresceu
à medida que foi se libertando dela.
CANDIDO. O Observador Literário. Rio de
Janeiro: Ouro sobre Azul, 2004.
Nesses textos sobre José Lins do Rego, tanto
Graciliano Ramos como Antonio Candido admitem
que

(A) a imersão na subjetividade engrandece alguns
escritores.
(B) a narração verossímil da vida nos mocambos
é uma proeza de José Lins.
(C) o Moleque Ricardo é um admirável romance
da literatura brasileira.
(D) o memorialista, por meio da imaginação
criadora, deu lugar ao ficcionista.
(E) a visão de mundo do escritor se restringia à
vivência de um menino bem nascido.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q45',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2021,
  1,
  45,
  'a visão de mundo do escritor se restringia à
vivência de um menino bem nascido.

Questão 45
O REAL RESISTE
Autoritarismo não existe
Sectarismo não existe
Xenofobia não existe
Fanatismo não existe
Bruxa fantasma bicho papão
O real resiste
É só pesadelo, depois passa
Na fumaça de um rojão
É só ilusão, não, não
Deve ser ilusão, não não
É só ilusão, não, não
Só pode ser ilusão
Miliciano não existe
Torturador não existe
Fundamentalista não existe
Terraplanista não existe
Monstro vampiro assombração
O real resiste
É só pesadelo, depois passa
Múmia zumbi medo depressão
Não, não, não, não
Não, não, não, não
Não, não, não, não
Trabalho escravo não existe
Desmatamento não existe
Homofobia não existe
Extermínio não existe
Mula sem cabeça demônio dragão
O real resiste
É só pesadelo, depois passa
Como o estrondo de um trovão
É só ilusão, não, não
Deve ser ilusão, não não
É só ilusão, não, não
Só pode ser ilusão
Esquadrão da morte não existe
Ku Klux Klan não existe
Neonazismo não existe
O inferno não existe
Tirania eleita pela multidão
O real resiste
É só pesadelo, depois passa
Lobisomem horror opressão
Não, não, não, não
Não, não, não, não
Não, não, não, não
Arnaldo Antunes
Disponível em https://www.letras.mus.br
Sobre a canção “O Real Resiste”, que dá título
ao novo álbum do compositor e cantor Arnaldo
Antunes, pode-se afirmar que

(A) a canção nega a existência do real.
(B) na canção, o real representa exatamente a
realidade.
(C) nessa canção, a existência do real é concebida
como modo de resistência a um mundo de
dissolvência, de dissolução.
(D) a canção faz uma apologia à atual situação
do mundo e do Brasil, em particular.
(E) a canção endossa o absurdo, a normalização
das barbaridades.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q46',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  46,
  'a canção endossa o absurdo, a normalização
das barbaridades.

Questão 46
Ministério da Saúde, 2020 (adaptado)
Na campanha publicitária em questão, o emprego do termo “espalhar” está

(A) explorando a polissemia do verbo para criar uma relação com diferentes significados.
(B) destacando o aumento dos casos de covid-19 e a necessidade de combater a doença.
(C) ligado à forma como o aplicativo evita a transmissão pela sua instalação nos celulares.
(D) impreciso, pois existe um desvio em seu uso nessa situação comunicativa particular.
(E) contradizendo a mensagem das frases em destaque, o que invalida a mensagem.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q47',
  'linguagens',
  'Literatura',
  'Literatura',
  2021,
  1,
  47,
  'contradizendo a mensagem das frases em destaque, o que invalida a mensagem.

Questão 47
Machado de Assis
01 de junho de 1888
BONS DIAS!
Agora fale o senhor, que eu não tenho nada mais que lhe dizer. Já o saudei, graças à boa criação que Deus
me deu, porque isto de criação se a natureza não ajuda, é escusado trabalho humano. Eu, em menino, fui
sempre um primor de educação. […]
[…]
[…]
[…]
Podia citar casos honrosíssimos, como prova de boa criação. Um, deles nunca me há de esquecer, e é fresquinho.
Estando há dias a almoçar com alguns amigos, percebi que alguma coisa os amargurava. Não gosto de
caras tristes, como não gosto delas alegres; — um meio-termo entre o Caju e o Recreio Dramático e o que
vai comigo. Senão quando, com um modo delicado, perguntei o que é que tinham. Calaram-se, eu, como
manda a boa criação, calei-me também e falei de outra coisa. Foi o mesmo que se os convidasse a pôr tudo
em pratos limpos. Tratando-se de meu almoço, era condição primordial.
Um dos convivas confessou que no meio das festas abolicionistas não aparecia o seu nome, outro que era
G dele que não aparecia outro que era o dele, e todos que os deles. Aqui é que eu quisera ser um homem
malcriado. O menos que diria a todos, é que eles tanto trabalharam para a abolição dos escravos, como para
a destruição de Nínive, ou para a morte de Sócrates. Eu, com uma sabedoria só comparável à deste filósofo,
respondi que a história era um livro aberto, e a justiça a perpétua vigilante. Um dos convivas, dado a frases,
gostou da última, pediu outra e um cálice de Alicante. Respondi, servindo o vinho, que as reparações póstumas
eram mais certas que a vida, e mais indestrutíveis que a morte. Da primeira vez fui vulgar, da segunda creio
que obscuro; de ambas sublime e bem criado.
[…]
Podia citar outros muitos casos de boa criação, realmente exemplares. Nunca dei piparotes nas pessoas que
não conheço, não limpo a mão à parede, não vou bugiar, que é ofício feio, e ando sempre com tal cautela,
que não piso os calos aos vizinhos. Tiro o chapéu, como fiz agora ao leitor; e dei-lhe os bons dias do costume.
Creio que não se pode exigir mais. Agora, o leitor que diga alguma cousa, se está para isso, ou não diga
nada, e boas noites.
Disponível em: http://www.cronicas.uerj.br/home/cronicas/machado/rio_de_janeiro/ano1888/01jun88.htm
Sobre o trecho “Estando há dias a almoçar com alguns amigos, percebi que alguma coisa os amargurava.”,
analise as alternativas a seguir.
I - Poderíamos trocar “há” por “fazem” sem alteração de sentido.
II - “Com alguns amigos” exerce a função de objeto indireto.
III - No período, temos uma oração subordinada substantiva objetiva direta.
IV - O vocábulo “que” é conjunção integrante.
V - O vocábulo “que” é pronome relativo.
É correto apenas o que afirma em

(A) I, II e III.
(B) II, III e IV.
(C) II e III.
(D) III e IV.
(E) III e V.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q48',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  48,
  'III e V.

Questão 48
Questão 49
Questão 50
Sobre o uso da crase no trecho “Eu, com uma
sabedoria só comparável à deste filósofo, respondi
que a história era um livro aberto, e a justiça a
perpétua vigilante.”, podemos afirmar que

(A) não se justifica, uma vez que antecede uma
palavra masculina.
(B) está correto por anteceder um pronome
demonstrativo.
(C) a ocorrência da crase segue a mesma regra
de “Era uma pintura à Leonardo da Vinci”.
(D) é facultativa, pois precede um pronome
demonstrativo.
(E) não se justifica, pois antecede um pronome
demonstrativo.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q49',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2021,
  1,
  49,
  'não se justifica, pois antecede um pronome
demonstrativo.
A sensação de estar caindo constantemente
em ratoeiras virtuais é grande após assistir ao
documentário da Netflix “O Dilema das Redes”. Sua
história gira em torno de diversos profissionais da
área da tecnologia da informação que, nos últimos
quinze anos, ajudaram na construção do que hoje é
o Facebook, Twitter, Instagram, Google, Pinterest e
Oracle. Com a direção de Jeff Orlowski, a estrutura
tradicional é corrompida quando a narrativa passa
ao espectador informações na forma de animação
e de ficção, com uma história que ilustra os pontos
de vista dos entrevistados. [...]
KLIMIUC. O Dilema das Redes (Netflix, 2020): mea culpa e medo
da verdade. Cinema com Rapadura.
Disponível em: <https://cinemacomrapadura.com.br/>. Acesso em:
28 nov. 2020.
As redes sociais causam impactos reais nas
interações humanas da contemporaneidade. Dessa
forma, a construção no texto da metáfora “ratoeiras
virtuais” está alicerçada em um

(A) paradoxo em si, já que um objeto físico não
conseguiria ser materializado na rede.
(B) pensamento falacioso, pois os entrevistados
desconhecem o tema a fundo.
(C) raciocínio hiperbólico porque o documentário
suaviza o impacto das redes no real.
(D) tênue equilíbrio entre estímulo e recompensa
que induz o usuário ao risco.
(E) comparativo literal, que aborda como as redes
ajudam na propagação de pestes.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q50',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2021,
  1,
  50,
  'comparativo literal, que aborda como as redes
ajudam na propagação de pestes.
A função elementar dos gêneros comunicativos na
vida social é de organizar, rotinizar e condicionar (em
maior ou menor grau) as soluções para problemas
comunicativos recorrentes. Os problemas
comunicativos para os quais tais soluções são
estabelecidas socialmente e depositadas no
estoque social do conhecimento tendem a ser
aquelas que afetam os aspectos comunicativos
das interações sociais que são importantes para
a manutenção de uma dada ordem social... Dessa
forma sociedades diferentes não têm o mesmo
repertório de gêneros comunicativos, bem como
os gêneros comunicativos de uma época podem
se dissolver em processos comunicativos mais
“espontâneos”, enquanto outros gêneros até então
pouco definidos podem se congelar em novos
gêneros.
LUCKMANN, Thomas. In. Gêneros
Textuais, Tipificação e Interação. Charles
Bazerman: DIONÍSIO Ângela Paiva;
HOFFNAGEL, Judith Chambliss et al. São
Paulo: Cortez, 2005.p. 56.
Após a leitura do texto, é possível afirmar que os
gêneros comunicativos na vida social
I- atribuem uma rotina para fazer com que algo
aconteça ou se desenvolva sempre da mesma
forma.
II- são tipos estáveis de enunciados, isto é,
apresentam uma forma de composição (estrutura).
III- apresentam-se com os mesmos repertórios
em sociedades diferentes.
IV- podem se congelar, também, em novos gêneros.
É correto apenas o que se afirma em

(A) I e II.
(B) I, II e III.
(C) II e III.
(D) II e IV.
(E) III e IV.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q51',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  51,
  'III e IV.

Questão 51 Questão 52
Mais de vinte milhões de pessoas infectadas e
sistemas de saúde em alerta no mundo todo.
Arrisco-me a dizer que nunca tínhamos enfrentado
um vírus com uma capacidade de transmissão tão
alta. E este é o grande trunfo do novo coronavírus,
que apesar de não ter uma letalidade considerada
elevada na população geral, tem a capacidade
de provocar estragos sistêmicos – na saúde, na
economia e nas relações interpessoais.
Disponível em: https://politica.estadao.
com.br/blogs/fausto-macedo/covid-19-
uma-reflexao-do-que-vivemos-atualmente/
(destaques nossos). Acesso em:
19/11/2020.
Com base nesse trecho, indique a alternativa
correta.

(A) O verbo "ter", que aparece em destaque duas
vezes no trecho, traz a compreensão de um
fato absolutamente certo de ter ocorrido, em
ambos os casos.
(B) As palavras "nunca" e "tão" são classificadas,
sintaticamente, como adjuntos adverbiais.
(C) As palavras "coronavírus", "letalidade" e
"interpessoais" foram formadas pelo mesmo
processo de composição.
(D) O grande trunfo do novo coronavírus é não
ter uma letalidade tão alta.
(E) O uso da ênclise em “Arrisco-me” é devido à
atração da preposição “a”.
MENINA DO MANGUE',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q52',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  52,
  'O uso da ênclise em “Arrisco-me” é devido à
atração da preposição “a”.
MENINA DO MANGUE
Corre menina, na areia da praia,
Descalça, risonha, saltando corais;
Com vento varrendo a tez bem corada,
As madeixas exalam fragrâncias florais.
Ao longe a jangada exausta chegando,
Depois do embate em cruéis temporais.
Alheia a menina aperta o seu passo,
Na tarde vazia rumo ao porto sem cais.
O mundo não espia o andar da menina,
Sequer se apieda dessa filha sem pais,
Que anda faceira, seguindo sua sina,
De cuja morada são frios manguezais.
Menina do mangue, sedenta de vida,
De brilho nos olhos, de alguns ideais;
Que a terra jamais lhe negue guarida;
Não hei de algum dia ouvir os seus ais!
MENESES, E. Primavera. Mogi Guaçu-
SP: Editora Becalete, 2020
Nesse poema, o último verso indica que o poeta

(A) não está preocupado com o sofrimento da
menina.
(B) não acredita que a menina terá sucesso na
vida.
(C) está muito interessado em ajudar a criança.
(D) não deseja que ela tenha uma vida sofrida.
(E) teme pelos poucos ideais da menina.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q53',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2021,
  1,
  53,
  'teme pelos poucos ideais da menina.

Questão 53 Questão 54
O emprego das formas verbais na charge denota

(A) hipótese passível de realização.
(B) fato e definido no tempo.
(C) condição de realização de um fato.
(D) finalidade das ações apontadas no segmento.
(E) temporalidade que situa as ações no passado.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q54',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  54,
  'temporalidade que situa as ações no passado.
A ideia de oposição ou contraste tanto pode ser
expressa por uma coordenada adversativa quanto
por uma subordinada concessiva. Mas a opção pela
subordinada concessiva fará com que a oração de
que ela dependa ganhe maior realce.
GARCIA. Comunicação em prosa
moderna. Rio de Janeiro: FGV Editora,
2010. (Adaptado)
Nas adversativas, prevalece a orientação
argumentativa do segmento introduzido pela
conjunção.
PLATÃO e FIORIN. Lições de texto:
leitura e redação. São Paulo: Ática, 1996.
(Adaptado)
Com base nas informações, o período “Tinha
um coração humano, sem dúvida, mas adquirira
hábitos de animal”, pode ser escrito, sem alteração
de sentido e de ênfase das ideias, da seguinte
forma:

(A) Apesar de adquirir hábitos de animal, tinha
um coração humano, sem dúvida.
(B) Tinha um coração humano, sem dúvida,
embora adquirisse hábitos de animal.
(C) Embora tivesse, sem dúvida, um coração
humano, adquirira hábitos de animal.
(D) Adquirira hábitos de animal, todavia tinha,
sem dúvida, um coração humano.
(E) Mesmo adquirindo hábitos de animal, tinha
um coração humano, sem dúvida.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q55',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  55,
  'Mesmo adquirindo hábitos de animal, tinha
um coração humano, sem dúvida.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
Questão 56
As questões 55 e 56 são baseadas em uma música de Jhené Efuru Chilombo.
Jhené Aiko EfuruChilombo (Los Angeles, Califórnia, 16 de março de 1988), conhecida artisticamente
como Jhené Aiko ou Jhené, é uma cantora e compositora americana. Embarcou no mundo musical ao
colaborar em vários videoclipes do grupo de R&B B2K. Sua beleza e vitalidade chama a atenção de todos
para o mundo vegetariano.
And I feel like sometimes I cry
''Cause I feel so good to be alive
And there''s not a doubt inside my mind
That you''re still here, right here by my side, yeah
Com base nesses versos do seu hit para o verão “Summer 2020”, é correto afirmar que

(A) apesar de ser verão, ela gosta de chorar.
(B) ela, às vezes, sente vontade chorar por ser verão.
(C) ela, às vezes, se emociona pela beleza de estar no verão.
(D) embora, algumas vezes, sinta-se triste, ama estar viva e lembrar de seu amor ao seu lado.
(E) embora se sinta triste, ama a vida, mas quer esquecer quem não está mais ao seu lado.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2021,
  1,
  56,
  'embora se sinta triste, ama a vida, mas quer esquecer quem não está mais ao seu lado.
I can''t wrap my head around what''s happening
I can''t get no sleep, no peace of mind ...
Marque a opção que melhor expressa o uso de "can´t" dos versos acima:

(A) predição
(B) impossibilidade
(C) ausência de planos
(D) ausência de intenção
(E) ausência de obrigação',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q57',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2021,
  1,
  57,
  'ausência de obrigação

Questão 57
NETTIQUETTE
Emails are an inevitable part of the modern business world, and they are part of your business image. But
can we improve the way we communicate by email?
• Remember that emails are not private! Only write what you wouldn’t mind other peple reading.
• Avoid replying to an email when you are angry. Sending and angry reply is called ‘flaming’.
• Don’t expect an instant reply. Emails are not phone calls.
• Don’t forward someone’s message without permission. It may be confidential.
• Be polite and warm – open and close your email with a greeting and closing salutation.
• Keep your message brief – it’s not a novel! Use only a few paragraphs.
• Read your message through for ‘tone and voice’ and content. Have you said all you need to say?
• Don’t include the whole previous email. Only quote the relevant part of the original message. Put the
symbols <> around the quote.
• Limit your use of abbreviations and emoticons – not everyone understands them!
EMOTICONS
É correto afirmar que o texto

(A) trata de uma sequência de regras que devem ser observadas por profissionais da área de marketing
pessoal.
(B) descreve o processo de planejamento e uso de símbolos em emails para melhorar a comunicação oral
e a imagem pessoal.
(C) apresenta dicas de etiquetas para melhorar a comunicação por emails, contribuindo assim para uma
boa imagem profissional.
(D) apresenta o passo a passo para a elaboração de um bom email e as regras de para a formação de um
profissional de marketing.
(E) descreve a importância do conhecimento dos ‘emoticons’ para a interpretação das mensagens de
trabalho.
: - )
smile/happy
: - (
sad
: - I
disappointed
: - 0
surprised
:’ (
crying
: - #
don’ttellanyone
: - @
angry
: - $
embarrassed',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2021,
  1,
  58,
  'descreve a importância do conhecimento dos ‘emoticons’ para a interpretação das mensagens de
trabalho.
: - )
smile/happy
: - (
sad
: - I
disappointed
: - 0
surprised
:’ (
crying
: - #
don’ttellanyone
: - @
angry
: - $
embarrassed

Questão 58
A tradução correta para a sentença “We have met the enemy of the people and he is The New York
Times...” é:

(A) “Nós temos achado o inimigo do povo, e ele está no The New York Times....”
(B) “Nós acharemos o inimigo do povo, e ele é o The New York Times...”
(C) “Nós encontramos um inimigo das pessoas, e ele está no The New York Times...”
(D) “Nós temos descoberto um inimigo das pessoas, e ele está no The New York Times...”
(E) “Nós encontramos o inimigo do povo, e ele é o The New York Times...”',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2021,
  1,
  59,
  '“Nós encontramos o inimigo do povo, e ele é o The New York Times...”

A vaccine which can prevent nine out of 10 people getting Covid-19 is set to be put
forward for emergency approval.
Its developers, Pfizer and BioNTech, said it had been tested on 43,500 people, with no safety concerns raised.
What is the new vaccine and how effective is it?
The vaccine trains the immune system to fight coronavirus. It is a new type of vaccine called an RNA vaccine
and uses a tiny fragment of the virus'' genetic code. This starts making part of the virus inside the body, which
the immune system1 recognises as foreign and starts to attack. It is given in two doses - three weeks apart
- and early data suggests it protects more than 90% of people from developing Covid symptoms.
Who will get it first and how soon can I have it?
It depends how old you are, as age is the biggest risk factor2 for severe Covid-19. In the UK, older care home
residents3 and care home staff4 are top of the preliminary priority list. They are followed by health workers
such as hospital staff and the over 80s. People are then ranked by age, with people under 50 at the bottom
of the list. The first jabs may take place before Christmas if everything goes smoothly. The vaccine will be
delivered through care homes, GPs and pharmacists as well as "go-to" vaccination centres set up in venues
such as sports halls. However, there are logistical challenges5 to overcome - such as the need to keep the
vaccine at minus 80C during transportation from the manufacturing lab to vaccination venues. The jab must
be thawed before it is given to a patient and can be stored in a normal fridge for a few days before being
administered.
Will it offer lasting protection?
It is impossible to know and we will find the answer only by waiting. If immunity does not last then it may be
necessary to have a vaccine every year, in the same way as for flu. The data did not show whether protection
from Covid-19 was the same in all age groups. However, earlier studies did suggest young and old people
could produce an immune response. There will also be some people - such as those with a weak immune
system - who will not be able to have the vaccine.
Could the vaccine have long-term health effects?
Nothing in medicine is 100% safe - even something we take without thinking, like paracetamol, poses risks. The
data so far is reassuring - trials on 43,500 people discovered no safety concerns, although mild side effects
have been reported. If there were highly dangerous and common consequences of this vaccination, they
should have become apparent. However, rarer side effects may emerge as millions of people are immunised.
Adapted from: https://www.bbc.com/news/explainers-54880084.
As questões 59 e 60 são baseadas no seguinte texto:

A opção que melhor resume o conteúdo do texto é:

(A) Uma vacina, desenvolvida pela Pftzere testada em 43.500 pessoas, está prestes a ser aprovada em
caráter emergencial para combater a COVID-19. Essa vacina treina o sistema imunológico a combater
o coronavírus e precisa ser armazenada em uma temperatura muito baixa, durante o seu transporte a
centros de vacinação. A vacina é administrada em duas doses com três intervalos de semanas. Como
a idade é considerada um grande fator de risco, pessoas com mais idade terão prioridade, bem como
as casas de apoio, GPs, farmacêuticos e postos de vacinação.
(B) A vacina, desenvolvida pela Pftzer e BioNTech está prestes a ser aprovada em caráter emergencial
para combater a COVID-19. A vacina é administrada em três doses com um intervalo de duas semanas.
Como a idade não é considerada um grande fator de risco, a vacina será disponibilizada para toda a
população em casas de apoio, GPs, farmacêuticos e postos de vacinação.
(C) Uma vacina,desenvolvida pela Pftzer e BioNTech e testada em 43.500 pessoas, está prestes a ser
aprovada em caráter emergencial para combater a COVID-19 antes do Natal. Essa vacina treina o
sistema imunológico a combater o coronavírus e precisa ser armazenada em uma temperatura de
-80C durante o seu transporte a centros de vacinação. A vacina é administrada em duas doses com um
intervalo de três semanas. Como a idade é considerada um grande fator de risco, pessoas com mais
idade terão prioridade, bem como as casas de apoio, GPs, farmacêuticos e postos de vacinação.
(D) A vacina, desenvolvida pela Pftzer e BioNTech e testada em 43.500 pessoas, está prestes a ser aprovada
para combater a COVID-19 antes do Natal. Essa vacina treina o sistema imunológico a combater o
coronavírus e precisa ser armazenada em uma temperatura de -80C em locais de vacinação. A vacina
é administrada em duas doses com um intervalo de três semanas. Apesar da idade não ser considerada
um grande fator de risco, pessoas com mais idade terão prioridade, bem como as casas de apoio, GPs,
farmacêuticos e postos de vacinação.
(E) Uma vacina, desenvolvida pela Pftzer e testada em 43.500 pessoas, está prestes a ser aprovada em
caráter emergencial para combater a COVID-19 antes do Natal. Essa vacina elimina o coronavírus do
sistema imunológico e precisa ser armazenada em uma temperatura de -80C durante o seu transporte
a centros de vacinação. A vacina é administrada em três doses com um intervalo de três semanas.
Como a idade é considerada um grande fator de risco, pessoas com mais idade terão prioridade, bem
como as casas de apoio, GPs, farmacêuticos e postos de vacinação.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2021-1_Q60',
  'linguagens',
  'Artes',
  'Artes',
  2021,
  1,
  60,
  'Leia com atenção a entrevista de Luis Arce, a seguir parcialmente reproduzida.
Luis Arce en Aristegui: «No tenemos pensado» incluir a Evo Morales en el gabinete
(CNN Español) — Luis Arce, candidato ganador de la elección presidencial de Bolivia, dice que el expresidente Evo
Morales es el líder histórico de su movimiento pero que no hay planes por ahora de incluirlo en el gabinete. Arce le
dijo a Carmen Aristegui que su gobierno no va a abrir nuevos procesos en casos de corrupción existentes y explicó
su postura sobre los casos que enfrentan él, Morales y otros miembros del Movimiento al Socialismo, el partido que
vuelve al poder tras el interinato de JeanineÁñez.
¿Que representa el regreso de Evo Morales a Bolívia?
_________________________________________________________________________________________
¿Fue un error por parte de Evo Morales repostularse como presidente el año pasado?
“Fue muy taxativo al decir que fue un error, ¿no? El tema de la repostulación», señaló el candidato ganador. «Y creemos
nosotros que estamos de acuerdo con su autocrítica de que fue un error y bueno, ahora nos resta a nosotros darle
continuidad a todo el proceso con el apoyo mayoritario y popular que hemos recibido en Bolivia”.
¿Qué hará el gobierno de Arce con la oposición y con los procesos legales?
“Ya están abiertos muchos procesos, juicios de corrupción por el tema de Senkata, Sacaba, en fin, hay muchos juicios
que ya están abiertos. El gobierno nacional no va abrir nuevos procesos al respecto”, dijo Arce.
“Hay muchos juicios que no solamente se le han abierto al compañero Evo sino también a mi persona y a otros
dirigentes sociales y sindicales y del Movimiento al Socialismo. Hay muchos juicios que nosotros lo único que
tenemos que hacer es defendernos en las instancias legales correspondientes todos incluido el compañero Evo»,
afirmó. «Ahí lo único que se debe garantizar en la justicia que se cumpla el debido proceso, que no existan excesos
como lo hemos visto que durante este gobierno ha habido en la justicia. Nosotros esperaríamos que eso poco a poco
vaya mejorando en el sentido de que se dé cumplimiento estricto a la normativa legal vigente y de esta manera se
garantice los juicios adecuados”.
Y, en relación a las propuestas de la oposición en la campaña…
“En esta campaña electoral se ha podido evidenciar que el único partido político que salía a proponer era el Movimiento
al Socialismo», dijo. «Teníamos nuestro programa de gobierno, tenemos nuestra estrategia para salir de la crisis, que
la hemos planteado al pueblo boliviano en todo el tiempo de la campaña y los partidos de derecha que estaban en
oposición que participaron en el golpe de Estado del año pasado lo único que hacían era referirse a temas de odio, que
Evo Morales hace 14 años. Lamentablemente ese odio llegó a forma parte del programa de gobierno de los partidos
de la derecha cuando la población necesita propuestas para salir de la crisis profunda que está viviendo el país”.
Disponível https://cnnespanol.cnn.com/2020/10/20/luis-arce-en-aristegui-no-tenemos-pensado-incluir-a-evo-morales-en-el-gabinete/, acesso em 08/11/2020
Marque a opção que apresenta a resposta de Luis Arce à pergunta "¿Que representa el regreso de Evo Morales a
Bolívia?" que melhor corresponde à integralidade da entrevista.

(A) “Para todos nosotros nos queda absolutamente claro que Evo Morales es nuestro líder histórico que ha generado
todo este proceso de cambio en el país y actualmente él es presidente del instrumento, del Movimiento al
Socialismo, así que cuando va a retornar seguramente cuando él decida hacerlo a cumplir las funciones del
presidente del MAS y en el gobierno, mientras yo entiendo que él va a tener que responder primero todos sus
problemas judiciales que está enfrentando, no tenemos pensado incluirlo en el gabinete ni en la parte ejecutiva”,
dijo Arce.
(B) “Lo hizo después de que el comandante de las Fuerzas Armadas, Williams Kaliman, le pidiera dar un paso al lado
para así apaciguar la tensión creciente que sufre Bolivia tras las denuncias de fraude electoral en las elecciones
presidenciales del pasado 20 de octubre.”
(C) "En Bolivia se ha instalado una "dictadura" que será resistida por los movimientos sociales e indígenas, denuncia
la complicidad de Estados Unidos en el proceso que lo llevó a abandonar el cargo, defiende su triunfo en las
elecciones del 20 de octubre, y no descarta que en el futuro vuelva a ser candidato."
(D) “Estuve en Santa Cruz la última vez que Bolivia llegó al Mundial, hace más de un cuarto de siglo, y ni siquiera
en ese tiempo de efervescencia nacional vi tantas banderas del país en las calles de esta ciudad.”
(E) "Esta abogada y militante del hasta ahora opositor partido Plan Progreso para Bolivia Convergencia Nacional
asumió el cargo este martes en una breve ceremonia y con la misión declarada de crear un gobierno de "transición"
que convoque a unas nuevas elecciones en el menor plazo posible. Su ascenso al frente del Ejecutivo fue
consecuencia de la renuncia de Evo Morales a la presidencia; de Álvaro García Linera, a la vicepresidencia, así
como de la presidenta del Senado, Adriana Salvatierra."',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q41',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2022,
  1,
  41,
  'Durante a última década as mulheres conquistaram posições importantes na sociedade, tanto em termos
legais como profissionais. Paralelamente a essa escalada de poder, porém, aumentaram os distúrbios ligados
à alimentação, as cirurgias plásticas, a pornografia e a necessidade artificialmente provocada de corresponder
a um modelo idealizado de mulher, em que a velhice e a obesidade, mais do que pecados, são motivos
para a estigmatização. Em O mito da beleza Naomi Wolf enfrenta o que ela acredita ser a única trincheira
ainda por derrubar para que a mulher possa obter sua igualdade em todos os campos. Para mostrar como
a indústria da beleza e o culto à bela fêmea manipulam imagens que minam a resistência psicológica e
material femininas, reduzindo as conquistas de 20 anos de lutas a meras ilusões, Naomi escreveu um livro
forte, com dados estatísticos contundentes e fúria temperada aqui e ali por humor e lirismo.
WOLF, Naomi. O Mito da Beleza. Como as imagens de beleza são usadas contra as mulheres. Tradução de Waldéa
Barcellos. Rocco: Rio de Janeiro, 1992
De acordo com o texto, é correto afirmar que

(A) as mulheres conseguiram posições importantes na sociedade somente em termos legais.
(B) o termo "paralelamente" pode ser substituído por "divergente" sem alterar o sentido no texto.
(C) para consolidação de sua conquista profissional, a mulher priorizou cuidar da saúde e da imagem.
(D) a mulher, para obter igualdade em todos os campos, deve superar o mito da beleza.
(E) há uma necessidade real de a mulher corresponder ao mito da beleza.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q42',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2022,
  1,
  42,
  'há uma necessidade real de a mulher corresponder ao mito da beleza.
Questão 42
Disponível em: <http://www.bahia.ba.gov.br/wp-content/uploads/2021/08/Campanha-publicitaria-696x482.jpeg>.
Acesso em: 13 Out 2021.
Considerando essa campanha publicitária, pode-se afirmar que

(A) o texto não verbal expressa a importância de proferir palavras contra o racismo.
(B) o texto não verbal expressa uma voz contra o racismo, em consonância com o trecho do texto verbal
“Todas as vozes contra o racismo”.
(C) o texto verbal, em “racismo mata, racismo é crime”, está interligado de modo coerente com o sentido
do texto não verbal.
(D) o texto não verbal apresenta uma figura que diz respeito à luta pela tolerância na sociedade.
(E) o texto visa informar aos leitores sobre os benefícios do porte de armas.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q43',
  'linguagens',
  'Artes',
  'Artes',
  2022,
  1,
  43,
  'o texto visa informar aos leitores sobre os benefícios do porte de armas.

Questão 43
Só os loucos sabem
Charlie Brown Jr.
Agora eu sei
Exatamente o que fazer
Bom recomeçar, poder contar com você
Pois eu me lembro de tudo irmão
Eu estava lá também
Um homem quando está em paz
Não quer guerra com ninguém
Segurei minhas lágrimas
Pois não queria demonstrar a emoção
Já que estava ali só pra observar
E aprender um pouco mais sobre a percepção
Eles dizem que é impossível encontrar o amor
Sem perder a razão
Mas pra quem tem pensamento forte
O impossível é só questão de opinião
E disso os loucos sabem
Só os loucos sabem
Disso os loucos sabem
Só os loucos sabem
Toda positividade eu desejo a você
Pois precisamos disso
Nos dias de luta
O medo cega os nossos sonhos
O medo cega os nossos sonhos
Menina linda eu quero morar na sua rua
Você deixou saudade
Você deixou saudade
Quero te ver outra vez
Quero te ver outra vez
Você deixou saudade
Agora eu sei
Exatamente o que fazer
Bom recomeçar, poder contar com você
Pois eu me lembro de tudo irmão
Eu estava lá também
Um homem quando está em paz
Não quer guerra com ninguém
No trecho “O impossível é só questão de opinião
/ E disso os loucos sabem”, dessa música de
Charlie Brown Jr., o autor utiliza o termo “loucos”
para se referir às pessoas que

(A) são desequilibradas.
(B) têm alguma alteração patológica na saúde
mental.
(C) são extravagantes.
(D) superam limites.
(E) têm opinião formada sobre vários assuntos.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q44',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2022,
  1,
  44,
  'têm opinião formada sobre vários assuntos.

Questão 44 Questão 45
O que a morte nos ensina sobre a vida
Socorro Acioli
A escritora Noemi Jaffe, quando perdeu sua mãe,
começou a escrever uma longa carta, honesta e
forte, sobre a força de sua presença. (...) Um dos
momentos mais comoventes do texto é quando
a autora relembra uma mensagem da sua mãe
que ficou gravada no celular: “queria te dar um
beijo, estou com saudades”. O registro dessa
voz, armazenado em um aparelho eletrônico,
reproduzido por vários, salvo em uma nuvem,
transforma-se no som mais precioso do mundo. (...)
A tecnologia avança e alcança feitos inimagináveis,
mas estamos sempre lidando com as mesmas
emoções, a condição humana, a saudade, o amor
e a dor.
Disponível em: <https://diariodonordeste.
verdesmares.com.br/opiniao/colunistas/socorro-acioli/
o-que-a-morte-nos-ensina-sobre-a-vida-1.3133433>.
Acesso em: 9 Out 2021.
Infere-se, do artigo de opinião acima, que

(A) a expressão “sobre a força de sua presença”
remete à ideia de que a presença da mãe está
mais forte na carta do que nas mensagens
do celular.
(B) o registro da voz da mãe de Noemi, salvo
no celular, garante que a presença dela
permaneça forte e real.
(C) o registro da voz da mãe de Noemi mostra-
se precioso simplesmente por poder ser
armazenado em nuvens, tornando-se mais
seguro aos perigos de perda de dados na
Internet.
(D) a tecnologia é poderosa para acabar com as
dores do coração.
(E) a tecnologia é aliada no alívio da saudade,
porém não é capaz de zerar esse sentimento.
Janela
Janela, palavra linda',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q45',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2022,
  1,
  45,
  'a tecnologia é aliada no alívio da saudade,
porém não é capaz de zerar esse sentimento.
Janela
Janela, palavra linda
Janela é o bater das asas da borboleta amarela.
Abre pra fora as suas folhas de madeira à toa
pintada,
janela jeca, de azul.
Eu pulo você pra dentro e pra fora, monto a cavalo
em você,
meu pé esbarra no chão.
Janela sobre o mundo aberta, por onde vi
o casamento da Anita esperando neném, a mãe
do Pedro Cisterna urinando na chuva, por onde vi
meu bem chegar de bicicleta e dizer a meu pai:
minhas intenções com sua filha são as melhores
possíveis.
Ô janela com tramela, brincadeira de ladrão,
claraboia na minha alma,
olho no meu coração.
PRADO. A. Poesia Reunida. Rio de
Janeiro: Record, 2017
Nesse poema, o eu-lírico celebra a janela.
Sobre esse objeto poético no texto, considere as
assertivas a seguir.
I. O elogio do objeto janela se revela a partir do
próprio signo linguístico.
II. A janela da afeição do eu-lírico é a de cor
amarela como a da borboleta.
III. A janela no poema sugere o movimento
dialético da própria vida.
IV. A janela é denotativa e conotativamente um
lugar de registro dos eventos da vida.
É correto o que se afirma apenas em

(A) I, II, III e IV.
(B) I, II e IV.
(C) I, III e IV.
(D) II, III e IV.
(E) III e IV.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q46',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2022,
  1,
  46,
  'III e IV.

Questão 46
“EU NÃO EXISTI”
Minha vida durante e depois da Covid-19
Quando penso no que é a vida, recordo os versos pentassílabos de Gonçalves Dias, na Canção do Tamoio.
“Não chores, meu filho;
Não chores, que a vida
É luta renhida:
Viver é lutar.
A vida é combate,
Que os fracos abate,
Que os fortes, os bravos
Só pode exaltar.”
Numa quarta-feira, 8 de abril de 2020, eu fui intubado em decorrência de complicações trazidas pela Covid-19.
(...) Sou diabético, hipertenso e fumei durante boa parte da vida. As lembranças que guardo são turvas. Dos
dias de internação, antes de perder a consciência, me lembro de pouco. Sei que não tinha ânimo para ler
nem para conversar, que sentia cansaço. E apaguei. Para usar uma expressão médica que ouvi muito, meus
“sensórios” estavam “embotados”. Eu não sonhei, não me lembro de nada. Eu não existi. Minha memória
mais concreta depois dessa internação data de quase um ano depois, o início de 2021. Nesse tempo todo,
tive alta e voltei a ser internado três vezes. (...). Eu havia perdido a noção do tempo.(...) Tive receio de que
a minha memória, que é excepcional, fosse afetada pela doença. Mas felizmente ela continua igual.
Sergio Bermudes
Disponível em: <https://piaui.folha.uol.com.br/materia/eu-nao-existi/>. Acesso em: 11 Out 2021.
Com base na leitura do depoimento de Sérgio Bermudes, é correto afirmar que

(A) o verso “viver é lutar”, de Gonçalves Dias, remonta, de forma direta, à ideia do trecho “Eu havia perdido
a noção do tempo”.
(B) o verso “viver é lutar”, de Gonçalves Dias, apresenta relação de contrariedade com “Nesse tempo todo,
tive alta e voltei a ser internado três vezes”.
(C) os versos “Que os fortes, os bravos, só pode exaltar” correspondem ao trecho “Tive receio de que a
minha memória, que é excepcional, fosse afetada pela doença. Mas felizmente ela continua igual”.
(D) os versos “A vida é combate/ Que os fracos abate” corresponde a “mas felizmente ela continua igual”.
(E) a palavra “embotados” aparece no texto com sentido de firmes.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q47',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2022,
  1,
  47,
  'a palavra “embotados” aparece no texto com sentido de firmes.

Questão 47
AMOR LÍQUIDO
Sobre a fragilidade dos laços humanos
A era da modernidade líquida em que vivemos — um mundo repleto de sinais confusos, propenso a mudar
com rapidez e de forma imprevisível — é fatal para nossa capacidade de amar, seja esse amor direcionado ao
próximo, nosso parceiro ou a nós mesmos. Zygmunt Bauman, um dos mais originais e perspicazes sociólogos
ainda em atividade, investiga aqui de que forma nossas relações tornam-se cada vez mais "flexíveis", gerando
níveis de insegurança sempre maiores. Uma vez que damos prioridade a relacionamentos em "redes", as
quais podem ser tecidas ou desmanchadas com igual facilidade — e frequentemente sem que isso envolva
nenhum contato além do virtual —, não sabemos mais manter laços a longo prazo. E não apenas relações
amorosas e vínculos familiares são afetados: Bauman verifica ainda que nossa capacidade de tratar um
estranho com humanidade é prejudicada. Como exemplo, ele examina a crise na atual política imigratória
de diversos países da União Europeia e a forma como a sociedade tende a creditar seus medos, sempre
crescentes, a estrangeiros e refugiados. Sensível e brilhante como de hábito, Zygmunt Bauman faz deste
Amor líquido mais que uma mera e triste constatação, um alerta revigorante.
BAUMAN, Zygmunt. Amor líquido: sobre a fragilidade dos laços humanos. Rio de Janeiro: Jorge Zahar, 2004.
Em relação ao texto, considere as afirmações abaixo.
I. O termo "amor líquido" alude a um conceito sobre a fragilidade das relações humanas.
II. As relações se caracterizam pela solidez com tendência ao compromisso.
III. Na era da modernidade, o amor se tornou líquido e flui com vínculos afetivos estáveis.
IV. As relações via “redes” convertem-se em modelo que abrange a vida real.
É correto apenas o que se afirma em

(A) I.
(B) II.
(C) I e II.
(D) I e IV.
(E) II e III.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q48',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2022,
  1,
  48,
  'II e III.

Questão 48
Questão 49
Pré-História
Murilo Mendes
Mamãe vestida de rendas
Tocava piano no caos.
Uma noite abriu as asas
Cansada de tanto som,
Equilibrou-se no azul,
De tonta não mais olhou
Para mim, para ninguém:
Cai no álbum de retratos.
Com base na leitura do poema Pré-História de Murilo Mendes, poeta brasileiro surrealista, pode-se inferir
que o tema do poema é

(A) a dupla jornada da mulher de acordo com o verso “Tocava piano no caos”.
(B) a emancipação da mulher, segundo o verso “Uma noite abriu as asas”.
(C) o abandono da família, conforme os versos “de tonta não mais olhou/Para mim, para ninguém”.
(D) a decepção, de acordo com o verso “Cansada de tanto som”.
(E) a morte, segundo o verso “Cai no álbum de retratos”',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q49',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2022,
  1,
  49,
  'a morte, segundo o verso “Cai no álbum de retratos”
A Sinédoque é o primeiro festival exclusivamente dedicado ao documentário brasileiro em curta-metragem
do país. Com uma linguagem ágil e de impacto, de forma totalmente online, gratuita e independente, a
Sinédoque tem a cara do seu tempo: democrática, acessível, inclusiva e diversa. Nossa missão é celebrar
e popularizar o documentário brasileiro em curta-metragem.
No texto, ainda faz comparação da figura de linguagem Sinédoque ao ofício d@ documentarista, que
representa o mundo pelo seu ponto de vista.
Disponível em: <https://www.sinedoque.com.br/>. Acesso em: 28 Out 2021.
De acordo com o conteúdo exposto acima, a definição de sinédoque é

(A) figura de linguagem que apresenta o uso de uma palavra no lugar de outra, com a qual haja uma relação
de sentido.
(B) figura de linguagem usada para atenuar algo grave de ser dito.
(C) figura de comparação explícita.
(D) figura de linguagem que faz uma comparação implícita, sem o elemento comparativo.
(E) figura de linguagem que faz a substituição de um termo por outro, ocorrendo redução ou ampliação do
sentido.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q50',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2022,
  1,
  50,
  'figura de linguagem que faz a substituição de um termo por outro, ocorrendo redução ou ampliação do
sentido.

Questão 50
Questão 51
“Quando resulta de descuidos ou de ignorância
do verdadeiro sentido das palavras, o pleonasmo
constitui defeito abominável. Entretanto,
empregado com habilidade, realça sobremaneira
a expressão das ideias."
GARCIA, Othon M. Comunicação em Prosa
Moderna Rio de Janeiro: FGV, 2010.
A partir dessa explicação, pode-se dizer que há
pleonasmo intencional para realçar a expressão
das ideias em

(A) "E rir meu riso e derramar meu pranto."
(Vinicius de Moraes)
(B) Havia uma multidão de pessoas no salão.
(C) “É preciso amor / Pra poder pulsar / É preciso
paz pra poder sorrir / É preciso a chuva para
florir” (Tocando em Frente — Almir Sater)
(D) “Por você eu largo tudo / Vou mendigar, roubar,
matar / Até nas coisas mais banais / Pra mim
é tudo ou nunca mais” (Exagerado — Cazuza)
(E) Choveu uma chuva forte.
Leia o seguinte trecho.
“… era um refinado mentiroso, pronto a enganar
qualquer um com a sua língua bífida, que, neste
caso, segundo o dicionário privado do narrador
desta história, significa traiçoeira, pérfida, aleivosa,
desleal e outras lindezas semelhantes.”
SARAMAGO, J. Caim. São Paulo:
Companhia das Letras, 2017.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q51',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2022,
  1,
  51,
  'Choveu uma chuva forte.
Leia o seguinte trecho.
“… era um refinado mentiroso, pronto a enganar
qualquer um com a sua língua bífida, que, neste
caso, segundo o dicionário privado do narrador
desta história, significa traiçoeira, pérfida, aleivosa,
desleal e outras lindezas semelhantes.”
SARAMAGO, J. Caim. São Paulo:
Companhia das Letras, 2017.
Nesse trecho, o autor explica ao leitor a palavra
por ele utilizada. Essa função da linguagem é
conhecida como

(A) referencial
(B) fática
(C) emotiva
(D) poética
(E) metalinguística',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q52',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2022,
  1,
  52,
  'metalinguística
Questão 52
Dois Cavalos atravessa a ponte devagar, à
velocidade mínima autorizada, para dar ao
espanhol tempo de admirar a beleza das paisagens
de terra e mar, e também a grandiosa obra de
engenharia que liga as duas margens do rio,
esta construção, falamos da frase, é perifrástica,
usámo-la só para não repetirmos a palavra ponte,
de que resultaria solecismo, da espécie pleonástica
ou redundante.
SARAMAGO, J. In: A jangada de Pedra.
São Paulo: Companhia das Letras, 1988.
*grafia preservada do português de Portugal.
A partir dos esclarecimentos acerca da escrita
nesse fragmento, pode-se dizer que

(A) ao esclarecer o termo "construção", o autor
evita uma ambiguidade.
(B) ao substituir a palavra "ponte", o autor usou
a catáfora como recurso coesivo.
(C) ao optar por não repetir a palavra "ponte", o
autor rompe com a ênfase da frase.
(D) ao evitar solecismo na frase, o autor demonstra
domínio das técnicas da narrativa.
(E) ao justificar a frase perifrástica, o autor revela
cuidado apenas com o conteúdo da frase.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q53',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2022,
  1,
  53,
  'ao justificar a frase perifrástica, o autor revela
cuidado apenas com o conteúdo da frase.

Numa era conturbada, onde a tecnologia testa os
limites da ciência e uma pandemia pôs o planeta
em xeque, Manes convida à introspecção: “A
maior força para o presente e para o futuro não
é o computador mais sofisticado ou ter dinheiro
ou poder, e sim pensarmos como humanos para
combater a mudança climática, a desigualdade e
enfrentar os grandes desafios da humanidade”.
Disponível em: <https://brasil.elpais.com/ciencia/2021-09-29/
em-cinco-anos-passar-o-dia-no-whatsapp-sera-tao-
mal-visto-quanto-fumar-num-aviao.html?ssm=IG_BR_
CM&utm_campaign=later-linkinbio-elpaisbrasil&utm_
content=later21143817&utm_medium=social&utm_source=linkin.bio
>. Acesso em: 11 Out 2021.
A respeito do uso do “onde” no trecho, marque a
opção correta.

(A) Está adequado porque se refere a um período
em que a tecnologia reina.
(B) Está inadequado porque não apresenta
antecedente locativo.
(C) Está inadequado porque há erro de grafia. O
adequado seria “aonde”.
(D) Está adequado porque está sendo usado
como pronome relativo.
(E) Está inadequado porque não aparece como
advérbio de lugar.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q54',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2022,
  1,
  54,
  'Está inadequado porque não aparece como
advérbio de lugar.
Questão 53
Em Defesa dos Adjetivos
Muitas vezes nos mandam cortar nossos
adjetivos. O bom estilo, conforme dizem, sobrevive
perfeitamente sem eles; bastariam o resistente
arco dos substantivos e a flecha dinâmica e
onipresente dos verbos. Contudo, um mundo sem
adjetivos é triste como um hospital no domingo. A
luz azul se infiltra pelas janelas frias, as lâmpadas
fluorescentes emitem um murmúrio débil.
Substantivos e verbos bastam apenas a soldados
e líderes de países totalitários. Pois o adjetivo é
o imprescindível avalista da individualidade de
pessoas e coisas. […]
O adjetivo está para a língua assim como a cor
para a pintura. […]
[…]
Vida longa ao adjetivo! Pequeno ou grande,
esquecido ou corrente. Precisamos de você, esbelto
e maleável adjetivo que repousa delicadamente
sobre coisas e pessoas e cuida para que elas não
percam o gosto revigorante da individualidade. […]
[…] A memória é feita de adjetivos. Uma rua
comprida, um dia abrasador de agosto, o portão
rangente que dá para um jardim e ali, em meio
aos pés de groselha cobertos pelo pó do verão,
os teus dedos despachados… (tudo bem, teus é
pronome possessivo).
Adam Zagajewski
Poeta, ensaísta e romancista polonês, publicou
Another Beauty, sem edição no Brasil.
Disponível em: https://piaui.folha.uol.com.br/
materia/em-defesa-dos-adjetivos/
O adjetivo pode exercer diferentes funções
sintáticas. Assinale a alternativa em que o adjetivo
destacado está corretamente classificado.

(A) “Um mundo sem adjetivos é triste como um
hospital no domingo.”(Adjunto adnominal)
(B) Aquele rapaz triste foi ao hospital no domingo.
(Predicativo do sujeito)
(C) “A luz azul se infiltra pelas janelas frias”
(Adjunto adnominal)
(D) As noites frias são agradáveis. (Predicativo
do sujeito)
(E) Aquela luz é azul. (Adjunto adnominal)',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2022,
  1,
  55,
  'Aquela luz é azul. (Adjunto adnominal)
Questão 54

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
Questão 56
Leia o texto a seguir:
It was evening. Francisco was very nervous. It was his graduation day. Yes, the ceremony was ____112th
December. He was extremely happy because it was going to be _____2 a Saturday, his relatives were going
to be there. He woke up early _____3 the morning, checked the invitations, arrived _____4Unifor _____5 6:00
p.m, talked to his professors and friends and enjoyed the celebration. What a night!
A opção que preenche corretamente as lacunas, quando necessário, é:

(A) on1 ; over2; in3 ; at4 ; at5
(B) at1 ; in2 ; on3 ; on4 ; in5
(C) in1 ; in2 ; on3 ;___4 ; at5
(D) __1; on2 ; at3 ; in4 ; in5
(E) on1 ; on2; in3 ; at4 ; at5',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q56',
  'linguagens',
  'Artes',
  'Artes',
  2022,
  1,
  56,
  'on1 ; on2; in3 ; at4 ; at5
Leia os versos de Easy on Me a seguir.
There ain''t no gold in this river
That I''ve been washing my hands in forever
I know there is hope in these waters
But I can''t bring myself to swim
When I am drowning in the silence...
De acordo com os versos de Easy on Me, é correto afirmar:

(A) A música apresenta sua vontade de continuar a lutar por sua felicidade e ver o brilho da vida.
(B) A música apresenta a esperança em novos rumos nas águas douradas onde lavava suas mãos no
passado.
(C) Embora tenha esperança em momentos melhores, a cantora não se sente apta a lutar por sua felicidade
no momento de dor.
(D) A letra mostra a vontade de seguir em frente, porém a inabilidade de nadar impede a cantora de seguir.
(E) A música apresenta o mergulho nas águas douradas do verão e o medo de se afogar silenciosamente.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q57',
  'linguagens',
  'Artes',
  'Artes',
  2022,
  1,
  57,
  'A música apresenta o mergulho nas águas douradas do verão e o medo de se afogar silenciosamente.

Questão 57
Questão 58
Ainda considerando a música Easy on Me, analise o seguinte trecho:
I can''t bring myself to swim
You can''t deny how hard I''ve tried
A opção que melhor expressa o uso de CAN’T desses versos da canção é:

(A) Ausência de obrigação.
(B) Ausência de Intenção.
(C) Ausência de planos.
(D) Impossibilidade.
(E) Proibição.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q58',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2022,
  1,
  58,
  'Proibição.
Leia a tirinha e marque a resposta correta.
“I will walk with you forever.”
O uso do verbo modal “will” (I will walk...) na sentença acima significa:

(A) Plano.
(B) Conselho.
(C) Promessa.
(D) Permissão.
(E) Probabilidade.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2022,
  1,
  59,
  'Probabilidade.

Questão 59
Leia o texto Skyscraper Constructione a seguir.
Skyscrapers start with a very large hole in the ground which will contain the foundations, several floors,
and possibly even a metro or subway station. The type of foundations depend on the nature of the ground.
Usually they are made by drilling narrow, deep holes and filling them with reinforced concrete to form piles.
Another method is to drive steel piles, as much as twenty meters in length, into the ground. A thick raft of
concrete is laid on top of the piles.
Vertical steel columns are bolted to the foundations. Each column rests on a platform of steel to spread the
load. Steel girders are fixed horizontally from column to column by Steel Erectors to form a strong framework.
Metal decking is laid across the girders and filled with lightweight liquid concrete which is pumped up from
the ground. When it sets, it forms the floors.
Ducts are installed below the floors to carry all services:
electricity, water, drains. All exposed metalwork is
fireproofed. If a fire happens, it is important that the
structure can withstand high temperatures without
buckling.
The same process is repeated as the building rises. In
some construction methods, entire floors are built at
ground level and hoisted in position by cranes.
The outside of the building is covered in cladding. This
consists of prefabricated panels of materials such as
stainless steel, aluminium, and glass.
Após sua leitura, pode-se concluir que o texto

(A) trata da apresentação dos métodos seguidos na construção das fundações de um prédio.
(B) apresenta os principais processos seguidos na construção de um prédio – da escavação da fundação
até o processo da construção do último andar.
(C) descreve a importância do material usado, das vigas de aço e do uso de cimento, no planejamento de
cada andar.
(D) apresenta a importância de lajes pré-fabricadas para proteção dos operários da construção e aceleração
da obra.
(E) descreve o trabalho desenvolvido por uma empresa de engenharia na construção de mais um prédio.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2022-1_Q60',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2022,
  1,
  60,
  'Mirando hacia el futuro
¿Cómo será la sociedad del futuro? Es la pregunta con la que se llenan cada vez más páginas en los periódicos, con
artículos de fondo o con suplementos dedicados al impacto de las nuevas tecnologías. Es obvio, sin embargo, que
nadie puede darle una respuesta segura, y tanto más insegura será la que se dé cuanto más alejemos en el tiempo
las predicciones. Nadie sabe lo que nos espera pasadas dos o tres décadas. Los rápidos avances científico-técnicos
desalientan a todo el que aspire a ser siquiera un profeta menor. Cuanto más poderosa es nuestra tecnología, más
acelera su crecimiento y menos alcance logra nuestra visión. Quizás dentro de quinientos o mil años los seres humanos
hayan sido sustituidos por una especie posthumana, quizás sean cíborgs integrados perfectamente en sus cuerpos
semiartificiales, quizás no queden más que máquinas superinteligentes que contengan muchas mentes humanas como
parte de su memoria, pero quizás no haya nada de todo esto porque la humanidad no haya podido superar una crisis
ecológica global o una nueva guerra mundial. A lo sumo, podemos especular –y utilizo esta palabra con la intención
de subrayar la precariedad epistémica de este discurso– con lo que puede pasar con cierta probabilidad en el plazo de
unos diez o veinte años; y ya esto supone un gran atrevimiento.
En tal caso, lo primero que yo diría, casi a modo de apuesta, si se me preguntara, es que la sociedad del futuro
inmediato se parecerá bastante a la nuestra: existirán desigualdades sociales clamorosas; padeceremos injusticias y
conflictos armados; el fanatismo político y religioso generará enfrentamientos; centros de poder ajenos a un mínimo
control democrático ampliarán aún más su influencia; algunos problemas ecológicos se verán agravados, aunque quizás
seremos capaces de paliar otros ya creados; padeceremos enfermedades y experimentaremos los sufrimientos de la
decrepitud física y mental en los últimos años de nuestra vida, y los de la muerte al final del camino. La tecnología no
habrá eliminado ninguno de estos problemas, y creo que es ingenuo pensar que lo hará. Evgeny Morozov ha hablado,
con bastante razón, de la «locura del solucionismo tecnológico», entendiendo por tal la pretensión de que el desarrollo
tecnológico traiga por sí solo la resolución de todas las penurias y contrariedades que aquejan al ser humano, y no solo
las políticas, económicas o sociales, sino también las existenciales, incluyendo la propia muerte.
A esto añadiría que seguramente viviremos rodeados de tecnologías aún inimaginables (como era inimaginable Internet
hace cuarenta años). La inteligencia artificial estará integrada en todos los aspectos de nuestra vida, para bien y para
mal, y los desarrollos espectaculares de las biotecnologías pondrán en nuestras manos el control de una buena parte
de la vida en este planeta y puede que hasta el futuro de nuestra propia especie, como predicen los transhumanistas, lo
cual generará enormes problemas éticos y políticos a los que habrá que enfrentarse. Veremos (o verán los que lleguen)
cambios radicales, como una vida de duración extendida, pero no veremos el paraíso en la tierra que nos anuncian desde
Silicon Valley y desde otros lugares comprometidos económicamente con el despliegue de estas nuevas tecnologías.
Y no lo veremos por fortuna, porque ese paraíso se parece poco a lo que tradicionalmente se ha venido considerando
una vida buena.
In DIÉGUEZ LUCENA, Antonio Javier. ¿Podremos vencer a la muerte?. PASAJES 57, 2019, pp. 6-17 Disponível em
https://roderic.uv.es/bitstream/handle/10550/73003/7134243.pdf?sequence=1, acesso em 15/10/2021.
Escolha a opção que propõe uma reflexão conclusiva condicente com o conteúdo do seguinte texto.

(A) O desenvolvimento tecnológico da humanidade é, sem dúvida, impressionante e poderoso. É uma grande vantagem
poder contar com seus avanços. Entretanto, é ingênuo pensar que a tecnologia poderá resolver os problemas
intrínsecos da humanidade: desde uma boa saúde, uma boa qualidade de vida (individual e coletiva), até a aceitação
da decrepitude e da morte, dado que são problemas de índole bioética. Por outras palavras, além de desenvolver
a tecnologia, é necessário desenvolver o humano.
(B) A tecnologia tem sempre marcado a evolução da espécie humana. Não há uma forma que supere em eficácia,
produtividade e lucro à aplicação da tecnologia nos problemas de mercado. O exemplo está dado pelo complexo
de Silicon Valley, hoje integrado pelas empresas que, indiscutivelmente, lideram todas as perspectivas do mercado
globalizado, além de dominar de forma definitiva os capitais monetários mundiais.
(C) Graças à tecnologia, a humanidade atual tem em suas mãos a possibilidade de recriar o paraíso perdido na terra.
Podemos hoje vislumbrar um futuro próximo no qual nossos corpos modificados, aperfeiçoados por altas tecnologias
cibernéticas e intervenções genéticas vencerão o envelhecimento e a morte, além de desempenhar-se com força,
agilidade e precisão nunca sonhadas em outras eras.
(D) A desigualdade social; a injustiça; os conflitos armados; o fanatismo político e religioso; a concentração de poder
em oligopólios alheios a um mínimo de controle dos estados; a degradação ecológica; as doenças; a decrepitude
e a morte estão com os dias contados, dado que a inteligência artificial contemporânea saberá lidar com esses
problemas de forma muito mais efetiva do que nós, simples humanos, dotados de inteligências naturais.
(E) A digitalização da vida chegou para ficar e não adianta lutar contra ela. A trajetória evolutiva humana tem mostrado
indícios vários e inequívocos de sua obsolescência. Não adianta, o tempo é das máquinas! E para que o ser
humano não seja ultrapassado, precisa mais que aliar-se, fusionar-se, simbiotizar-se com elas. Somente dessa
forma teremos futuro, mesmo se ele implica a aniquilação do humano e de seu habitat natural pela superação
tecnológica que ele mesmo criou.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q41',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2024,
  1,
  41,
  'Disponível em :https://www.sintafce.org.br
Acesso em: 12 out 2023
O tom instigante do slogan no cartaz se deve ao
modo como a mensagem foi organizada em torno
da palavra "bárbara" por meio do emprego de
recursos linguísticos, como a

(A) metonímia.
(B) denotação.
(C) função poética.
(D) plurissignificação.
(E) aliteração.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q42',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2024,
  1,
  42,
  'aliteração.
Todos sabemos que a nossa época é profundamente
bárbara, embora se trate de uma barbárie ligada
ao máximo de civilização. Penso que o movimento
pelos direitos humanos se encontra aí, pois somos
a primeira era da história em que teoricamente é
possível entrever uma solução para as grandes
desarmonias que geram a injustiça contra a qual
lutam os homens de boa vontade, a busca, não
mais do estado ideal sonhado pelos utopistas
racionais que nos antecederam, mas do máximo
viável de igualdade e justiça, em correlação a cada
momento da história.
Mas esta verificação desalentadora deve ser
compensada por outra, mais otimista: nós sabemos
que hoje os meios materiais necessários para nos
aproximarmos desse estágio melhor existem, e
que muito do que era simples utopia se tornou
possibilidade real. Se as possibilidades existem,
a luta ganha maior cabimento e se torna mais
esperançosa, apesar de tudo o que o nosso tempo
apresenta de negativo. Quem acredita nos direitos
humanos procura transformar a possibilidade
teórica em realidade, empenhando-se em fazer
uma coincidir com a outra.
CANDIDO, Antônio. O direito à Literatura.
Vários Escritos. São Paulo: Duas Cidades,
1995 (fragmento)
Nesse fragmento, as reflexões do autor, face ao
tempo em que vivemos, revelam

(A) desalento e perspectiva de um tempo melhor.
(B) esperança utópica, apesar de tudo o que há
de negativo.
(C) descrédito no ser humano como agente de
mudanças.
(D) crença na erradicação total das injustiças de
nossa era.
(E) pessimismo, dada a profunda barbárie de
nossa época.

30',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q43',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  1,
  43,
  'pessimismo, dada a profunda barbárie de
nossa época.

30 
Questão 43
Minha Vida
Carta a Lúcio de Mendonça
Comentário - É sob a perspectiva biográfica, a carta mais significativa da produção intelectual de Luiz Gama.
Repleta de declarações impactantes e minúcias finíssimas que o mais diligente leitor pode sem querer deixar
escapar – ao que antecipadamente alerto em vista de redobrar a atenção -, a “Carta a Lúcio de Mendonça”
é uma obra de arte da literatura brasileira. A narrativa da jornada épica do menino baiano que atravessa o
país no porão de um navio infestado e ratos e apinhado de mercadorias e pessoas escravizadas, chega
ao Rio de Janeiro, e de lá ruma, acorrentado, primeiro em um navio para Santos, depois a pé para Jundiaí,
Campinas e finalmente São Paulo, é das coisas mais impressionantes da história do Brasil. Luiz Gama
passa, então, oito anos barbaramente escravizado no centro da capital paulista e, de modo enigmático,
foge do cativeiro, alcança provas de sua liberdade e assenta praça na Força Pública, espécie de regimento
policial da época. De lá, o que já era épico tem sua marca confirmada pelos eventos sincrônicos e seguintes.
Insurge-se contra o abuso de autoridade, uma, duas, três – diversas! – vezes, aprende a ler e escrever
com maestria, toma possa de empregos públicos reservados àqueles que possuíam sólido conhecimento
normativo e administrativo, revela-se enquanto homem de letras – poeta e jornalista – e, entre múltiplas
expertises, torna-se um dos mais importantes advogados – e juristas! – já conhecidos no Brasil. A carta, que
pode ser lida como autobiografia se o leitor se permitir vestir de destinatário da mensagem, é um monumento
à criatividade, à luta e à perseverança da humanidade negra que, nas palavras do poeta, “fez e faz história
segurando esse país no braço”.
GAMA, Luiz. Liberdade. São Paulo: Hedra, 2021.
Considerando o gênero textual comentário, o texto tem o objetivo predominante de

(A) convencer o leitor para a necessidade da leitura da carta.
(B) emitir um juízo de valor, um posicionamento sobre a carta.
(C) narrar resumidamente a saga do emissor da carta.
(D) alertar o leitor para a qualidade literária da carta.
(E) apontar o gênero textual autobiografia presente na carta.
“Sentou debaixo de uma oliveira, à beira da estrada, e retirou o cordeiro do alforge, ninguém se estranharia
de o ver ali, pensariam, Está a descansar da caminhada, a ganhar forças para ir ao Templo levar o cordeiro,
bonito é ele, não saberemos, nós, se, na ideia de quem o pensou, o bonito é o anho, ou é Jesus. Temos cá
a nossa opinião, que os dois o são (...)”',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q44',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  1,
  44,
  'apontar o gênero textual autobiografia presente na carta.
“Sentou debaixo de uma oliveira, à beira da estrada, e retirou o cordeiro do alforge, ninguém se estranharia
de o ver ali, pensariam, Está a descansar da caminhada, a ganhar forças para ir ao Templo levar o cordeiro,
bonito é ele, não saberemos, nós, se, na ideia de quem o pensou, o bonito é o anho, ou é Jesus. Temos cá
a nossa opinião, que os dois o são (...)”
SARAMAGO, José. O Evangelho segundo Jesus Cristo. São Paulo: Companhia das Letras, 2022.
Na formulação do pensamento de alguém diante da cena descrita no texto, o autor expõe a questão da
ambiguidade, num procedimento de análise da própria linguagem, fazendo uso da função

(A) conativa.
(B) expressiva.
(C) fática.
(D) referencial.
(E) metalinguística.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q45',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  1,
  45,
  'metalinguística.
Questão 44

Questão 45
TEXTO I
Você é o que você come
Está provado em pesquisas que crianças que mantêm um bom hábito alimentar e que controlam seu peso
têm maior probabilidade de se tornarem adultos saudáveis e sempre de bem com a balança. A lógica inversa,
infelizmente também se confirma: crianças que passam a infância acima de seu peso normal tendem a se
transformar em adultos obesos e em constante “briga” com a balança.
Hoje, o Brasil ostenta um título nada agradável: campeão mundial de crianças de até cinco anos com
sobrepeso (entre 10% e 15% do ideal). Por isso mesmo, pais e responsáveis por elas têm a missão de
orientar e reeducar seus pequenos para evitar uma grande epidemia de obesidade, doença tratada com muita
preocupação em todo o mundo. Alimentações regradas, moderadas, cinco vezes ao dia e sempre com hora
marcada são uma boa fórmula para começar a botar a casa em ordem e melhorar a saúde da criançada.
“O Globo Esportes”, 17 de julho de 2010.
TEXTO II
Aposta na prevenção
A prevenção da obesidade deve ser feita desde o nascimento e uma das ferramentas mais eficazes é a
amamentação. “Bebês amamentados no peito têm menos chances de se tornarem adultos gordos porque,
no esforço de sugar o seio, desenvolvem a percepção da saciedade, ou seja, sentem que a fome acaba e
param de mamar”, afirma o médico pediatra Fábio Ancoria Lopes.
Já o leite oferecido na mamadeira, além de chegar à boca com mais facilidade, o que faz o bebê receber
mais alimento do que necessita, costuma ser muito calórico, principalmente se for engrossado com farinhas
e adoçado. Para saber se o bebê caminha para ser um adulto com peso normal ou um obeso, basta ficar
de olho na balança.
De acordo com o padrão internacional de pediatria, no primeiro ano de vida é normal que ele triplique o
peso que tinha ao nascer. A partir do segundo aniversário e até a adolescência, a criança pode ganhar em
média de 2 a 3 quilos, por ano.
Revista Crescer, ano 2001.
Após a leitura dos textos, avalie as afirmativas a seguir.
I. Segundo os textos I e II, crianças com sobrepeso são mais propensas a se tornarem obesas na fase
adulta.
II. De acordo com o texto I, a promoção de hábitos saudáveis é fundamental para a prevenção da obesidade.
III. Conforme os textos I e II, a amamentação é uma ferramenta eficaz contra a obesidade infantil.
IV. No texto I, temos algumas orientações concernentes ao combate à obesidade infantil.
É correto o que se afirma apenas em

(A) I, II, III e IV.
(B) I, II e III.
(C) I, III e IV.
(D) I, II e IV.
(E) II e IV.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q46',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  1,
  46,
  'II e IV.

Questão 46
A importância da tecnologia
Wilson Jacob Filho
Participei de uma reunião muito interessante. Médicos passaram um sábado inteiro discutindo a melhor
maneira de exercer a sua profissão.Muitas imperfeições foram apontadas, o presente foi comparado ao
passado, […]. Dentre todos os assuntos, porém, o mais comentado foi a importância da tecnologia.
[…]
Usada como sinônimo de modernidade, a tecnologia foi criticada pelo alto custo que impõe aos diagnósticos e
tratamentos,além de ser considerada a principal ferramenta com que os jovens profissionais escondem suas
limitações na arte de bem examinar e avaliar seus clientes e a melhor forma de reduzir o tempo de consulta.
[…]
Discordo, porém, de que isso decorra dos avanços atuais da tecnologia. Justifico a minha opinião: desde
que a ciência passou a ser o principal fundamento da atitude médica, temos sido beneficiados pelo seu
progressivo desenvolvimento.
[…]
Esta é a verdadeira vocação da tecnologia: criar uma maneira de fazer aquilo que ainda não podia ser feito
ou aprimorar aquilo que se fazia de forma inadequada, e não simplesmente tentar substituir o útil antigo
pelo inútil moderno.
[…]
Folha de São Paulo. Caderno Equilíbrio. São Paulo, quinta-feira, 04 de junho de 2009. Fragmento
Sabendo que uma mesma conjunção subordinativa, dependendo do contexto em que estiver empregada,
pode adquirir sentidos diferentes, assinale a alternativa em que a conjunção “desde que” apresenta o mesmo
sentido em que foi utilizada no trecho “…desde que a ciência passou a ser o principal fundamento da atitude
médica, temos sido beneficiados pelo seu progressivo desenvolvimento.”.

(A) Desde que você estude, fará uma excelente prova.
(B) Você será promovido, desde que seja um bom profissional.
(C) Desde que descobriu a traição, ela resolveu abandoná-lo.
(D) Desde que o trânsito esteja tranquilo, conseguirei chegar no horário.
(E) Desde que não chova, irei à praia.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q47',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  1,
  47,
  'Desde que não chova, irei à praia.

Questão 47
O Islã não é só árabe
Religião abrange diversas etnias em todo mundo
Boa parte da população ocidental acredita que o mundo islâmico é aquela porção de países do Oriente Médio
que têm como idioma oficial o árabe. Por isso, são indevidamente considerados árabes alguns países de
maioria islâmica, mas que têm outros idiomas, como Turquia (línguas turca e curda), Irã (persa), Afeganistão
(pashtu e dari) e Paquistão (urdu e punjabi).
Existem atualmente cerca de 1,3 bilhão de muçulmanos no mundo, como são denominados os adeptos do
islamismo. A maioria vive na Ásia, onde essa religião nasceu e ganhou o mundo há cerca de 1.400 anos.
Da Ásia, os muçulmanos passaram para o norte da África - onde foram chamados de mouros - e parte da
Europa. Integraram-se com africanos, europeus das penínsulas ibérica e itálica e outros povos. Hoje eles
estão presentes também entre europeus, norte-americanos e até brasileiros.
O islamismo cresceu em número de adeptos muito mais fora do mundo árabe do que no local em que a
religião nasceu. Basta fazer uma comparação: os países islâmicos mais populosos, como a Indonésia (com
“apenas” 228 milhões de habitantes), o Paquistão (145 milhões), Bangladesh (131 milhões) e Nigéria (127
milhões) têm contingentes humanos muito maiores que o Egito (70 milhões), país de maior população entre os
árabes, seguido de longe pelo Sudão (36 milhões). Até a Índia, majoritariamente hindu, tem aproximadamente
100 milhões de muçulmanos.
Revista GALILEU. p. 42. Novembro de 2001.
Releia o seguinte trecho:
“Existem atualmente cerca de 1,3 bilhão de muçulmanos no mundo, como são denominados os adeptos
do islamismo.”
Sabendo que a conjunção “como”, dependendo do contexto em que estiver empregada, pode adquirir
sentidos diferentes, analise os períodos a seguir e assinale a alternativa em que a conjunção apresenta o
mesmo sentido do trecho destacado.

(A) Contratei um profissional para fazer a reforma, como foi pedido.
(B) “Eu sou como a borboleta
Tudo o que eu penso é liberdade …”
(“Proteção às borboletas” – Benito Di Paula)
(C) Como sou engenheiro, fiz o projeto da minha casa.
(D) Como não havia dinheiro, não fiz a reforma necessária.
(E) “Eu te amo calado
Como quem ouve uma sinfonia”
(“Certas coisas” – Lulu Santos)',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q48',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2024,
  1,
  48,
  '“Eu te amo calado
Como quem ouve uma sinfonia”
(“Certas coisas” – Lulu Santos)

Questão 48 Questão 49
Disponível em: https://blogger.
googleusercontent.com/img/b/R29vZ2xl/
AVvXsEigOqd2wVJ6B_. Acesso em: 16 out
2023.
A partir da leitura dos quadrinhos, podemos inferir
que

(A) o personagem dos quadrinhos não gosta de
televisão.
(B) o personagem está querendo assistir a um
filme.
(C) o personagem está triste com o fim do
programa.
(D) o personagem fará uma doação para que o
programa não saia do ar.
(E) o personagem não se sensibilizou com o
pedido de doações.
A fadiga da informação',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q49',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  1,
  49,
  'o personagem não se sensibilizou com o
pedido de doações.
A fadiga da informação
Há uma nova doença no mundo: a fadiga da
informação. Antes mesmo da Internet, o problema
já era sério, tantos e tão velozes eram os meios
de informação existentes, trafegando nas asas da
eletrônica, da informação, dos satélites. A Internet
levou o processo ao apogeu, criando a espécie dos
internautas e estourando os limites da capacidade
humana de assimilar os conhecimentos e os
acontecimentos desse mundo. Pois os instrumentos
de comunicação se multiplicam, mas o potencial
de captação humana – do ponto de vista físico,
mental e psicológico – continua restrito. Então,
diante do bombardeio crescente de informações, a
reação de muitos tende a tornar-se doentia: ficam
estressados, perturbam-se e perdem a eficiência
no trabalho.
Já não se trata de imaginar como esse fenômeno
possa ocorrer. Na verdade, a síndrome da fadiga
da informação está em plena evidência, conforme
pesquisa recente nos Estados Unidos, na Inglaterra
e em outros países, junto a 1300 executivos. Entre
os sintomas da doença, apontam-se a paralisia da
capacidade analítica, o aumento das ansiedades
e das dúvidas, a inclinação para decisões
equivocadas e até levianas.
MARZAGÃO, Augusto. In: DIMENSTEIN, Gilberto.
Aprendiz do futuro: cidadania hoje e amanhã. São Paulo:
Editora Ática, 1999.
No trecho “Entre os sintomas da doença,
apontam-se a paralisia da capacidade analítica,
o aumento das ansiedades e das dúvidas, a
inclinação para decisões equivocadas e até
levianas.”, a palavra destacada exerce a função de

(A) conjunção subordinativa condicional.
(B) pronome apassivador.
(C) índice de indeterminação do sujeito.
(D) pronome reflexivo.
(E) parte integrante do verbo.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q50',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  1,
  50,
  'parte integrante do verbo.

Meu Cantinho Preferido: Aldemir Martins (cantinhopreferidodamah.blogspot.com)/Acesso em 05/10/23
A respeito das obras de Aldemir Martins, artista plástico cearense, pode-se afirmar que

(A) representam uma estética de padrões antropocentristas focados em paisagens.
(B) manifestam uma perspectiva de arte realista sem idealizações e com traços marcantes.
(C) revelam o ideal de progresso industrial pós primeira e segunda guerras mundiais.
(D) manifestam forte teor de figuratividade e de brasilidade com expressão da natureza.
(E) exibem padrão de arte não figurativa do Nordeste brasileiro.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q51',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2024,
  1,
  51,
  'exibem padrão de arte não figurativa do Nordeste brasileiro.
Questão 50
Questão 51
A charge de Cazo ironiza

(A) o desgaste físico provocado pelo deslocamento até o escritório.
(B) o problema de saúde mental devido à preocupação e ao estresse.
(C) a busca por justiça no Brasil em relação a golpes da internet.
(D) a perda de viagem de avião.
(E) a expressão facial de desespero.

36',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q52',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  1,
  52,
  'a expressão facial de desespero.

36 
Questão 52
Literatura de Conceição Evaristo resgata a ancestralidade negro-brasileira
As “escrevivências” da escritora Conceição Evaristo mostram a importância de voltar ao passado para
caminhar no presente, mostra artigo da “Revista Criação & Crítica”
Conceição Evaristo é uma das maiores personalidades da literatura contemporânea feminina brasileira,
homenageada como Personalidade Literária do Ano pelo Prêmio Jabuti, em 2019, cujas obras resgatam a
ancestralidade e recuperam a genealogia “negro-brasileira”, retratando o cotidiano das mulheres negras,
os preconceitos que enfrentam nos âmbitos social, cultural e político. A literatura negro-brasileira é um
instrumento de concretização para o não colonialismo, a “decolonialidade”, na medida em que as mulheres
se “autorrepresentam e autoficcionalizam-se”, pois, falar de si é falar do coletivo. (...)
Conceição Evaristo desempenha, na atualidade, um papel fundamental na literatura negro-brasileira,
reverenciando suas ancestrais como parceiras tanto pela condição feminina quanto por serem negras,
seguindo caminhos de lutas e de dores, compartilhados nas personagens femininas atadas pela representação
simbólica da cor dos olhos, no conto Olhos d’água. Nesse conto a história, o tempo e a ancestralidade são
instrumentos de concretização da liberdade de autobiografar-se e de representar a si própria, sem barreira de
terceiros: “É vivendo, se vendo e vendo o outro como partícipe que mantém seu olhar pairando no passado
e no presente, questionando-se sobre o futuro”.
Disponível em: https://jornal.usp.br/ciencias/literatura-de-conceicao-evaristo-resgata-a-ancestralidade-negro-
brasileira/. Acesso em: 05 out 2023.
A reportagem acerca da renomada escritora Conceição Evaristo possui o objetivo de

(A) informar sobre a grandiosidade de uma Literatura que reverbera e preconiza a força do colonialismo.
(B) apresentar o modo como a autora foca em progredir em termos de resgate da ancestralidade a partir
da valorização de características físicas negro-brasileiras.
(C) representar a importância de tratar de si na luta por valorização feminina na contemporaneidade por
meio da Literatura.
(D) informar sobre a literatura de Conceição Evaristo no que concerne ao retrato da negritude brasileira
em facetas que envolvem preconceitos e lutas diversas.
(E) auxiliar o leitor a compreender a força da literatura geral, extremamente importante a um pleno
desenvolvimento nacional.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q53',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  1,
  53,
  'auxiliar o leitor a compreender a força da literatura geral, extremamente importante a um pleno
desenvolvimento nacional.

Questão 53
Biografia do orvalho
Manoel de Barros
A maior riqueza do homem é a sua incompletude.
Nesse ponto sou abastado.
Palavras que me aceitam como sou — eu não
aceito.
Não aguento ser apenas um sujeito que abre
portas, que puxa válvulas, que olha o relógio, que
compra pão às 6 horas da tarde, que vai lá fora,
que aponta lápis, que vê a uva etc. etc.
Perdoai.
Mas eu preciso ser Outros.
Eu penso renovar o homem usando borboletas.
Disponível em:https://poetisarte.com/autores/manoel-de-barros/biografia-do-
orvalho/ Acesso em: 16 out 2023.
Com base na leitura do texto, analise as afirmativas.
I. O texto levanta questionamento sobre a relação entre o ser e o ter.
II. Em seus versos, o eu lírico pede perdão pelo desconhecimento poético do mundo.
III. O autor lança, poeticamente, o debate a respeito do mundo moderno e da vida no automático.
IV. A ideia central do texto é voltada à concepção de que, a partir das borboletas, é possível mostrar ao
homem uma concepção diferente de mundo.
É correto apenas o que se afirma em

(A) I e II.
(B) II e III.
(C) III e IV.
(D) I, III e IV.
(E) I, II, III e IV.

38',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q54',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  1,
  54,
  'I, II, III e IV.

38 
Questão 54
Disponível em: https://www.portaldapropaganda.com.br. Acesso em: 10 out 2023
Por meio da recriação de uma ilustração clássica de Inferno, primeira parte da obra A Divina Comédia,
do italiano Dante Alighieri, essa peça publicitária, que integra uma campanha dos Médicos sem
Fronteiras, apela para

(A) a sensibilização para uma dada realidade atual de dor e sofrimento.
(B) a fi ccionalização do sofrimento humano na contemporaneidade.
(C) a valorização da literatura clássica universal nos tempos atuais.
(D) o paralelismo entre ilustração e fotografia nas artes plásticas.
(E) a compreensão do nexo entre passado e presente na arte.

39 
ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2024,
  1,
  55,
  'a compreensão do nexo entre passado e presente na arte.

39 
ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
O I Wanna Be Tour é uma turnê inédita com grandes nomes do pop punk e do emo nacional e internacional,
com organização nacional. Leia o trecho da música Hey There Delilah, da banda Plain White T’s, para
responder à questão.
A thousand miles seems pretty far
But they''ve got planes and trains and cars
I''d walk to you if I had no other way
Our friends would all make fun of us
And we''ll just laugh along because we know
That none of them have felt this way
Delilah, I can promise you
That by the time we get through
The world will never ever be the same
And you''re to blame
No trecho em destaque, o narrador

(A) reconhece que os amigos têm razão.
(B) se sente irritado com os amigos.
(C) culpa Delilah pela perda dos amigos.
(D) promete um futuro melhor.
(E) desconsidera a brincadeira dos amigos.

40',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2024,
  1,
  56,
  'desconsidera a brincadeira dos amigos.

40 
Questão 56 Questão 57
A trail of darkness swept across the Western
Hemisphere on Saturday, starting at the Oregon
coast and then venturing to the Southwest region
as it cut through Nevada, Utah, New Mexico, Texas
and other states. It was an annular solar eclipse
that millions of people across the United States
and Latin American countries experienced as a
ring of fire in their local skies.
The path of annularity, or the path where the moon
was most centered over the sun, was about 130
miles wide. People traveled from great distances
to reach this shadowy strip, soaking up the four
to five minutes of the darkest phase for those who
got closer to its center.
“You see a picture, and it just doesn’t do it justice,”
said Matthew Neal, who drove to Richfield, Utah,
from San Diego with his wife, Jennifer Neal, to
chase the eclipse.
Millions more people experienced a partial solar
eclipse, with considerable dimming of the sun
occurring in major cities like Seattle, Los Angeles,
Houston, Mexico City and Bogotá, even though
they were far outside the path of annularity in some
cases.
Disponível em: https://www.nytimes.
com/2023/10/14/homepage/solar-eclipse-
photos.html. Acesso em: 13 out 2023.
De acordo com Matthew Neal, qual o desafio em
tentar transmitir a beleza do eclipse?

(A) O eclipse não é tão impressionante quanto
esperavam.
(B) Fotografias e descrições não conseguem
capturar a sua essência.
(C) O eclipse é muito rápido para ser apreciado.
(D) O eclipse só é visível para aqueles próximos
ao seu centro.
(E) O eclipse só é visível em grandes cidades.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q57',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2024,
  1,
  57,
  'O eclipse só é visível em grandes cidades.
Planeta Estranho, de Nathan Pyle, figura
como um espelho para nosso comportamento
humano de forma bem humorada. Na tirinha, que
comportamento é representado?

(A) Fazer atividades físicas para ficar mais
atraente.
(B) Encontrar amigos antigos.
(C) Bronzear-se naturalmente.
(D) Realizar procedimentos estéticos artificiais.
(E) Ter relacionamentos amorosos.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q58',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  1,
  58,
  'Ter relacionamentos amorosos.

Questão 58
The annual comic book and entertainment convention in New York city is a cult favourite. Some
attendees shell out thousands to go.
For four days every October, New York City resembles something out of a science fiction movie – people
dressed in elabourate, head-turning costumes pepper Manhttan''s West Side. These superheroes, winged
creatures and anime characters are all on their way to New York Comic Con, the US east coast''s massive
ode to comic books and entertainment.
The first New York Comic Con was held in 2006 with 33,000 attendees. Today, roughly 200,000 fans gather
at the Jacob K Javits Convention Center, attending panels and swarming booths showcasing future releases
in comics, video games and toys. Celebrity spottings are common: 2023''s convention, which runs 12 to 15
October, will feature top names in entertainment, including Ewan McGregor and Chris Evans, who each
played major characters in blockbuster films.
Fans spend big to get in on the fun – for some, the total runs into the thousands when accounting for costumes,
tickets, travel and merchandise (think an $18,000 life-size light-up Iron Man statue, or a $30 Thor-hammer
meat tenderiser). It''s worth it for the fans who return every year.
Disponível em: https://www.bbc.com/worklife/article/20231010-how-much-it-costs-to-attend-new-york-comic-con.
Acesso em: 10 out 2023.
Sobre o texto da BBC, analise as afirmativas a seguir.
I. Na frase "people dressed in elaborate, head-turning costumes," “elaborate” é um advérbio .
II. A palavra "Head-Turning" indica que as fantasias chamam muita atenção no evento.
III. “Every” é o advérbio utilizado para indicar a frequência da Comic Con.
IV. Na frase "roughly 200,000 fans gather at the Jacob K Javits Convention Center," a função de "roughly"
é um adjetivo.
V. Na frase "Fans spend big to get in on the fun", o advérbio é “big”.
É correto apenas o que se afirma em

(A) II e III.
(B) IV e V.
(C) I, II e III.
(D) II, III e V.
(E) I, II, III, IV e V.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q59',
  'linguagens',
  'Artes',
  'Artes',
  2024,
  1,
  59,
  'I, II, III, IV e V.

Questão 59
Tim Minchin é um compositor, músico, comediante, ator, escritor, produtor e diretor australiano. Seu trabalho
é celebrado por sua originalidade e sua habilidade de provocar reflexões e risadas ao mesmo tempo. Seja
por sua música, comédia, ou atuação, ele, com certeza, marca o mundo do entretenimento. Leia o trecho
de sua música The Aeroplane para responder à questão.
If I had the blueprint or the brain
I would build an aeroplane
With fashion wings of balsa wood and glue
And I would fly to you
I''d carve a prop from old recycled would haves
All these relentless could have
These pointless might have beens
Oh, the storms that I would gladly battle through
So I could fly to you
Na primeira linha da música, o que a frase "If I had the blueprint or the brain" indica?

(A) Uma habilidade atual
(B) Uma intenção futura
(C) Uma habilidade passada
(D) Uma possibilidade passada
(E) Uma ação passada',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-1_Q60',
  'linguagens',
  'Artes',
  'Artes',
  2024,
  1,
  60,
  '49 
Observe um trecho da letra da canção “El coste de la vida”, do cantor dominicano Juan Luís Guerra:
El costo de la vida sube otra vez
El peso que baja, ya ni se ve
Y las habichuelas no se pueden comer
Ni una libra de arroz, ni una cuarta e café
A nadie le importa qué piensa usted
Será porque aquí no hablamos inglés
Ah, ah es verdad
Do you understand? Do you, do you?
Y la gasolina sube otra vez
El peso que baja, ya ni se ve
Y la democracia no puede crecer
Si la corrupción juega ajedrez
A nadie le importa qué piensa usted
Será porque aquí no hablamos francés
Ah, ah vous parlez?
Ah, ah non, Monsieur
¡Eh!...
(...)
Disponível em: <https://genius.com/Juan-luis-guerra-el-costo-de-la-vida-lyrics> Acesso em: 15 out. 2023.
A opção que melhor corresponde ao sentido da letra da música é:

(A) mesmo com a crise da América Latina, a corrupção é fraca e a democracia cresce.
(B) os problemas que a América Latina enfrenta se relacionam à crise econômica e à corrupção.
(C) a causa do desemprego não é a recessão, mas sim o fato de as pessoas não enxergarem os problemas.
(D) mesmo em recessão, a moeda do país é valorizada, o que mantém a ilusão de que está tudo bem.
(E) admite que, mesmo em um cenário de corrupção, não existe crime nessa situação de crise.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q41',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  2,
  41,
  'Texto I
Por um lado te vejo como um seio murcho
Pelo outro como um ventre de cujo umbigo pende ainda
[o cordão placentário
És vermelha como o amor divino
Dentro de ti em pequenas pevides
Palpita a vida prodigiosa
Infinitamente
E quedas tão simples
Ao lado de um talher
Num quarto pobre de hotel.
Bandeira, M. 50 poemas escolhidos pelo autor. São Paulo: Cosac Naify,2006.
Texto II
O quarto verso do poema falava de pequenas pevides dentro da maçã. Eu não conhecia aquela palavra. O
livro era de Teresa e estava sobre a mesa da cozinha, junto com um saca-rolhas e um porta-guardanapos
sem guardanapos e uma lista de compras da qual constavam, entre outras coisas, vinho e guardanapos.
(...)
Num quarto pobre de hotel, ao lado de um talher, está uma maçã. E um livro de Manuel Bandeira, o Estrela
da vida inteira. Esta é a minha vida. Olho pela janela, e o que será que vejo?
Lisboa, A. Um beijo de colombina. Rio de janeiro: Objetiva, 2015
O diálogo entre os textos I e II evidencia que

(A) ambos pertencem ao mesmo gênero textual.
(B) tanto o eu-lírico como o narrador evocam o passado.
(C) ambos dissertam sobre o simbolismo da maçã.
(D) ambos descrevem uma cena em suas vidas.
(E) o narrador recria o sentido de “pevides” do texto I.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q42',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  2,
  42,
  'o narrador recria o sentido de “pevides” do texto I.

Questão 42
Texto I
No livro infantil O pequeno lampião, traduzido por Michel Sleiman, o escritor Ghassan Kanafani, narra os
desafios enfrentados por uma jovem princesa que precisa levar o sol para dentro do palácio para se tornar
rainha. Após a morte do rei, que lhe incumbiu da missão, a princesa enfrenta uma jornada cheia de esperança
e com um final surpreendente.
Em determinado momento, Kanafani escreve:
“Algumas pessoas diziam que a princesa estava louca por pretender o impossível. Outras, que a princesa
era sábia porque queria realizar o impossível.”
Disponível em: https://blog.editoratabla.com.br. Acesso em: 7 mai. 2024.
Texto II
Se as coisas são inatingíveis…ora!
Não é motivo para não querê-las…
Que tristes os caminhos, se não fora
A mágica presença das estrelas
Poema extraído do livro Espelho Mágico de Mário Quintana, publicado em 1951.
Disponível em : https://literatura-brasileira.com. Acesso em 7 mai. 2024
Os textos I e II têm em comum o tema da

(A) esperança diante da utopia.
(B) impossibilidade de recriação do mundo.
(C) loucura frente a realidade da vida.
(D) fantasia própria da infância.
(E) ilusão inerente à literatura.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q43',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  2,
  43,
  'ilusão inerente à literatura.

Questão 43
Chamemos de muro
Volto algumas páginas para revisar as palavras que fui acumulando. Antissemitismo, shoah* e lar seguro,
mas também nakba*, casas arrasadas e retornos impossíveis. Silêncio. Direitos. Despejo. Destruição.
Combatentes legais. Terrorismo. Nesse ponto crítico do planeta, cada palavra ativa ecos de ressonâncias
imprevisíveis e perigosas. Em uma nova página em branco escrevo uma daquelas palavras complicadas –
m u r o – com plena certeza de que preferir, ou proferir, este substantivo indica uma posição política. Dizer
muro é reduzir a quatro letras uma quilométrica barreira de concreto, alta, lisa, cinzenta, que às vezes é
uma cerca de arame farpado, que em alguns trechos está eletrificada: menos para eletrocutar do que para
indicar a presença de um corpo inimigo. A palavra muro exige a quem a enuncia complementar seu uso
com os verbos cercar e confinar e obstruir. Barreira de segurança ou simplesmente cerca divisória situa
semanticamente quem usa estes termos do outro lado do conflito; então não se trata mais que de separar
ou proteger Israel dos árabes. A escolha não é neutra. Não pode ser. Nessa região não existe neutralidade.
Não é inofensiva, tampouco, a política do muro.
*Shoah: catástrofe em hebraico; *nakba: catástrofe em árabe
MERUANE, Lina. Tornar-se Palestina. Belo Horizonte, MG: Relicário, 2019
Considerando as ideias desse texto, podemos afirmar que

(A) o uso das palavras no discurso é apenas uma questão de gosto.
(B) a autora tinha o hábito despretensioso de anotar palavras.
(C) das palavras acumuladas, somente muro tem conotação política.
(D) a autora, ao sondar o uso da linguagem, marca sua posição política.
(E) as palavras cerca divisória e muro têm a mesma conotação política.
“(...) a simples gramaticalidade, o simples fato de algumas palavras se entrosarem segundo a sintaxe de
uma língua para tentar comunicação não é condição suficiente para lhes garantir inteligibilidade (...)”',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q44',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  2,
  44,
  'as palavras cerca divisória e muro têm a mesma conotação política.
“(...) a simples gramaticalidade, o simples fato de algumas palavras se entrosarem segundo a sintaxe de
uma língua para tentar comunicação não é condição suficiente para lhes garantir inteligibilidade (...)”
GARCIA, Othon M. Comunicação em prosa moderna. Rio de Janeiro: Editora FGV, 2010.
Exemplificando as palavras acima, uma das seguintes frases apresenta incoerência pela subversão da
ordem das ideias. É o caso de:

(A) Apesar do progresso feito em diferentes regiões do mundo, os resultados em termos de decolonização
ainda são limitados.
(B) Porque viu o que viu e como viu, Bartolomeu não se calou.
(C) Apesar dos conflitos ideológicos, raciais e religiosos que marcam inconfundivelmente as relações entre
os indivíduos dos dias de hoje, é extraordinário o progresso alcançado pelos meios de comunicação.
(D) No sistema capitalista neoliberal, a educação carece de sentido de serviço à sociedade e à humanidade,
porém se subordina aos interesses do poder econômico.
(E) Embora haja um pensamento comum de que os brasileiros deveriam ser os responsáveis pela
preservação da Amazônia, a floresta é um bem comum não só do Brasil, mas também da América
Latina e da humanidade.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q45',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  2,
  45,
  'Embora haja um pensamento comum de que os brasileiros deveriam ser os responsáveis pela
preservação da Amazônia, a floresta é um bem comum não só do Brasil, mas também da América
Latina e da humanidade.
Questão 44

Questão 45 Questão 46
América Latina é uma definição geográfica e
política inventada por europeus a partir do século
XV. Ao mesmo tempo que define a localização
geográfica dos vinte países, que possuem idioma
derivado do latim e que ocupam uma determinada
faixa territorial, também define o lugar periférico
desse território na economia capitalista. Portanto
a origem dessa definição é eurocêntrica.
Renata Andrade. In: Agenda Mundial
Lationoamericana, 2024: descolonizar
o mundo e a vida: missão libertadora.
(fragmento)
A função de linguagem predominante no texto é a

(A) poética, pois evidência a construção artística
do texto, um modo diferente de dizer.
(B) referencial, pois apresenta fatos e informações
sobre um determinado acontecimento do
mundo real.
(C) conativa, pois incentiva o leitor a fazer algo, a
tomar uma atitude em relação a determinado
fato.
(D) fática, pois seu objetivo principal é testar o
canal de comunicação entre o emissor e o
receptor.
(E) metalinguística, pois, centrada no código
linguístico, a linguagem utilizada explica a
própria linguagem.
Leia o fragmento a seguir.
“Ouvi dizer que é cada vez maior o número de
pessoas que se conhecem pela Internet e acabam
casando ou vivendo juntas uma semana depois. As
conversas por computador são, necessariamente,
sucintas e práticas, e não permitem namoros
longos, ou qualquer tipo de aproximação por
etapas. Estamos longe, por exemplo, do tempo em
que as pessoas se viam numa quermesse de igreja
e se mandavam recados pelo alto-falante. Como as
quermesses eram anuais, elas só se falavam uma
vez por ano, e sempre pelo alto-falante. Quando
finalmente se aproximavam, eram mais dois anos
de namoro e um de noivado, e só na noite de
núpcias, imagino, ficavam íntimos, e mesmo assim
acho que o vovô dizia: “Com licença”.”',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q46',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  2,
  46,
  'metalinguística, pois, centrada no código
linguístico, a linguagem utilizada explica a
própria linguagem.
Leia o fragmento a seguir.
“Ouvi dizer que é cada vez maior o número de
pessoas que se conhecem pela Internet e acabam
casando ou vivendo juntas uma semana depois. As
conversas por computador são, necessariamente,
sucintas e práticas, e não permitem namoros
longos, ou qualquer tipo de aproximação por
etapas. Estamos longe, por exemplo, do tempo em
que as pessoas se viam numa quermesse de igreja
e se mandavam recados pelo alto-falante. Como as
quermesses eram anuais, elas só se falavam uma
vez por ano, e sempre pelo alto-falante. Quando
finalmente se aproximavam, eram mais dois anos
de namoro e um de noivado, e só na noite de
núpcias, imagino, ficavam íntimos, e mesmo assim
acho que o vovô dizia: “Com licença”.”
VERÍSSIMO, Luís Fernando. Comédias
para se ler na escola. Rio de Janeiro:
Objetiva, 2001.
No fragmento acima, as palavras destacadas
classificam-se, respectivamente, como

(A) pronome relativo; conjunção integrante;
conjunção subordinativa causal; conjunção
subordinativa temporal.
(B) conjunção integrante; conjunção integrante;
conjunção subordinativa comparativa;
conjunção subordinativa temporal.
(C) conjunção integrante; pronome relativo;
conjunção subordinativa causal; conjunção
subordinativa temporal.
(D) pronome relativo; pronome relativo; conjunção
subordinativa causal; conjunção subordinativa
temporal.
(E) pronome relativo; conjunção coordenativa
explicativa; conjunção subordinativa causal;
conjunção subordinativa temporal.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q47',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  2,
  47,
  'pronome relativo; conjunção coordenativa
explicativa; conjunção subordinativa causal;
conjunção subordinativa temporal.

Questão 47
Partilhar
Ana Vitória & Rubel
Se for preciso, eu pego um barco
Eu remo por seis meses como peixe, pra te ver
Tão pra inventar um mar grande o bastante
Que me assuste e que eu desista de você
Se for preciso eu crio alguma máquina
Mais rápida que a dúvida, mais súbita que a lágrima
Viajo a toda força e num instante de saudade e dor
Eu chego pra dizer que eu vim te ver
Eu quero partilhar, eu quero partilhar
A vida boa com você
Eu quero partilhar, eu quero partilhar
A vida boa com você
[…]
Se for preciso, eu giro a Terra inteira
Até que o tempo se esqueça
De ir pra frente e volte atrás milhões de anos
Quando todos continentes se encontravam
Pra que eu possa caminhar até você
[…]
Também perdi o meu rumo
Até o meu canto ficou mudo
E eu desconfio que esse mundo já não seja tudo aquilo
Mas não importa, a gente inventa a nossa vida
E a vida é boa com você
[…]
Eu quero partilhar, eu quero partilhar
A vida boa com você
Eu quero partilhar, eu quero partilhar
A vida boa com você
A respeito da letra da música, analise as afirmativas.
I . Há um desejo intenso de superar qualquer obstáculo para ficar ao lado da pessoa amada.
II . O verdadeiro amor é capaz de resistir ao tempo e se fortalecer com a distância.
III . Apesar das dificuldades, é muito importante ter alguém com quem se possa compartilhar os desafios e
as alegrias da vida.
É correto apenas o que se afirma em

(A) III.
(B) I e II.
(C) I e III.
(D) II e III.
(E) I, II e III.

Texto 1',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q48',
  'linguagens',
  'Literatura',
  'Literatura',
  2024,
  2,
  48,
  'I, II e III.

Texto 1
Banzo de Benguela, benguelê. Saudade das terras livres e férteis do longínquo reino africano. Esta é
uma das possíveis origens etimológicas da palavra benguelê, entendida aqui como a fusão de Benguela,
denominação de uma região situada ao sudoeste de Angola, com o fonema lê − em quimbundo, nostalgia,
banzo, saudade. (...)
O processo gradativo de desconstrução da forma e edificação de uma sintaxe própria a partir de elementos
extraídos dos bailados populares brasileiros que, desde o início da década, vem marcando a escritura
coreográfica de Rodrigo Pederneiras, parece ter chegado em Benguelê a um lugar onde os traços da escola
francesa simplesmente desaparecem da vista do espectador. Entre marcações de pé, de pélvis, de ombro,
muita mão no quadril e remelexo de cintura, não se consegue divisar um lapso sequer de movimento que
denuncie a presença da técnica clássica, sem a qual os vinte bailarinos da companhia mineira de dança
seriam incapazes de executar a intrincada partitura de corpos construída por Rodrigo sobre a música de
João Bosco. A ocupação do espaço é no mais das vezes anárquica, frenética, enquanto a gradação dos
movimentos vai do festivo ao processional ou ritualístico, com a formação recorrente de figuras humanas
vergadas pelo tempo e de imagens animalizadas
Disponível em: < https://grupocorpo.com.br/wp-content/uploads/2020/09/release_Benguele.pdf>. Acesso em: 20
mai. 2024.
Texto 2
Disponível em: <https://culturalizabh.com.br/index.php/2018/04/19/grupo-corpo-danca-sinfonica-e-benguele/>.
Acesso em: 20 mai. 2024.
De acordo com a descrição sintética do espetáculo Benguelê, no texto e na imagem, podemos dizer que a
“escritura coreográfica” expressa

(A) ruptura entre o balé clássico e o moderno.
(B) reelaboração dos extintos ritmos afro-brasileiros.
(C) crítica à desarmonia própria das danças tribais.
(D) evocação dos ritmos afro-brasileiros.
(E) contraste entre danças tribais e modernas.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q50',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  2,
  50,
  'I, II e III.

A Vida é Selvagem
Por Ailton Krenak
13/12/2022
A vida é selvagem. Esse é um elemento essencial
para um pensamento que tem me provocado: como
a ideia de que a vida é selvagem poderia incidir
sobre a produção do pensamento urbanístico hoje?
É uma convocatória a uma rebelião do ponto de
vista epistemológico, de colaborar com a produção
de vida. Quando falo que a vida é selvagem, quero
chamar a atenção para uma potência de existir
que tem uma poética esquecida, abandonada
pelas escolas, formadoras de profissionais que
perpetuam a lógica de que a civilização é urbana,
de que tudo fora das cidades é bárbaro, primitivo
– e que a gente pode tacar fogo.
Como atravessar o muro das cidades? Quais
possíveis implicações poderiam existir entre
comunidades humanas que vivem na floresta e as
que estão enclausuradas nas metrópoles? Pois se
a gente conseguir fazer com que continue existindo
florestas no mundo, existirão comunidades dentro
delas. Eu vi um número que a World Wide Fund for
Nature (WWF) publicou em um relatório, dizendo
que 1,4 bilhão de pessoas no mundo dependem
da floresta, no sentido de ter uma economia ligada
a ela. Não é a turma das madeireiras, não: é uma
economia que supõe que os humanos que vivem
ali precisam de floresta para viver. [...]
Aí eu me pergunto: como fazer a floresta
existir em nós, em nossas casas, em nossos
quintais? Podemos provocar o surgimento de
uma experiência de florestania começando por
contestar essa ordem urbana sanitária ao dizer:
eu vou deixar o meu quintal cheio de mato, quero
estudar a gramática dele. Como eu acho no meio
do mato um ipê, uma peroba rosa, um jacarandá?
E se eu tivesse um buritizeiro no quintal?
Temos que parar com essa fúria de meter asfalto
e cimento em cima de tudo. [...]
Disponível em: <https://www.amazonialatitude.
com/2022/12/13/a-vida-e-selvagem/>. Acesso
em: 26 abr. 2024.
Texto para as questões 50 e 51. Questão 50
Questão 51
O texto de Ailton Krenak possui o principal objetivo
de

(A) informar sobre a grandiosidade das zonas
urbanas brasileiras.
(B) defender a produção de vida e a potência do
existir.
(C) defender as florestas e as experiências
florestais.
(D) informar sobre a relação entre economia e
meio ambiente.
(E) lançar a ideia de que toda civilização é rural.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q51',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2024,
  2,
  51,
  'lançar a ideia de que toda civilização é rural.
Em “Pois se a gente conseguir fazer com que
continue existindo florestas no mundo, existirão
comunidades dentro delas”, o termo destacado
pode ser substituído, sem prejuízo de sentido, por

(A) contudo.
(B) então.
(C) porque.
(D) conforme.
(E) conquanto.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q52',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2024,
  2,
  52,
  'não há relação de sentido entre o título do
poema e os versos “Quando se vê, já são
6 horas: há tempo…/ Quando se vê, já é
6ª-feira…/Quando se vê, passaram 60 anos!”.
Questão 52
Após a leitura da charge, analise as afirmativas.
I . O uso social da tecnologia apresenta uma
distorção entre fala e ação.
II . A charge expõe os benefícios da Internet.
III . Expressa uma crítica por meio de ironias.
IV . Em “E NÃO HÁ COVARDIA / Nova mensagem:
‘Eu não te amo mais”, temos uma crítica à
indiferença presente nas relações humanas.
É correto apenas o que se afirma em

(A) I e II.
(B) I e III.
(C) II, III e IV.
(D) I, III e IV.
(E) I, II, III e IV.
,',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q53',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  2,
  53,
  'conquanto.

Questão 53
Seiscentos e Sessenta e Seis
A vida é uns deveres que nós trouxemos para
fazer em casa.
Quando se vê, já são 6 horas: há tempo…
Quando se vê, já é 6.ª feira…
Quando se vê, passaram 60 anos…
Agora, é tarde demais para ser reprovado…
E se me dessem – um dia – uma outra oportunidade,
eu nem olhava o relógio.
seguia sempre, sempre em frente …
E iria jogando pelo caminho a casca dourada e
inútil das horas.
Mário Quintana
Acerca da poética de Quintana, é coerente afirmar
que

(A) a vida é vivida de modo intenso, sem
urgências.
(B) a sua ideia central gira em torno da condição
humana e da passagem inevitável do tempo.
(C) a efemeridade da vida é um fator positivo
ao sujeito moderno e à realização de seus
deveres.
(D) o ritmo inevitável do tempo é um adjuvante
a um viver em potencial.
(E) não há relação de sentido entre o título do
poema e os versos “Quando se vê, já são
6 horas: há tempo…/ Quando se vê, já é
6ª-feira…/Quando se vê, passaram 60 anos!”.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q54',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2024,
  2,
  54,
  'I, II, III e IV.
,

Questão 54
Borboletas
Borboletas me convidaram a elas.
O privilégio insetal de ser uma borboleta me atraiu.
Por certo eu iria ter uma visão diferente dos homens e das coisas.
Eu imaginava que o mundo visto de uma borboleta seria, com certeza,
um mundo livre aos poemas.
Daquele ponto de vista:
Vi que as árvores são mais competentes em auroras do que os homens.
Vi que as tardes são mais aproveitadas pelas garças do que pelos homens.
Vi que as águas têm mais qualidade para a paz do que os homens.
Vi que as andorinhas sabem mais das chuvas do que os cientistas.
Poderia narrar muitas coisas ainda que pude ver do ponto de vista de
uma borboleta.
Ali até o meu fascínio era azul.
Disponível em: <https://poetisarte.com/autores/manoel-de-barros/borboletas/>. Acesso em: 06 mai. 2024.
Por meio do poema “Borboletas”, Manoel de Barros defende a tese de que

(A) ser borboleta é um grande privilégio por causa de seu mundo azul e de sua poética encantadora.
(B) o mundo das borboletas deve ser um grande alvo dos cientistas devido à sua grandiosidade poética.
(C) o mundo das borboletas é fascinante, repleto de liberdade e leveza; devido a isso, o ser humano precisa
ser repensado a partir da natureza.
(D) a capacidade de voar do homem se assemelha à das borboletas, basta que ele se aproxime mais do
meio ambiente e da riqueza dele.
(E) a sabedoria humana é semelhante à dos recursos naturais diversos.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2024,
  2,
  55,
  'a sabedoria humana é semelhante à dos recursos naturais diversos.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55 Questão 56
No trecho “I won’t eat you then”, a palavra em
destaque pode ser substituída por

(A) tomorrow.
(B) outside.
(C) suddenly.
(D) in that case.
(E) however.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2024,
  2,
  56,
  'however.
Disponível em: @thelifeofsharks no Instagram.
Students cramming for finals can find some
reprieve just by looking outside their windows.
A new study found that birdwatching can reduce
stress and improve the mental health of college
students, especially those most likely to suffer from
mental health issues.
“There has been a lot of research about well-being
coming out through the pandemic that suggests
adolescents and college-aged kids are struggling
the most,” corresponding author Nils Peterson,
professor of forestry and environmental resources
at North Carolina State University, said in a
press release. “Bird watching is among the most
ubiquitous ways that human beings interact with
wildlife globally, and college campuses provide a
pocket where there’s access to that activity even
in more urban settings.”
Disponível em: <https://www.theepochtimes.
com/health/birdwatching-improves-student-
mental-health-study-5644501>. Acesso em:
13 mai. 2024.
Sobre o texto, analise as seguintes afirmativas.
I. Nils Peterson é um professor universitário.
II. Segundo Nils Peterson, observação de aves
esta facilmente disponível nas universidades.
III. O trecho “corresponding author”, no texto,
refere-se ao autor da matéria.
IV. A palavra “ubiquitous” está sendo usada no
sentido de “presente em todo lugar”.
V. A observação de pássaros pode aumentar
as interações sociais dos estudantes.
É correto apenas o que se afirma em

(A) II e III.
(B) I, II e IV.
(C) I, III e IV.
(D) I, II, III e IV
(E) II, III, IV e V.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2024,
  2,
  57,
  'II, III, IV e V.

Questão 57
Your mobile device is ruining your creativity
A paradox of modernity is our best ideas come when offline, yet we rely on digital tools to bring those
ideas to life. This worked fine when we didn’t also try to bring our workstation with us 24/7 via latest gen
smartphone in our pocket, always-on, always at the ready to disrupt deep thoughts and deep work. You''re
not only unproductive on mobile, you''re robbing yourself of the most fertile time for contemplation by being
tethered. The downstream effects of this on your life could not be more simultaneously pronounced and
ignored.
Twitter/X and social media didn’t hijack your attention or life, we had those growing up in the 90s. I was on
forums/boards as a kid instead of TV and it honestly couldn’t have been healthier. Instead of simply being
passively entertained by cable, much of what I learned was directly transferable to what I do by day, and
it might surprise some of you but it was cerebral time spent. But previously, you left that at home and then
went out and connected with others face-to-face without distraction. [...]
There is significant evidence to suggest creativity thrives in moments of solitude and contemplation.
According to a study by HBR, people tend to have their most original ideas when they’re not focused on
their work. This phenomenon, known as ‘incubation,’ is the unconscious processing of information and
problem-solving that occurs when we step away from the task at hand. Taking breaks (without the pings
of work) and allowing the mind to wander enhances creative problem-solving. Thus, it''s safe to say our
most fertile ground for contemplation is when we are offline, away from the constant stream of digital
information. If these breaks involve your mobile device being glued to your face you’re already lost, and are
robbing yourself of perhaps the most critical time for when you are at work and need to deliver something
important and unique.
Disposnível em: <https://www.hottakes.space/p/your-mobile-device-is-ruining-your?s=03>.
Acesso em: 22 mai. 2024.
O problema, de acordo com o autor, se dá pelo uso de

(A) redes sociais durante o trabalho.
(B) celulares durante nosso tempo livre
(C) celulares durante o trabalho
(D) celulares como ferramenta de trabalho
(E) redes sociais durante o tempo livre',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2024,
  2,
  59,
  'a redução proporcional da quantidade do produto dentro de cada embalagem e do seu preço.

Questão 59
Warned
Sylvia Stults
The sands of time have rendered fear
Blue skies on high no longer clear
Stars were bright whence they came
Now dimmed, obscured, pollution''s haze
Crystal clear our waters gleamed
Fish abundant, rivers streamed
Ocean floors sandy white
Now littered, brown, pollution''s plight
Trees towered high above
Trunks baring professed love
Birds chirping from sites unseen
Gone, paper joined pollution''s team
One can''t blame pollution alone
As they say, you reap what you''ve sown
So let us plant a better seed
Tear out old roots, cultivate, weed
Protect what has been given for free
Our waters, skies, wildlife and trees
For once they''re gone, don''t you say
Consider yourself warned of that fatal day
Disponível em: <https://www.familyfriendpoems.com/poem/warned>. Acesso em: 09 mai. 2024.
Nesse poema, a autora Sylvia Stults quer estimular um sentimento de

(A) preocupação ao apresentar contrastes entre cenários antes e após a influência destruidora humana,
resultando em futuro ruim para todos caso nada seja feito para proteger a natureza.
(B) felicidade ao falar de pássaros voando no céu azul, peixes em abundância, árvores marcadas pelo
amor, areia branca nas praias de águas cristalinas, tudo dado de graça pela natureza.
(C) mágoa com a natureza que, frequentemente, é um entrave à evolução humana e ao desenvolvimento
de novas tecnologias, devendo ser superada pelo bem da raça humana.
(D) animação em cuidar da natureza, através do reforço positivo de comportamentos benéficos descritos
com vigor, mas sem nenhuma caracterização de desastres ambientais.
(E) culpa das empresas que poluem rios e lagos, promovem desmatamento e ataques a animais e pessoas.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2024-2_Q60',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2024,
  2,
  60,
  'La casa de Bernalda Alba
Amelia: ¿Has tomado la medicina?
Martirio: ¡Para lo que me va a servir!
Amelia: Pero la has tomado.
Martirio: Yo hago las cosas sin fe, pero como un reloj.
Amelia: Desde que vino el médico nuevo estás más animada.
Martirio: Yo me siento lo mismo.
Amelia: ¿Te fijaste? Adelaida no estuvo en el duelo.
Martirio: Ya lo sabía. Su novio no la deja salir ni al tranco de la calle. Antes era alegre;
ahora ni polvos echa en la cara.
Amelia: Ya no sabe una si es mejor tener novio o no.
Martirio: Es lo mismo.
Amelia: De todo tiene la culpa esta crítica que no nos deja vivir. Adelaida habrá pasado
mal rato.
La casa de Bernalda Alba, Dominio Público, pág.11.
A respeito das semelhanças entre os termos sublinhados, é correto afirmar que são verbos no

(A) indicativo e conjugados na segunda pessoa do plural.
(B) subjuntivo e conjugados na primeira pessoa do plural.
(C) futuro e conjugados na terceira pessoa do plural.
(D) condicional e conjugados na terceira pessoa do singular.
(E) pretérito e conjugados na segunda pessoa do singular.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q41',
  'linguagens',
  'Artes',
  'Artes',
  2025,
  1,
  41,
  'Primeiros erros (Chove)
Canção de Capital Inicial
Composição: Kiko Zambianchi
Meu caminho é cada manhã
Não procure saber onde vou
Meu destino não é de ninguém
Eu não deixo os meus passos no chão
Se você não entende, não vê
Se não me vê, não entende
Não procure saber onde estou
Se o meu jeito te surpreende
Se o meu corpo virasse sol
Minha mente virasse sol
Mas só chove e chove
Chove e chove
Se um dia eu pudesse ver
Meu passado inteiro
E fizesse parar de chover
Nos primeiros erros, oh
O meu corpo viraria sol
Minha mente viraria...
Mas só chove e chove
Chove e chove
[...]
Chove e chove, oh
Chove e chove, oh
Chove e chove
A respeito da letra da música “Primeiros erros”,
analise as afirmativas a seguir.
I. Inicialmente, o eu lírico se mostra uma pessoa
livre que não deseja firmar compromisso com
qualquer pessoa.
II. Há um personagem consciente dos seus erros,
mas que não se arrepende em momento algum.
III. Há um personagem que deseja ser
compreendido e que quer se reconciliar com
o passado, corrigindo os seus erros, mas
percebe que, infelizmente, isso não é mais
possível.
É correto apenas o que se afirma em

(A) I e II.
(B) II e III.
(C) I e III.
(D) I.
(E) III.

27 UNIFoR – P r o c esso seletivo 2025.1 - M edicina',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q42',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2025,
  1,
  42,
  'III.

27 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 42
Disponível em: <https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlFxc912b9BtilsoQcuydZvexRomvGb0N
9sw&s>. Acesso em: 30 set. 2024.
Com base a leitura da tirinha, é possível concluir que Calvin

(A) deseja participar das eleições porque está preocupado com o futuro das crianças.
(B) faz uma reflexão sobre a falta de políticas públicas voltadas para as crianças.
(C) é egocêntrico e está preocupado apenas com o seu bem-estar.
(D) faz uma crítica ao governo, que não incentiva a participação de crianças na política.
(E) está se sentindo injustiçado por ser criança e não ganhar um pedaço maior do bolo.
A onda
a onda anda
aonde anda
a onda?
a onda ainda
ainda onda
ainda anda
aonde?
aonde?
a onda a onda',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q43',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2025,
  1,
  43,
  'está se sentindo injustiçado por ser criança e não ganhar um pedaço maior do bolo.
A onda
a onda anda
aonde anda
a onda?
a onda ainda
ainda onda
ainda anda
aonde?
aonde?
a onda a onda
BANDEIRA, Manuel. Estrela da vida inteira.4.ed. Rio de Janeiro, J. Olympio, 1973. p.286.
Nesse poema de Manuel Bandeira, percebe-se o uso de qual figura de linguagem?

(A) Metáfora.
(B) Pleonasmo.
(C) Assonância.
(D) Polissíndeto.
(E) Onomatopeia.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q44',
  'linguagens',
  'Literatura',
  'Literatura',
  2025,
  1,
  44,
  'Onomatopeia.
Questão 43

Questão 44
Questão 45
Questão 46
Não se irrite o leitor com esta confissão. Eu sei bem
que, para titilar-lhe os nervos da fantasia, devia
padecer um grande desespero, derramar algumas
lágrimas, e não almoçar. Seria romanesco; mas não
seria biográfico. A realidade pura é que almocei,
como nos demais dias…
ASSIS, Machado de. Memórias Póstumas
de Brás Cubas. São Paulo: Scipione, 2004.
p.114.
A obra literária Memória Póstumas de Brás Cubas
pertence à escola literária Realismo. Como
característica dessa escola, tem-se

(A) a crítica à falsa moral.
(B) o uso da subjetividade.
(C) o fluir de imagens do inconsciente.
(D) a mulher quase como um ser divino.
(E) a musicalidade como recurso poético.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q45',
  'linguagens',
  'Artes',
  'Artes',
  2025,
  1,
  45,
  'a musicalidade como recurso poético.
Não posso escrever enquanto estou ansiosa ou
espero soluções porque em tais períodos faço tudo
para que as horas passem; e escrever é prolongar
o tempo, é dividi-lo em partículas de segundos,
dando a cada uma delas uma vida insubstituível.
LISPECTOR, Clarice. A hora da estrela. Rio
de Janeiro: Rocco, 1977.
Segundo a leitura do trecho acima de Clarice
Lispector, podemos inferir que

(A) para a autora, escrever é tido como algo banal.
(B) para Clarice Lispector, escrever faz com que
ela trabalhe depressa.
(C) a ansiedade faz com que a autora queira que
o tempo passe depressa.
(D) Clarice Lispector prefere escrever quando
está esperando alguma solução.
(E) para a autora, o ato de escrever não pode
ser dividido em momento algum.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q46',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2025,
  1,
  46,
  'para a autora, o ato de escrever não pode
ser dividido em momento algum.
Disponível em: <https://www.culturagenial.
com/abaporu/>. Acesso em: 29 set. 2024.
Tarsila do Amaral presenteou seu marido, Oswald
de Andrade, com a tela “Abaporu”. Analise as
afirmativas a seguir a respeito dessa obra.
I. Na tela “Abaporu”, há uma crítica à sociedade
da época em que a obra foi lançada.
II. A obra “Abaporu” não está ligada ao movimento
antropofágico.
III. Tarsila do Amaral retrata um homem satisfeito
com sua realidade de vida.
IV. Na obra “Abaporu”, Tarsila do Amaral utiliza
um recurso denominado gigantismo presente
também em outras obras dela.
É correto apenas o que se afirma em

(A) I e IV.
(B) II e III.
(C) I, II e III.
(D) I, II e IV.
(E) I, II, III e IV.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q47',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  1,
  47,
  'I, II, III e IV.

Questão 47
Entre os reis gregos que sitiaram Tróia estava
Ulisses, o mais astuto de todos eles. Ele inventou
uma artimanha espertíssima, para que finalmente
os gregos vencessem os troianos.
Fez que os gregos construíssem um enorme
cavalo de madeira e no interior dele acomodaram
os guerreiros mais valentes, inclusive Ulisses.
Puseram o cavalo em frente aos portões de Tróia,
como se fosse um presente.
Depois, começaram a se retirar, embarcando
inclusive nos seus navios.
Os troianos, vendo aquilo, acreditaram que os
gregos tivessem desistido da guerra e que o
presente fosse uma prova disso.
O cavalo era tão grande, que não passava pelos
portões da cidade. Então, embriagados com a ideia
de que a guerra tinha finalmente acabado, alguns
troianos resolveram derrubar uma parte da muralha
para poder levar o cavalo para dentro da cidade.
ROCHA, Ruth. Odisseia. São Paulo:
Companhia das letras, 2000
A palavra “que” pode desempenhar diferentes
funções. Assinale a alternativa em que ela está
corretamente classificada.

(A) “Entre os reis gregos que sitiaram Tróia estava
Ulisses ...” – Conjunção integrante.
(B) Fez que os gregos construíssem um enorme
cavalo de madeira ... – Pronome relativo.
(C) “Os troianos, vendo aquilo, acreditaram que
os gregos tivessem desistido da guerra ...” –
Conjunção subordinativa causal
(D) “O cavalo era tão grande, que não passava
pelos portões da cidade.” – Conjunção
subordinativa consecutiva.
(E) “Então, embriagados com a ideia de que
a guerra tinha finalmente acabado ...” –',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q48',
  'linguagens',
  'Literatura',
  'Literatura',
  2025,
  1,
  48,
  '“Então, embriagados com a ideia de que
a guerra tinha finalmente acabado ...” –
Conjunção subordinativa comparativa.

NO CEMITÉRIO DE PULIANAS
Um dia, há talvez sete ou oito anos, procurou-nos, a Pilar e a mim um leonês chamado Emílio Silva, pedindo
apoio para a empresa a que se propunha meter ombros, a de encontrar o que ainda restasse do seu avô,
assassinado pelos franquistas no princípio da guerra civil. Pedia-nos apoio moral, nada mais. Sua avó havia
manifestado o desejo de que os ossos do avô fossem recuperados e recebessem digna sepultura. Mais que
como o desejo de uma anciã inconformada, Emílio Silva tomou essas palavras como uma ordem que seria
seu dever cumprir, acontecesse o que acontecesse. Este foi o primeiro passo de um movimento coletivo que
se espalhou por toda a Espanha: recuperar das fossas e barrancos, onde haviam sido enterradas, as dezenas
de milhares das vítimas do ódio fascista, identificá-las e entregá-las às famílias. Uma tarefa imensa que não
encontrou só apoios, basta recordar os contínuos esforços da direita política e sociológica espanhola para
travar o que já era uma realidade exaltante e comovedora, erguer da terra escavada e removida os restos
daqueles que haviam pago com a vida a fidelidade às suas ideias e à legalidade republicana. Permita-se-me
que deixe aqui, como simbólica vénia a quantos se têm dedicado a este trabalho, o nome de Ãngel del Río,
um cunhado meu que a ele tem dado o melhor do seu tempo, incluindo dois livros de investigação sobre os
desaparecidos e os represaliados.
Era inevitável que o resgate dos restos de Frederico García Lorca, enterrado como milhares de outros no
barranco de Viznar, na província de Granada, se tivesse convertido rapidamente em autêntico imperativo
nacional. Um dos maiores poetas de Espanha, o mais universalmente conhecido, está ali, naquele páramo,
aliás em um lugar acerca do qual existe praticamente a certeza de ser a fossa onde jaz o autor do Romanceiro
gitano, junto com três outros fuzilados, um professor primário chamado Dióscolo Galindo e dois bandarilheiros
anarquistas, Joaquín Arcollas Cabezas e Francisco Galadí Melgar. Estranhamente, porém, a família de García
Lorca sempre se opôs a que se procedesse a exumação. Os argumentos alegados relacionavam-se, todos
eles, em maior ou menor grau, com questões que podemos classificar de decoro social, como a curiosidade
malsã dos meios de comunicação social, razões sem dúvida respeitáveis, mas que, permito-me dizê-lo,
perderam hoje peso perante a simplicidade com que a neta de Dióscolo Galindo respondeu quando, em
entrevista numa estação de rádio, lhe perguntaram aonde levaria os restos do seu avô, se viessem a ser
encontrados: “Ao cemitério de Pulianas”. Há que esclarecer que Pulianas, na província de Granada, é a
aldeia onde Dióscolo Galindo trabalhava e a sua família continua a morar. Só as páginas dos livros se viram,
as da vida não.
SARAMAGO, José. Caderno. São Paulo: Companhia das Letras, 2023, pág. 24/25.
Esse texto faz parte de um blog para o qual José Saramago enviava “breves prosas”. Sobre a argumentação
informal presente em quase toda conversa, podemos afirmar que, nesse texto

(A) o autor pretende convencer o leitor sobre a importância da exumação dos restos do poeta García Lorca.
(B) o autor apenas relata a empresa em que se envolveu, mostrando a importância de seu prestígio para
a realização de projetos familiares de resgate dos corpos dos mártires.
(C) o autor pretende persuadir a família do poeta García Lorca a proceder a exumação, refutando os
argumentos de decoro social.
(D) o autor dá a conhecer a razão que moldou sua opinião sobre a exumação, resumida e expressa em
forma de argumento na última frase.
(E) o autor considera os argumentos da família do célebre poeta sobre a exumação inabaláveis e, por isso,
adere inteiramente a eles.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q49',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  1,
  49,
  'o autor considera os argumentos da família do célebre poeta sobre a exumação inabaláveis e, por isso,
adere inteiramente a eles.
Questão 48

31 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 49
Malandragem
Cássia Eller
Quem sabe eu ainda sou uma garotinha
Esperando o ônibus da escola, sozinha
Cansada com minhas meias três quartos
Rezando baixo pelos cantos
Por ser uma menina má
Quem sabe o príncipe virou um chato
Que vive dando no meu saco
Quem sabe a vida é não sonhar
Eu só peço a Deus
Um pouco de malandragem
Pois sou criança
E não conheço a verdade
Eu sou poeta e não aprendi a amar
Eu sou poeta e não aprendi a amar
(...)
Disponível em: <https://www.letras.mus.br/cassia-eller/12559/>.
Acesso em: 30 set. 2024.
Releia o seguinte verso da letra: “Quem sabe o príncipe virou um chato”. Assinale a alternativa em que o
verbo destacado apresenta a mesma predicação do verbo “virar”.

(A) “meu riso é tão feliz contigo / o meu melhor amigo é o meu amor” (Marisa Monte – “Velha infância)
(B) “Tudo de bom que você me fizer, faz minha rima ficar mais rara” (Caetano Veloso – “Sorte”)
(C) “Deus me proteja de mim / E da maldade de gente boa” (Chico César – “Deus me proteja”)
(D) “Investe em mim / Aposta tudo em mim” (Jonas Esticado – “Investe em mim”)
(E) “E no meio de tanta gente eu encontrei você” (Marisa Monte – “Não vá embora”)

32 UNIFoR – P r o c esso seletivo 2025.1 - M edicina',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q50',
  'linguagens',
  'Literatura',
  'Literatura',
  2025,
  1,
  50,
  '“E no meio de tanta gente eu encontrei você” (Marisa Monte – “Não vá embora”)

32 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 50
Texto 1
Em verdade, era curioso. Aquelas grandes
braçadas de mato brotando do lodo, e postas ali
ao pé da cara de Rubião, davam-lhe vontade
de ir ter com elas. Tão perto da rua! (...) passou
o Saco dos Alferes, passou a Gamboa, parou
diante do cemitério dos ingleses com seus velhos
sepulcros trepados pelo morro, e afinal chegou
à Saúde. Viu ruas esguias, outras em ladeiras,
casas apinhadas ao longe e no alto dos morros,
becos, muita casa antiga, algumas do tempo do rei,
comidas, gretadas, estripadas, o caio encardido e a
vida lá dentro. E tudo isso lhe dava uma sensação
de nostalgia. Nostalgia de farrapo, da vida escassa,
acalcanhada e sem vexame. Mas durou pouco; o
feiticeiro que andava nele transformou tudo. Era
tão bom não ser pobre!
ASSIS, Machado de. Quincas Borba. São
Paulo:Penguin Classics Companhia das
Letras, 2012, p. 181 /182
Texto 2
Gente Humilde
Tem certos dias
Em que eu penso em minha gente
E sinto assim
Todo o meu peito se apertar
Porque parece
Que acontece de repente
Feito um desejo de eu viver
Sem me notar
Igual a como
Quando eu passo no subúrbio
Eu muito bem
Vindo de trem de algum lugar
E aí me dá
Como uma inveja dessa gente
Que vai em frente
Sem nem ter com quem contar
São casas simples
Com cadeiras na calçada
E na fachada
Escrito em cima que é um lar
Pela varanda
Flores tristes e baldias
Como a alegria
Que não tem onde encostar
E aí me dá uma tristeza
No meu peito
Feito um despeito
De eu não ter como lutar
E eu que não creio
Peço a Deus por minha gente
É gente humilde
Que vontade de chorar.
Garoto / Vinicius de Moraes / Chico Buarque
Disponível em: <https://www.chicobuarque.
com.br>. Acesso em: 3 out. 2024.
Os dois textos, o primeiro, um fragmento de
romance, e o segundo, a letra de uma canção,
expõem o olhar do narrador e do eu-lírico,
respectivamente, para uma paisagem. Sobre esses
dois textos, podemos afirmar que, entre eles,

(A) há uma semelhança temática na descrição das
paisagens, ambas marcadas pela pobreza.
(B) há uma semelhança quanto à subjetividade
do narrador e do eu-lírico diante da paisagem.
(C) a semelhança consiste na escolha de palavras
para dissertar sobre o subúrbio da cidade.
(D) a semelhança reside no fato de ambos os
textos pertencerem ao mesmo gênero textual.
(E) a semelhança reside na denúncia do descaso
político com os que moram nas periferias.

33 UNIFoR – P r o c esso seletivo 2025.1 - M edicina',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q51',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2025,
  1,
  51,
  'esse, seus.
Exausto
Eu quero uma licença de dormir
perdão para descansar horas a fio,
sem ao menos sonhar
a leve palha de um pequeno sonho.
Quero o que antes da vida
foi o profundo sono das espécies,
a graça de um estado.
Semente.
Muito mais que raízes.
PRADO, Adélia. Bagagem. Rio de Janeiro:
Record, 2014. Pág. 26.
Evidencia-se, nesse texto, a função da linguagem

(A) metalinguística, pois, centrada no código
linguístico, a linguagem utilizada explica a
própria linguagem.
(B) poética, pois coloca em evidência a construção
artística do texto, um modo diferente de dizer.
(C) conativa, pois incentiva o leitor a fazer algo, a
tomar uma atitude em relação a determinado
fato.
(D) fática, pois seu objetivo principal é testar o
canal de comunicação entre o emissor e o
receptor.
(E) referencial, pois apresenta fatos e informações
sobre um determinado acontecimento do
mundo real.

34 UNIFoR – P r o c esso seletivo 2025.1 - M edicina',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q52',
  'linguagens',
  'Coesão e coerência',
  'Coesão',
  2025,
  1,
  52,
  'a semelhança reside na denúncia do descaso
político com os que moram nas periferias.

33 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 52 Questão 51
“Se tiver bola, eu dou a entrevista”. Essa foi a
única exigência do nosso companheiro de pelada,
Chico Buarque, numa caminhada entre o metrô e o
campo. Uma bola. E eu acabara de informar que o
dono da redonda não viria à pelada de quarta-feira.
Éramos dez amantes do futebol, órfãos.
Sem saber se esse era um gol de letra dele para
fugir da solicitação de seus parceiros jornalistas,
ou uma última esperança, em forma de pressão,
de não perder a religiosa partida, eu, que não
creio, olhei para o céu e pedi a Deus: uma pelota!
Disponível em: <https://www.chicobuarque.com.br
>. Acesso em: 3 out. 2024 (fragmento).
Assinale a opção em que os termos transcritos do
texto fazem parte de um mesmo mecanismo de
coesão textual, o da substituição.

(A) essa, pelada.
(B) entrevista, exigência.
(C) redonda, pelota.
(D) gol de letra, dele.
(E) esse, seus.
Exausto
Eu quero uma licença de dormir
perdão para descansar horas a fio,
sem ao menos sonhar
a leve palha de um pequeno sonho.
Quero o que antes da vida
foi o profundo sono das espécies,
a graça de um estado.
Semente.
Muito mais que raízes.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q53',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2025,
  1,
  53,
  'referencial, pois apresenta fatos e informações
sobre um determinado acontecimento do
mundo real.

34 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 53 Questão 54
Mais adiante topou com a Benvinda à porta a
regatear com veemência o preço de uma carga
de lenha. O lenhador queria dez tostões; ela não
dava mais de dois cruzados, que o seu dinheiro
não era roubado. E como visse Alípio aproximar-se,
ofereceu nove tostões para acabar com a pendenga.
- Isto é ainda para cozinhar o jantar? perguntou o
bacharel rindo familiarmente.
- O jantar está aqui, disse ela batendo sem-cerimônia
no bucho; mas se quer esperar, apronta-se outro
enquanto o diabo esfrega o olho.
- Muito obrigado, fica para outra vez. E outra coisa:
que é da vizinha?
- Creio que está incomodada; fechou a porta logo
que os meninos saíram.
- Então não teremos o nosso joguinho hoje, sinhá
comadre?
- Sei lá! A vizinha anda assim meia lesa... Decerto
não fui eu quem lhe botou quebranto... Ah!
Meu doutorzinho. Você só veio a esta terra pra
desencabeçar as filhas alheias.
SALES, Antônio. Aves de Arribação.
Fortaleza: Editora UFC, 2024, pág. 163
(fragmento)
O texto apresenta interlocutores de condições
sociais diferentes e assim mais de uma variedade
linguística. Nessa situação de comunicação,
assinale a alternativa que apresenta um desvio
da norma padrão.

(A) “Ah! Meu doutorzinho.”
(B) “Mais adiante topou com a Benvinda à porta..”
(C) “...não fui eu quem lhe botou quebranto...”
(D) “Creio que está incomodada”.
(E) “A vizinha anda assim meia lesa.”',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q54',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  1,
  54,
  '“A vizinha anda assim meia lesa.”
Museu em Olinda reúne coleção de fantoches
tipicamente brasileiros, os mamulengos
Você sabe o que é um mamulengo? Se você
for do Nordeste do país deve saber; se for de
outras regiões, deve conhecê-lo como fantoche.
Mamulengo é um boneco, feito geralmente de
pano e madeira, que pode ser vestido na mão
para fazer teatrinhos. Em Pernambuco, é muito
tradicional e faz parte da cultura popular – tanto
que ganhou um museu especial!
O Espaço Tiridá – Museu do Mamulengo, em
Olinda, reúne uma coleção enorme de fantoches
tipicamente nordestinos de várias épocas. Lá, você
vai encontrar um monte de personagens curiosos
dos teatros populares. Tem, é claro, Lampião e
Maria Bonita; o padre; as carpideiras (que são
pagas para chorar nos enterros dos outros) e o
Tiridá, um rapaz engraçado, que sempre fala em
rima, e dá nome ao museu. São tantos bonecos
interessantes e coloridos que você sai de lá com
vontade de brincar!
Disponível em: <https://acessaber.com.br/
atividades/interpretacao-de-texto-arte-dos-
bonecos-2o-ano-do-ensino-medio/#more-9295.>
Acesso em: 29 set 2024
Após a leitura do texto, analise as afirmativas.
I. O termo “lo”, no primeiro parágrafo, refere-se
à palavra “Nordeste”.
II. O trecho “ganhou um museu especial”, no
primeiro parágrafo, classifica-se como objeto
indireto.
III. O termo “Lá” refere-se ao “Espaço Tiridá –
Museu do Mamulengo, em Olinda”.
IV. O pronome relativo “que” em “que sempre
fala em rima”, no último parágrafo, refere-se
à palavra padre.
É correto apenas o que se afirma em

(A) I.
(B) III.
(C) II e IV.
(D) I, II, III.
(E) II, III e IV.

35 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2025,
  1,
  55,
  'II, III e IV.

35 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
Disponível em: <https://x.com/dinosaurcouch/status/1755328932465820124>. Acesso em: 10 out. 2024.
O principal sentimento expresso pelo dinossauro maior no diálogo é

(A) desprezo por atividades sociais.
(B) desconforto e sensação de isolamento, mesmo na companhia de outros.
(C) alegria ao estar com os amigos.
(D) entusiasmo por sair, mas preferir roupas mais confortáveis.
(E) curiosidade sobre o comportamento das pessoas ao redor.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q56',
  'linguagens',
  'Artes',
  'Artes',
  2025,
  1,
  56,
  'curiosidade sobre o comportamento das pessoas ao redor.

Questão 56
Deadpool & Wolverine review – Marvel’s achingly meta new sequel is going to be huge
Ryan Reynolds and Hugh Jackman’s superhero odd couple are flung together in a gagtastic if sloppy action
comedy that maxes out its 15 certificate
If there’s a more obnoxious film this year, I’ll book myself on an all-expenses trip to “the Void” (a dumping
ground for reject mutants, superheroes and sundry franchise miscellanea, which Deadpool, irreverent scamp
that he is, describes as “a bit Mad Maxy”). This isn’t unexpected. Obviously this movie is obnoxious. It’s
directed by Shawn Levy (Free Guy), whose approach is to deploy cinematic winks and ironic air quotes, and
it stars Ryan Reynolds, who has made a career from walking the precarious line that divides lovable from
punchable. It isn’t even necessarily a bad thing: a film can be obnoxious and simultaneously very funny, and
Deadpool & Wolverine is frequently hilarious. But it’s also slapdash, repetitive and shoddy looking, with an
overreliance on meme-derived gags and achingly meta comic fan in-jokes. It’s going to be huge.
Already paired up in a series of Marvel comic books, Deadpool (Reynolds) and Wolverine (Hugh Jackman)
make for an entertaining, if explosive movie double act. They have plenty in common: both are self-healers,
both have authority issues, both have monster-sized substance abuse problems. But their differences –
slashed, stabbed and punched out in close combat in the back of a Honda minivan – are what gives the film
its juice. And by juice I mean blood; what with the gore and the risque gags, the film earns every last month
of its 15 certificate.
Deadpool and Wolverine are flung together after the timeline of Deadpool’s universe is threatened with abrupt
termination by Mr Paradox (Matthew Macfadyen), a rogue agent of the Time Variance Authority. Since the
death of the Wolverine in Deadpool’s universe is a key factor in its demise, Deadpool goes multiverse-hopping
for a replacement and manages to find the very worst version – a self-loathing, drunken failure. Redemption
beckons, but not before plenty of effects-driven carnage and a run-in with Cassandra (Emma Corrin), the
deranged evil twin of Professor Charles Xavier.
Disponível em: <https://www.theguardian.com/film/article/2024/jul/27/deadpool-wolverine-review-marvel-achingly-
meta-gagfest-is-going-to-be-huge-ryan-reynolds-hugh-jackman-shawn-levy>. Acesso em: 11 out. 2024.
De acordo com o autor, o filme Deadpool & Wolverine pode ser caracterizado como

(A) divertido e impecável em seus efeitos visuais.
(B) monótono, com uma história previsível.
(C) bem-humorado, mas com falhas na execução técnica.
(D) visualmente impressionante, mas sem humor.
(E) inovador e profundo, com uma narrativa complexa.

37 UNIFoR – P r o c esso seletivo 2025.1 - M edicina',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2025,
  1,
  57,
  'inovador e profundo, com uma narrativa complexa.

37 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 57
Disponível em: <https://theawkwardyeti.com/comic/braces/>. Acesso em: 11 out. 2024.
Considerando o uso de can e could no diálogo, assinale a alternativa correta.

(A) Can é usado para expressar uma proibição, enquanto could expressa uma possibilidade.
(B) Ambos os modais são usados para expressar certeza sobre o futuro.
(C) Could é usado para dar permissão e can para prever uma consequência.
(D) Can é usado para expressar uma dúvida e could expressa uma certeza.
(E) Can e could são usados para fazer perguntas diretas sobre as ações dos dentes.

38 UNIFoR – P r o c esso seletivo 2025.1 - M edicina',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2025,
  1,
  58,
  'Can e could são usados para fazer perguntas diretas sobre as ações dos dentes.

38 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 58
Google DeepMind boss wins Nobel for proteins breakthrough
British computer scientist Professor Demis Hassabis has won a share of the Nobel Prize for Chemistry for
“revolutionary” work on proteins, the building blocks of life.
Prof Hassabis, 48, co-founded the artificial intelligence (AI) company that became Google DeepMind.
Professor John Jumper, 39, who worked with Prof Hassabis on the breakthrough, shares the award along
with US-based Professor David Baker, 60.
Proteins are the building blocks of life and are found in every cell in the human body.
Better understanding proteins has driven huge breakthroughs in medicine. It is used in solving antibiotic
resistance and to image enzymes that can decompose plastics.
Prof Hassabis said it was the “honour of a lifetime” to receive the Nobel.
“I’ve dedicated my whole life to working on AI because I believe in its potential to change the world,” he said
in a press conference on Wednesday.
He said the Nobel committee did not have his phone number. Instead they called his wife, but she ignored
the call several times before realising it was a Swedish number and might be important.
He encouraged children to not only play computer games, but also make them, saying that his early gaming
was the gateway to his experimentation with AI.
Speaking about being awarded the prize, Prof John Jumper said it felt “so unreal at this moment” but that
“the prize represents the promise of computational biology”.
But the Nobel committee also struggled to reach him.
“I got a number from a Swedish number and I absolutely could not believe it. I was really hoping it wasn’t a
delivery or something,” he said.
Disponível em: <https://www.bbc.com/news/articles/czrm0p2mxvyo>. Acesso em: 11 out. 2024.
De acordo com o texto, analise as afirmativas a seguir.
I. Professor Demis Hassabis ganhou o Prêmio Nobel de Química pela criação de um novo tipo de antibiótico.
II. Hassabis acredita que os jogos de computador o ajudaram a começar a experimentar com IA.
III. As descobertas de Hassabis foram aplicadas principalmente na indústria de jogos.
IV. As proteínas são essenciais para a vida porque estão presentes em todas as células do corpo humano.
É correto apenas o que se afirma em

(A) III e IV.
(B) I e II.
(C) II e IV.
(D) II e III.
(E) II, III e IV.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2025,
  1,
  59,
  'II, III e IV.

ChatGPT is changing the way we write. Here’s how – and why it’s a problem
Phrases such as “delve into” and “navigate the landscape” seem to feature in everything from social media
posts to news articles and academic publications. They may sound fancy, but their overuse can make a text
feel monotonous and repetitive.
This trend may be linked to the increasing use of generative artificial intelligence (AI) tools such as ChatGPT and
other large language models (LLMs). These tools are designed to make writing easier by offering suggestions
based on patterns in the text they were trained on.
However, these patterns can lead to the overuse of certain stylistic words and phrases, resulting in works that
don’t closely resemble genuine human writing.
Disponível em: <https://theconversation.com/chatgpt-is-changing-the-way-we-write-heres-how-and-why-its-a-
problem-239601>. Acesso em: 03 out. 2024.
De acordo com o texto, o uso de ferramentas de Inteligência Artificial como o ChatGPT na produção de
textos tem

(A) expandido o vocabulário de seus usuários.
(B) reduzido a frequência de erros ortográficos.
(C) criado vícios estilísticos.
(D) dificultado a interpretação de textos complexos.
(E) auxiliado no desenvolvimento dessas ferramentas.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-1_Q60',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  1,
  60,
  '43 UNIFoR – P r o c esso seletivo 2025.1 - M edicina
Questão 60
Disponível em: <https://br.pinterest.com/pin/37014028160409703/>. Acesso em: 06
out. 2024.
Na tirinha de Gaturro, aparecem verbos no presente do subjuntivo, entre eles está o verbo TENER, considerado
um verbo irregular. Assinale a opção em que a sequência apresente somente verbos irregulares.

(A) salir - saber - pedir - partir - ir.
(B) ir - haber - dar - salir - saber.
(C) constatar - vivir - comprender - sacar - pedir.
(D) comprender - hacer - poner - vivir - amar.
(E) venir - haber - partir - leer - trabajar.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q41',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  2,
  41,
  'Leia o texto.
Admirável Chip Novo
(Pitty)
Pane no sistema, alguém me desconfigurou
Aonde estão meus olhos de robô?
Eu não sabia, eu não tinha percebido
Eu sempre achei que era vivo
Parafuso e fluido em lugar de articulação
Até achava que aqui batia um coração
Nada é orgânico, é tudo programado
E eu achando que tinha me libertado
Mas lá vêm eles novamente
Eu sei o que vão fazer
Reinstalar o sistema
Pense, fale, compre, beba
Leia, vote, não se esqueça
Use, seja, ouça, diga
Tenha, more, gaste, viva
Pense, fale, compre, beba
Leia, vote, não se esqueça
Use, seja, ouça, diga
Não, senhor, sim, senhor
Não, senhor, sim, senhor
Pane no sistema, alguém me desconfigurou
Aonde estão meus olhos de robô?
Eu não sabia, eu não tinha percebido
Eu sempre achei que era vivo
Parafuso e fluido em lugar de articulação
Até achava que aqui batia um coração
Nada é orgânico, é tudo programado
E eu achando que tinha me libertado
Mas lá vêm eles novamente
Eu sei o que vão fazer
Reinstalar o sistema
Pense, fale, compre, beba
Leia, vote, não se esqueça
Use, seja, ouça, diga
Tenha, more, gaste, viva
Pense, fale, compre, beba
Leia, vote, não se esqueça
Use, seja, ouça, diga
Não, senhor, sim, senhor
Não, senhor, sim, senhor
Mas lá vêm eles novamente
Eu sei o que vão fazer
Reinstalar o sistema
Disponível em: https://www.letras.com/pitty/admiravel- chip-novo/
Acesso em: 28 Abr 2025.
Sobre a letra da música, analise as afirmativas.
I. A letra da música retrata uma sociedade
que busca informação e não aceita ser
massificada.
II. A letra faz uma crítica à manipulação que a
sociedade sofre.
III. A letra apresenta uma sociedade questionadora
que busca sua própria identidade.
IV. Nos versos “Pane no sistema, alguém me
desconfigurou / aonde estão meus olhos de
robô”, o eu lírico se apresenta como um ser
controlado pela tecnologia.
É correto apenas o que se afirma em

(A) I, III e IV.
(B) I e IV.
(C) II e IV.
(D) III e IV.
(E) I e II.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q42',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2025,
  2,
  42,
  'I e II.

Questão 42
Leia as tirinhas a seguir.
Nas tirinhas I, II e III, temos, respectivamente, as seguintes figuras de linguagem.

(A) Metonímia; onomatopeia; ironia.
(B) Comparação; metáfora; ironia.
(C) Metonímia; onomatopeia; pleonasmo.
(D) Personificação; onomatopeia; ironia.
(E) Eufemismo; hipérbole; antítese.
I.
II.
III.
Quem foi o inteligente
que usou o meu
notebook e apagou tudo
que estava gravados?',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q43',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2025,
  2,
  43,
  'Eufemismo; hipérbole; antítese.
I.
II.
III.
Quem foi o inteligente
que usou o meu
notebook e apagou tudo
que estava gravados?

Questão 43
Certas coisas
(Lulu Santos)
Não existiria som se não houvesse o silêncio
Não haveria luz se não fosse a escuridão
A vida é mesmo assim
Dia e noite, não e sim
Cada voz que canta o amor
Não diz tudo o que quer dizer
Tudo o que cala fala mais alto ao coração
Silenciosamente, eu te falo com paixão
Eu te amo calado
Como quem ouve uma sinfonia
De silêncios e de luz
Nós somos medo e desejo
Somos feitos de silêncio e som
Tem certas coisas que eu não sei dizer
A vida é mesmo assim
Dia e noite, não e sim
Eu te amo calado
Como quem ouve uma sinfonia
De silêncios e de luz
Nós somos medo e desejo
Somos feitos de silêncio e som
Tem certas coisas que eu não sei dizer
E digo
Disponível em: https://www.vagalume.com.
br/lulu-santos/certas-coisas.html. Acesso em: 29 Abr 2025.
Analise as afirmativas a seguir a respeito da letra
da música.
I. A letra é uma reflexão sobre a complexidade
dos sentimentos humanos, especialmente o
amor entre duas pessoas.
II. O autor utiliza a antítese para ilustrar a
dualidade dos sentimentos que, mesmo
opostos, complementam-se.
III. No verso “Tudo que cala fala mais alto ao
coração”, o autor sugere que, muitas vezes,
os sentimentos não podem ser explicados,
apenas sentidos nos gestos, nos olhares, no
silêncio.
IV. Nos versos “A vida é mesmo assim / Dia e
noite, não e sim”, o autor transmite a ideia de
que a vida é feita de contrastes e escolhas
constantes.
Está correto apenas o que se afirma em

(A) I, II, e IV.
(B) I e III .
(C) I e IV.
(D) I, II, III e IV.
(E) I, III e IV.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q44',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  2,
  44,
  'I, III e IV.

Questão 44
Questão de humor
Os gregos acreditavam que problemas mentais eram uma punição divina. Hipócrates, não. Criador dos
conceitos de saúde e doença, o pai da medicina inventou também a teoria humoral – uma primeira reflexão
sobre o que seria a psicologia. Segundo ele, o corpo tinha quatro substâncias que deveriam estar em
harmonia: bile amarela, bile negra, sangue e fleuma. Quando em desequilíbrio, surgiam doenças. A bile
amarela, por exemplo, provocava comportamento raivoso. Já a bile negra, depressão. Para tratar esses
humores, usavam-se laxantes, remédios para vomitar e drenava-se o sangue.
Superinteressante. São Paulo: Abril. Jul. 2019.
Analise as afirmativas a seguir a respeito da classificação sintática dos termos destacados.
I. “... problemas mentais eram uma punição divina.” – Objeto direto.
II. “... o corpo tinha quatro substâncias que deveriam estar em harmonia: bile amarela, bile negra, sangue
e fleuma.” – Aposto.
III. “A bile amarela, por exemplo, provocava comportamento raivoso.” – Complemento nominal.
IV. “... o pai da medicina inventou também a teoria humoral – Adjunto adnominal.
A classificação sintática está correta somente em

(A) I e IV.
(B) II e IV.
(C) I e III.
(D) III e IV.
(E) I, II e IV.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q45',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2025,
  2,
  45,
  'I, II e IV.

Questão 45
Texto 1
“ (...) Só tens uma maneira de tirar o caso a limpo, Qual, Fazeres o que te disse a inquilina do rés do chão
direito, a velha, Mas tento na língua, por favor, É velha, É uma senhora de idade, Deixa-te de hipocrisias,
idade temo-la nós todos, a questão está em saber-se quanta, se é pouca, és novo, se é muita, és velho, o
resto é conversa, (...)”
SARAMAGO, José. Todos os nomes. São Paulo: Companhia das Letras, 2017. Pág. 70
Texto 2
A velhice sofreu uma cirurgia plástica na linguagem
Na semana passada, sugeri a uma pessoa próxima que trocasse a palavra “idosas” por “velhas” em um texto.
E fui informada de que era impossível, porque as pessoas sobre as quais ela escrevia se recusavam a ser
chamadas de “velhas”: só aceitavam ser “idosas”. Pensei: “roubaram a velhice”. As palavras escolhidas
– e mais ainda as que escapam – dizem muito, como Freud já nos alertou há mais de um século. Se
testemunhamos uma epidemia de cirurgias plásticas na tentativa da juventude para sempre (até a morte), é
óbvio esperar que a língua seja atingida pela mesma ânsia. Acho que “idoso” é uma palavra “fotoshopada”
– ou talvez um lifting completo na palavra “velho”. E saio aqui em defesa do “velho” – a palavra e o ser/estar
de um tempo que, se tivermos sorte, chegará para todos.
(...)
Não, eu não sou velho. Sou idoso. Não, eu não moro num asilo. Mas numa casa de repouso. Não, eu
não estou na velhice. Faço parte da melhor idade. Tenho muito medo dos eufemismos, porque eles soam
bem intencionados. São os bonitinhos mas ordinários da língua. O que fazem é arrancar o conteúdo das
letras que expressam a nossa vida. Justo quando as pessoas têm mais experiências e mais o que dizer, a
sociedade tenta confiná-las e esvaziá-las também no idioma.
Disponível em: https://www.geledes.org.br/chamem-de-velha-por-eliane-brum/. Acesso em: 30 Abr 2025 .
Da leitura desses dois textos, podemos afirmar que entre eles há semelhança

(A) há semelhança na abundância argumentativa em defesa do uso da palavra velha.
(B) há uma semelhança de opinião quanto ao uso eufemístico das palavras.
(C) há semelhança na escolha de palavras para dissertar sobre o tema da velhice.
(D) há semelhança no fato de ambos os textos pertencerem ao mesmo gênero textual.
(E) há semelhança de abordagem sobre as dificuldades no processo de envelhecimento.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q46',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2025,
  2,
  46,
  'há semelhança de abordagem sobre as dificuldades no processo de envelhecimento.

Questão 46 Questão 47
Feijoada completa
Chico Buarque de Holanda
Mulher
Você vai gostar
Tô levando uns amigos pra conversar
Eles vão com uma fome que nem me contem
Eles vão com uma sede de anteontem
Salta cerveja estupidamente gelada prum
batalhão
E vamos botar água no feijão
Mulher
Não vá se afobar
Não tem que pôr a mesa, nem dá lugar
Ponha os pratos no chão, e o chão tá posto
E prepare as linguiças pro tiragosto
Uca, açúcar, cumbuca de gelo, limão
E vamos botar água no feijão
Mulher
Você vai fritar
Um montão de torresmo pra acompanhar
Arroz branco, farofa e a malagueta
A laranja-bahia ou da seleta
Joga o paio, carne-seca, toucinho no caldeirão
E vamos botar água no feijão
Mulher
Depois de salgar
Faça um bom refogado, que é pra engrossar
Aproveite a gordura da frigideira
Pra melhor temperar a couve mineira
Diz que tá dura, pendura a fatura no nosso irmão
E vamos botar água no feijão
Disponível em https://www.chicobuarque.
com.br. Acesso em: 1 Maio 2025.
Considerando a qualidade poética das letras das
canções de Chico Buarque, pode-se afirmar que,
apesar de haver marcas formais de receita, esse
texto pode ser considerado poema em função

(A) do conhecimento da arte culinária.
(B) do uso da linguagem expressiva.
(C) da descrição de um ambiente descontraído.
(D) da descrição pormenorizada dos ingredientes.
(E) da identificação de um interlocutor.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q47',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  2,
  47,
  'da identificação de um interlocutor.
Se fizer isso, se cair nessa fraqueza sentimental,
todo o reconhecimento e carinho que sinto por
você neste momento, todo o amor que tenho por
você, vai se transformar – e não te perdoaria por
isso – em profundo desprezo, sentimento por si
só desprezível, que macula tanto a pessoa que o
experimenta quanto aquela de que é objeto.
Acho que nunca escrevi uma frase tão longa. É
tudo. Adeus.
SARR, Mohamed Mbougar. A mais
recôndita memória dos homens. Trad.:
Diogo Cardoso. São Paulo: Fósforo, 2023.
Pág. 336.(fragmento)
Essa “frase tão longa” apresenta enlaces
linguísticos, conferindo-lhe coesão textual. Sobre
sua construção sintática, assinale a alternativa
correta.

(A) Trata-se de uma frase acumulada de orações
coordenadas por conjunções sindéticas.
(B) O período se inicia com a ideia principal
seguida de orações subordinadas adverbiais.
(C) O pronome “isso” na primeira oração tem
função catafórica, ou seja, antecipa o termo
“fraqueza”.
(D) Os elos em “que macula”, “o experimenta”,
“de que é objeto” retomam o mesmo termo.
(E) As duas primeiras orações adjetivas apontam
para o mesmo referente, “reconhecimento e
carinho”.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q48',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2025,
  2,
  48,
  'referencial.
O engenheiro
A luz, o sol, o ar livre
envolvem o sonho do engenheiro.
O engenheiro sonha coisas claras:
superfícies, tênis, um copo de água.
O lápis, o esquadro, o papel;
o desenho, o projeto, o número:
o engenheiro pensa o mundo justo,
mundo que nenhum véu encobre.
(Em certas tardes nós subíamos
ao edifício. A cidade diária,
como um jornal que todos liam,
ganhava um pulmão de cimento e vidro.)
A água, o vento, a claridade
de um lado o rio, no alto as nuvens,
situavam na natureza o edifício
crescendo de suas forças simples.
João Cabral de Melo Neto. In: Obra
completa. © by herdeiros de João Cabral de
Melo Neto. Rio de Janeiro: Nova Aguilar.
Analise as afirmativas a respeito das características
da poesia de João Cabral de Melo Neto.
I. Há nos versos a presença de uma linguagem
prolixa e difusa.
II. Estão presentes no poema o objetivismo
formal e a participação social.
III. Existe no poema tanto um sentimentalismo
fácil quanto um excesso de subjetividade.
IV. Existe uma preocupação do poeta em
construir uma poesia marcada pela precisão
arquitetônica.
É correto apenas o que se afirma em

(A) I e II.
(B) I e III.
(C) II e IV.
(D) I, II e III.
(E) II, III e IV.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q49',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2025,
  2,
  49,
  'As duas primeiras orações adjetivas apontam
para o mesmo referente, “reconhecimento e
carinho”.

Questão 49 Questão 48
Ou fosse pelo inesperado do descobrimento, ou
fosse por uma recordação súbita e desgovernada
das altitudes da Conservatória Geral, ao Sr. José
como que lhe passou uma coisa pela vista, modo
expressivo e corrente de dizer que dispensa, com
comunicativa vantagem, o uso da palavra vertigem
por bocas populares que não nasceram para isso.
SARAMAGO, José. Todos os nomes. São
Paulo: Companhia das Letras, 2017. Pág.
86.
Ao justificar a dispensa do uso da palavra vertigem,
substituindo-a por outro modo de dizer, o autor
utiliza uma função da linguagem centrada no
código linguístico, conhecida como

(A) metalinguística.
(B) poética.
(C) conativa.
(D) fática.
(E) referencial.
O engenheiro
A luz, o sol, o ar livre
envolvem o sonho do engenheiro.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q50',
  'linguagens',
  'Literatura',
  'Literatura',
  2025,
  2,
  50,
  'II, III e IV.

Questão 50 Questão 51
Anita Malfatti. Tropical, 1917. Imagem: Fundação Clóvis Salgado
Disponível em: <https://blog.artsoul.com.br/anita-
malfatti-a-mulher-que-trouxe-o-modernismo-para-
o-brasil/>
Acesso em: 25 Abr 2025.
Anita Malfatti foi uma artista importante na primeira
fase do Modernismo. Assinale a alternativa que
apresenta uma característica das obras dela.

(A) Suas obras retomam a arte tradicional e de
cunho acadêmico.
(B) Suas obras não sofrem influência do
expressionismo e do cubismo.
(C) As cores, em suas obras, não são contrastantes
nem as pinceladas são marcantes.
(D) Em suas obras, há a presença de cores puras
e vibrantes para expressar temas do cotidiano.
(E) Nas obras de Anita Malfatti, não há sensação
de movimento nas figuras estáticas da pintura.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q51',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2025,
  2,
  51,
  'Nas obras de Anita Malfatti, não há sensação
de movimento nas figuras estáticas da pintura.
A Boa Notícia de Jesus é preferencialmente expressa,
pelos evangelistas, por imagens, em vez de por
formulações teológicas. Por isso, quando se lê o
Evangelho, é necessário distinguir entre o que o
autor deseja comunicar e como o expressa.
A mensagem que o evangelista transmite é a
Palavra de Deus sempre atual no tempo. O modo
de apresentá-la pertence a seu mundo cultural.
Alguns exemplos tomados da linguagem comum
nos ajudam a compreender a distinção entre uma
mensagem e o modo de transmiti-la.
“Fulano se encontra em precárias condições
econômicas” é uma frase formulada de forma correta,
mas será mais incisiva se for expressa com uma
imagem: “Fulano está em maus lençóis”. E, assim,
pode-se dizer que alguém está “muito surpreso”,
porém nos expressaremos mais eficazmente se
dissermos: “Fulano está de queixo caído” ou “ de
boca aberta”.
A arrogância é descrita de modo melhor quando
dizemos “nariz em pé”; “ter ideias absurdas” fica
melhor com “ter minhocas na cabeça”, e, se alguém
é especialmente nervoso, entende-se melhor com
“ele é uma pilha de nervos”. Igualmente, o orador que
fala demasiado “fala pelos cotovelos”; e do vencedor
de uma loteria se diz que “nasceu virado pra lua”.
Na cultura de nosso país, todos compreendem que se
trata de modos de dizer, e ninguém ira acreditar que
há pessoas com a cabeça recheada de minhocas...
Mas essas expressões lidas há dois mil anos, em
outras culturas, poderiam ser tomadas ao pé da letra.
MAGGI, Alberto. Como ler o Evangelho e
não perder a fé. (tradução de José Bortolini)
São Paulo: Paulus, 2023, pág.19-20.
Em sua explanação sobre o “que” e o “como” na
leitura bíblica, o autor recorre

(A) à exemplificação a fi m de chamar a atenção
para a linguagem denotativa do Evangelho.
(B) à linguagem conceitual, típica do texto bíblico,
para o esclarecimento de sua tese.
(C) à exemplificação e, por meio dela, ressalta a
importância e a eficácia da forma do texto do
Evangelho.
(D) à ilustração hipotética de fatos da vida comum
para atualização da mensagem do Evangelho.
(E) a fatos históricos e culturais para exemplificar
a forma de linguagem do Evangelho.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q52',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2025,
  2,
  52,
  'a fatos históricos e culturais para exemplificar
a forma de linguagem do Evangelho.

Questão 52 Questão 53
Analisando a charge em questão, observa-se que
ela toma como mote um conhecido ditado popular,
“Em briga de marido e mulher, não se mete a
colher”, a fim de defender um ponto de vista. A
partir dessa observação, é possível inferir que o
objetivo do artista foi

(A) aproximar a realidade atual do contexto social
de produção do ditado popular em pauta.
(B) reproduzir o ditado popular, estabelecendo
uma relação entre a imagem (texto não verbal)
e a expressão escrita (texto verbal) desse
mesmo ditado.
(C) sugerir uma mudança na conduta social diante
de situações de violência doméstica contra a
mulher a partir da ressignificação do ditado
popular.
(D) apontar o papel da arte na propagação positiva
de mudanças de comportamento social diante
de temas como violência doméstica.
(E) sugerir que ninguém se envolva em problemas
de outros casais.
Desenhos do Nando.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q53',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2025,
  2,
  53,
  'sugerir que ninguém se envolva em problemas
de outros casais.
Desenhos do Nando.
Disponível em: https://www.facebook.com/photo.php?
fbid=3059220281012772&id=1615444765390338&set
=a.2505733236361482
Acesso em: 26 abr 2025.
DESEMPREGO ENTRE JOVENS BRASILEIROS
CAI PELA METADE ENTRE 2019 E 2024
Pesquisa mostra queda no número dos que não
estudam nem trabalham
Nos últimos três meses do ano passado, a taxa de
desemprego dos jovens entre 14 e 24 anos de idade
caiu pela metade na comparação com o mesmo
período de 2019. Levantamento inédito do Ministério
do Trabalho e Emprego (MTE) foi divulgado hoje (29),
em São Paulo, durante o evento Empregabilidade
Jovem Brasil, promovido pelo Centro de Integração
Empresa-Escola (CIEE).
Segundo a pesquisa, a taxa de desemprego entre
jovens passou de 25,2% no quarto trimestre de 2019,
quando teve início a série histórica, para 14,3% no
ano passado. Isso significa que o número de jovens
sem emprego passou de 4,8 milhões de pessoas em
2019 para 2,4 milhões no ano passado.
Também houve queda no número de jovens entre 18 e
24 anos que não estudam nem trabalham, que agora
somam 5,3 milhões de brasileiros, menor patamar
da série histórica.
O quantitativo de estagiários continua crescendo e
passou de 642 mil em 2023 para 990 mil no primeiro
bimestre deste ano.
Disponível em: https://ootimista.com.br/noticias/
desemprego-entre-jovens-cai-pela-metade-entre-2019-
e-2024?category=economy&page=1. Acesso em: 29 Abr
2025.
Analise as alternativas a seguir.
I. “Segundo a pesquisa” (2º parágrafo) refere-se ao
evento Empregabilidade Jovem Brasil, remetido
no parágrafo anterior.
II. O texto informa sobre a diminuição do
desemprego entre jovens, além da diminuição
do número de jovens ociosos na sociedade por
meio da expressão “Também” (3º parágrafo),
que, atua como elemento coesivo ao introduzir
uma informação vinculada ao parágrafo anterior.
III. Os 3º e o 4º parágrafos apresentam uma
progressão semântica clara e coerente, que
poderia ter sido reforçada pelo conectivo
“todavia”.
IV. A expressão “quando teve início a série
histórica” (2º parágrafo) contribui para a
progressão temática do texto e o reforço dos
argumentos utilizados, ao cooperar com o leitor
no conhecimento da origem da série de dados
apresentada.
É correto o que se afirma em

(A) I e II.
(B) II e IV.
(C) I e III.
(D) III e IV.
(E) II e III.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q54',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2025,
  2,
  54,
  'II e III.

Questão 54
Texto 1
Partilhar
Rubel
Se for preciso, eu pego um barco, eu remo
Por seis meses, como peixe pra te ver
Tão pra inventar um mar grande o bastante
Que me assuste e que eu desista de você
Se for preciso, eu crio alguma máquina
Mais rápida que a dúvida, mais súbita que a lágrima
Viajo a toda força, e num instante de saudade e dor
Eu chego pra dizer que eu vim te ver
Disponível em: https://www.letras.mus.br/rubel/partilhar/.
Acesso em: 25 Abr 2025. (trecho)
Texto 2
O último poema do último príncipe
Matilde Campilho
Era capaz de atravessar a cidade em bicicleta para te ver dançar.
E isso
diz muito sobre minha caixa torácica.
Disponível em: https://www.culturagenial.com/poemas-femininos-curtos/.
Acesso em: 25 Abr 2025.
Relacionando os textos 1 e 2, é correto afirmar que

(A) ambos os textos equilibram as hipérboles utilizadas com uma leve ironia, produzindo a sensação de
um amor intenso, mas leve.
(B) ambos os textos abordam o amor a partir da disponibilidade da entrega afetiva para estar próximo
àquele que ama, porém com imaginários poéticos variados.
(C) enquanto o texto 1 expressa o amor de maneira intensa e extremada, o texto 2 já o traz de modo sutil,
sem grandes expressões ou profundidade de sentimentos.
(D) no texto 1, o espaço (mar) representa, em sua vastidão simbólica, o eu-lírico mais denso e introspectivo,
enquanto, no texto 2, o espaço realista e urbano (cidade), contrasta com um eu-lírico dramático e
idealizado.
(E) ambos os textos expressam o amor de forma superficial.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q55',
  'linguagens',
  'Artes',
  'Artes',
  2025,
  2,
  55,
  'ambos os textos expressam o amor de forma superficial.

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
How a focus on nature is changing therapy for kids
“Nature-deficit disorder,” a concept introduced by journalist and author Richard Louv in 2005, underscores
the importance of access to green spaces. A growing number of studies indicate that exposure to nature
benefits kids in different ways, such as by lowering stress and promoting better cognitive development.
Ecotherapy — also called nature therapy or green therapy — goes further by encouraging structured,
purposeful interactions with nature to improve mental health. “You’re bringing an aspect of mindfulness and
intentionality to being outdoors,” says Amy Lajiness, an ecotherapist and psychotherapist in San Diego who
counsels adolescents, adults and families.
Disponível em: https://www.washingtonpost.com/lifestyle/on-parenting/ecotherapy-kids-mental-health/2021/10/11/
dae57190-2151-11ec-8200-5e3fd4c49f5e_story.html. Acesso em: 30 Abr 2025.
De acordo com o texto, de que forma o contato com a natureza beneficia as crianças?

(A) Ajuda a desenvolver melhor as capacidades cognitivas.
(B) Estimula as capacidades de socialização.
(C) Reduz o tempo de tela nos celulares.
(D) Melhora o desempenho físico, estimulando exercícios.
(E) Estimula a curiosidade pela natureza.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2025,
  2,
  56,
  'Estimula a curiosidade pela natureza.
Questão 56
A Global Flourishing Study Finds That Young Adults, Well, Aren’t
A 2023 report from the Harvard Graduate School of Education, for example, found that young adults ages
18-25 in the United States reported double the rates of anxiety and depression as teens. On top of that,
perfectionism has skyrocketed among college students, who often report feeling pressure to meet unrealistic
expectations. Participation in community organizations, clubs and religious groups has declined, and loneliness
is now becoming as prevalent among young adults as it is among older adults.
“Study after study shows that social connection is critical for happiness, and young people are spending less
time with friends than they were a decade ago,” said Laurie Santos, a psychology professor at Yale and host
of “The Happiness Lab” podcast. “Plus, like folks of all ages, young people are facing a world with a whole
host of global issues — from climate to the economy to political polarization.”
Disponível em: https://www.nytimes.com/2025/04/30/well/mind/happiness-flourishing-young-adult-study.html. Acesso
em: 03 Maio 2025.
De acordo com o texto, quais fatores contribuem para o aumento da infelicidade entre jovens adultos?

(A) A redução da participação em grupos comunitários e religiosos.
(B) A diminuição do perfeccionismo e autocrítica.
(C) O aumento no uso de aparelhos móveis e isolamento social.
(D) A redução do tempo passado com amigos e a preocupação com questões globais.
(E) O aumento da polarização política na última década.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q57',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  2,
  57,
  'O aumento da polarização política na última década.

Questão 57
A cantora e compositora norte-americana Taylor
Swift é um dos maiores fenômenos da música
pop contemporânea. Conhecida por transformar
experiências pessoais em letras carregadas de
emoção, sua obra transita entre o pop, o country
e o folk, sempre mantendo forte apelo narrativo e
lírico. Em novembro de 2023, Swift trouxe ao Brasil
a aguardada The Eras Tour, com apresentações
marcantes no Rio de Janeiro e em São Paulo,
reunindo milhares de fãs em shows que celebraram
diferentes fases de sua carreira.
Now That We Don’t Talk
You went to a party
I heard from everybody
You part the crowd like the red sea
Don’t even get me started
Did you get anxious, though
On the way home?
I guess I’ll never ever know
Now that we don’t talk
You grew your hair long
You got new icons
And from the outside
It looks like you’re trying lives on
I miss the old ways
You didn’t have to change
But I guess I don’t have a say
Now that we don’t talk
I call my mom, she said that it was for the best
Remind myself the morе I gave, you’d want me
less
I cannot bе your friend, so I pay the price of
what I lost
And what it cost, now that we don’t talk
What do you tell your friends we
Shared dinners, long weekends with?
Truth is, I can’t pretend it’s
Platonic, it’s just ended, so
I call my mom, she said to get it off my chest (off
my chest)
Remind myself the way you faded till I left (until
I left)
I cannot be your friend, so I pay the price of
what I lost (of what I lost)
And what it cost, now that we don’t talk
I don’t have to pretend I like acid rock
Or that I’d like to be on a mega yacht
With important men who think important
thoughts
Guess maybe I am better off now that we don’t
talk
And the only way back to my dignity
Was to turn into a shrouded mystery
Just like I had been when you were chasing me
Guess this is how it has to be now that we don’t
talk
A oração “who think important thoughts” no trecho
“With important men who think important thoughts”
desempenha a função de

(A) introduzir um novo sujeito à frase, desvinculado
de “important men”.
(B) e x p r e s s a r u m a c o n s e q u ê n c i a d o
comportamento dos “important men”.
(C) caracterizar de forma detalhada os “important
men” mencionados anteriormente.
(D) indicar o motivo pelo qual os “important men”
são considerados importantes.
(E) substituir o termo “important men” por uma
explicação subjetiva do eu lírico.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q58',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2025,
  2,
  58,
  'substituir o termo “important men” por uma
explicação subjetiva do eu lírico.

Questão 58
Stockpile 72 hours of supplies in case of disaster or attack, EU tells citizens
The European Union (EU) has encouraged citizens across the continent to stockpile food, water and other
essentials to last at least 72 hours as war, cyberattacks, climate change and disease increase the chances
of a crisis.
The call to action for the EU''s 450 million citizens comes as the 27-nation bloc rethinks its security, especially
after Donald Trump''s US administration warned that Europe must take more responsibility for it.
In recent years, the EU has been forced to deal with the coronavirus pandemic, and the threat from Russia,
including its attempts to exploit Europe''s dependence on its natural gas to weaken support for Ukraine.
NATO Secretary-General Mark Rutte has warned that Russia could be capable of launching another attack
in Europe by 2030.
"Today''s threats facing Europe are more complex than ever, and they are all interconnected," said Preparedness
and Crisis Management Commissioner Hadja Lahbib as she shared a new strategy for dealing with future
disasters.
While the commission is keen not to be seen as alarmist, Lahbib said it''s important "to make sure people have
essential supplies for at least 72 hours in a crisis." She listed food, water, flashlights, ID papers, medicine
and radios as things to stock.
Lahbib said the EU should build up a "strategic reserve" and stockpile other critical resources including
firefighting planes; medical, energy and transport equipment; and specialized assets against chemical,
biological and nuclear threats.
The EU''s plans are similar to those in France, Finland and Sweden.
Last year, Sweden updated its civil emergency advice "to better reflect today''s security policy reality" such
as what to do in case of nuclear attack.
Not all EU countries have the same level of crisis preparedness, and the commission also wants to encourage
them to coordinate better in case of emergency.
President of the European Commission, Ursula von der Leyen, said: "New realities require a new level of
preparedness in Europe."
She added: "Our citizens, our Member States, and our businesses need the right tools to act both to prevent
crises and to react swiftly when a disaster hits.
Disponível em: https://www.theguardian.com/world/2025/mar/26/stockpile-supplies-72-hours-disasters-attack-eu-
tells-citizens. Acesso em: 22 Abr 2025
No artigo, a frase “People should have food, water, flashlights, and radios with batteries” apresenta uma
enumeração de itens. A escolha do verbo modal “should”, nesse contexto, indica

(A) uma obrigação legal imposta aos moradores da União Europeia.
(B) itens não essenciais para a sobrevivência da população, quando ocorrerem guerras ou desastres.
(C) uma possibilidade de que esses itens sejam necessários, por isso as pessoas são obrigadas a adquirir
o kit.
(D) um desejo pessoal de Lahbib.
(E) uma recomendação baseada em desastre anteriores.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q59',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2025,
  2,
  59,
  'uma recomendação baseada em desastre anteriores.

Questão 59
Na canção Beautiful Boy, John Lennon expressa, de
forma terna e protetora, o amor por seu filho Sean. A
música é uma espécie de canção de ninar moderna,
carregada de carinho, conselhos e esperança para o
futuro.
Close your eyes
Have no fear
The monster’s gone
He’s on the run and your daddy’s here
Beautiful, beautiful, beautiful
Beautiful boy
Beautiful, beautiful, beautiful
Beautiful boy
Before you go to sleep
Say a little prayer
Every day in every way, it’s getting better and better
Beautiful, beautiful, beautiful
Beautiful boy
Beautiful, beautiful, beautiful
Beautiful boy
Out on the ocean sailing away
I can hardly wait
To see you come of age
But I guess we’ll both just have to be patient
‘Cause it’s a long way to go
A hard row to hoe
Yes, it’s a long way to go
But in the meantime
Before you cross the street
Take my hand
Life is what happens to you while you’re busy making
other plans
Beautiful, beautiful, beautiful
Beautiful boy
Beautiful, beautiful, beautiful
Beautiful boy
Before you go to sleep
Say a little prayer
Every day in every way, it’s getting better and better
Beautiful, beautiful, beautiful
Beautiful boy
Darling, darling, darling
Darling Sean
No trecho, em destaque a imagem do “oceano” é
utilizada como metáfora. A que ideia essa imagem
está associada no contexto da música?

(A) Ao medo do pai de que o filho viaje para longe.
(B) Ao desejo do pai de que o filho se torne
marinheiro.
(C) Ao crescimento e amadurecimento do filho como
um processo longo.
(D) À dificuldade de encontrar o filho no futuro.
(E) À vontade do pai de ir embora e recomeçar a
vida.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2025-2_Q60',
  'linguagens',
  'Literatura',
  'Literatura',
  2025,
  2,
  60,
  'El país de todas las sangres según el Nobel Vargas Llosa y su tarea pendiente
Un compatriota mío, José María Arguedas, llamó al Perú el país de “todas las sangres”. No creo que haya
fórmula que lo defina mejor. Eso somos y eso llevamos dentro todos los peruanos, nos guste o no: una suma
de tradiciones, razas, creencias y culturas procedentes de los cuatro puntos cardinales. A mí me enorgullece
sentirme heredero de las culturas prehispánicas que fabricaron los tejidos y mantos de plumas de Nazca
y Paracas y los ceramios mochicas o incas que se exhiben en los mejores museos del mundo, de los
constructores de Machu Picchu, el Gran Chimú, Chan Chan, Kuelap, Sipán, las huacas de la Bruja y del Sol
y de la Luna, y de los españoles que, con sus alforjas, espadas y caballos, trajeron al Perú a Grecia, Roma,
la tradición judeocristiana, el Renacimiento, Cervantes, Quevedo y Góngora, y la lengua recia de Castilla
que los Andes dulcificaron. Y de que con España llegara también África con su reciedumbre, su música y su
efervescente imaginación a enriquecer la heterogeneidad peruana. Si escarbamos un poco descubrimos que
el Perú, como el Aleph de Borges, es en pequeño formato el mundo entero. ¡Qué extraordinario privilegio
el de un país que no tiene una identidad porque las tiene todas! [...]
https://donambro.wordpress.com/2010/12/07/el-pais-de-todas-las-sangres-segun-el-nobel-vargas-llosa-y-su-tarea-
pendiente/ Acesso em: 01 Maio de 2025.
Com base na leitura do texto, assinale a alternativa que apresenta a síntese do texto.

(A) O texto de Llosa descreve as desigualdades existentes na sociedade peruana desde as suas raízes,
mas afirma que elas foram superadas com a construção da sua identidade.
(B) O autor entende que tais aspectos culturais ao se misturarem deram origem à identidade peruana, que
não é única, mas sim plural e rica em seus aspectos de diversidade.
(C) Desde a sua construção, a identidade andina, segundo Vargas, não recebeu nenhum elemento da
cultura africana ou amazônica.
(D) O vencedor do Nobel de literatura Vargas Llosa afirma que a singularidade sempre foi um traço marcante
dos costumes peruanos, herdados sem nenhum traço marcante da cultura castelhana.
(E) A expressão “o país de todos os sangues” demonstra muito mais os conflitos existentes na sociedade
peruana do que a construção de uma identidade cultural.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q43',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2026,
  1,
  43,
  'Bancarrota blues
Edu Lobo / Chico Buarque
Uma fazenda
Com casarão
Imensa varanda
Dá jerimum
Dá muito mamão
Pé de jacarandá
Eu posso vender
Quanto você dá?
Algum mosquito
Chapéu de sol
Bastante água fresca
Tem surubim
Tem isca pra anzol
Mas nem tem que pescar
Eu posso vender
Quanto quer pagar?
O que eu tenho
Eu devo a Deus
Meu chão, meu céu, meu mar
Os olhos do meu bem
E os filhos meus
Se alguém pensa que vai levar
Eu posso vender
Quanto vai pagar?
Os diamantes rolam no chão
O ouro é poeira
Muita mulher pra passar sabão
Papoula pra cheirar
Eu posso vender
Quando vai pagar?
Negros quimbundos
Pra variar
Diversos açoites
Doces lundus
Pra nhonhô sonhar
À sombra dos oitis
Eu posso vender
Que é que você diz?
Sou feliz
E devo a Deus
Meu éden tropical
Orgulho dos meus pais
E dos filhos meus
Ninguém me tira nem por mal
Mas posso vender
Deixe algum sinal
Disponível em: https://www.letras.mus.br/
chico-buarque/85931/.
Acesso em: 02 Out 2025
A palavra blues, um gênero musical, no título,
identifica o gênero textual a que pertence o texto.
No entanto, a aproximação sugestiva com um
poema pode ser considerada em função

(A) do tema político e social.
(B) do uso da linguagem expressiva.
(C) da descrição de um ambiente bucólico.
(D) do emprego da denotação.
(E) do uso da primeira pessoa verbal.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q45',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2026,
  1,
  45,
  'Embora o pavão não seja uma ave originária
do Brasil, ele é uma ave exótica comum no
país.
Recursos Educacionais Digitais: o que são e
onde encontrá-los
Graziela Balardim
Convenhamos que a tecnologia é um bom “molho”
para qualquer conteúdo, não é? Para os nativos
digitais, que estão sempre com o celular na mão
e que entendem mais de tecnologia do que boa
parte dos adultos, escutar conteúdos palestrados
e copiar anotações do quadro para o caderno é
algo que definitivamente não empolga.
Usar Recursos Educacionais Digitais é falar a
língua deles. Os conteúdos e as possibilidades
que eles trazem tornam qualquer assunto muito
mais atrativo. Como consequência, o rendimento
deles tende a aumentar. Ao menos foi isso o que
demonstrou uma pesquisa realizada pela Unesp
com estudantes que tinham médias ruins. O
desempenho deles melhorou em 51% com o uso
de recursos digitais interativos.
Disponível em: https://blog.clipescola.com/
recursos-educacionais-digitais/.
Acesso em: 05 Out 2025.
A partir da leitura do texto, pode-se afirmar
corretamente que

(A) trata-se de um texto formal, voltado para
professores de educação digital.
(B) foi escrito diretamente para o público de
estudantes jovens.
(C) utiliza uma linguagem despojada como recurso
estilístico-argumentativo de aproximação com
a temática.
(D) valoriza e reconhece os benefícios, mas
desaprova o uso de recursos digitais entre
estudantes.
(E) objetiva convencer estudantes a utilizarem
recursos digitais para educação e não apenas
para entretenimento.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q46',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2026,
  1,
  46,
  'objetiva convencer estudantes a utilizarem
recursos digitais para educação e não apenas
para entretenimento.

Questão 46
Brasil é o 2° país em que usuários passam mais tempo on-line
Relatório Global Digital 2024 mostra que brasileiros passam mais de 9 horas conectados
Gabriela Andrade
De acordo com o Relatório Digital 2024: 5 billion social media users, publicado em parceria entre We Are
Social e Meltwater, o Brasil é o segundo país em que os usuários passam mais tempo on-line, com média
de 9h13, atrás apenas da África do Sul, com 9h24.
Esse dado mostra que a internet desempenha um papel significativo na vida diária dos brasileiros, com
grande parte do tempo sendo dedicado às atividades on-line.
Essa alta taxa de engajamento on-line pode ter diversas implicações, desde oportunidades para empresas
alcançarem e engajarem o público brasileiro até reflexos sobre os padrões de consumo de mídia e
comportamentos sociais na era digital.
Há um declínio na audiência da televisão em favor do aumento do tempo gasto on-line. Isso ocorre devido
à conveniência, personalização e diversidade de conteúdos disponíveis on-line, refletindo na evolução dos
hábitos de consumo de mídia em direção às experiências mais ricas e envolventes.
Os brasileiros amam as redes sociais
Outro ponto abordado na pesquisa é que o Brasil está em terceiro lugar mundial no tempo gasto em redes
sociais, com os usuários dedicando em média 3h37 diariamente.
Além disso, os brasileiros ocupam a quinta posição no uso do Instagram, evidenciando a importância dessa
rede social como um canal de marketing digital crucial no país.
“Esses números refletem não apenas a presença massiva dos brasileiros nas redes sociais, mas também
a oportunidade significativa que ela representa para as marcas e empresas alcançarem e engajarem o
público-alvo de maneira eficaz e direcionada”, explica o especialista em dados e inovação e professor de
MBA da FGV, Kenneth Corrêa.
O país também ocupa a quinta posição em termos de percentual de população que utiliza o Instagram,
com 78% dos brasileiros adultos engajando no aplicativo. “Essa posição de liderança na plataforma realça
a importância dessa rede social não apenas como uma ferramenta de comunicação e lazer, mas como um
poderoso canal de marketing digital que oferece uma oportunidade ímpar de engajar e criar uma conexão
profunda com o público brasileiro”, afirma Corrêa.
Disponível em: https://www.metropoles.com/colunas/m-buzz/brasil-e-o-2-pais-em-que-usuarios-passam-mais-
tempo-on-line. Acesso em: 24 Set 2025.
No texto, a autora recorre ao uso de pronomes demonstrativos como recurso de coesão. Assinale a alternativa
em que se registra a correta referência textual com o pronome destacado.

(A) “Esse dado mostra que...” (2º parágrafo) - O tempo on-line utilizado pelos usuários da África do Sul.
(B) “Essa alta taxa de engajamento...” (3º parágrafo) - Vida diária dos brasileiros
(C) “Isso ocorre devido à...” (4º parágrafo) - O comportamento na era digital.
(D) “Além disso, os brasileiros...” (6º parágrafo) - Posição do Brasil no uso do Instagram.
(E) “Esses números refletem não apenas ...” (7º parágrafo) - Conjunto de dados estatísticos apresentados
sobre o Brasil.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q47',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2026,
  1,
  47,
  '“Esses números refletem não apenas ...” (7º parágrafo) - Conjunto de dados estatísticos apresentados
sobre o Brasil.

Questão 47
Balanço ético-global para a COP30
Este sistema inumano e sem qualquer solidariedade jamais vai renunciar a suas vantagens e privilégios
Leonardo Boff
1. Por que tantas vezes negamos ou ignoramos o que a ciência e os saberes tradicionais dizem sobre
a crise climática, e compartilhamos ou compactuamos com a desinformação, mesmo sabendo que
vidas estão em risco?A desinformação é voluntária. Muitos chefes de estados ricos e CEOs de grandes
corporações sabem dos riscos, pois eles estão presentes e são inegáveis como o aquecimento global, as
enchentes destrutivas de cidades inteiras, as fogueiras imensas na Califórnia, no Amazonas, na Espanha e
ainda a presença de vários vírus, em particular do Coronavírus, que atingiu a humanidade inteira.
Negam estes dados claros porque são antissistêmicos. O sistema do capital, hoje mundializado, mais e
mais se concentra (1% contra 99%). Tomar a sério estes dados obrigaria este capital a mudar de lógica,
cuidar da natureza em vez de superexplorá-la, cultivar uma justiça social e uma justiça ecológica. Não basta
descarbonizar.
Como diz a "Carta da Terra": "Adotar padrões de produção e consumo que protejam as capacidades
regenerativas da Terra, os direitos humanos e o bem-estar comunitário" (§II,7). Este sistema inumano e
sem qualquer solidariedade jamais vai renunciar a suas vantagens e privilégios. A seguir a lógica do capital,
iremos ao encontro, cedo ou tarde, de uma grande tragédia ecológico-social que poderá afetar a biosfera,
e no limite, a sobrevivência dos seres humanos sobre este planeta, que, limitado, não suporta um projeto
de crescimento/desenvolvimento ilimitado.
Disponível em: https://iclnoticias.com.br/balanco-etico-global-para-a-cop30/. Acesso em: 25 Set 2025.
Com base no uso da norma padrão da língua portuguesa no texto, analise as afirmativas.
I. O prefixo presente na palavra “inumano” (lead), diferente da palavra ‘inegáveis” (1º parágrafo), apresenta
significado que ultrapassa a simples oposição de “humano”, algo que não é humano, mas perpassa a
ideia de “negação da humanidade”, enquanto que “inegáveis” continua sendo “aquilo que não se pode
negar”.
II. A repetição em “O sistema do capital, hoje mundializado, mais e mais se concentra” (2º parágrafo) foi
utilizada como recurso estilístico com a finalidade de enfatizar a afirmação.
III. A repetição em “cultivar uma justiça social e uma justiça ecológica” (2º parágrafo) visa reforçar que só
há uma única maneira de conceber justiças social e ecológica.
IV. A escolha pela expressão “tragédia ecológico-social” (3º parágrafo) fortalece a relação de interdependência
entre ambas as esferas (social e ecológica), que seriam atingidas simultaneamente.
É correto o que se afirma apenas em

(A) I e II.
(B) III e IV.
(C) I, II e III.
(D) I, II e IV.
(E) II, III e IV.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q48',
  'linguagens',
  'Literatura',
  'Literatura',
  2026,
  1,
  48,
  'II, III e IV.

Questão 48
Leia a letra da canção Rosa de Hiroshima adaptada do poema de Vinicius de Moraes pertencente
ao Modernismo. O lançamento da música ocorreu no ano de 1973, com a banda Secos & Molhados.
A Rosa de Hiroshima
Pensem nas crianças
Mudas telepáticas
Pensem nas meninas
Cegas inexatas
Pensem nas mulheres
Rotas alteradas
Pensem nas feridas
Como rosas cálidas
Mas oh não se esqueçam
Da rosa da rosa
Da rosa de Hiroshima
A rosa hereditária
A rosa radioativa
Estúpida e inválida
A rosa com cirrose
A antirrosa atômica
Sem cor sem perfume
Sem rosa sem nada.
Vinicius de Moraes / Gerson Conrad
Disponível em: https://www.letras.mus.br/ney-matogrosso/47735/. Acesso em: 01 Out 2025.
Após a leitura, analise as afirmativas a seguir.
I. O poema foi escrito em um período marcado pela Grande Depressão, pelo avanço do nazifascismo,
pela Segunda Guerra Mundial e pela consolidação do Estado Novo no Brasil.
II. Na letra da canção, observa-se uma falta de preocupação relacionada ao destino dos homens
e ao estar no mundo.
III. Ocorre uma aproximação semântica entre a rosa e a bomba devido à semelhança entre o
desabrochar da rosa e a explosão da bomba atômica.
IV. Os dois primeiros versos fazem referência aos danos cognitivos e intelectuais causados pelos
efeitos da radiação que atingiram as crianças e que serão transmitidos para as futuras gerações.
É correto apenas o que se afirma em

(A) I.
(B) IV
(C) III e IV.
(D) I, III e IV.
(E) I, II e IV.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q49',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2026,
  1,
  49,
  'I, II e IV.

Questão 49 Questão 51
Observe a charge do cartunista brasileiro Duke.
Disponível em:<https://ensinodegeografiauenp.blogspot.
com/2013/01/charges-para-pensar-nas-chuvas-de-verao.
html.> Acesso em: 28 Set 2025.
Na palavra “clic”, a charge utiliza, como recurso
expressivo, qual figura de linguagem?

(A) Antonomásia
(B) Onomatopeia
(C) Quiasmo
(D) Paronomásia
(E) Hipálage',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q50',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2026,
  1,
  50,
  'a forma reduzida do texto reforça o caráter
sintético e não permite um jogo de significados.
Questão 50
A pátria que quisera ter era um mito; era um fantasma
criado por ele no silêncio do seu gabinete. Nem a
física, nem a moral, nem a intelectual, nem a política
que julgava existir, havia.
BARRETO, Lima. Triste fi m de Policarpo Quaresma.
São Paulo: Editora Pé de Letra, 2022.
Considerando a sintaxe, pode-se afirmar que

(A) o termo “que” classifica-se como conjunção
integrante.
(B) no trecho, há uma oração sem sujeito.
(C) “A pátria” é o sujeito de “quisera ter”.
(D) “era um mito” classifica-se como predicado
verbal.
(E) “por ele” classifica-se como objeto direto.
CLIC!',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q51',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2026,
  1,
  51,
  'Hipálage
Leia o poema abaixo do poeta brasileiro Cassiano
Ricardo.
Serenata sintética
Rua
torta
Lua
morta
Tua
porta
Cassiano Ricardo. Poesias completas. Rio
de Janeiro: José Olympio, 1957.p.279.
Sobre o poema, pode-se afirmar que

(A) a substituição de um fonema por outro pode
estabelecer diferença de significado entre
palavras, o que se comprova nas palavras
do poema “Rua”, “Lua”, “Tua” escolhidas pelo
poeta com a intenção de explorar o som dos
significantes.
(B) o termo “sintética”, presente no título do
poema, não sugere a redução de uma forma
grandiosa a um ato banal.
(C) o ideal romântico da serenata está no mesmo
plano semântico da trivialidade da realidade.
(D) o poeta não pretendeu contrapor a linguagem
sofisticada do título com o tom cotidiano dos
versos.
(E) a forma reduzida do texto reforça o caráter
sintético e não permite um jogo de significados.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q52',
  'linguagens',
  'Artes',
  'Artes',
  2026,
  1,
  52,
  '“por ele” classifica-se como objeto direto.
CLIC!

Questão 52
O equilíbrio entre previsibilidade e surpresa nos relacionamentos
Relacionar-se é aprender a transitar entre dois movimentos: a previsibilidade que sustenta e a imprevisibilidade
que encanta.
Como duas características aparentemente opostas podem ser igualmente fundamentais para
um relacionamento saudável e duradouro? A resposta está no equilíbrio entre previsibilidade e imprevisibilidade,
forças que, quando combinadas na medida certa, transformam uma parceria em algo profundo, vivo e
estimulante.
A previsibilidade, por si só, traz segurança. É o que nos faz confiar no outro, sentir estabilidade e perceber
consistência nas atitudes. Essa sensação de confiança e tranquilidade cria a base necessária para que homens
e mulheres possam se entregar de forma autêntica, permitindo vulnerabilidade e conexão verdadeira. Em
outras palavras, o previsível sustenta o sentimento de segurança emocional, essencial para que qualquer
relacionamento floresça.
Mas apenas previsibilidade não basta. A imprevisibilidade, com seus gestos inesperados e doses de novidade,
é responsável por manter o frescor e o entusiasmo.
Um toque criativo, uma surpresa, uma palavra diferente, tudo isso reacende a paixão e desperta a curiosidade,
lembrando que o amor também precisa de movimento e renovação.
É natural que, com o tempo, muitos relacionamentos entrem em rotinas estáveis. E justamente por isso o
imprevisto tem um papel tão importante: ela quebra a monotonia, resgata o encantamento e traz vitalidade
para a convivência.
Criatividade, espontaneidade e abertura para o novo são elementos que fortalecem a atração e a cumplicidade
entre parceiros.
O autoconhecimento é o ponto-chave para equilibrar esses dois polos. Quando cada pessoa percebe sua
tendência natural, se busca mais segurança ou mais novidade, torna-se possível ajustar a balança, oferecendo
ao relacionamento tanto estabilidade quanto entusiasmo.
Em última análise, relacionar-se é aprender a transitar entre dois movimentos: a previsibilidade que sustenta
e a imprevisibilidade que encanta. Juntas, essas forças criam a alquimia necessária para um relacionamento
de profundidade, parceria consciente e evolução mútua.
O verdadeiro amor não está em escolher entre a segurança ou a surpresa, mas em dançar no equilíbrio
entre ambas, onde a confiança sustenta e a novidade mantém vivo o encantamento.
Disponível em: https://iclnoticias.com.br/equilibrio-previsibilidade-relacionamento/. Acesso em: 02 Out 2025.
Em sua explanação sobre o equilíbrio nos relacionamentos, a autora Margareth Signorelli utiliza

(A) a estratégia de questionamento, deixando para o leitor a resposta.
(B) a linguagem conceitual, típica de textos científicos acerca do assunto.
(C) a exemplificação de ações concretas e, por meio dela, ressalta a importância do amor.
(D) a opinião para construção de um ensinamento acerca da relação amorosa sadia.
(E) a contradição de termos linguísticos para instigar, no leitor, o debate sobre relacionamentos.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q53',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2026,
  1,
  53,
  'a contradição de termos linguísticos para instigar, no leitor, o debate sobre relacionamentos.

Questão 53
Questão 54
“Os professores semeamos sonhos, e cada ensinamento é a multiplicação da esperança no coração dos
alunos.”
Em "Os professores semeamos sonhos" há uma figura de sintaxe que está corretamente identificada no
seguinte item:

(A) Elipse, por haver a omissão do objeto direto.
(B) Anacoluto, por haver uma ruptura na estrutura da frase.
(C) Silepse, por haver uma concordância ideológica.
(D) Pleonasmo, por haver uma redundância intencional.
(E) Hipérbato, por haver uma inversão da ordem natural e direta dos termos da oração.
O Agente Secreto',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q54',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2026,
  1,
  54,
  'Hipérbato, por haver uma inversão da ordem natural e direta dos termos da oração.
O Agente Secreto
Wagner Moura e Kleber Mendonça Filho são uma boa dupla no universo vibrante e enigmático de O Agente
Secreto
Aline Pereira
“É difícil ser chamado por outro nome”, diz um personagem de O Agente Secreto em um momento que
considero simbólico para a trama escrita e dirigida por Kleber Mendonça Filho. Registros e lembranças são
assuntos recorrentes na filmografia do cineasta – tema principal, aliás, de seu longa anterior a este, Retratos
Fantasmas –, mas no suspense (suspense?) estrelado por Wagner Moura, estes dois tópicos formam aliança
com um terceiro tema importante: a memória da identidade. De pessoas, lugares, acontecimentos. Da
importância de saber quem foram as pessoas, quais foram os lugares e que acontecimentos foram esses.
O início de O Agente Secreto nos apresenta ao pesquisador Marcelo (Wagner Moura), de cara, em uma
situação de choque moral, ético e político enquanto está a caminho da cidade de Recife, em Pernambuco,
em meio a uma semana de carnaval. Ele se torna alvo de uma perseguição, mas quais as intenções da
mudança e o real perigo que ele corre são alguns dos enigmas que nos acompanham e se desenrolam para
o público ao longo da história – e por isso, é claro, prefiro deixar de fora os detalhes do mistério.
Disponível em: https://www.adorocinema.com/filmes/filme-1000009761/criticas-adorocinema/.
Acesso em: 01 Out 2025.
Sobre a função de linguagem predominante no texto, assinale a alternativa correta.

(A) Predomina a função referencial, uma vez que o foco do texto está em descrever o filme, destacando
pontos principais de seu enredo.
(B) Predomina a função emotiva, já que a autora insere comentários pessoais, sobressaindo as marcas
subjetivas.
(C) Predomina a função fática, evidenciada pela interação com o leitor (“suspense?”) e a linguagem informal.
(D) Predomina a função conativa, pois é clara a finalidade de sugerir ao leitor que se veja o filme, utilizando-
se se qualificadores positivos voltados ao elenco, ao diretor e à história.
(E) Predomina a função metalinguística ao utilizar uma expressão verbal (a escrita) para descrever outra
expressão verbal (um roteiro de cinema).

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q55',
  'linguagens',
  'Funções da linguagem',
  'Funções',
  2026,
  1,
  55,
  'Predomina a função metalinguística ao utilizar uma expressão verbal (a escrita) para descrever outra
expressão verbal (um roteiro de cinema).

ATENÇÃO: As questões de números 55 a 60 versam sobre Língua Inglesa e Língua Espanhola.
Você deverá respondê-las de acordo com a escolha já feita por ocasião da inscrição ao Processo
Seletivo. A mudança de opção NÃO é permitida neste momento.
LÍNGUA INGLESA
Questão 55
Risk
And then the day came,
when the risk
to remain tight
in a bud
was more painful
than the risk
it took
to blossom.
Disponível em: https://allpoetry.com/poem/8497015-Risk-by-Anais-Nin/.
Acesso em: 17 Set 2025.
O poema sugere uma reflexão existencial sobre a transformação humana diante do medo e da dor. A oposição
entre “remain tight in a bud” e “to blossom” articula-se em torno da ideia de que

(A) a manutenção do estado de segurança inicial é sempre preferível às incertezas do crescimento individual.
(B) o processo de amadurecimento ocorre quando a estagnação se torna mais insuportável que os riscos
da mudança, comparativamente a uma flor.
(C) o florescimento representa uma etapa inevitável e indolor do ciclo vital, desvinculada de escolhas
pessoais.
(D) o risco de permanecer fechado é ilusório, pois o desenvolvimento humano não depende de rupturas.
(E) a dor e o risco são apenas consequências externas, não determinando a decisão de transformação
individual.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2026,
  1,
  56,
  'a dor e o risco são apenas consequências externas, não determinando a decisão de transformação
individual.

Questão 56
Can the US government ban apps that track ICE agents?
3 October 2025
Nick Beake & Joshua Cheetham, BBC Verify in Washington
The US government and law enforcement agencies have hit out at developers and users of apps which track
Immigration and Customs Enforcement (ICE), arguing they threaten the lives of agents.
The FBI says the man who targeted an ICE facility in Dallas - killing two detainees - had used these types
of apps to track the movements of agents and their vehicles.
A tracking app downloaded more than a million times that shows the movements of immigration officers was
removed from Apple’s App Store on Thursday.
ICE Block was released in April following the Trump administration’s crackdown on illegal immigration. The
creator of the app told the BBC that Apple was “capitulating to an authoritarian regime”.
The White House and the FBI had argued the app put the lives of law enforcement at risk.
Special Agent Joseph Rothrock said: “It’s no different than giving a hitman the location of their intended
target” - a claim which has been disputed by the developer of one of the most popular apps.
BBC Verify has been looking at what the apps do and the potential impact they are having.
Disponível em: https://www.bbc.com/news/articles/c2lxwxnnx2zo.
Acesso em: 04 Out 2025.
A declaração do agente especial Joseph Rothrock, comparando os aplicativos a “It’s no different than giving
a hitman the location of their intended target”, tem como objetivo

(A) justificar a necessidade de manter os apps em funcionamento.
(B) minimizar o perigo que os aplicativos representam.
(C) reforçar a ideia de que os aplicativos colocam vidas em risco.
(D) sugerir que os apps não têm impacto real sobre a segurança.
(E) destacar que os desenvolvedores não têm responsabilidade moral.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q57',
  'linguagens',
  'Artes',
  'Artes',
  2026,
  1,
  57,
  'destacar que os desenvolvedores não têm responsabilidade moral.

Questão 57
The Smashing Machine
Dwayne Johnson is synonymous with megabudget blockbusters, but he gets to prove himself as a serious
actor in The Smashing Machine, a brooding indie biopic written and directed by Benny Safdie (the co-director
of Good Time and Uncut Gems). Johnson stars as Mark Kerr, a mixed martial artist who won tournaments in
the early days of the sport, before it became the global sensation it is today. As much as he revels in punching
and kicking his opponents to a bloody pulp, the bouts take their toll on his physical and mental health, and he
is soon fighting addiction as well as fighting other people. Emily Blunt co-stars as Kerr’s girlfriend. “It’s a film
that feels gloriously alive,” writes Hannah Strong in Little White Lies, “earnest in its depiction of masculinity
that is fragile rather than toxic while still grappling with the question of why anyone would choose to make
a living in such a barbaric way.”
Released internationally from 2 October
Disponível em: https://www.bbc.com/culture/article/20251001-12-of-the-best-films-to-watch-this-october.
Acesso em: 04 Out 2025.
A expressão “before it became the global sensation it is today” refere-se

(A) à popularidade atual das artes marciais mistas em todo o mundo.
(B) ao declínio dos torneios no passado.
(C) à perda de interesse por esportes violentos.
(D) à influência dos filmes de Hollywood no público global.
(E) ao desaparecimento das artes marciais como carreira profissional.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q58',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2026,
  1,
  58,
  'ao desaparecimento das artes marciais como carreira profissional.

Considerando a imagem da charge, a crítica central está relacionada

(A) ao impacto dos data centers de inteligência artificial sobre os ecossistemas naturais, especialmente
quanto ao uso intensivo de água e energia na região em que são instalados.
(B) à ameaça representada pela substituição completa da agricultura pela produção energética limpa,
retratada como inevitável.
(C) à dependência da sociedade em orientações de ferramentas digitais, evidenciando a incapacidade de
agir sem tecnologia, mas que pode favorecer o meio ambiente.
(D) à desvalorização da produção agrícola frente ao aumento do consumo urbano, retratada como um
fenômeno natural e irreversível.
(E) à associação da inteligência artificial com benefícios ambientais, simbolizada pela harmonização entre
agricultura, energia limpa e consumo tecnológico.',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2026-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2026,
  1,
  59,
  'à associação da inteligência artificial com benefícios ambientais, simbolizada pela harmonização entre
agricultura, energia limpa e consumo tecnológico.
Questão 58
Questão 59
Record everything!
Why is our memory so valuable to us? Beyond its obvious role for survival, let us focus on three key aspects:
first, we take pleasure in remembering and reminiscing. Second, our memories help us understand ourselves,
others and our place in the world. Third, our memories play a crucial role for personal identity: who we are
as persons is determined by our memories. These constitute our selves, so you are literally made, in part,
of your memories. Our memories are valuable because they help make us who we are as individuals. [...]
Consider current memory enhancement practices: why do we keep chatlogs, take pictures or write diaries at
all? Of course reasons are plentiful: journaling can serve reflection; picture-taking has an artistic component;
habit and device presets may play a role, etc. But we clearly value our records in large part because they
enhance our memory. Our memory is valuable and this value is promoted by the records that enhance it.
https://aeon.co/essays/if-memory-is-precious-to-you-then-go-ahead-and-record-everything. Acesso em 02/10/2025
Com base no texto, a que se deve o valor de nossas memórias?

(A) Elas servem para que possamos armazenar grandes volumes de informação e dados.
(B) Elas servem para nos ajudar a manter controle de nossas tarefas diárias.
(C) Nossas memórias constituem uma parte crucial na formação de nossa identidade.
(D) As memórias são importantes para nossa tomada de decisão rápida.
(E) A seletividade de nossa memória nos ajuda a lidar com traumas.',
  '',
  'C',
  false
) on conflict (id) do nothing;
