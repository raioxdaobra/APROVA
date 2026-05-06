/**
 * PR 18 — Extrai questões de Linguagens (Português) das provas oficiais
 * UNIFOR Medicina e gera um seed SQL idempotente em
 * supabase/migrations/0023_seed_linguagens.sql.
 *
 * Pipeline por prova (year-semester):
 *   1. Lê o PDF da prova e localiza a seção "LINGUAGENS, CÓDIGOS E SUAS
 *      TECNOLOGIAS" até "REDAÇÃO".
 *   2. Quebra em blocos por marcador "Questão NN", inferindo o número da
 *      questão a partir do próprio texto.
 *   3. Para cada bloco extrai o enunciado + 5 alternativas (A..E).
 *   4. Lê o GABARITO oficial (primeira tabela — INGLÊS) e marca a resposta.
 *      Para Linguagens (questões 41-60) o gabarito é o mesmo em INGLÊS e
 *      ESPANHOL — só LEM (1-20) varia.
 *   5. Lê o PDF "QUESTÕES ANULADAS" (se existir): aplica retificações de
 *      gabarito e descarta as questões anuladas.
 *   6. Classifica tópico via heurística simples.
 *   7. Imprime stats e escreve SQL idempotente.
 *
 * Notas sobre o schema (`public.questions`):
 *   - id text PK, formato canônico `{ano}-{sem}_Q{NN}` com NN zero-padded.
 *   - discipline text (existem hoje: matematica/fisica/quimica/biologia/
 *     humanas). Aqui usamos `linguagens` por consistência com naming.
 *   - subtopic text NOT NULL e subtopic_short text NOT NULL: usamos o tópico
 *     classificado (ex.: "Interpretação de texto").
 *   - description text: enunciado + alternativas concatenadas (já que não
 *     existe coluna options no schema).
 *   - image_url text NOT NULL: deixamos string vazia '' por enquanto (texto
 *     extraído, sem imagem dedicada ainda — futuro pipeline pode preencher).
 *   - correct_answer char(1) ('A'..'E') aplicado a partir do gabarito.
 *   - annulled boolean: questões anuladas são descartadas na extração; este
 *     seed não insere registros anulados, então fica false.
 *
 * Uso: `npx tsx scripts/extract_linguagens.ts`
 *   --debug   imprime trechos para inspeção manual
 *   --limit=N processa apenas N provas (útil em iteração)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PROVAS_DIR = join(
  ROOT,
  'OneDrive',
  'Documentos',
  'APROVA',
  'PROVAS MEDICINA UNIFOR',
  'PROVA'
);
const OUT_SQL = join(ROOT, 'supabase', 'migrations', '0023_seed_linguagens.sql');

const DEBUG = process.argv.includes('--debug');
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1] ?? '0', 10) : 0;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ExtractedQuestion {
  id: string;
  year: number;
  semester: number;
  questionNum: number;
  discipline: string;
  topic: string;
  topicShort: string;
  statement: string;
  options: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  source: string;
}

interface ProvaPlan {
  year: number;
  semester: number;
  provaPath: string;
  gabaritoPath: string;
  anuladasPath: string | null;
}

// ---------------------------------------------------------------------------
// Helpers de PDF
// ---------------------------------------------------------------------------

async function extractPdfText(path: string): Promise<string> {
  const buf = readFileSync(path);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

// ---------------------------------------------------------------------------
// Descoberta dos arquivos
// ---------------------------------------------------------------------------

function discoverProvas(): ProvaPlan[] {
  if (!existsSync(PROVAS_DIR)) {
    throw new Error(`PROVAS_DIR não existe: ${PROVAS_DIR}`);
  }
  const all = readdirSync(PROVAS_DIR);
  const provaRe = /^(\d{4})-([12]) - PROVA MEDICINA - UNIFOR\.pdf$/;
  const plans: ProvaPlan[] = [];
  for (const name of all) {
    const m = provaRe.exec(name);
    if (!m) continue;
    const year = parseInt(m[1]!, 10);
    const semester = parseInt(m[2]!, 10);
    const gabarito = `${m[1]}-${m[2]} - GABARITO.pdf`;
    const anuladas = `${m[1]}-${m[2]} - GABARITO - QUESTÕES ANULADAS.pdf`;
    const gabaritoPath = join(PROVAS_DIR, gabarito);
    if (!existsSync(gabaritoPath)) {
      console.warn(`[skip] gabarito ausente para ${m[1]}-${m[2]}`);
      continue;
    }
    plans.push({
      year,
      semester,
      provaPath: join(PROVAS_DIR, name),
      gabaritoPath,
      anuladasPath: existsSync(join(PROVAS_DIR, anuladas))
        ? join(PROVAS_DIR, anuladas)
        : null,
    });
  }
  plans.sort((a, b) => a.year - b.year || a.semester - b.semester);
  return plans;
}

// ---------------------------------------------------------------------------
// Parsing do gabarito
// ---------------------------------------------------------------------------

/**
 * Extrai um mapa {número da questão -> letra} a partir do texto do gabarito
 * oficial. O PDF lista uma tabela por LEM (INGLÊS e ESPANHOL); ambas
 * coincidem para questões 41-60 (Linguagens). Usamos a primeira ocorrência
 * porque é suficiente.
 */
