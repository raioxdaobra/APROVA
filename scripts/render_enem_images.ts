/**
 * Render das questões do ENEM como IMAGENS JPEG recortadas dos PDFs oficiais
 * do INEP — mesmo padrão das questões da Unifor (imagem fiel à prova original,
 * com gráficos, charges e layout intactos).
 *
 * Adapta scripts/render_linguagens_images.ts para o ENEM:
 *   - 2 PDFs por ano (1o e 2o dia), questões numeradas 1..180 contínuas
 *   - marcador QUESTAO-NN (maiúsculo) detectado via camada de texto do PDF
 *   - layout de 2 colunas (mesma heurística de crop do pipeline Unifor)
 *
 * Pipeline por PDF:
 *   1. Renderiza páginas como PNG (pdfjs-dist + node-canvas).
 *   2. getTextContent() mapeia a posição (x, y) de cada marcador QUESTAO-NN.
 *   3. Recorta verticalmente entre marcadores; trata 2 colunas e quebra
 *      de página (empilha verticalmente).
 *   4. Converte cada recorte para JPEG (q=85, largura máx 1200) via sharp.
 *   5. Upload pro bucket Storage 'questions' em enem/{ano}/Q{NNN}.jpg.
 *   6. Upsert em public.questions com exam='enem'.
 *
 * Disciplina por questão (caderno azul, ordem canônica):
 *   1..45   linguagens        46..90  humanas
 *   91..135 ciências natureza 136..180 matemática
 *   As 91..135 (Natureza) misturam física/química/biologia — a divisão
 *   vem do arquivo de config por ano (campo naturezaDisciplinas).
 *
 * Config por ano: scripts/enem-config/{ano}.json
 *   Campos: year, caderno, gabarito (180 letras A-E) e naturezaDisciplinas
 *   (disciplina fisica/quimica/biologia das questoes 91..135).
 *   Se o arquivo não existir, um TEMPLATE é gerado no 1o --dry-run.
 *
 * Uso:
 *   npx tsx scripts/render_enem_images.ts --year=2023 --dry-run --debug
 *     -> renderiza, detecta marcadores, salva recortes em scripts/enem-debug/
 *        e gera o template de config. NÃO sobe nada.
 *   npx tsx scripts/render_enem_images.ts --year=2023
 *     -> upload pro Storage + upsert no banco (precisa do config preenchido).
 *
 * PDFs esperados (baixados do INEP, caderno AZUL):
 *   PROVAS ENEM/{ano}/dia1.pdf   (questões 1..90)
 *   PROVAS ENEM/{ano}/dia2.pdf   (questões 91..180)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { config as loadEnv } from 'dotenv';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

loadEnv({ path: join(ROOT, '.env.local') });

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------
const DRY_RUN = process.argv.includes('--dry-run');
const DEBUG = process.argv.includes('--debug');
const YEAR_ARG = process.argv.find((a) => a.startsWith('--year='));
const YEAR = YEAR_ARG ? parseInt(YEAR_ARG.split('=')[1] ?? '0', 10) : 0;
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1] ?? '0', 10) : 0;
const DIR_ARG = process.argv.find((a) => a.startsWith('--dir='));

if (!YEAR || YEAR < 2009 || YEAR > 2100) {
  console.error('BLOCKED: informe --year=YYYY (ex: --year=2023)');
  process.exit(1);
}

const PROVAS_DIR = DIR_ARG
  ? DIR_ARG.split('=')[1]!
  : join(ROOT, 'PROVAS ENEM', String(YEAR));
const CONFIG_DIR = join(ROOT, 'scripts', 'enem-config');
const CONFIG_PATH = join(CONFIG_DIR, `${YEAR}.json`);
const DEBUG_DIR = join(ROOT, 'scripts', 'enem-debug', String(YEAR));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SECRET =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL ?? '';

const BUCKET = 'questions';
const RENDER_SCALE = 2.0;
const TOTAL_QUESTIONS = 180;

// PDFs oficiais do INEP (caderno AZUL). D1 azul = CD1; D2 azul = CD7 (2023).
// Em outros anos o numero do caderno azul muda — adicione o ano aqui.
const INEP_BASE = 'https://download.inep.gov.br/enem/provas_e_gabaritos';
const PROVA_URLS: Record<number, { dia1: string; dia2: string }> = {
  2023: {
    dia1: `${INEP_BASE}/2023_PV_impresso_D1_CD1.pdf`,
    dia2: `${INEP_BASE}/2023_PV_impresso_D2_CD7.pdf`,
  },
};

// pdfjs-dist 3.x + node-canvas (mesmo padrão de render_linguagens_images.ts)
const require = createRequire(import.meta.url);
type CanvasMod = { createCanvas: (w: number, h: number) => any };
const { createCanvas } = require('canvas') as CanvasMod;
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js') as any;

// ---------------------------------------------------------------------------
// Disciplina por número de questão (caderno azul)
// ---------------------------------------------------------------------------
const DISCIPLINE_LABEL: Record<string, string> = {
  linguagens: 'Linguagens',
  humanas: 'Ciências Humanas',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  matematica: 'Matemática',
};

interface EnemConfig {
  year: number;
  caderno: string;
  /** 180 letras A-E; índice = (questão - 1). '?' = pendente. */
  gabarito: string;
  /** Disciplina das questões 91..135 (Ciências da Natureza). */
  naturezaDisciplinas: Record<string, string>;
}

