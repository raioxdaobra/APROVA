/**
 * PR 23 — OCR da prova 2018-1 (PDF escaneado)
 *
 * Extrai questões da seção "LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS" da prova
 * 2018.1 do vestibular de Medicina da UNIFOR. Esta prova foi entregue como
 * PDF escaneado (imagens) — pdf-parse não consegue extrair texto, então
 * rodamos OCR via tesseract.js (lang `por`) sobre cada página renderizada
 * via pdfjs-dist + node-canvas.
 *
 * Pipeline:
 *   1. Renderiza páginas do PDF da prova como PNG em alta resolução.
 *   2. Roda OCR (português) em cada página, concatena o texto na ordem.
 *   3. Aplica a MESMA lógica de parsing de scripts/extract_linguagens.ts
 *      (com pequenas tolerâncias adicionais a artefatos de OCR — ex.: "(O)"
 *      em vez de "(C)", número da questão com "0" em vez de "O" etc.).
 *   4. Lê o gabarito (`2018-1 - GABARITO.pdf`) com pdf-parse — esse PDF é
 *      texto, não escaneado.
 *   5. Gera SQL idempotente em supabase/migrations/0025_seed_linguagens_2018_1.sql.
 *
 * Não inserimos textos vazios/null. Se OCR não conseguir parsear uma questão,
 * ela é pulada e logada.
 *
 * Uso: `npx tsx scripts/ocr_2018_1.ts`
 *   --debug        log adicional e dump do texto OCR concatenado
 *   --pages=A-B    limita processamento à faixa de páginas (debug)
 *   --skip-render  reusa PNGs já renderizados em /tmp/ocr_2018_1_pages/
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createWorker } from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Em ambientes de worktree do Claude (cwd != $HOME), as provas vivem em
// C:/Users/engar/OneDrive/... — caminho absoluto resolve nos dois casos.
const PROVAS_DIR =
  'C:/Users/engar/OneDrive/Documentos/APROVA/PROVAS MEDICINA UNIFOR/PROVA';

const PROVA_PDF = join(PROVAS_DIR, '2018-1 - PROVA MEDICINA - UNIFOR.pdf');
const GABARITO_PDF = join(PROVAS_DIR, '2018-1 - GABARITO.pdf');
const OUT_SQL = join(
  ROOT,
  'supabase',
  'migrations',
  '0025_seed_linguagens_2018_1.sql'
);

const CACHE_DIR = join(process.env.TEMP ?? '/tmp', 'ocr_2018_1_pages');

const DEBUG = process.argv.includes('--debug');
const SKIP_RENDER = process.argv.includes('--skip-render');
const PAGES_ARG = process.argv.find((a) => a.startsWith('--pages='));

const RENDER_SCALE = 3.0;
const YEAR = 2018;
const SEMESTER = 1;
const SOURCE = `Unifor Medicina ${YEAR}.${SEMESTER}`;

// Carrega pdfjs-dist 3.x via createRequire — a versão mais nova (5+) tem
// problemas de compat com node-canvas em PDFs com imagens inline.
const require = createRequire(import.meta.url);
type CanvasMod = {
  createCanvas: (w: number, h: number) => any;
};
const { createCanvas } = require('canvas') as CanvasMod;
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js') as any;

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

// ---------------------------------------------------------------------------
// Render PDF -> PNGs por página
// ---------------------------------------------------------------------------

/**
 * Renderiza cada página em DOIS recortes: metade esquerda e metade direita.
 * O OCR depois lê cada metade isoladamente — isso preserva a ordem de leitura
 * em provas com layout em duas colunas (Q45/Q46 lado a lado etc.). Em páginas
 * com uma única coluna, a metade direita é majoritariamente vazia mas não
 * atrapalha — só adiciona ruído leve descartado pelo parser.
 */
type RenderedPage = {
  pageNum: number;
  variant: 'F' | 'L' | 'R'; // Full / Left half / Right half
  png: Buffer;
};

/**
 * Renderiza cada página em TRÊS variantes: full, left-half, right-half.
 *
 * Estratégia robusta pra OCR de PDFs com mistura de layouts (uma coluna em
 * algumas páginas, duas em outras):
 *   - O OCR da página FULL preserva markers de cabeçalho ("Questão NN") em
 *     páginas single-column onde o split corta no meio do texto.
 *   - Os OCRs de LEFT/RIGHT preservam ordem de leitura coluna-por-coluna em
 *     páginas com layout em duas colunas. Isso impede que tesseract leia
 *     linha-a-linha cruzando colunas e embaralhe o conteúdo de Q45/Q46.
 *
 * O parser combina os três e usa dedupe por marker — primeira ocorrência
 * vence.
 */
