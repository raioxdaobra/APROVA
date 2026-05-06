-- =============================================================================
-- Migration 0025 — Seed de Linguagens 2018-1 (extraído via OCR)
-- =============================================================================
-- Gerado por scripts/ocr_2018_1.ts. A prova 2018-1 foi entregue como PDF
-- escaneado (imagens), então pdf-parse não extrai texto. Este pipeline:
--   1. Renderiza páginas via pdfjs-dist + node-canvas.
--   2. OCR com tesseract.js (lang 'por').
--   3. Aplica MESMA lógica de parsing de scripts/extract_linguagens.ts
--      (PR 18) com tolerâncias adicionais a artefatos de OCR.
--   4. Lê gabarito (PDF é texto) e classifica subtopic via heurística.
--
-- Idempotente via ON CONFLICT (id) DO NOTHING.
-- =============================================================================

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q41',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  41,
  '- Sabe que eu nunca tinha estado nesta casa? — disse ele. — Sempre que nos víamos, era Nuria quem ia
ao meu encontro. “Para o senhor é mais fácil, paí”, dizia ela. “Para quê vai subir escadas? ” Eu sempre lhe
dizia: “Bem, se você não me convidar eu não vou”, e ela respondia: “Não preciso convidá-lo para a minha
casa, pal, nós convidamos estranhos. O senhor pode vir quando quiser. " Em mais de 15 anos, não vim vê-
la uma só vez. Sempre lhe disse que ela havia escolhido um péssimo bairro. Pouca luz. Um prédio velho.
Ela só concordava. [...]. É curioso como julgamos os demais e não percebemos o quão miserável é nosso
desprezo até eles nos faltarem, até serem tirados de nós. São tirados de nós porque nunca foram nossos...

ZAFÓN, Carlos Ruiz. A Sombra do Vento. Rio de Janeiro: Objetiva, 2007, p.293

Reconhecem-se, nesse trecho, sentimentos de amor e arrependimento encontrados nas relações familiares.
Esses sentimentos são traduzidos
|- pela descrição da dura realidade da vida da filha, Nuria.
I|l- pelas decepções causadas pela filha em morar num péssimo bairro.
Ill - pela ausência de gestos de carinho com a filha.
IV - pelo sentimento de menosprezo que tratava a filha.
É correto apenas o que se afirma em

(A) lelV.
(B) Nell.
(C) Il elV.
(D) ll el.
(E) LH elV.

[[PAGE 27-F]]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q42',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2018,
  1,
  42,
  'VAI, CARLOS! SER LEGO NA VIDA
TEXTO 1
=
no meio MB nunca me esquecerei
MM do caminho MM desse acontecimento
E jino uma na vida de minhas retinas
E pedra E tão fatigadas
= ae
LAURENTINO, Dedé. Vai, Carlos! Ser Lego na vida. , 18 set. 2017.
Disponível em: <http://piaui.folha.uol.com.br/vai-carlos-ser-lego-na-vida/>. Acesso em: 23 set. 2017.
TEXTO 2
No meio do caminho
No meio do caminho tinha uma pedra
tinha uma pedra no meio do caminho
tinha uma pedra
no meio do caminho tinha uma pedra.
Nunca me esquecerei desse acontecimento
na vida de minhas retinas tão fatigadas.
Nunca me esquecerei que no meio do caminho
tinha uma pedra
tinha uma pedra no meio do caminho
no meio do caminho tinha uma pedra.
ANDRADE, Carlos Drummond de. . 7.ed. Rio de Janeiro: Record, 2005. p.47.
A charge, texto |, faz uma brincadeira que acaba destacando um dos principais recursos do poema
drummondiano, texto 2, que é a

(A) elipse de informações fundamentais.
(B) exposição de elementos humorísticos.
(C) metáfora parnasiana das pedras.
(D) repetição progressiva de termos.
(E) Presença de formas poéticas fixas.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q43',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  43,
  'E