function disciplineFor(num: number, cfg: EnemConfig | null): string {
  if (num >= 1 && num <= 45) return 'linguagens';
  if (num >= 46 && num <= 90) return 'humanas';
  if (num >= 136 && num <= 180) return 'matematica';
  if (num >= 91 && num <= 135) {
    const d = cfg?.naturezaDisciplinas?.[String(num)];
    if (d && DISCIPLINE_LABEL[d]) return d;
    return 'biologia'; // fallback até a config ser preenchida
  }
  return 'linguagens';
}

function loadConfig(): EnemConfig | null {
  if (!existsSync(CONFIG_PATH)) return null;
  const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  return raw as EnemConfig;
}

function writeConfigTemplate(): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  if (existsSync(CONFIG_PATH)) return;
  const naturezaDisciplinas: Record<string, string> = {};
  for (let n = 91; n <= 135; n++) naturezaDisciplinas[String(n)] = 'biologia';
  const template: EnemConfig = {
    year: YEAR,
    caderno: 'azul',
    gabarito: '?'.repeat(TOTAL_QUESTIONS),
    naturezaDisciplinas,
  };
  writeFileSync(CONFIG_PATH, JSON.stringify(template, null, 2) + '\n', 'utf8');
  console.log(`[config] template criado: ${CONFIG_PATH}`);
  console.log('         preencha o campo gabarito (180 letras A-E) e revise');
  console.log('         as disciplinas de Ciencias da Natureza (Q91-Q135).');
}

// ---------------------------------------------------------------------------
// Render PDF -> PNG por página + marcadores QUESTAO-NN
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
  yTop: number;
  xLeft: number;
}