async function renderPagesToPng(
  pdfPath: string,
  pageRange: [number, number] | null,
): Promise<RenderedPage[]> {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;

  const start = pageRange ? pageRange[0] : 1;
  const end = pageRange ? Math.min(pageRange[1], doc.numPages) : doc.numPages;

  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const out: RenderedPage[] = [];

  for (let p = start; p <= end; p++) {
    const variants: ('F' | 'L' | 'R')[] = ['F', 'L', 'R'];
    let fullCanvas: any = null;
    let viewport: any = null;
    for (const variant of variants) {
      const cachePath = join(
        CACHE_DIR,
        `p${String(p).padStart(2, '0')}_${variant}.png`,
      );
      if (SKIP_RENDER && existsSync(cachePath)) {
        out.push({ pageNum: p, variant, png: readFileSync(cachePath) });
        if (DEBUG) console.log(`  [render] cached page ${p}-${variant}`);
        continue;
      }
      if (!fullCanvas) {
        const page = await doc.getPage(p);
        viewport = page.getViewport({ scale: RENDER_SCALE });
        fullCanvas = createCanvas(viewport.width, viewport.height);
        const ctx = fullCanvas.getContext('2d');
        await page.render({
          canvasContext: ctx,
          viewport,
          canvas: fullCanvas,
        }).promise;
      }
      let buf: Buffer;
      if (variant === 'F') {
        buf = fullCanvas.toBuffer('image/png');
      } else {
        const halfW = Math.floor(viewport.width / 2);
        const overlap = Math.floor(viewport.width * 0.04);
        const cropX = variant === 'L' ? 0 : halfW - overlap;
        const cropW =
          variant === 'L'
            ? halfW + overlap
            : Math.ceil(viewport.width) - cropX;
        const cropCanvas = createCanvas(cropW, viewport.height);
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(
          fullCanvas,
          cropX,
          0,
          cropW,
          viewport.height,
          0,
          0,
          cropW,
          viewport.height,
        );
        buf = cropCanvas.toBuffer('image/png');
      }
      writeFileSync(cachePath, buf);
      out.push({ pageNum: p, variant, png: buf });
      if (DEBUG) console.log(`  [render] page ${p}-${variant} (${buf.length} bytes)`);
    }
  }
  await doc.destroy();
  return out;
}

// ---------------------------------------------------------------------------
// OCR
// ---------------------------------------------------------------------------

/**
 * Detecta páginas com layout em duas colunas pelo padrão
 * "Questão NN Questão NN+1" no OCR full. Páginas single-column usam só o
 * texto FULL; two-column usam o texto L + R em sequência.
 */
async function ocrPages(pages: RenderedPage[]): Promise<string> {
  const worker = await createWorker('por', undefined, {
    logger: () => undefined,
  });
  // Agrupa por pageNum
  const byPage = new Map<number, Record<'F' | 'L' | 'R', RenderedPage>>();
  for (const p of pages) {
    if (!byPage.has(p.pageNum))
      byPage.set(p.pageNum, {} as Record<'F' | 'L' | 'R', RenderedPage>);
    byPage.get(p.pageNum)![p.variant] = p;
  }

  // Cache local de OCR por (page,variant) — evita rerodar
  const ocrCache = new Map<string, string>();
  async function ocrOf(p: RenderedPage): Promise<string> {
    const key = `${p.pageNum}-${p.variant}`;
    if (ocrCache.has(key)) return ocrCache.get(key)!;
    const { data } = await worker.recognize(p.png);
    if (DEBUG) {
      console.log(
        `  [ocr] page ${key}: ${data.text.length} chars (conf=${data.confidence.toFixed(1)})`,
      );
    }
    ocrCache.set(key, data.text);
    return data.text;
  }

  // Decide variant por página: rodamos FULL primeiro, e se detectamos padrão
  // de duas colunas (dois "Questão NN" próximos no mesmo trecho — i.e. linha
  // de cabeçalho com dois marcadores), trocamos por L+R.
  let combined = '';
  const sortedPages = Array.from(byPage.keys()).sort((a, b) => a - b);
  for (const pageNum of sortedPages) {
    const variants = byPage.get(pageNum)!;
    const fullText = variants.F ? await ocrOf(variants.F) : '';
    // Padrão duas colunas: dois "Questão NN" nos primeiros ~600 chars
    // separados por <80 chars (mesma linha de cabeçalho).
    const head = fullText.slice(0, 800);
    const twoColRe =
      /Quest[ãa]o\s+\d+[\s\S]{0,80}?Quest[ãa]o\s+\d+/;
    const isTwoCol = twoColRe.test(head);
    if (isTwoCol && variants.L && variants.R) {
      const lt = await ocrOf(variants.L);
      const rt = await ocrOf(variants.R);
      combined += `\n[[PAGE ${pageNum}-L]]\n${lt}\n[[PAGE ${pageNum}-R]]\n${rt}\n`;
      if (DEBUG) console.log(`  [layout] page ${pageNum}: 2-col → using L+R`);
    } else {
      combined += `\n[[PAGE ${pageNum}-F]]\n${fullText}\n`;
      if (DEBUG) console.log(`  [layout] page ${pageNum}: 1-col → using F`);
    }
  }
  await worker.terminate();
  return combined;
}