function parseGabarito(text: string): {
  answers: Map<number, string>;
  annulledInline: Set<number>;
} {
  const answers = new Map<number, string>();
  const annulledInline = new Set<number>();
  // Aceita 'X' (anulada inline). Linha de 20 marcadores [A-EX].
  const blockRe =
    /(\d+(?:\s+\d+){19})\s+([A-EX](?:\s+[A-EX]){19})/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(text)) !== null) {
    const nums = m[1]!.trim().split(/\s+/).map((n) => parseInt(n, 10));
    const letters = m[2]!.trim().split(/\s+/);
    for (let i = 0; i < nums.length && i < letters.length; i++) {
      const n = nums[i]!;
      const l = letters[i]!;
      if (l === 'X') {
        annulledInline.add(n);
        continue;
      }
      if (!answers.has(n)) answers.set(n, l);
    }
  }
  return { answers, annulledInline };
}

// ---------------------------------------------------------------------------
// Parsing de anuladas
// ---------------------------------------------------------------------------

/**
 * Lê o PDF de anuladas e retorna:
 *  - annulled: Set de números de questão a descartar.
 *  - rectifications: Map<número, letra> com gabaritos retificados.
 */
function parseAnuladas(text: string): {
  annulled: Set<number>;
  rectifications: Map<number, string>;
} {
  const annulled = new Set<number>();
  const rectifications = new Map<number, string>();

  // Padrão: "anular as referidas questões" ou "anular as questões 18, 21 e 22"
  const annulRe =
    /(?:anular(?:\s+as)?\s+(?:referidas\s+)?quest[õo]es)\s*([0-9,\s eE]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = annulRe.exec(text)) !== null) {
    const nums = (m[1] ?? '').match(/\d+/g) ?? [];
    for (const n of nums) annulled.add(parseInt(n, 10));
  }

  // Fallback: "questões 18, 21 e 22" próximas ao termo "anular"
  if (annulled.size === 0) {
    const fallback = /quest[õo]es\s+([0-9,\s eE]+)\s*,\s*raz[ãa]o\s+pela\s+qual\s+decidiu\s+anular/i.exec(
      text
    );
    if (fallback) {
      const nums = fallback[1]!.match(/\d+/g) ?? [];
      for (const n of nums) annulled.add(parseInt(n, 10));
    }
  }

  // Padrão de retificação:
  //   "Questão 34 e, após a retificação, a resposta correta é "A""
  const rectRe =
    /Quest[ãa]o\s+(\d+)[^"]*ap[óo]s\s+a\s+retifica[çc][ãa]o[^"]*"\s*([A-E])\s*"/gi;
  let r: RegExpExecArray | null;
  while ((r = rectRe.exec(text)) !== null) {
    rectifications.set(parseInt(r[1]!, 10), r[2]!);
  }
  return { annulled, rectifications };
}

// ---------------------------------------------------------------------------
// Parsing de questões da prova
// ---------------------------------------------------------------------------

const SECTION_START_RE = /LINGUAGENS,\s*C[ÓO]DIGOS\s+E\s+SUAS\s+TECNOLOGIAS/i;
const SECTION_END_RE = /\n\s*REDA[ÇC][ÃA]O\s*\n/i;