function groupItemsToLines(
  items: { str: string; x: number; y: number; height: number }[],
): { text: string; yPdf: number; xPdf: number }[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { text: string; yPdf: number; xPdf: number; xMax: number }[] = [];
  for (const it of sorted) {
    let placed = false;
    for (const ln of lines) {
      if (Math.abs(ln.yPdf - it.y) <= 3) {
        if (it.x - ln.xMax > 60 && ln.text.length > 0) continue;
        ln.text = (ln.text + ' ' + it.str).replace(/\s+/g, ' ').trim();
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

/**
 * Renderiza as páginas relevantes do PDF e extrai os marcadores QUESTAO-NN.
 */
async function renderPdf(
  pdfPath: string,
): Promise<{ pages: PageRender[]; markers: QuestionMarker[] }> {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;

  const pageItems = new Map<
    number,
    { str: string; x: number; y: number; height: number }[]
  >();
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    try {
      const content = await page.getTextContent();
      pageItems.set(
        p,
        (content.items as any[]).map((item) => ({
          str: String(item.str ?? ''),
          x: Number(item.transform?.[4] ?? 0),
          y: Number(item.transform?.[5] ?? 0),
          height: Number(item.height ?? 0),
        })),
      );
    } catch {
      pageItems.set(p, []);
    }
  }

  // Detecta marcadores QUESTAO-NN (1..180). Case-insensitive.
  const markers: QuestionMarker[] = [];
  for (const [p, items] of pageItems) {
    for (const line of groupItemsToLines(items)) {
      const m = /quest[ãa]o\s+(\d{1,3})/i.exec(line.text);
      if (!m) continue;
      const num = parseInt(m[1]!, 10);
      if (num < 1 || num > TOTAL_QUESTIONS) continue;
      markers.push({ questionNum: num, pageNum: p, yTop: line.yPdf, xLeft: line.xPdf });
    }
  }

  if (markers.length === 0) {
    console.warn(`  [warn] nenhum marcador QUESTAO-NN em ${pdfPath}`);
    await doc.destroy();
    return { pages: [], markers: [] };
  }

  // Renderiza da primeira à última página com marcador (+1 de folga).
  const pagesWithMarkers = new Set(markers.map((m) => m.pageNum));
  const minP = Math.min(...pagesWithMarkers);
  const maxP = Math.min(doc.numPages, Math.max(...pagesWithMarkers) + 1);
  const pages: PageRender[] = [];
  for (let p = minP; p <= maxP; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    pages.push({
      pageNum: p,
      width: canvas.width,
      height: canvas.height,
      png: canvas.toBuffer('image/png'),
    });
  }

  // Converte coords PDF (bottom-up) -> pixel top-down.
  const heightPxByPage = new Map<number, number>();
  for (const pg of pages) heightPxByPage.set(pg.pageNum, pg.height);
  for (const mk of markers) {
    const heightPx = heightPxByPage.get(mk.pageNum);
    if (heightPx === undefined) continue;
    const heightPdf = heightPx / RENDER_SCALE;
    const yPx = (heightPdf - mk.yTop) * RENDER_SCALE;
    mk.yTop = Math.max(0, Math.floor(yPx - 8 * RENDER_SCALE));
    mk.xLeft = mk.xLeft * RENDER_SCALE;
  }

  await doc.destroy();
  return { pages, markers };
}

// ---------------------------------------------------------------------------
// Crop por questão (mesma heurística do pipeline Unifor)
// ---------------------------------------------------------------------------
interface QuestionCrop {
  questionNum: number;
  jpeg: Buffer;
}

async function cropPngRaw(
  png: Buffer,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<Buffer> {
  return sharp(png)
    .extract({
      left: Math.max(0, Math.floor(x)),
      top: Math.max(0, Math.floor(y)),
      width: Math.floor(w),
      height: Math.floor(h),
    })
    .png()
    .toBuffer();
}

async function cropPng(
  png: Buffer,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<Buffer> {
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
  const metas = await Promise.all(slices.map((s) => sharp(s).metadata()));
  const totalH = metas.reduce((a, m) => a + (m.height ?? 0), 0);
  const composite: any[] = [];
  let yOff = 0;
  for (let i = 0; i < slices.length; i++) {
    composite.push({ input: slices[i], top: yOff, left: 0 });
    yOff += metas[i]?.height ?? 0;
  }
  const stacked = await sharp({
    create: {
      width,
      height: totalH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(composite)
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer();
  let outImg = sharp(stacked);
  const meta = await outImg.metadata();
  if (meta.width && meta.width > 1200) {
    outImg = outImg.resize({ width: 1200, withoutEnlargement: true });
  }
  return outImg.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

/**
 * Recorta cada questão entre o seu marcador e o do próximo. Trata layout de
 * 2 colunas (marcadores na mesma página com Y próximo) e questões que
 * atravessam páginas (empilha verticalmente).
 */
async function cropQuestions(
  pages: PageRender[],
  markers: QuestionMarker[],
): Promise<QuestionCrop[]> {
  if (markers.length === 0) return [];
  const sorted = [...markers].sort((a, b) =>
    a.pageNum !== b.pageNum ? a.pageNum - b.pageNum : a.yTop - b.yTop,
  );
  const dedup: QuestionMarker[] = [];
  const seen = new Set<number>();
  for (const m of sorted) {
    if (seen.has(m.questionNum)) continue;
    seen.add(m.questionNum);
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

    const twoColumn =
      nxt && nxt.pageNum === cur.pageNum && Math.abs(nxt.yTop - cur.yTop) <= 40;

    if (twoColumn) {
      const curIsLeft = cur.xLeft < (nxt!.xLeft ?? 0);
      const rightColX = curIsLeft ? nxt!.xLeft : cur.xLeft;
      const splitX = Math.max(50, Math.floor(rightColX - 20));
      const top = Math.max(0, Math.min(cur.yTop, nxt!.yTop));
      const bottom = curPage.height;
      const leftEdge = curIsLeft ? 0 : splitX;
      const rightEdge = curIsLeft ? splitX : curPage.width;
      const w = rightEdge - leftEdge;
      if (w > 50 && bottom - top > 30) {
        crops.push({
          questionNum: cur.questionNum,
          jpeg: await cropPng(curPage.png, leftEdge, top, w, bottom - top),
        });
      }
      const otherLeft = curIsLeft ? splitX : 0;
      const otherRight = curIsLeft ? curPage.width : splitX;
      const otherW = otherRight - otherLeft;
      if (otherW > 50 && bottom - top > 30) {
        crops.push({
          questionNum: nxt!.questionNum,
          jpeg: await cropPng(curPage.png, otherLeft, top, otherW, bottom - top),
        });
      }
      i++; // nxt já processado
      continue;
    }

    if (nxt && nxt.pageNum === cur.pageNum) {
      const top = Math.max(0, cur.yTop);
      const bottom = Math.min(curPage.height, nxt.yTop);
      if (bottom <= top + 30) continue;
      crops.push({
        questionNum: cur.questionNum,
        jpeg: await cropPng(curPage.png, 0, top, curPage.width, bottom - top),
      });
      continue;
    }

    // Atravessa páginas (ou é a última questão).
    const top = Math.max(0, cur.yTop);
    const slices: Buffer[] = [
      await cropPngRaw(curPage.png, 0, top, curPage.width, curPage.height - top),
    ];
    const endPage = nxt ? nxt.pageNum : cur.pageNum + 1;
    for (let p = cur.pageNum + 1; p < endPage; p++) {
      const inter = pageMap.get(p);
      if (inter) slices.push(inter.png);
    }
    if (nxt) {
      const nxtPage = pageMap.get(nxt.pageNum);
      if (nxtPage) {
        const cutBottom = Math.min(nxtPage.height, nxt.yTop);
        if (cutBottom > 30) {
          slices.push(
            await cropPngRaw(nxtPage.png, 0, 0, nxtPage.width, cutBottom),
          );
        }
      }
    }
    crops.push({
      questionNum: cur.questionNum,
      jpeg: await stackVertical(slices, curPage.width),
    });
  }
  return crops;
}

// ---------------------------------------------------------------------------
// Processamento
// ---------------------------------------------------------------------------
interface Stats {
  detected: number;
  cropped: number;
  uploaded: number;
  upserted: number;
  failed: number;
}

async function processPdf(
  pdfPath: string,
  cfg: EnemConfig | null,
  supabase: ReturnType<typeof createClient> | null,
  pg: Client | null,
  stats: Stats,
): Promise<void> {
  console.log(`  [render] ${pdfPath}`);
  const { pages, markers } = await renderPdf(pdfPath);
  stats.detected += new Set(markers.map((m) => m.questionNum)).size;

  if (DEBUG) {
    for (const m of [...markers].sort(
      (a, b) => a.questionNum - b.questionNum,
    )) {
      console.log(
        `    [marker] Q${m.questionNum} page=${m.pageNum} yTop=${m.yTop.toFixed(0)} xLeft=${m.xLeft.toFixed(0)}`,
      );
    }
  }

  let crops = await cropQuestions(pages, markers);
  crops.sort((a, b) => a.questionNum - b.questionNum);
  if (LIMIT > 0) crops = crops.slice(0, LIMIT);
  stats.cropped += crops.length;
  console.log(`  [crop] ${crops.length} questões recortadas`);

  for (const crop of crops) {
    const num = crop.questionNum;
    const numPad = String(num).padStart(3, '0');
    const id = `enem_${YEAR}-1_Q${numPad}`;
    const remotePath = `enem/${YEAR}/Q${numPad}.jpg`;
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`;
    const discipline = disciplineFor(num, cfg);
    const label = DISCIPLINE_LABEL[discipline] ?? 'Geral';
    const correct =
      cfg && cfg.gabarito && cfg.gabarito.length >= num
        ? cfg.gabarito[num - 1]!.toUpperCase()
        : '?';

    if (DRY_RUN) {
      if (!existsSync(DEBUG_DIR)) mkdirSync(DEBUG_DIR, { recursive: true });
      const dbgPath = join(DEBUG_DIR, `Q${numPad}.jpg`);
      writeFileSync(dbgPath, crop.jpeg);
      stats.uploaded++;
      continue;
    }

    if (!/^[A-E]$/.test(correct)) {
      console.warn(`    [skip] Q${numPad}: gabarito ausente no config`);
      stats.failed++;
      continue;
    }

    // Upload da imagem
    const { error: upErr } = await supabase!.storage
      .from(BUCKET)
      .upload(remotePath, crop.jpeg, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (upErr) {
      console.error(`    [upload-fail] Q${numPad}: ${upErr.message}`);
      stats.failed++;
      continue;
    }
    stats.uploaded++;

    // Upsert da row
    try {
      await pg!.query(
        `insert into public.questions
          (id, discipline, subtopic, subtopic_short, year, semester,
           question_num, description, image_url, correct_answer, annulled, exam)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (id) do update set
           discipline = excluded.discipline,
           subtopic = excluded.subtopic,
           subtopic_short = excluded.subtopic_short,
           year = excluded.year,
           semester = excluded.semester,
           question_num = excluded.question_num,
           image_url = excluded.image_url,
           correct_answer = excluded.correct_answer,
           annulled = excluded.annulled,
           exam = excluded.exam`,
        [
          id,
          discipline,
          label,
          label,
          YEAR,
          1,
          num,
          null,
          imageUrl,
          correct,
          false,
          'enem',
        ],
      );
      stats.upserted++;
    } catch (err) {
      console.error(`    [upsert-fail] Q${numPad}: ${(err as Error).message}`);
      stats.failed++;
    }
  }
}

/**
 * Baixa o PDF do INEP se ainda não estiver em disco. Roda na máquina do
 * usuário (internet liberada). Best-effort: se falhar, segue e o usuário
 * pode colocar o arquivo manualmente.
 */
async function downloadIfMissing(url: string, dest: string): Promise<void> {
  if (existsSync(dest)) {
    console.log(`[pdf] já existe: ${dest}`);
    return;
  }
  console.log(`[download] ${url}`);
  try {
    const res: any = await (globalThis as any).fetch(url);
    if (!res || !res.ok) {
      console.warn(`  [warn] download falhou (HTTP ${res?.status ?? '?'})`);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    console.log(`  salvo: ${dest} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
  } catch (err) {
    console.warn(`  [warn] download falhou: ${(err as Error).message}`);
  }
}

async function main() {
  const startTs = Date.now();
  console.log(`[ENEM ${YEAR}] render de questões${DRY_RUN ? ' (DRY-RUN)' : ''}`);

  // Baixa os PDFs do INEP automaticamente (se ainda não estiverem em disco).
  const urls = PROVA_URLS[YEAR];
  if (urls) {
    await downloadIfMissing(urls.dia1, join(PROVAS_DIR, 'dia1.pdf'));
    await downloadIfMissing(urls.dia2, join(PROVAS_DIR, 'dia2.pdf'));
  }

  const dia1 = join(PROVAS_DIR, 'dia1.pdf');
  const dia2 = join(PROVAS_DIR, 'dia2.pdf');
  const pdfs = [dia1, dia2].filter((p) => existsSync(p));
  if (pdfs.length === 0) {
    console.error(`BLOCKED: nenhum PDF encontrado em ${PROVAS_DIR}`);
    console.error('  esperado: PROVAS ENEM/{ano}/dia1.pdf e dia2.pdf');
    process.exit(1);
  }
  console.log(`[pdf] ${pdfs.length} arquivo(s): ${pdfs.join(', ')}`);

  let cfg = loadConfig();
  if (!cfg) {
    writeConfigTemplate();
    cfg = loadConfig();
  }

  let supabase: ReturnType<typeof createClient> | null = null;
  let pg: Client | null = null;
  if (!DRY_RUN) {
    if (!SUPABASE_URL || !SUPABASE_SECRET || !SUPABASE_DB_URL) {
      console.error('BLOCKED: variáveis Supabase ausentes em .env.local');
      console.error('  precisa de NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_DB_URL');
      process.exit(1);
    }
    if (!cfg || cfg.gabarito.includes('?')) {
      console.error(`BLOCKED: preencha o gabarito em ${CONFIG_PATH} antes do upload.`);
      process.exit(1);
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
      auth: { persistSession: false },
    });
    const url = new URL(SUPABASE_DB_URL);
    const ref = /^db\.([a-z0-9]+)\.supabase\.co$/.exec(url.hostname)?.[1];
    if (!ref) throw new Error(`SUPABASE_DB_URL host inesperado: ${url.hostname}`);
    pg = new Client({
      host: process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: `postgres.${ref}`,
      password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
    });
    await pg.connect();
  }

  const stats: Stats = {
    detected: 0,
    cropped: 0,
    uploaded: 0,
    upserted: 0,
    failed: 0,
  };
  for (const pdf of pdfs) {
    try {
      await processPdf(pdf, cfg, supabase, pg, stats);
    } catch (err) {
      console.error(`  [fail] ${pdf}: ${(err as Error).message}`);
      if (DEBUG) console.error((err as Error).stack);
    }
  }

  if (pg) await pg.end();

  const elapsed = ((Date.now() - startTs) / 1000).toFixed(0);
  console.log('---');
  console.log(`tempo:           ${elapsed}s`);
  console.log(`questões detectadas: ${stats.detected}`);
  console.log(`recortadas:      ${stats.cropped}`);
  if (DRY_RUN) {
    console.log(`recortes salvos em: ${DEBUG_DIR}`);
    console.log('CONFIRA os recortes; ajuste o crop se algo cortou errado.');
  } else {
    console.log(`uploaded:        ${stats.uploaded}`);
    console.log(`upserted no DB:  ${stats.upserted}`);
  }
  console.log(`falhas:          ${stats.failed}`);
}

main().catch((err) => {
  console.error('FAIL:', err);
  console.error((err as Error).stack);
  process.exit(1);
});