// ---------------------------------------------------------------------------
// Limpeza do texto OCR
// ---------------------------------------------------------------------------

/**
 * Aplica correções tipicas de erro do tesseract sobre português + texto
 * estruturado de prova. Mantemos transformações conservadoras — apenas
 * normalizações que não alteram o sentido das alternativas.
 */
function normalizeOcr(input: string): string {
  let s = input;
  // Cabeçalho/rodapé fixos
  s = s.replace(/^\s*UNIFOR\b.*$/gm, '');
  s = s.replace(/^\s*\d+\s+UNIFOR.*$/gm, '');
  s = s.replace(/UNIFOR\s*[-–]\s*Processo Seletivo.*?MEDICINA/gi, '');

  // OCR confunde "(O)" com "(C)" e "(0)" com "(D)" em algumas tipografias.
  // Substituímos APENAS quando a "letra" está em parênteses no início de
  // alternativa (depois de \n ou espaço).
  s = s.replace(/(\s)\(O\)/g, '$1(C)');
  s = s.replace(/(\s)\(0\)/g, '$1(C)');
  // Tesseract ocasionalmente lê o "(C)" como "(OC)" quando o parêntese inicial
  // captura ruído da letra. Trocamos quando aparece em início de linha — é
  // sempre marcador de alternativa.
  s = s.replace(/^\s*\(OC\)/gm, '(C)');
  s = s.replace(/(\s)\(OC\)/g, '$1(C)');
  // "A)" sem parêntese de abertura — ocorre em scans com baixo contraste.
  // Reparamos APENAS quando vem em início de linha seguido de espaço.
  s = s.replace(/^([A-E])\)\s/gm, '($1) ');

  // Marcadores "Questão NN" às vezes vem com lixo. Normaliza.
  s = s.replace(/Quest[aã]o\s*[\s|]*\s*(\d+)/g, 'Questão $1');
  // "Questao" sem til
  s = s.replace(/Questao\s+(\d+)/gi, 'Questão $1');

  // Recovery específico desta prova: o marker "Questão 59" da página de
  // INGLÊS (p39) tem fundo preto destacado e o tesseract não lê. Injetamos
  // manualmente antes do enunciado conhecido se necessário.
  // Detecção: presença da sentença característica SEM um marker Q59
  // próximo (≤200 chars antes).
  const q59Anchor =
    /Rossitza Bontcheva is nineteen years old/i.exec(s);
  if (q59Anchor) {
    const before = s.slice(Math.max(0, q59Anchor.index - 200), q59Anchor.index);
    if (!/Quest[ãa]o\s+59\b/.test(before)) {
      s =
        s.slice(0, q59Anchor.index) +
        '\nQuestão 59\n\n' +
        s.slice(q59Anchor.index);
    }
  }

  // Linhas separadoras de página customizadas
  // (mantém [[PAGE N]] como anchor, não remove)

  return s;
}

// ---------------------------------------------------------------------------
// Parsing do gabarito (PDF de texto)
// ---------------------------------------------------------------------------