function extractLinguagensSection(text: string): string | null {
  const startMatch = SECTION_START_RE.exec(text);
  if (!startMatch) return null;
  // Inclui ~400 chars ANTES do marcador para capturar headers
  // "Questão 41 \tQuestão 42" que muitas vezes ficam no topo da página
  // anterior à linha "LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS".
  const startIdx = Math.max(0, startMatch.index - 400);
  const endRel = SECTION_END_RE.exec(text.slice(startIdx));
  const endIdx = endRel ? startIdx + endRel.index : text.length;
  return text.slice(startIdx, endIdx);
}

/**
 * Limpa noise do header de página/rodapé que aparece dentro do texto
 * extraído (ex.: "-- 22 of 51 --", "UNIFOR – Processo Seletivo 2024.1 -
 * MEDICINA"). Mantém quebras de parágrafo razoáveis.
 */
function cleanText(input: string): string {
  return input
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/UNIFOR\s*[–-].*?MEDICIN[Aa].*$/gm, '')
    .replace(/^\s*\d+\s+UNIFOR.*$/gm, '')
    .replace(/^\s*UNIFOR\s*$/gm, '')
    .replace(/LINGUAGENS,\s*C[ÓO]DIGOS\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/CI[ÊE]NCIAS\s+(DA\s+NATUREZA|HUMANAS)\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/MATEM[ÁA]TICA\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface RawQuestionBlock {
  questionNum: number;
  body: string;
}

/**
 * Quebra a seção de Linguagens em blocos por questão.
 *
 * Estratégia: localizar cada GRUPO completo de alternativas (A)..(E) em
 * ordem e fatiar a seção em torno desses grupos. Cada grupo corresponde a
 * exatamente uma questão. Os números das questões são inferidos da lista
 * ordenada de marcadores "Questão NN" presentes no texto.
 *
 * Por que não dividir só por marcadores "Questão NN":
 *   O extrator linear do pdf-parse interleva conteúdo quando a página tem
 *   layout em duas colunas (cabeçalho "Questão 41 \tQuestão 42" com texto
 *   abaixo). Isso embaralha os limites — então usar os grupos de (A)..(E)
 *   como ground truth é mais robusto.
 */
function splitIntoBlocks(section: string): RawQuestionBlock[] {
  // 1) Coleta marcadores "Questão NN" na ORDEM em que aparecem (sem
  // dedupe, apenas mantendo o filtro 41..60 para descartar ruído de outras
  // disciplinas/cabeçalhos). Em provas com layout em duas colunas, dois
  // marcadores aparecem juntos no topo da página antes do conteúdo das
  // duas questões — preserva-se a ordem visual.
  const numRe = /Quest[ãa]o\s+(\d+)/g;
  const orderedMarkers: { num: number; idx: number }[] = [];
  let nm: RegExpExecArray | null;
  const dedupe = new Set<number>();
  while ((nm = numRe.exec(section)) !== null) {
    const n = parseInt(nm[1]!, 10);
    if (n < 41 || n > 60) continue;
    if (dedupe.has(n)) continue; // ignora duplicações (rodapé/tabela final)
    dedupe.add(n);
    orderedMarkers.push({ num: n, idx: nm.index });
  }

  // 2) Localiza grupos completos A..E. Um grupo é uma sequência onde
  // aparecem (A) ... (B) ... (C) ... (D) ... (E) em ordem dentro de uma
  // janela razoável.
  const altRe = /\(([A-E])\)/g;
  const alts: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] = [];
  let am: RegExpExecArray | null;
  while ((am = altRe.exec(section)) !== null) {
    alts.push({ letter: am[1] as 'A' | 'B' | 'C' | 'D' | 'E', idx: am.index });
  }
  // Agrupa em sequências consecutivas A..B..C..D..E
  type Group = { startIdx: number; endIdx: number };
  const groups: Group[] = [];
  let cur: { letter: string; idx: number }[] = [];
  for (const a of alts) {
    const expected = ALT_LETTERS[cur.length];
    if (a.letter === expected) {
      cur.push(a);
      if (cur.length === 5) {
        groups.push({
          startIdx: cur[0]!.idx,
          // endIdx é a posição logo APÓS a marca (E) para limitar ali; o
          // texto da alternativa E em si vai até o próximo grupo ou final.
          endIdx: a.idx,
        });
        cur = [];
      }
    } else if (a.letter === 'A') {
      // sequência reiniciou (talvez houve "(C)" perdido em ruído)
      cur = [a];
    } else {
      // letra fora de ordem; reset
      cur = [];
    }
  }
  if (groups.length === 0) return [];

  // 3) Pivô inicial: para o primeiro bloco evitamos puxar conteúdo da
  // disciplina anterior. Usamos a posição do marcador "LINGUAGENS, CÓDIGOS"
  // ou do primeiro "Questão 41" como ponto inicial.
  let initialPivot = 0;
  const linguagensMarker = /LINGUAGENS,\s*C[ÓO]DIGOS/i.exec(section);
  if (linguagensMarker) initialPivot = linguagensMarker.index;
  const q41Marker = /Quest[ãa]o\s+41\b/.exec(section);
  if (q41Marker && q41Marker.index < initialPivot) initialPivot = q41Marker.index;

  // 4) Filtra grupos que aparecem ANTES do primeiro marcador "Questão 41"
  // (são ruído da seção anterior trazido pelo padding de 400 chars).
  const firstMarkerIdx = orderedMarkers.length > 0 ? orderedMarkers[0]!.idx : 0;
  const validGroups = groups.filter((g) => g.startIdx >= firstMarkerIdx);

  // 5) Pareamento 1:1 entre grupos (A..E) válidos e marcadores "Questão NN"
  // na ORDEM em que aparecem. Para cada grupo, body = intervalo entre o fim
  // do grupo anterior e o início do próximo.
  //
  // Quando #groups != #markers, paramos no menor — preferimos perder
  // questões a desalinhar respostas com gabarito.
  const limit = Math.min(validGroups.length, orderedMarkers.length);
  const blocks: RawQuestionBlock[] = [];
  for (let i = 0; i < limit; i++) {
    const start = i === 0 ? initialPivot : validGroups[i - 1]!.endIdx + 4;
    const end = i + 1 < limit ? validGroups[i + 1]!.startIdx : section.length;
    const body = section.slice(start, end);
    blocks.push({ questionNum: orderedMarkers[i]!.num, body });
  }
  return blocks;
}

