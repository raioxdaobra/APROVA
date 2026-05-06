/**
 * PR 30 — Re-extrai questões de Linguagens (Português) das provas oficiais
 * UNIFOR Medicina como IMAGENS JPEG cropadas dos PDFs originais.
 *
 * Motivação:
 *   PR 18 (0023) e PR 23 (0025) extraíram as 326+19 questões de Linguagens
 *   como TEXTO no campo `description`. Isso quebra o DNA do APROVA — questões
 *   precisam ser idênticas à prova original (layout, fórmulas, charges,
 *   tirinhas). Este pipeline gera uma imagem por questão, faz upload pro
 *   bucket Supabase Storage `questions` e emite migration 0033 com UPDATEs
 *   setando `image_url` para cada questão Linguagens.
 *
 *   O `description` (texto OCR + alternativas concatenadas) NÃO é alterado —
 *   continua como fallback redundante.
 *
 * Pipeline por prova:
 *   1. Renderiza cada página do PDF como PNG (pdfjs-dist 3.x + node-canvas).
 *   2. Para PDFs com texto extraível (todas exceto 2018-1):
 *      - usa pdfjs.getTextContent() pra mapear posições (x, y) dos
 *        marcadores "Questão NN" em cada página
 *      - 41 ≤ NN ≤ 60 (Linguagens) e a próxima questão da seção define o
 *        bottom do crop. Se NN+1 está em outra página, concatena verticalmente
 *        a parte de baixo da página atual + parte de cima da próxima.
 *   3. Para 2018-1 (PDF imagem):
 *      - reusa os PNGs em cache de PR 23 (em $TEMP/ocr_2018_1_pages/)
 *      - roda OCR cacheado (tesseract.js) com bbox info para encontrar
 *        posições dos "Questão NN" e cropar como acima
 *   4. Cada crop é convertido para JPEG (q=85, max width 1200) via sharp.
 *   5. Upload para o bucket `questions` em `linguagens/{ano}.{sem}/Q{NN}.jpg`.
 *      Bucket existente só aceita image/jpeg | image/webp (PR 8). JPEG é a
 *      escolha consistente com as 680 questões originais.
 *   6. Gera SQL: `update public.questions set image_url = '<url>' where id =
 *      '<id>';` para cada questão processada.
 *
 * Uso:
 *   npx tsx scripts/render_linguagens_images.ts [--limit=N] [--prova=YYYY-S]
 *     [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { config } from 'dotenv';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Provas vivem fora do worktree; caminho absoluto é estável em qualquer cwd.
const PROVAS_DIR =
  'C:/Users/engar/OneDrive/Documentos/APROVA/PROVAS MEDICINA UNIFOR/PROVA';

// Env: prefere .env.local na home (compartilhada entre worktrees) e cai pra
// .env.local local se existir.
config({ path: 'C:/Users/engar/.env.local' });
config({ path: join(ROOT, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error(
    'BLOCKED: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY ausentes em .env.local'
  );
  process.exit(1);
}

const BUCKET = 'questions';
const RENDER_SCALE = 2.0; // ~150 DPI no PDF de tamanho A4
const OUT_SQL = join(ROOT, 'supabase', 'migrations', '0033_linguagens_images.sql');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1] ?? '0', 10) : 0;
const PROVA_ARG = process.argv.find((a) => a.startsWith('--prova='));
const PROVA_FILTER = PROVA_ARG ? PROVA_ARG.split('=')[1] : null;
const DEBUG = process.argv.includes('--debug');

const SQL_FILE_2023 = join(ROOT, 'supabase', 'migrations', '0023_seed_linguagens.sql');
const SQL_FILE_2025 = join(ROOT, 'supabase', 'migrations', '0025_seed_linguagens_2018_1.sql');

// pdfjs-dist 3.x via createRequire (mesmo padrão do scripts/ocr_2018_1.ts)
const require = createRequire(import.meta.url);
type CanvasMod = {
  createCanvas: (w: number, h: number) => any;
};
const { createCanvas } = require('canvas') as CanvasMod;
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js') as any;

// ---------------------------------------------------------------------------
// Tipos e mapeamento de IDs
// ---------------------------------------------------------------------------

interface QuestionId {
  id: string;
  year: number;
  semester: number;
  questionNum: number;
}

/**
 * Lê IDs de Linguagens já existentes a partir das migrations 0023/0025.
 * Retorna agrupados por prova (ano-semestre).
 */