async function loadGabarito(): Promise<Map<number, string>> {
  // Usa pdfjs 3.x (mesmo módulo que renderizamos páginas com) para extrair
  // texto do gabarito — evita conflito com pdf-parse que carrega pdfjs 5.x
  // internamente. O gabarito é texto puro, então getTextContent() basta.
  const data = new Uint8Array(readFileSync(GABARITO_PDF));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;
  let text = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lineMap = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      const x = item.transform[4] ?? 0;
      const y = Math.round(item.transform[5] ?? 0);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x, str: item.str });
    }
    const ys = Array.from(lineMap.keys()).sort((a, b) => b - a);
    for (const y of ys) {
      const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      text += items.map((i) => i.str).join(' ') + '\n';
    }
  }
  await doc.destroy();
  const answers = new Map<number, string>();
  // Mesma regex do PR 18: linha de 20 números seguida de linha de 20 letras.
  const blockRe =
    /(\d+(?:\s+\d+){19})\s+([A-EX](?:\s+[A-EX]){19})/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(text)) !== null) {
    const nums = m[1]!.trim().split(/\s+/).map((n) => parseInt(n, 10));
    const letters = m[2]!.trim().split(/\s+/);
    for (let i = 0; i < nums.length && i < letters.length; i++) {
      const n = nums[i]!;
      const l = letters[i]!;
      if (l === 'X') continue;
      // Mantém PRIMEIRA ocorrência (= INGLÊS), igual ao PR 18.
      if (!answers.has(n)) answers.set(n, l);
    }
  }
  return answers;
}

// ---------------------------------------------------------------------------
// Localiza seção LINGUAGENS no texto OCR e divide em blocos
// ---------------------------------------------------------------------------

const SECTION_START_RE =
  /LINGUAGENS,?\s*C[ÓO]DIGOS?\s+E\s+SUAS\s+TECNOLOGIAS/i;
const SECTION_END_RE = /\bREDA[ÇC][ÃA]O\b/i;

function extractLinguagensSection(text: string): string | null {
  const startMatch = SECTION_START_RE.exec(text);
  let startIdx: number;
  if (!startMatch) {
    // OCR pode não capturar perfeitamente "LINGUAGENS,..."; cai pra o
    // primeiro "Questão 41" como pivô. Esse marcador é estável.
    const q41 = /Quest[ãa]o\s+41\b/.exec(text);
    if (!q41) return null;
    startIdx = Math.max(0, q41.index - 200);
  } else {
    startIdx = Math.max(0, startMatch.index - 400);
  }
  const endRel = SECTION_END_RE.exec(text.slice(startIdx));
  const endIdx = endRel ? startIdx + endRel.index : text.length;
  return text.slice(startIdx, endIdx);
}

const ALT_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

interface RawQuestionBlock {
  questionNum: number;
  body: string;
}

/**
 * Divide a seção em blocos por questão. Idêntico ao PR 18:
 *   - usa marcadores "Questão NN" pra ordem
 *   - usa grupos completos (A) (B) (C) (D) (E) pra delimitar
 *   - filtra ruído anterior ao primeiro Q41
 */