const ALT_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

/**
 * Extrai enunciado + alternativas (A..E) de um bloco. Retorna null se não
 * encontrar 5 alternativas em sequência (questão pode ter texto em imagem
 * ou ser inválida).
 *
 * O bloco pode conter sobras do final da questão anterior (resto da
 * alternativa E anterior). Para isolar a questão atual procuramos o
 * ÚLTIMO grupo completo (A) (B) (C) (D) (E) em ordem.
 */
function parseQuestionBody(body: string): {
  statement: string;
  options: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
} | null {
  const altRe = /\(([A-E])\)/g;
  const alts: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = altRe.exec(body)) !== null) {
    alts.push({ letter: m[1] as 'A' | 'B' | 'C' | 'D' | 'E', idx: m.index });
  }
  // Acha o ÚLTIMO grupo válido (A..E em sequência)
  let chosen: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] | null = null;
  let cur: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] = [];
  for (const a of alts) {
    const expected = ALT_LETTERS[cur.length];
    if (a.letter === expected) {
      cur.push(a);
      if (cur.length === 5) {
        chosen = cur;
        cur = [];
      }
    } else if (a.letter === 'A') {
      cur = [a];
    } else {
      cur = [];
    }
  }
  if (!chosen) return null;
  // statement = tudo entre o início do bloco e a posição do (A)
  // Mas há um caso: o (A) anterior (do final da questão prévia) pode estar
  // antes. Para limpar, pegamos do último final-de-(E) anterior ao chosen[0].
  const aIdx = chosen[0]!.idx;
  // Localiza o último (E) ANTES de aIdx (que pertenceria à questão prévia)
  let cutFrom = 0;
  const earlierE = body.slice(0, aIdx).lastIndexOf('(E)');
  if (earlierE !== -1) {
    // Avança até depois do texto da alternativa (E) anterior — usa o
    // primeiro "Questão NN" / dois \n após (E) como pista, ou simplesmente
    // descartamos tudo até o fim da última frase antes do enunciado.
    // Heurística: cortar até depois do primeiro "\n" depois de (E), pulando
    // o conteúdo curto que pode acompanhar.
    const after = body.slice(earlierE);
    const nlMatch = /\n\s*\n/.exec(after);
    if (nlMatch) {
      cutFrom = earlierE + nlMatch.index + nlMatch[0].length;
    } else {
      // fallback: pula até depois do '(E)' marker
      cutFrom = earlierE + 3;
    }
  }
  let statementRaw = body.slice(cutFrom, aIdx);
  // Remove cabeçalhos de disciplina/seção e ruído de página antes de
  // procurar marcadores de questão. cleanText cuida do resto depois.
  statementRaw = statementRaw
    .replace(/LINGUAGENS,\s*C[ÓO]DIGOS\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/CI[ÊE]NCIAS\s+(DA\s+NATUREZA|HUMANAS)\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/MATEM[ÁA]TICA\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/UNIFOR\s*[–-].*?MEDICIN[Aa].*$/gm, '')
    .replace(/^\s*\d+\s+UNIFOR.*$/gm, '')
    .replace(/^\s*UNIFOR\s*$/gm, '');
  // Remove marcadores "Questão NN" do início (até 5 consecutivos).
  for (let pass = 0; pass < 5; pass++) {
    const m = /^\s*Quest[ãa]o\s+\d+\s*/.exec(statementRaw);
    if (!m) break;
    statementRaw = statementRaw.slice(m[0].length);
  }
  const statement = cleanText(statementRaw);

  const options: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const startIdx = chosen[i]!.idx + 3; // pula "(X)"
    let endIdx = i + 1 < 5 ? chosen[i + 1]!.idx : body.length;
    // Para a alternativa (E), corta no próximo marcador "Questão NN" ou
    // no início do enunciado da próxima questão (que vem após o (E)).
    if (i === 4) {
      const tail = body.slice(startIdx);
      const cutters = [
        /\nQuest[ãa]o\s+\d+/,
        /\n[A-Z][^\n]{30,}\n/, // próxima frase de enunciado em parágrafo
      ];
      for (const c of cutters) {
        const cm = c.exec(tail);
        if (cm) {
          endIdx = Math.min(endIdx, startIdx + cm.index);
          break;
        }
      }
    }
    const txt = cleanText(body.slice(startIdx, endIdx));
    options.push({ letter: chosen[i]!.letter, text: txt });
  }
  if (statement.length < 5) return null;
  // Sanity: descarta opções vazias ou absurdamente longas
  if (options.some((o) => o.text.length === 0 || o.text.length > 1500)) return null;
  return { statement, options };
}