Leia o texto. º
C
Tirar a vida artificialmente seria tão pecaminoso ''
quanto impedir a morte artificialmente — porque .
se trata de intromissões dos homens na ordem ''
natural das coisas determinadas por Deus. ''
ALVES, Rubem. Rubem Alves Essencial (
— 300 pílulas de sabedoria. São Paulo:
Planeta, 2015, p. 225. F
Rubem Alves trilhou uma trajetória entre a ''
Teologia, a Psicanálise, a Educação, a Filosofia (
e a Litertura. |
Nesse texto, o intelectual brasileiro apresenta
uma visão que

(A) ressalta a vida como fruto do Misterioso !
Sagrado.
S
(B) exalta o poder do homem em driblar a morte. (
(C) destaca que o suicídio é um ultraje à ordem C
natural.
(D) mostra a obediência dos homens a aceitar (
os desígnios de Deus.
(E) zomba dos homens em querer mudar a (
ordem natural das coisas.
(
(
(',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q44',
  'linguagens',
  'Artes',
  'Artes',
  2018,
  1,
  44,
  '“Longarinas” rememora um belo cartão-postal
de Fortaleza — a Praia de Iracema e a Ponte
, dos Ingleses, ou “Ponte Velha'' — com uma linda
Ú letra realçada por um maracatu romântico,
À acompanhado por um solo de viola e uma
orquestração densa, valorizando a sonoridade
dos violinos e lembrando os timbres populares
'' das canções árabes.
. Pesquisadores da música cearense como Gilmar
: de Carvalho, Mary Pimentel e Nelson Augusto
a compartilham da opinião de que Ednardo é o
artista desta geração que mais cantou os nossos
lugares de memória em suas canções. [...]
2 CASTRO, Wagner. Ednardo. Fortaleza:
Demócrito Rocha, 2017. P.76-77. (Coleção
Terra Bárbara).
) £ , =
E possível reconhecer no texto em questão que
sua argumentação é orientada no sentido de
é convencer o público-leitor que o objetivo principal
1 do texto é/são
r

(A) a beleza inusitada de pontos turísticos da
capital cearense.
2
(B) os argumentos de autoridades sobre a
cidade em questão.
(C) a influência árabe na atual música popular
brasileira.
(D) as características musicais que destacam
um cantor.
(E) a importância da música cearense para o
contexto nacional.',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q45',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  45,
  'E
A CORUJA E A ÁGUIA
Coruja e águia, depois de muita briga resolveram
fazer as pazes.
— Basta de guerra — disse a coruja.
— O mundo é grande, e tolice maior que o mundo
é andarmos a comer os filhotes uma da outra.
— Perfeitamente — respondeu a águia —
Também eu não quero outra coisa.
— Nesse caso combinemos isso: de agora em
diante não comerás nunca os meus filhotes.
— Muito bem. Mas como posso distinguir os teus
filhotes?
— Coisa fácil. Sempre que encontrares uns
borrachos lindos, bem-feitihhos de corpo,
alegres, cheios de uma graça especial, que não
existe em filhote de nenhuma outra ave, já sabes,
são os meus.
— Está feito! — Concluiu a águia. |
Dias depois, andando à caça, a águia encontrou (
um ninho com três monstrengos dentro, que e
piavam de bico muito aberto.
— Horríveis bichos! — disse ela. — Vê-se logo (
que não são os filhos da coruja. (
E comeu-os. (
Mas eram os filhos da coruja. Ao regressar à toca,
a triste mãe chorou amargamente o desastre e (
foi ajustar contas com a rainha das aves. (
— Quê? — disse esta admirada. — Eram teus
filhos aqueles monstrenguinhos? Pois, olha não
se pareciam nada com o retrato que deles me
fizeste...
(Monteiro Lobato)
De acordo com a fábula, a estratégia de
argumentação da coruja foi

(A) racional, através da constatação dos fatos.
(B) baseada na comoção pelos sentimentos da
águia.
(C) uma ameaça à águia de que também poderia
comer os filhotes dela.
(D) de dizer que os filhotes da águia não eram
bonitos.
(E) desestabilidade da confiança da águia
mostrando também sua força.
29 0 0000 UNIFOR',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q46',
  'linguagens',
  'Literatura',
  'Literatura',
  2018,
  1,
  46,
  '1 | |
rf = E À
MM PM
> AD ==
|
1
S
o ee a, Pe
; MARTINS, Aldemir. . 1988. 1 original
| de arte, serigrafia, 33,5 cm x 31,8 cm.
Museu de Arte Moderna (São Paulo).
A pintura do artista brasileiro utiliza elementos
1 de estética de uma das Vanguardas Europeias,
: a saber o
?

(A) Realismo.
(B) Surrealismo.
(C) Cubismo.
o
N
(D) Expressionismo.
(E) Dadaísmo.
S
)
)
)
N
:|
:|
1
:|',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q47',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  47,
  '!
Eu Sou do Tamanho do que Vejo (
C
Da minha aldeia vejo quanto da terra se pode ver €
no Universo... F
Por isso a minha aldeia é tão grande como outra :''
terra qualquer í
Porque eu sou do tamanho do que vejo ,
E não, do tamanho da minha altura... L
Nas cidades a vida é mais pequena r
Que aqui na minha casa no cimo deste outeiro. C
C
Na cidade as grandes casas fecham a vista à
chave,
Escondem o horizonte, empurram o nosso olhar
para longe de todo o céu, E
Tornam-nos pequenos porque nos tiram o que os t
nossos olhos nos podem dar,
E tornam-nos pobres porque a nossa única (
riqueza é ver.
Alberto Caeiro, in “O Guardador de (
Rebanhos - Poema VII”
Fonte http://www.esa.esaportugues.com/ (
programa/Caeiro/textosCaeiro.htm
: | (
A partir do texto de Alberto Caeiro, um dos
heterônimos do poeta Fernando Pessoa, avalie (
as afirmações a seguir.
|- O poema organiza-se em torno do contraste
da “minha aldeia” e das “cidades”.
Il- A ideia da compreensão que se tem do
mundo é condicionada à imaginação de
cada um.
III- A presença de construções causais
evidencia uma intenção explicativa.
É correto o que se afirma em

(A) |, apenas.
(B) lelll, apenas.
(C) Il elll, apenas.
(D) Ill, apenas.
(E) ll el.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q48',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  48,
  'Observando alguns fatos de relevância
da contemporaneidade, tais como a crise
r econômica e os intermináveis combates na
Faixa de Gaza, vê-se que ao invés de explicar
a de forma cabal para o telespectador e ou leitor
da mídia escrita, acaba-se tendo dúvidas dos
fatos e há nitidamente tendências em certas
agências noticiosas. E até compreensível que
uma agência de notícias ligada a essa ou aquela
religião e ou a governos tente mostrar somente o
que lhe interessa, muitas vezes, certamente, por
conta de interesses inconfessáveis.
| MELO, Luís Olímpio Ferraz. Manipulação
2 Globalizada. hn""*— Pensamento
Contemporâneo. Fortaleza: ABC, 2010, p.39.
r
Esse trecho, sobre manipulação globalizada,
S tem como objetivo
2

(A) criticar a imprensa por apresentar
genericamente a notícia sem elucidar os
fatos.
e
(B) denunciar as agências de notícias de
| fornecer conteúdo jornalístico incompleto.
/
(C) defender os jornais por utilizar material das
À agências pela urgência para publicar.
(D) ressaltar a cobertura da mídia nos conflitos
| da Faixa de Gaza e da crise econômica.
o . À FAAO
''
(E) valorizar o trabalho jornalístico mostrando
todos os lados da notícia.
N
)
)
S',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q49',
  'linguagens',
  'Literatura',
  'Literatura',
  2018,
  1,
  49,
  'º Ene E
Leia o poema:
|
h
€
f
C
Mário Quintana — Canções
(

Pela análise do poema e considerando o (

momento literário de sua produção, pode-se

afirmar que

(

(A) há uma preocupação marcante com (
uma forma já mais elaborada de poema,
seguindo padrões estabelecidos antes do
modernismo, mas rompendo pelo conteúdo. (
(B) otom amoroso é retomado em uma dimensão
mais profunda que no romantismo, porque
seguido de um desconforto existencial,
também visto em outros poetas da segunda
fase modernista.
(C) o eu-lífico se entrega ao sentimento,
desconstruindo todo conceito que existia
anteriormente, rompendo consigo mesmo
para viver o outro e para o outro.
(D) a escolha das palavras (léxico do poema)
rompe com a lógica e desconstrói a imagem
do eu-lírico apresentada na primeira parte
do poema.
(E) a referência ao espantalho remete ao cunho
nacionalista do qual faz parte na primeira
fase modernista, numa retomada à cultura
brasileira.',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q50',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  50,
  'tidoesangue
à E AJUDE A QUEM PRECISA
EL=)
Disponível em: <http://portalsaude.saude.
gov.br/>. Acesso em: 8 set. 2017.
Na campanha veiculada pelo Ministério da
Saúde, a palavra “regularmente” cumpre a
função de reconhecer que o intuito principal da
campanha é
:

(A) gerar doações imediatas para um déficit que
é temporário.
é
(B) convencer certas regiões mais populosas a
doar sangue.
(C) colocar em dúvida a eficácia das campanhas
de doação.
''
(D) popularizar a hashtag que encabeça a nova
'' campanha.
)
|
(E) conseguir doadores de sangue que sejam
) mais regulares.
,
:|
,
:|
)
)
1
)
:|
:|

[[PAGE 32-F]]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q51',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  51,
  'O EVANGELHO CONTADO POR UM CEARENSE
(MATEUS, 8; 23-27 - adaptado)
Observando a linguagem utilizada, pode-se afirmar que

(A) a diversidade linguística gera inconsistência teológica, visto que o humor faz parte da narrativa.
(B) a comunicação no texto é possível e atende seu objetivo de atingir o público de comunidades incultas.
(C) a variação linguística enriquece o patrimônio cultural do país ao considerar formas diversificadas de
comunicação.
(D) o texto apresenta termos e expressões próprios da norma culta padrão de determinada região do país.
(E) a linguagem se distingue pelos elementos históricos, apesar de alguns registros escritos de maneira
errônea.

[[PAGE 33-F]]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q52',
  'linguagens',
  'Análise sintática e morfológica',
  'Sintaxe',
  2018,
  1,
  52,
  'A psicanálise tem uma importante contribuição na luta contra o racismo, principalmente em países
miscigenados como o Brasil; trata-se da elaboração do que Freud chamou (a respeito do antissemitismo
alemão) de narcisismo das pequenas diferenças. Para Freud, o ódio (racial, de gênero, de classe) não se
volta contra aqueles que nos parecem absolutamente exóticos. O ódio e o preconceito erguem barreiras
contra os que nos são tão semelhantes, em suas pequenas diferenças, que ameaçam nossa segurança
identitária. No racismo brasileiro é o fato de que o negro, o mulato e o cafuzo ameaçam a fronteira narcísica
dos que querem se identificar com o ideal europeu de beleza, de civilização, de conduta.
KEHL, Maria Rita. O racismo no divã — As heranças da escravidão brasileira e o “narcisismo das pequenas diferenças”
apontado por Freud. Revista Quatro cinco um, ano 1, nº 5, set. 2017, p.22-23.
Com base nesse contexto e nas informações apresentadas, pode-se afirmar que

(A) a psicanálise tem o objetivo de tratar desiquilíbrios psíquicos.
(B) o estudo de Freud revela que o ódio converge para o que é diferente.
(C) a miscigenação no Brasil ameaça a segurança identitárias do indivíduo.
(D) o verso de Caetano “Narciso acha veio o que não é espelho” confirma a ideia do texto.
(E) o ódio racial, de gênero e de classe tende para os que são similares.',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q53',
  'linguagens',
  'Figuras de linguagem',
  'Figuras',
  2018,
  1,
  53,
  'NT ae - = ceara == "
8 oo + ag
CONHECIMENTO à [EX | N FS Fr ESSPENIE Fat,
a PAX
LEVA''A : | ES ZA
- ” - o ed nto)
LIBERDADE WA ptgo, o ee ; SS
A—=A [rfe) ) S Eos z E SE SS x z NS
E EDER : E
Ei Fa Ty ecc ES Ext
AUS teme a) =
- É : — ; do =
AoÃo FEAGS 2 66 “Es
= VSEE Fo : Es a E
ITURRUSGARAIL, Adão. A vida como ela yeah. , São Paulo, 23 set. 2017. Disponível em: <http://
www .folha.uol.com.br/>. Acesso em: 23 set. 2017.
O efeito cômico da tirinha se apresenta pelo fato de ela relacionar

(A) metáforas muito conhecidas no meio prisional.
(B) recursos não verbais e uma interpretação literal.
(C) leitura com programas de incentivo para presos.
(D) silogismo com uma espécie de raciocínio indutivo.
(E) recursos visuais pouco comuns em tirinhas.

[[PAGE 34-F]]',
  '',
  'B',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q54',
  'linguagens',
  'Artes',
  'Artes',
  2018,
  1,
  54,
  'Leia o texto abaixo:
A dança é uma atividade bastante apreciada por adultos maduros. E os benefícios vão além da prática
de uma prazerosa atividade física. Um estudo da Organization for Computational Neurosciences (OCNS-
Paris), concluiu que dançar, por apenas um mês, tem impacto benéfico no controle da postura desse
grupo. Os pesquisadores observaram 38 adultos entre 54 e 89 anos. A ideia era verificar o quanto eles
“pbalançavam” enquanto estavam em pé.
Segundo os estudiosos, esta habilidade sinaliza o quão estável somos e pode ser mensurada. Feito isso,
os participantes foram divididos em dois times: um que praticaria dança em grupo, e o outro que não o
faria. As sessões ocorreram três vezes por semana, por 90 minutos e no período de um mês.
Terminado o teste, as medidas foram conferidas. A postura e o equilíbrio do grupo ativo melhoraram e o
levou a uma maior confiança, especialmente quando estavam com os olhos fechados. “Com a dança, as
pessoas passam a trabalhar mais a marcha, a direção e melhoram a coordenação motora e a postura”,
fala a professora de dança Rosi Alves (SP). “A oportunidade de sociabilizar também aprimora o humor e a
qualidade do sono”, conclui.
Por Letícia Ronche

http://revistavivasaude .uol.com.br/familia/saiba-mais-sobre-os-beneficios-da-atividade/6896/
As referências contribuem para a continuidade e progressão de um texto. Há correta referenciação na
alternativa

(A) “desse grupo” (1º parág) — dos estudiosos da OCNS - Paris.
(B) “eles balançavam” (1º parág) - pesquisadores.
(C) “Feito isso” (2º parág) — a pesquisa.
(D) “o levou” (3º parág) — o grupo ativo.
(E) “quando estavam de olhos fechados” (3º parág) — o grupo que dançava.

[[PAGE 35-F]]',
  '',
  'D',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q55',
  'linguagens',
  'Gêneros visuais (charge/tirinha/cartaz)',
  'Gêneros visuais',
  2018,
  1,
  55,
  '"
Observe a tirinha a seguir.
19 17 GETTING HOT É
IN HERE O0R1S VT ME Z
o E” )
o A 3
< >
CESSA)
DA CH
SAIO VA)
EA )
RAS AS NL, pano
Leo — Res =
https://www.cartoonstock.com/cartoonview.asp?catref=cgr0464
Avalie as informações a seguir.
|. O planeta está sofrendo com o aquecimento global.
Il. A avestruz representa o sofrimento dos animais com o desmatamento.
Ill. Atemperatura mundial está afetando muito mais o meio ambiente que os seres vivos.
IV. A avestruz representa os animais sentindo a temperatura elevada da terra.
V. Aavestruz representa o ser humano que se recusa a aceitar os efeitos negativos de seus atos ao invés
de solucioná-los.
É correto apenas o que se afirma em:

(A) V
(B) leV
(C) lLIleV
(D) LI elV.
(E) LI, IVeV.

[[PAGE 36-F]]',
  '',
  'A',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q56',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  56,
  'Marque a opção que melhor resume a ideia principal do texto.

(A) Mostrar a longa luta do povo Catalão pela independência da região e suas consequências a longo
prazo e a parceria mundial em defesa do plebiscito .
(B) Apresentar as ideias de Marianne Barriaux sobre a luta do povo catalão na defesa do direito de voto e
sua inconstitucionalidade e a posição e atuação da força jovem e adulta na mobilização nacional.
(C) Reportar a hora decisiva da luta do povo catalão tendo professores, pais, alunos e ativistas na
mobilização em defesa do plebiscito de independência, enquanto outra parte da população defende a
unidade nacional e a firmeza do governo espanhol.
(D) Conscientizar a comunidade internacional sobre o grande movimento e a força política do povo
espanhol que mesmo com a força policial tem o apoio de toda a população.
(E) Convidar o mundo para apoiar o movimento separatista em defesa do plebiscito e a truculência da
polícia e do governo espanhol ao fechar escolas e asilos e pontos de votação.',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q57',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  57,
  'Escolha a opção que corresponde à tradução das palavras grifadas no texto, mantendo o mesmo sentido

aplicado no texto.

(A) 1. permaneceram; 2. fecharam; 3. implorou; 4. desaparecer
(B) 1. espalharam-se; 2. reclamaram; 3. ordenou; 4. cair.
(C) 1. partilharam; 2. desligaram; 3. pediu; 4. desesperar.
(D) 1. partiram; 2. partilharam; 3. apelou ; 4. despencar.
(E) 1. espalharam-se; 2. desligaram; 3. apelou; 4. parar.

[[PAGE 38-F]]',
  '',
  'E',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q58',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  58,
  'Archaeologists uncover proof of how Ancient Egyptians built the Great Pyramid in 2600BC
7 o 2 The Sun, News Corp Australia Network
: PE. tuto Jo September 24, 2017 9:06pm
TE p Es SN “so /
- m— VP === NEW evidence reveals the Ancient Egyptians constructed
” : the Great Pyramid at Giza by transporting 170,000 tonnes
, n of limestone in boats.
; ” ” ” ) It has long been known that the rock was extracted 13km
eo Fem. á » away in Tura and that granite used in the monumental
E. “= structure was quarried 858km away in Aswan, reports The
Sun.
However, archaeologists have disagreed over how the material was transported to Giza, now part of modern-
day Cairo, for construction of Pharaoh Khufu''s tomb in 2600BC.
Now that mystery could be a step closer to being solved after the discovery of ''an ancient scroll of papyrus,
?a ceremonial boat and ?a network of waterways, reported the
The new evidence shows that thousands of labourers transported 170,000 tonnes of limestone along the River
Nile in wooden boats built with planks and rope.
The 2.5-tonne blocks were ferried through “a system of specially designed canals before arriving at an inland
port built just yards away from the base of the Great Pyramid.
The papyrus scroll is the only first-hand record of how the pyramid was built, and was written by an overseer
named Merer.
He explained in detail how the limestone was moved from the quarry in Tura to Giza using the Bronze Age
waterways.
Archaeologist Mark Lehner has also uncovered evidence of a waterway underneath the plateau the pyramid
sits on.
He said: “We''ve outlined the central canal basin, which we think was the primary delivery area to the foot of the
Giza Plateau.”
The new discoveries are being broadcast in a documentary called
Analise as sentenças abaixo sobre o texto.
|. —Anova evidência mostra que milhares de trabalhadores transportaram 170.000 toneladas de calcário pelo
Rio Nilo em barcos de madeira construídos com tábuas e corda.
Il. As descobertas estão sendo transmitidas em um documentário chamado a
Grande Pirâmide do Egito: A Nova Evidência.
Ill. Novas evidências revelam que os antigos egípcios construíram a Grande Pirâmide em Giza transportando
170.000 toneladas de calcário em barcos.
IV. Arqueólogos discordam de como o material foi transportado para Giza para a construção da Tumba do
Faraó Khufu.
V. Merer explicou dando detalhes de como o calcário era removido de pedreiras em Tura para Giza usando
os canais da Idade do Bronze.
Vl. Os blocos de 2.5 toneladas foram transportados em barcos através de canais antes de chegar ao porto
a jardas de distância da base da Grande Pirâmide.
A opção que reprsenta corretamente a ordem das sentenças de acordo com os eventos no texto é

(A) VIUIGGAGIV;V,
(B) IG; IV; GI; VV.
(C) UI; VI GI V AV.
(D) IIGAV;V; VAL
(E) WU; GIL VIE VAV,

[[PAGE 39-F]]',
  '',
  'C',
  false
) on conflict (id) do nothing;

insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)
values (
  '2018-1_Q59',
  'linguagens',
  'Interpretação de texto',
  'Interpretação',
  2018,
  1,
  59,
  'Rossitza Bontcheva is nineteen years old. She''s studying 1 a diploma 2? nursing ? Vazov

Nursing College. She has exams next month, so * the moment she is studying hard. She wants to be

a nurse * she likes working with people and she is interested 6 science 7 she doesn''t like

doing paper work.

She''d like to be a pediatric nurse ?º she really enjoys working ? children. She''s worked

1º a children''s ward ! three months as a work placement. One day, she hopes to work 1? India,

which she saw on TV.

Marque APENAS a alternativa correta.

(A) 1. for; 2. in; 3. at; 4. in; 5. for; 6. on; 7. so; 8. however; 9. to; 10. at; 11. for; 12.in
(B) 1.in; 2. on; 3. in; 4. at; 5. since; 6. in; 7. the; 8. however; 9. for; 10. In; 11. for; 12.in
(C) 1.in;2. in; 3. in; 4. at; 5. because; 6. on; 7. but; 8. because; 9. with; 10. on; 11. for; 12. in
(D) 1. for; 2. in; 3. at; 4. at; 5. because; 6. in; 7. but; 8. because; 9. with; 10. on; 11.for; 12.in
(E) 1. for; 2. on; 3. at; 4. on. 5. because; 6. in; 7. then; 8. because; 9. before; 10. In; 11. during; 12. in',
  '',
  'D',
  false
) on conflict (id) do nothing;