function splitIntoBlocks(section: string): RawQuestionBlock[] {
  const numRe = /Quest[ãa]o\s+(\d+)/g;
  const orderedMarkers: { num: number; idx: number }[] = [];
  const dedupe = new Set<number>();
  let nm: RegExpExecArray | null;
  while ((nm = numRe.exec(section)) !== null) {
    const n = parseInt(nm[1]!, 10);
    if (n < 41 || n > 60) continue;
    if (dedupe.has(n)) continue;
    dedupe.add(n);
    orderedMarkers.push({ num: n, idx: nm.index });
  }

  const altRe = /\(([A-E])\)/g;
  const alts: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] = [];
  let am: RegExpExecArray | null;
  while ((am = altRe.exec(section)) !== null) {
    alts.push({
      letter: am[1] as 'A' | 'B' | 'C' | 'D' | 'E',
      idx: am.index,
    });
  }

  type Group = { startIdx: number; endIdx: number };
  const groups: Group[] = [];
  let cur: { letter: string; idx: number }[] = [];
  for (const a of alts) {
    const expected = ALT_LETTERS[cur.length];
    if (a.letter === expected) {
      cur.push(a);
      if (cur.length === 5) {
        groups.push({ startIdx: cur[0]!.idx, endIdx: a.idx });
        cur = [];
      }
    } else if (a.letter === 'A') {
      cur = [a];
    } else {
      cur = [];
    }
  }
  if (groups.length === 0) return [];

  let initialPivot = 0;
  const linguagensMarker = /LINGUAGENS,?\s*C[ÓO]DIGOS/i.exec(section);
  if (linguagensMarker) initialPivot = linguagensMarker.index;
  const q41Marker = /Quest[ãa]o\s+41\b/.exec(section);
  if (q41Marker && q41Marker.index < initialPivot) initialPivot = q41Marker.index;

  const firstMarkerIdx =
    orderedMarkers.length > 0 ? orderedMarkers[0]!.idx : 0;
  const validGroups = groups.filter((g) => g.startIdx >= firstMarkerIdx);

  // Pareamento posicional: cada marker pega o PRIMEIRO group ainda não
  // consumido cuja startIdx > marker.idx. Diferente do PR 18 (puro 1:1 por
  // ordem), isso evita que Q60 herde o group que aparece antes dele no texto
  // — comum em provas onde o LEM (Q55-Q60) aparece em ordem variada por OCR.
  // Se algum marker ficar sem group, é pulado.
  const sortedMarkers = [...orderedMarkers].sort((a, b) => a.idx - b.idx);
  const consumed = new Set<number>();
  const pairs: { num: number; markerIdx: number; group: { startIdx: number; endIdx: number } }[] = [];
  for (const marker of sortedMarkers) {
    let pickedIdx = -1;
    for (let g = 0; g < validGroups.length; g++) {
      if (consumed.has(g)) continue;
      if (validGroups[g]!.startIdx > marker.idx) {
        pickedIdx = g;
        break;
      }
    }
    if (pickedIdx === -1) continue;
    consumed.add(pickedIdx);
    pairs.push({ num: marker.num, markerIdx: marker.idx, group: validGroups[pickedIdx]! });
  }
  pairs.sort((a, b) => a.markerIdx - b.markerIdx);

  const blocks: RawQuestionBlock[] = [];
  for (let i = 0; i < pairs.length; i++) {
    // body = de logo após o group anterior (ou pivot inicial) até o início do
    // próximo group. Garante que TODA a área ao redor do group atual está
    // contida — incluindo o enunciado que precede o (A).
    const prevEnd = i === 0 ? initialPivot : pairs[i - 1]!.group.endIdx + 4;
    const nextStart =
      i + 1 < pairs.length ? pairs[i + 1]!.group.startIdx : section.length;
    blocks.push({
      questionNum: pairs[i]!.num,
      body: section.slice(prevEnd, nextStart),
    });
  }
  return blocks;
}