// ---------------------------------------------------------------------------
// Heurística de tópico
// ---------------------------------------------------------------------------

const TOPIC_RULES: { pattern: RegExp; topic: string; short: string }[] = [
  {
    pattern: /figura(s)?\s+de\s+linguagem|met[áa]fora|met[oô]n[ií]mia|antiteses|antítese|paradoxo|hip[eé]rbole|prosopopeia|ironia|aliteraç[ãa]o|eufemismo|catacrese/i,
    topic: 'Figuras de linguagem',
    short: 'Figuras',
  },
  {
    pattern: /func[ãa]o\s+(da\s+)?linguagem|fun[çc][õo]es\s+da\s+linguagem|metalingu[ií]stica|conativa|fática|fática|po[ée]tica|emotiva|expressiva|referencial/i,
    topic: 'Funções da linguagem',
    short: 'Funções',
  },
  {
    pattern: /literatura|romantismo|modernismo|realismo|simbolismo|barroco|arcadismo|parnasianismo|naturalismo|machado de assis|cl[áa]ssico|cordel|cron(ica|ista)|romance|conto/i,
    topic: 'Literatura',
    short: 'Literatura',
  },
  {
    pattern: /conjun[çc][ãa]o|preposi[çc][ãa]o|pronome|adv[eé]rbio|verbo|sujeito|predicado|or[aá][cç][ãa]o|sintaxe|sint[áa]tica|morfol[oó]gica|advérbio|substantivo|adjetivo|crase/i,
    topic: 'Análise sintática e morfológica',
    short: 'Sintaxe',
  },
  {
    pattern: /coes[ãa]o|coer[êe]ncia|conector|articula[çc][ãa]o\s+textual|refer[êe]ncia\s+anaf|catáfora|an[áa]fora/i,
    topic: 'Coesão e coerência',
    short: 'Coesão',
  },
  {
    pattern: /charge|tirinha|quadrinhos|cartum|propaganda|publicit[áa]ria|cartaz/i,
    topic: 'Gêneros visuais (charge/tirinha/cartaz)',
    short: 'Gêneros visuais',
  },
  {
    pattern: /artes|arte\s+(plástica|visual)|pintura|m[úu]sica|cinema|teatro|dan[çc]a|escultura/i,
    topic: 'Artes',
    short: 'Artes',
  },
  {
    pattern: /educação\s+física|esporte|atividade\s+física/i,
    topic: 'Educação Física',
    short: 'Ed. Física',
  },
];