function readExistingIds(): Map<string, QuestionId[]> {
  const out = new Map<string, QuestionId[]>();
  const files = [SQL_FILE_2023, SQL_FILE_2025];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    const re = /'(\d{4})-([12])_Q(\d{2})'/g;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const id = `${m[1]}-${m[2]}_Q${m[3]}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const year = parseInt(m[1]!, 10);
      const semester = parseInt(m[2]!, 10);
      const questionNum = parseInt(m[3]!, 10);
      const key = `${year}-${semester}`;
      if (!out.has(key)) out.set(key, []);
      out.get(key)!.push({ id, year, semester, questionNum });
    }
  }
  for (const arr of out.values()) {
    arr.sort((a, b) => a.questionNum - b.questionNum);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Render PDF -> PNG por página + posicionamento de markers via getTextContent
// ---------------------------------------------------------------------------

interface PageRender {
  pageNum: number;
  width: number;
  height: number;
  png: Buffer;
}

interface QuestionMarker {
  questionNum: number;
  pageNum: number;
  // Y na imagem renderizada (0 = topo). Convertido a partir do (x, y) do
  // getTextContent (PDF coords são bottom-up; PNG é top-down).
  yTop: number;
  // X na imagem (pra debug — não usado para crop, sempre cropamos full-width)
  xLeft: number;
}

/**
 * Renderiza páginas + extrai markers "Questão NN" da seção LINGUAGENS.
 *
 * Estratégia para limitar páginas: lemos o texto completo primeiro pra
 * detectar onde começa a seção LINGUAGENS (marker "Questão 41" + cabeçalho
 * "LINGUAGENS, CÓDIGOS") e onde termina (próximo "REDAÇÃO" ou "Questão 60"+1).
 * Depois renderizamos só essas páginas.
 */
async function renderProva(
  provaPath: string,
  isImagePdf: boolean
): Promise<{ pages: PageRender[]; markers: QuestionMarker[] }> {
  const data = new Uint8Array(readFileSync(provaPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;

  // 1) Identificar páginas relevantes (Linguagens 41-60). Para PDFs de texto,
  // varremos getTextContent de todas as páginas rapidamente.
  const pageTexts = new Map<number, string>();
  const pageItems = new Map<
    number,
    { str: string; x: number; y: number; height: number }[]
  >();

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    try {
      const content = await page.getTextContent();
      const items = (content.items as any[]).map((item) => ({
        str: String(item.str ?? ''),
        x: Number(item.transform?.[4] ?? 0),
        y: Number(item.transform?.[5] ?? 0),
        height: Number(item.height ?? 0),
      }));
      pageItems.set(p, items);
      pageTexts.set(p, items.map((i) => i.str).join(' '));
    } catch {
      pageItems.set(p, []);
      pageTexts.set(p, '');
    }
  }

  // 2) Detectar páginas onde aparece "Questão NN" (41..60) com base nos
  // textos extraídos. Para PDFs imagem (2018-1), todas as páginas terão texto
  // vazio — neste caso retornamos pageRange manual e markers vazios (caller
  // usa fallback OCR).
  const markers: QuestionMarker[] = [];
  if (!isImagePdf) {
    for (const [p, items] of pageItems) {
      // Junta strings consecutivas próximas pra reconstituir "Questão 41"
      // mesmo que pdfjs entregue tokens separados ("Questão" + " " + "41").
      const lines = groupItemsToLines(items);
      for (const line of lines) {
        const m = /Quest[ãa]o\s+(\d+)/.exec(line.text);
        if (!m) continue;
        const num = parseInt(m[1]!, 10);
        if (num < 41 || num > 60) continue;
        markers.push({
          questionNum: num,
          pageNum: p,
          yTop: line.yPdf,
          xLeft: line.xPdf,
        });
      }
    }
  }

  // 3) Determinar páginas a renderizar
  let renderPages: number[];
  if (isImagePdf) {
    // 2018-1: páginas conhecidas via PR 23 (24-43)
    renderPages = [];
    for (let p = 24; p <= Math.min(43, doc.numPages); p++) renderPages.push(p);
  } else {
    const pagesWithMarkers = new Set(markers.map((m) => m.pageNum));
    if (pagesWithMarkers.size === 0) {
      console.warn(
        `  [warn] nenhum marker "Questão NN" detectado em ${provaPath}`
      );
      renderPages = [];
    } else {
      const minP = Math.max(1, Math.min(...pagesWithMarkers) - 0);
      const maxP = Math.min(doc.numPages, Math.max(...pagesWithMarkers) + 1);
      renderPages = [];
      for (let p = minP; p <= maxP; p++) renderPages.push(p);
    }
  }

  // 4) Renderizar essas páginas
  const pages: PageRender[] = [];
  for (const p of renderPages) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );
    const ctx = canvas.getContext('2d');
    // Fundo branco (PNG default é transparente)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const png = canvas.toBuffer('image/png');
    pages.push({
      pageNum: p,
      width: canvas.width,
      height: canvas.height,
      png,
    });
  }

  // 5) Converter coords PDF->PNG nos markers. Em pdfjs, transform[5] é Y do
  // baseline em coords PDF (bottom-up). Conversão pra Y top-down em pixels:
  //   yTopPx = (pageHeightPdf - yPdf) * scale - somaCorretiva
  // Usaremos o viewport.height (já em pixels) e a height da página em PDF
  // (= viewport.height/scale).
  const pageMeta = new Map<number, { heightPx: number }>();
  for (const pg of pages) {
    pageMeta.set(pg.pageNum, { heightPx: pg.height });
  }
  for (const mk of markers) {
    const meta = pageMeta.get(mk.pageNum);
    if (!meta) continue;
    // y em PDF coord (bottom-up). yTop converted to pixel top-down:
    // PDF tem origem em bottom-left; subtrai height do glyph pra apontar pro
    // baseline. Usamos a y diretamente como baseline e convertemos.
    const heightPdf = meta.heightPx / RENDER_SCALE;
    const yPdfTopBased = heightPdf - mk.yTop; // distance from top in PDF units
    const yPx = yPdfTopBased * RENDER_SCALE;
    // Pequeno padding pra cima pra não cortar o "Q" do "Questão"
    mk.yTop = Math.max(0, Math.floor(yPx - 8 * RENDER_SCALE));
    mk.xLeft = mk.xLeft * RENDER_SCALE;
  }

  await doc.destroy();
  return { pages, markers };
}

/**
 * Agrupa items pdfjs em linhas (por proximidade de y) e ordena por x.
 * Reconstrói o texto da linha juntando os strings com espaço.
 */
function groupItemsToLines(
  items: { str: string; x: number; y: number; height: number }[]
): { text: string; yPdf: number; xPdf: number }[] {
  if (items.length === 0) return [];
  // Ordena por y desc, x asc, e agrupa items próximos verticalmente (tolerância
  // de 3 unidades PDF). Em layout de duas colunas, items na mesma linha
  // visual mas em colunas diferentes têm Y idênticos — separamos por X gap.
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { text: string; yPdf: number; xPdf: number; xMax: number }[] = [];
  for (const it of sorted) {
    let placed = false;
    for (const ln of lines) {
      if (Math.abs(ln.yPdf - it.y) <= 3) {
        // Mesma linha visual. Se há gap > 60 entre xMax atual e it.x,
        // tratamos como nova linha (coluna diferente) — adiciona como nova.
        if (it.x - ln.xMax > 60 && ln.text.length > 0) continue;
        ln.text = (ln.text + it.str).replace(/\s+/g, ' ').trim();
        ln.xMax = Math.max(ln.xMax, it.x + (it.str.length || 0));
        placed = true;
        break;
      }
    }
    if (!placed) {
      lines.push({
        text: it.str.replace(/\s+/g, ' ').trim(),
        yPdf: it.y,
        xPdf: it.x,
        xMax: it.x + (it.str.length || 0),
      });
    }
  }
  return lines
    .filter((l) => l.text.length > 0)
    .map((l) => ({ text: l.text, yPdf: l.yPdf, xPdf: l.xPdf }));
}

// ---------------------------------------------------------------------------
// Crop por questão
// ---------------------------------------------------------------------------

interface QuestionCrop {
  questionNum: number;
  jpeg: Buffer;
}

/**
 * Para cada questão (definida pelo seu marker e o do próximo), produz um
 * JPEG cropado verticalmente. Se a próxima questão está numa página
 * subsequente, concatena verticalmente a parte de baixo da página atual com
 * a parte de cima da próxima.
 *
 * Crops sempre full-width — manter colunas/figuras intactas.
 */
async function cropQuestions(
  pages: PageRender[],
  markers: QuestionMarker[]
): Promise<QuestionCrop[]> {
  if (markers.length === 0) return [];
  // Ordena markers por (página, yTop). Markers únicos por questão (primeira
  // ocorrência vence — em caso de duplicação, ex.: "Questão 45" no índice de
  // ALTERNATIVAS final).
  const sorted = [...markers].sort((a, b) => {
    if (a.pageNum !== b.pageNum) return a.pageNum - b.pageNum;
    return a.yTop - b.yTop;
  });
  const dedup: QuestionMarker[] = [];
  const seenQ = new Set<number>();
  for (const m of sorted) {
    if (seenQ.has(m.questionNum)) continue;
    seenQ.add(m.questionNum);
    dedup.push(m);
  }

  const pageMap = new Map<number, PageRender>();
  for (const p of pages) pageMap.set(p.pageNum, p);

  const crops: QuestionCrop[] = [];
  for (let i = 0; i < dedup.length; i++) {
    const cur = dedup[i]!;
    const nxt = dedup[i + 1] ?? null;
    const curPage = pageMap.get(cur.pageNum);
    if (!curPage) continue;

    // Detecta layout em duas colunas: cur e nxt na MESMA página com Y
    // próximo (<= 40px no PNG). Neste caso cropa por coluna (left/right).
    const twoColumn =
      nxt &&
      nxt.pageNum === cur.pageNum &&
      Math.abs(nxt.yTop - cur.yTop) <= 40;
    let jpeg: Buffer | null = null;
    if (twoColumn) {
      // cur ocupa coluna esquerda; nxt ocupa coluna direita.
      // Determinar qual é qual pelos xLeft.
      const curIsLeft = cur.xLeft < (nxt!.xLeft ?? 0);
      // splitX = ~20px à esquerda da xLeft da coluna direita. Isso preserva
      // a coluna esquerda inteira (até pouco antes do início da direita) sem
      // sobrepor conteúdo da direita.
      const rightColX = curIsLeft ? nxt!.xLeft : cur.xLeft;
      const splitX = Math.max(50, Math.floor(rightColX - 20));
      // crop coluna correspondente desde top até fim da página
      const top = Math.max(0, Math.min(cur.yTop, nxt!.yTop));
      const bottom = curPage.height;
      const leftEdge = curIsLeft ? 0 : splitX;
      const rightEdge = curIsLeft ? splitX : curPage.width;
      const w = rightEdge - leftEdge;
      if (w > 50 && bottom - top > 30) {
        jpeg = await cropPng(curPage.png, leftEdge, top, w, bottom - top);
      }
      // E também cropa o nxt na coluna direita / esquerda diretamente aqui
      // pra evitar double-crop estranho. Empilhamos crop para nxt no fim do
      // loop usando flag.
      if (jpeg) {
        crops.push({ questionNum: cur.questionNum, jpeg });
      }
      // Crop do nxt
      const otherLeft = curIsLeft ? splitX : 0;
      const otherRight = curIsLeft ? curPage.width : splitX;
      const otherW = otherRight - otherLeft;
      if (otherW > 50 && bottom - top > 30) {
        const otherJpeg = await cropPng(
          curPage.png,
          otherLeft,
          top,
          otherW,
          bottom - top
        );
        crops.push({ questionNum: nxt!.questionNum, jpeg: otherJpeg });
      }
      // Pulamos nxt (já adicionado)
      i++;
      continue;
    }
    if (nxt && nxt.pageNum === cur.pageNum) {
      // Mesma página, mesma coluna (Y diferente): crop simples
      const top = Math.max(0, cur.yTop);
      const bottom = Math.min(curPage.height, nxt.yTop);
      if (bottom <= top + 30) continue;
      jpeg = await cropPng(curPage.png, 0, top, curPage.width, bottom - top);
    } else {
      // Spans múltiplas páginas (ou é a última questão)
      // Bottom pra primeira página: até o fim
      const top = Math.max(0, cur.yTop);
      const bottom = curPage.height;
      const slices: Buffer[] = [];
      slices.push(
        await cropPngRaw(curPage.png, 0, top, curPage.width, bottom - top)
      );
      // Páginas intermediárias inteiras
      const endPage = nxt ? nxt.pageNum : cur.pageNum + 1;
      for (let p = cur.pageNum + 1; p < endPage; p++) {
        const inter = pageMap.get(p);
        if (!inter) continue;
        slices.push(inter.png);
      }
      // Última página até yTop do próximo marker (ou pequena margem se for
      // a última questão da prova)
      if (nxt) {
        const nxtPage = pageMap.get(nxt.pageNum);
        if (nxtPage) {
          const cutBottom = Math.min(nxtPage.height, nxt.yTop);
          if (cutBottom > 30) {
            slices.push(
              await cropPngRaw(nxtPage.png, 0, 0, nxtPage.width, cutBottom)
            );
          }
        }
      }
      jpeg = await stackVertical(slices, curPage.width);
    }
    if (jpeg) {
      crops.push({ questionNum: cur.questionNum, jpeg });
    }
  }
  return crops;
}

async function cropPngRaw(
  png: Buffer,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<Buffer> {
  return sharp(png)
    .extract({ left: Math.max(0, Math.floor(x)), top: Math.max(0, Math.floor(y)), width: Math.floor(w), height: Math.floor(h) })
    .png()
    .toBuffer();
}

async function cropPng(
  png: Buffer,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<Buffer> {
  // Converte para JPEG q=85, max width 1200
  const raw = await cropPngRaw(png, x, y, w, h);
  let img = sharp(raw).flatten({ background: '#ffffff' });
  const meta = await img.metadata();
  if (meta.width && meta.width > 1200) {
    img = img.resize({ width: 1200, withoutEnlargement: true });
  }
  return img.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

async function stackVertical(slices: Buffer[], width: number): Promise<Buffer> {
  if (slices.length === 0) return Buffer.alloc(0);
  if (slices.length === 1) {
    let img = sharp(slices[0]).flatten({ background: '#ffffff' });
    const meta = await img.metadata();
    if (meta.width && meta.width > 1200) {
      img = img.resize({ width: 1200, withoutEnlargement: true });
    }
    return img.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  }
  // Calcular altura total
  const metas = await Promise.all(
    slices.map((s) => sharp(s).metadata())
  );
  const totalH = metas.reduce((a, m) => a + (m.height ?? 0), 0);
  const composite: any[] = [];
  let yOff = 0;
  for (let i = 0; i < slices.length; i++) {
    composite.push({ input: slices[i], top: yOff, left: 0 });
    yOff += metas[i]?.height ?? 0;
  }
  let img = sharp({
    create: {
      width: width,
      height: totalH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(composite)
    .flatten({ background: '#ffffff' });
  // Convert to buffer first then resize as JPEG (sharp pipeline limitations)
  const stacked = await img.png().toBuffer();
  let outImg = sharp(stacked);
  const meta = await outImg.metadata();
  if (meta.width && meta.width > 1200) {
    outImg = outImg.resize({ width: 1200, withoutEnlargement: true });
  }
  return outImg.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

// ---------------------------------------------------------------------------
// Fallback OCR para 2018-1
// ---------------------------------------------------------------------------

/**
 * Para 2018-1, reusa os PNGs já cacheados pelo PR 23 em $TEMP/ocr_2018_1_pages
 * (variant F = full page) e roda OCR com bbox info pra encontrar markers
 * "Questão NN".
 */
async function detect2018_1Markers(
  pages: PageRender[]
): Promise<QuestionMarker[]> {
  const { createWorker } = require('tesseract.js') as any;
  const worker = await createWorker('por', undefined, {
    logger: () => undefined,
  });
  const markers: QuestionMarker[] = [];
  for (const pg of pages) {
    // Solicita bbox a nível de WORD
    const { data } = await worker.recognize(pg.png, {}, { blocks: true });
    // tesseract.js v7 retorna data.blocks com paragraphs/lines/words; cada
    // word tem bbox. Procuramos sequência "Questão" + número.
    const blocks = (data.blocks ?? []) as any[];
    type Word = { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } };
    const words: Word[] = [];
    for (const b of blocks) {
      for (const par of b.paragraphs ?? []) {
        for (const ln of par.lines ?? []) {
          for (const w of ln.words ?? []) {
            words.push({
              text: String(w.text ?? ''),
              bbox: w.bbox ?? { x0: 0, y0: 0, x1: 0, y1: 0 },
            });
          }
        }
      }
    }
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i]!;
      const w2 = words[i + 1]!;
      const t1 = w1.text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      if (!/^quest[ãa]o$|^questao$/i.test(w1.text) && !/^questao$/i.test(t1)) continue;
      const num = parseInt(w2.text.replace(/\D/g, ''), 10);
      if (!Number.isFinite(num) || num < 41 || num > 60) continue;
      markers.push({
        questionNum: num,
        pageNum: pg.pageNum,
        yTop: Math.max(0, w1.bbox.y0 - 8),
        xLeft: w1.bbox.x0,
      });
    }
  }
  await worker.terminate();
  return markers;
}

// ---------------------------------------------------------------------------
// Upload + SQL
// ---------------------------------------------------------------------------

interface ProcessStats {
  prova: string;
  expected: number;
  cropped: number;
  uploaded: number;
  failed: number;
  questions: { id: string; url: string }[];
}

async function processProva(
  prova: string,
  expectedIds: QuestionId[],
  supabase: any
): Promise<ProcessStats> {
  const stats: ProcessStats = {
    prova,
    expected: expectedIds.length,
    cropped: 0,
    uploaded: 0,
    failed: 0,
    questions: [],
  };
  const provaPath = join(PROVAS_DIR, `${prova} - PROVA MEDICINA - UNIFOR.pdf`);
  if (!existsSync(provaPath)) {
    console.warn(`  [skip] PDF não encontrado: ${provaPath}`);
    stats.failed = expectedIds.length;
    return stats;
  }
  const isImagePdf = prova === '2018-1';
  console.log(`  [render] ${prova} (${isImagePdf ? 'OCR' : 'text'})`);
  const { pages, markers: textMarkers } = await renderProva(
    provaPath,
    isImagePdf
  );
  let markers = textMarkers;
  if (isImagePdf) {
    console.log(`  [ocr] detectando markers em 2018-1...`);
    markers = await detect2018_1Markers(pages);
  }
  // Filtra só os esperados (não cropa Q41 se ela não está na DB)
  const expectedNums = new Set(expectedIds.map((q) => q.questionNum));
  const filteredMarkers = markers.filter((m) =>
    expectedNums.has(m.questionNum)
  );
  // Mas para ter limites corretos no crop precisamos do "próximo marker"
  // independente de estar no DB. Mantemos TODOS os markers no array passado
  // para cropQuestions, e filtramos os crops depois.
  if (DEBUG) {
    const sortedDbg = [...markers].sort(
      (a, b) => a.pageNum - b.pageNum || a.yTop - b.yTop
    );
    for (const m of sortedDbg) {
      console.log(
        `    [marker] Q${m.questionNum} page=${m.pageNum} yTop=${m.yTop.toFixed(0)} xLeft=${m.xLeft.toFixed(0)}`
      );
    }
  }
  const crops = await cropQuestions(pages, markers);
  const wantedCrops = crops.filter((c) => expectedNums.has(c.questionNum));
  stats.cropped = wantedCrops.length;
  console.log(
    `  [crop] ${stats.cropped}/${stats.expected} questões cropadas em ${prova}`
  );

  // Upload
  for (const q of expectedIds) {
    const crop = wantedCrops.find((c) => c.questionNum === q.questionNum);
    if (!crop) {
      stats.failed++;
      if (DEBUG) console.warn(`    [miss] ${q.id}: sem crop`);
      continue;
    }
    const remotePath = `linguagens/${q.year}.${q.semester}/Q${String(q.questionNum).padStart(2, '0')}.jpg`;
    if (DRY_RUN) {
      if (DEBUG) {
        // dump pra /tmp pra inspecionar manualmente
        const dbgDir = process.env.TEMP ?? '/tmp';
        const dbgPath = join(dbgDir, `pr30_${q.id}.jpg`);
        writeFileSync(dbgPath, crop.jpeg);
        console.log(`    [debug-crop] ${q.id} -> ${dbgPath}`);
      }
      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`;
      stats.uploaded++;
      stats.questions.push({ id: q.id, url });
      continue;
    }
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, crop.jpeg, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) {
      stats.failed++;
      console.error(`    [upload-fail] ${q.id}: ${error.message}`);
      continue;
    }
    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`;
    stats.uploaded++;
    stats.questions.push({ id: q.id, url });
  }
  return stats;
}

function buildSql(allQuestions: { id: string; url: string }[]): string {
  const header =
    `-- =============================================================================\n` +
    `-- Migration 0033 — Linguagens: image_url para PNGs cropados (PR 30)\n` +
    `-- =============================================================================\n` +
    `-- Re-extraído pelas provas oficiais via scripts/render_linguagens_images.ts\n` +
    `-- (substitui texto OCR por imagem cropada do PDF, igual padrão das 680\n` +
    `-- questões originais). description é mantido como fallback.\n` +
    `--\n` +
    `-- Bucket: 'questions' (Supabase Storage). Path: linguagens/{ano}.{sem}/Q{NN}.jpg\n` +
    `-- =============================================================================\n\n`;
  const lines = allQuestions
    .map(
      (q) =>
        `update public.questions set image_url = '${q.url.replace(/'/g, "''")}' where id = '${q.id.replace(/'/g, "''")}';`
    )
    .join('\n');
  return header + lines + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const startTs = Date.now();
  console.log('[1/3] lendo IDs Linguagens existentes...');
  const idsByProva = readExistingIds();
  let provas = Array.from(idsByProva.keys()).sort();
  if (PROVA_FILTER) provas = provas.filter((p) => p === PROVA_FILTER);
  if (LIMIT > 0) provas = provas.slice(0, LIMIT);
  const totalQuestions = provas.reduce(
    (a, p) => a + (idsByProva.get(p)?.length ?? 0),
    0
  );
  console.log(
    `       ${provas.length} provas, ${totalQuestions} questões Linguagens`
  );

  console.log('[2/3] processando provas...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: { persistSession: false },
  });

  const allStats: ProcessStats[] = [];
  for (const prova of provas) {
    const ids = idsByProva.get(prova) ?? [];
    try {
      const s = await processProva(prova, ids, supabase);
      allStats.push(s);
    } catch (err) {
      console.error(`  [fail] ${prova}: ${(err as Error).message}`);
      if (DEBUG) console.error((err as Error).stack);
      allStats.push({
        prova,
        expected: ids.length,
        cropped: 0,
        uploaded: 0,
        failed: ids.length,
        questions: [],
      });
    }
  }

  console.log('[3/3] gerando SQL...');
  const allQuestions = allStats.flatMap((s) => s.questions);
  const sql = buildSql(allQuestions);
  if (!DRY_RUN || PROVA_FILTER || LIMIT) {
    writeFileSync(OUT_SQL, sql, 'utf8');
    console.log(`       escrito ${OUT_SQL}`);
  }

  const totalCropped = allStats.reduce((a, s) => a + s.cropped, 0);
  const totalUploaded = allStats.reduce((a, s) => a + s.uploaded, 0);
  const totalFailed = allStats.reduce((a, s) => a + s.failed, 0);
  const elapsed = ((Date.now() - startTs) / 1000).toFixed(0);
  console.log('---');
  console.log(`tempo: ${elapsed}s`);
  console.log(`provas: ${provas.length}`);
  console.log(`questões esperadas: ${totalQuestions}`);
  console.log(`cropadas: ${totalCropped}`);
  console.log(`uploaded: ${totalUploaded}`);
  console.log(`falharam: ${totalFailed}`);
  console.log('por prova:');
  for (const s of allStats) {
    console.log(
      `  ${s.prova}: ${s.uploaded}/${s.expected} uploaded (${s.failed} fail)`
    );
  }
}

main().catch((err) => {
  console.error('FAIL:', err);
  console.error((err as Error).stack);
  process.exit(1);
});