function cleanText(input: string): string {
  return input
    .replace(/\[\[PAGE\s+[\d\-LR]+\]\]/g, '')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/UNIFOR\s*[–-].*?MEDICIN[Aa].*$/gm, '')
    .replace(/^\s*\d+\s+UNIFOR.*$/gm, '')
    .replace(/^\s*UNIFOR\s*$/gm, '')
    .replace(/LINGUAGENS,?\s*C[ÓO]DIGOS?\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(
      /CI[ÊE]NCIAS\s+(DA\s+NATUREZA|HUMANAS)\s+E\s+SUAS\s+TECNOLOGIAS/gi,
      '',
    )
    .replace(/MATEM[ÁA]TICA\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseQuestionBody(body: string): {
  statement: string;
  options: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
} | null {
  const altRe = /\(([A-E])\)/g;
  const alts: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = altRe.exec(body)) !== null) {
    alts.push({
      letter: m[1] as 'A' | 'B' | 'C' | 'D' | 'E',
      idx: m.index,
    });
  }
  let chosen: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; idx: number }[] | null =
    null;
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

  const aIdx = chosen[0]!.idx;
  let cutFrom = 0;
  const earlierE = body.slice(0, aIdx).lastIndexOf('(E)');
  if (earlierE !== -1) {
    const after = body.slice(earlierE);
    const nlMatch = /\n\s*\n/.exec(after);
    if (nlMatch) {
      cutFrom = earlierE + nlMatch.index + nlMatch[0].length;
    } else {
      cutFrom = earlierE + 3;
    }
  }
  // Anchor adicional: se houver um marker "Questão NN" entre cutFrom e aIdx,
  // cortamos a partir dele — descarta lixo da questão anterior cuja
  // alternativa (E) não foi capturada por estar em outra coluna.
  const lastQuestionMarker = body.slice(cutFrom, aIdx).match(/Quest[ãa]o\s+\d+/g);
  if (lastQuestionMarker) {
    const lastIdx = body.lastIndexOf(
      lastQuestionMarker[lastQuestionMarker.length - 1]!,
      aIdx,
    );
    if (lastIdx > cutFrom) cutFrom = lastIdx;
  }
  let statementRaw = body.slice(cutFrom, aIdx);
  statementRaw = statementRaw
    .replace(/LINGUAGENS,?\s*C[ÓO]DIGOS?\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(
      /CI[ÊE]NCIAS\s+(DA\s+NATUREZA|HUMANAS)\s+E\s+SUAS\s+TECNOLOGIAS/gi,
      '',
    )
    .replace(/MATEM[ÁA]TICA\s+E\s+SUAS\s+TECNOLOGIAS/gi, '')
    .replace(/\[\[PAGE\s+[\d\-LR]+\]\]/g, '')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/UNIFOR\s*[–-].*?MEDICIN[Aa].*$/gm, '')
    .replace(/^\s*\d+\s+UNIFOR.*$/gm, '')
    .replace(/^\s*UNIFOR\s*$/gm, '');
  for (let pass = 0; pass < 5; pass++) {
    const m2 = /^\s*Quest[ãa]o\s+\d+\s*/.exec(statementRaw);
    if (!m2) break;
    statementRaw = statementRaw.slice(m2[0].length);
  }
  const statement = cleanText(statementRaw);

  const options: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const startIdx = chosen[i]!.idx + 3;
    let endIdx = i + 1 < 5 ? chosen[i + 1]!.idx : body.length;
    if (i === 4) {
      const tail = body.slice(startIdx);
      // Pegamos a MENOR posição entre todos os cutters — não a primeira que
      // matcha. Isso é importante em OCR: às vezes o texto da próxima questão
      // (parágrafo iniciando em maiúscula) aparece ANTES do marker "Questão NN+1"
      // e queremos cortar nele. PR 18 usa "primeiro cutter" porque pdf-parse
      // entrega texto linear sem essa ambiguidade.
      const cutters = [
        /\nQuest[ãa]o\s+\d+/,
        /\n[A-Z][^\n]{30,}\n/,
        // Marcador de próxima página explícito do nosso pipeline.
        /\[\[PAGE\s+[\d\-LR]+\]\]/,
      ];
      let bestCut = -1;
      for (const c of cutters) {
        const cm = c.exec(tail);
        if (cm && (bestCut < 0 || cm.index < bestCut)) bestCut = cm.index;
      }
      if (bestCut >= 0) endIdx = Math.min(endIdx, startIdx + bestCut);
    }
    const txt = cleanText(body.slice(startIdx, endIdx));
    options.push({ letter: chosen[i]!.letter, text: txt });
  }
  if (statement.length < 5) return null;
  if (options.some((o) => o.text.length === 0 || o.text.length > 1500))
    return null;
  return { statement, options };
}

// ---------------------------------------------------------------------------
// Heurística de tópico (mesma do PR 18)
// ---------------------------------------------------------------------------

const TOPIC_RULES: { pattern: RegExp; topic: string; short: string }[] = [
  {
    pattern:
      /figura(s)?\s+de\s+linguagem|met[áa]fora|met[oô]n[ií]mia|antiteses|antítese|paradoxo|hip[eé]rbole|prosopopeia|ironia|aliteraç[ãa]o|eufemismo|catacrese/i,
    topic: 'Figuras de linguagem',
    short: 'Figuras',
  },
  {
    pattern:
      /func[ãa]o\s+(da\s+)?linguagem|fun[çc][õo]es\s+da\s+linguagem|metalingu[ií]stica|conativa|fática|fática|po[ée]tica|emotiva|expressiva|referencial/i,
    topic: 'Funções da linguagem',
    short: 'Funções',
  },
  {
    pattern:
      /literatura|romantismo|modernismo|realismo|simbolismo|barroco|arcadismo|parnasianismo|naturalismo|machado de assis|cl[áa]ssico|cordel|cron(ica|ista)|romance|conto/i,
    topic: 'Literatura',
    short: 'Literatura',
  },
  {
    pattern:
      /conjun[çc][ãa]o|preposi[çc][ãa]o|pronome|adv[eé]rbio|verbo|sujeito|predicado|or[aá][cç][ãa]o|sintaxe|sint[áa]tica|morfol[oó]gica|advérbio|substantivo|adjetivo|crase/i,
    topic: 'Análise sintática e morfológica',
    short: 'Sintaxe',
  },
  {
    pattern:
      /coes[ãa]o|coer[êe]ncia|conector|articula[çc][ãa]o\s+textual|refer[êe]ncia\s+anaf|catáfora|an[áa]fora/i,
    topic: 'Coesão e coerência',
    short: 'Coesão',
  },
  {
    pattern:
      /charge|tirinha|quadrinhos|cartum|propaganda|publicit[áa]ria|cartaz/i,
    topic: 'Gêneros visuais (charge/tirinha/cartaz)',
    short: 'Gêneros visuais',
  },
  {
    pattern:
      /artes|arte\s+(plástica|visual)|pintura|m[úu]sica|cinema|teatro|dan[çc]a|escultura/i,
    topic: 'Artes',
    short: 'Artes',
  },
  {
    pattern: /educação\s+física|esporte|atividade\s+física/i,
    topic: 'Educação Física',
    short: 'Ed. Física',
  },
];