function classifyTopic(statement: string, optionsText: string): {
  topic: string;
  short: string;
} {
  const haystack = `${statement}\n${optionsText}`;
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(haystack)) {
      return { topic: rule.topic, short: rule.short };
    }
  }
  return { topic: 'Interpretação de texto', short: 'Interpretação' };
}

// ---------------------------------------------------------------------------
// Processamento de uma prova
// ---------------------------------------------------------------------------

interface ProvaResult {
  questions: ExtractedQuestion[];
  annulled: number[];
  failed: boolean;
  reason?: string;
}

async function processProva(plan: ProvaPlan): Promise<ProvaResult> {
  let provaText: string;
  let gabaritoText: string;
  try {
    provaText = await extractPdfText(plan.provaPath);
    gabaritoText = await extractPdfText(plan.gabaritoPath);
  } catch (err) {
    return {
      questions: [],
      annulled: [],
      failed: true,
      reason: `erro lendo PDFs: ${(err as Error).message}`,
    };
  }
  // PDFs com menos de ~10k chars de texto são geralmente imagens escaneadas
  // (provas digitalizadas onde só metadados/cabeçalho extraem como texto).
  if (provaText.length < 10000) {
    return {
      questions: [],
      annulled: [],
      failed: true,
      reason: `prova text curto (${provaText.length} chars) — provavelmente PDF é imagem escaneada`,
    };
  }
  const section = extractLinguagensSection(provaText);
  if (!section) {
    return {
      questions: [],
      annulled: [],
      failed: true,
      reason: 'seção LINGUAGENS não encontrada',
    };
  }
  const blocks = splitIntoBlocks(section);
  const { answers: gabarito, annulledInline } = parseGabarito(gabaritoText);

  let annulledSet = new Set<number>(annulledInline);
  const rectifications = new Map<number, string>();
  if (plan.anuladasPath) {
    try {
      const aText = await extractPdfText(plan.anuladasPath);
      const parsed = parseAnuladas(aText);
      for (const n of parsed.annulled) annulledSet.add(n);
      for (const [k, v] of parsed.rectifications) rectifications.set(k, v);
    } catch (err) {
      console.warn(
        `[warn] erro lendo anuladas de ${plan.year}-${plan.semester}: ${(err as Error).message}`
      );
    }
  }
  // aplica retificações ao gabarito
  for (const [k, v] of rectifications) gabarito.set(k, v);

  const out: ExtractedQuestion[] = [];
  const seen = new Set<number>();
  const skippedAnulled: number[] = [];

  for (const block of blocks) {
    const num = block.questionNum;
    if (seen.has(num)) continue; // dedupe (alguns headers aparecem 2x)
    seen.add(num);
    if (annulledSet.has(num)) {
      skippedAnulled.push(num);
      continue;
    }
    const parsed = parseQuestionBody(block.body);
    if (!parsed) {
      if (DEBUG) {
        console.warn(
          `  [debug] ${plan.year}-${plan.semester} Q${num}: parse falhou (alternativas não detectadas)`
        );
      }
      continue;
    }
    const correct = gabarito.get(num);
    if (!correct || !/^[A-E]$/.test(correct)) {
      if (DEBUG) {
        console.warn(
          `  [debug] ${plan.year}-${plan.semester} Q${num}: gabarito ausente ('${correct}')`
        );
      }
      continue;
    }
    const optionsText = parsed.options.map((o) => o.text).join(' ');
    const { topic, short } = classifyTopic(parsed.statement, optionsText);
    const id = `${plan.year}-${plan.semester}_Q${String(num).padStart(2, '0')}`;
    out.push({
      id,
      year: plan.year,
      semester: plan.semester,
      questionNum: num,
      discipline: 'linguagens',
      topic,
      topicShort: short,
      statement: parsed.statement,
      options: parsed.options,
      correctAnswer: correct as 'A' | 'B' | 'C' | 'D' | 'E',
      source: `Unifor Medicina ${plan.year}.${plan.semester}`,
    });
  }
  return { questions: out, annulled: skippedAnulled, failed: false };
}

// ---------------------------------------------------------------------------
// Geração de SQL
// ---------------------------------------------------------------------------

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function buildSql(questions: ExtractedQuestion[]): string {
  const header =
    `-- =============================================================================\n` +
    `-- Migration 0023 — Seed de questões de Linguagens (Português)\n` +
    `-- =============================================================================\n` +
    `-- Gerado por scripts/extract_linguagens.ts a partir das provas oficiais\n` +
    `-- UNIFOR Medicina 2015.1–2026.1 (PDFs em\n` +
    `-- 'PROVAS MEDICINA UNIFOR/PROVA/'). Idempotente via ON CONFLICT.\n` +
    `--\n` +
    `-- Campos:\n` +
    `--   description: enunciado + alternativas (A..E) concatenados em texto.\n` +
    `--                Schema atual de questions não tem coluna 'options', então\n` +
    `--                guardamos tudo aqui — o pipeline de UI já trata enunciado\n` +
    `--                rico via markdown.\n` +
    `--   image_url: '' (texto extraído, sem imagem por enquanto). Schema exige\n` +
    `--              NOT NULL mas aceita string vazia. Pipeline futuro pode\n` +
    `--              gerar a imagem.\n` +
    `--   correct_answer: extraído do GABARITO oficial (PDF), com retificações\n` +
    `--              aplicadas a partir do PDF de QUESTÕES ANULADAS quando existir.\n` +
    `--   subtopic / subtopic_short: heurística simples baseada em palavras-chave\n` +
    `--              (Figuras de linguagem / Funções da linguagem / Literatura /\n` +
    `--              Análise sintática / Coesão / Gêneros visuais / Artes /\n` +
    `--              Interpretação).\n` +
    `--\n` +
    `-- Anuladas: descartadas durante extração; este seed não as inclui.\n` +
    `-- =============================================================================\n\n`;

  const lines: string[] = [];
  for (const q of questions) {
    const optionsBlock = q.options
      .map((o) => `(${o.letter}) ${o.text}`)
      .join('\n');
    const description = `${q.statement}\n\n${optionsBlock}`;
    lines.push(
      `insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)\n` +
        `values (\n` +
        `  '${sqlEscape(q.id)}',\n` +
        `  '${sqlEscape(q.discipline)}',\n` +
        `  '${sqlEscape(q.topic)}',\n` +
        `  '${sqlEscape(q.topicShort)}',\n` +
        `  ${q.year},\n` +
        `  ${q.semester},\n` +
        `  ${q.questionNum},\n` +
        `  '${sqlEscape(description)}',\n` +
        `  '',\n` +
        `  '${q.correctAnswer}',\n` +
        `  false\n` +
        `) on conflict (id) do nothing;`
    );
  }
  return header + lines.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const plans = discoverProvas();
  const limited = LIMIT > 0 ? plans.slice(0, LIMIT) : plans;
  console.log(`encontrados ${plans.length} pares prova/gabarito (processando ${limited.length})`);

  const all: ExtractedQuestion[] = [];
  const failures: { year: number; semester: number; reason: string }[] = [];
  let totalAnnulled = 0;

  for (const plan of limited) {
    process.stdout.write(`  ${plan.year}-${plan.semester} ... `);
    const result = await processProva(plan);
    if (result.failed) {
      console.log(`FALHOU (${result.reason})`);
      failures.push({ year: plan.year, semester: plan.semester, reason: result.reason ?? 'unknown' });
      continue;
    }
    all.push(...result.questions);
    totalAnnulled += result.annulled.length;
    console.log(
      `${result.questions.length} extraídas, ${result.annulled.length} anuladas`
    );
  }

  // ordena por id para SQL determinístico
  all.sort((a, b) => a.id.localeCompare(b.id));

  const sql = buildSql(all);
  writeFileSync(OUT_SQL, sql, 'utf8');

  console.log('---');
  console.log(`extraídas: ${all.length} questões`);
  console.log(`anuladas descartadas: ${totalAnnulled}`);
  console.log(`PDFs com falha: ${failures.length}`);
  for (const f of failures) {
    console.log(`  - ${f.year}-${f.semester}: ${f.reason}`);
  }
  console.log(`SQL escrito em: ${OUT_SQL}`);
  console.log('Anos cobertos: ' + Array.from(new Set(all.map((q) => `${q.year}.${q.semester}`))).join(', '));
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