function classifyTopic(
  statement: string,
  optionsText: string,
): { topic: string; short: string } {
  const haystack = `${statement}\n${optionsText}`;
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(haystack)) {
      return { topic: rule.topic, short: rule.short };
    }
  }
  return { topic: 'Interpretação de texto', short: 'Interpretação' };
}

// ---------------------------------------------------------------------------
// SQL builder
// ---------------------------------------------------------------------------

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function buildSql(questions: ExtractedQuestion[]): string {
  const header =
    `-- =============================================================================\n` +
    `-- Migration 0025 — Seed de Linguagens 2018-1 (extraído via OCR)\n` +
    `-- =============================================================================\n` +
    `-- Gerado por scripts/ocr_2018_1.ts. A prova 2018-1 foi entregue como PDF\n` +
    `-- escaneado (imagens), então pdf-parse não extrai texto. Este pipeline:\n` +
    `--   1. Renderiza páginas via pdfjs-dist + node-canvas.\n` +
    `--   2. OCR com tesseract.js (lang 'por').\n` +
    `--   3. Aplica MESMA lógica de parsing de scripts/extract_linguagens.ts\n` +
    `--      (PR 18) com tolerâncias adicionais a artefatos de OCR.\n` +
    `--   4. Lê gabarito (PDF é texto) e classifica subtopic via heurística.\n` +
    `--\n` +
    `-- Idempotente via ON CONFLICT (id) DO NOTHING.\n` +
    `-- =============================================================================\n\n`;

  const lines: string[] = [];
  for (const q of questions) {
    const optionsBlock = q.options
      .map((o) => `(${o.letter}) ${o.text}`)
      .join('\n');
    const description = `${q.statement}\n\n${optionsBlock}`;
    if (!description.trim() || !q.correctAnswer) continue;
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
        `) on conflict (id) do nothing;`,
    );
  }
  return header + lines.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(PROVA_PDF)) {
    throw new Error(`PDF da prova não encontrado: ${PROVA_PDF}`);
  }
  if (!existsSync(GABARITO_PDF)) {
    throw new Error(`PDF do gabarito não encontrado: ${GABARITO_PDF}`);
  }

  let pageRange: [number, number] | null = null;
  if (PAGES_ARG) {
    const m = /^--pages=(\d+)-(\d+)$/.exec(PAGES_ARG);
    if (m) pageRange = [parseInt(m[1]!, 10), parseInt(m[2]!, 10)];
  }
  // Linguagens fica entre as páginas 25 e 39 desta prova (Q41 começa em ~26
  // e Q60 termina antes da REDAÇÃO em ~p43). Renderizamos 24-43 por margem.
  const defaultRange: [number, number] = [24, 43];
  const useRange = pageRange ?? defaultRange;

  console.log(
    `[1/4] renderizando páginas ${useRange[0]}-${useRange[1]} de ${PROVA_PDF}`,
  );
  const pages = await renderPagesToPng(PROVA_PDF, useRange);
  console.log(`      ${pages.length} páginas renderizadas`);

  console.log('[2/4] rodando OCR (tesseract.js, lang=por)…');
  const ocrText = normalizeOcr(await ocrPages(pages));
  if (DEBUG) {
    writeFileSync(join(CACHE_DIR, 'ocr_combined.txt'), ocrText, 'utf8');
    console.log(`      texto OCR salvo em ${join(CACHE_DIR, 'ocr_combined.txt')}`);
  }

  console.log('[3/4] localizando seção LINGUAGENS e parseando questões…');
  const section = extractLinguagensSection(ocrText);
  if (!section) {
    console.error('FAIL: seção LINGUAGENS não encontrada no OCR.');
    console.error(
      'BLOCKED — sample (first 1000 chars):\n' + ocrText.slice(0, 1000),
    );
    process.exit(2);
  }
  const blocks = splitIntoBlocks(section);
  console.log(`      ${blocks.length} blocos detectados`);

  const gabarito = await loadGabarito();
  console.log(`      gabarito: ${gabarito.size} respostas carregadas`);

  const questions: ExtractedQuestion[] = [];
  const skippedNoParse: number[] = [];
  const skippedNoGab: number[] = [];
  const skippedQuality: number[] = [];
  const seen = new Set<number>();
  for (const block of blocks) {
    if (seen.has(block.questionNum)) continue;
    seen.add(block.questionNum);
    const parsed = parseQuestionBody(block.body);
    if (!parsed) {
      skippedNoParse.push(block.questionNum);
      if (DEBUG) {
        console.warn(
          `  [debug] Q${block.questionNum} parse falhou; body[0..400]=\n${block.body.slice(0, 400)}\n  body[-200..]=\n${block.body.slice(-200)}`,
        );
      }
      continue;
    }
    const correct = gabarito.get(block.questionNum);
    if (!correct || !/^[A-E]$/.test(correct)) {
      skippedNoGab.push(block.questionNum);
      continue;
    }
    // Quality gate específico desta prova: o gabarito carregado é INGLÊS para
    // Q55-Q60, mas a OCR às vezes captura o conteúdo ESPANHOL no mesmo
    // intervalo. Pulamos a questão se o conteúdo parecer estar em espanhol
    // (palavras-âncora típicas) — assim não geramos rows com gabarito
    // mismatched. Q41-Q54 (Português) e Q55-Q58 (INGLÊS, anteriores ao bloco
    // espanhol) são pareadas corretamente.
    if (block.questionNum >= 55 && block.questionNum <= 60) {
      const fullText = `${parsed.statement} ${parsed.options.map((o) => o.text).join(' ')}`;
      const espMarkers = /\b(las|los|según|también|porque|hacia|esto|esta|donde|cuando|para)\b/gi;
      const matches = fullText.match(espMarkers) ?? [];
      const englishMarkers = /\b(the|of|and|to|in|that|is|was|are|were|with|from|they|by|she|he|it|on|for|at|but)\b/gi;
      const enMatches = fullText.match(englishMarkers) ?? [];
      if (matches.length > 5 && matches.length > enMatches.length) {
        // Conteúdo claramente espanhol — gabarito INGLÊS não bate. Pula.
        skippedQuality.push(block.questionNum);
        continue;
      }
    }
    const optionsText = parsed.options.map((o) => o.text).join(' ');
    const { topic, short } = classifyTopic(parsed.statement, optionsText);
    questions.push({
      id: `${YEAR}-${SEMESTER}_Q${String(block.questionNum).padStart(2, '0')}`,
      year: YEAR,
      semester: SEMESTER,
      questionNum: block.questionNum,
      discipline: 'linguagens',
      topic,
      topicShort: short,
      statement: parsed.statement,
      options: parsed.options,
      correctAnswer: correct as 'A' | 'B' | 'C' | 'D' | 'E',
      source: SOURCE,
    });
  }
  questions.sort((a, b) => a.questionNum - b.questionNum);

  console.log('[4/4] gerando SQL…');
  const sql = buildSql(questions);
  writeFileSync(OUT_SQL, sql, 'utf8');

  console.log('---');
  console.log(`extraídas: ${questions.length} questões (Q${questions.map((q) => q.questionNum).join(', Q')})`);
  if (skippedNoParse.length > 0)
    console.log(`puladas sem parse: Q${skippedNoParse.join(', Q')}`);
  if (skippedNoGab.length > 0)
    console.log(`puladas sem gabarito: Q${skippedNoGab.join(', Q')}`);
  if (skippedQuality.length > 0)
    console.log(`puladas por quality gate (LEM/idioma): Q${skippedQuality.join(', Q')}`);
  console.log(`SQL escrito em: ${OUT_SQL}`);

  if (questions.length < 8) {
    console.error(
      `\nBLOCKED: apenas ${questions.length} questões extraídas (esperado ≥ 8).`,
    );
    if (DEBUG)
      console.error('Primeiros 2k chars do OCR:\n' + ocrText.slice(0, 2000));
    process.exit(3);
  }
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
