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
 *   O gabarito é preenchido automaticamente a partir dos PDFs GB_impresso
 *   do INEP (ver GABARITO_URLS); o que sobrar como '?' precisa ser ajustado
 *   à mão no config antes do upload.
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
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  statSync,
  rmSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
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
const RENDER_SCALE = 3.0;
const TOTAL_QUESTIONS = 180;

// Fontes padrão do pdfjs (Helvetica/Times/etc). Sem isso o render solta
// "failed to fetch standard font" e pode perder glifos no recorte.
const STANDARD_FONTS =
  join(ROOT, 'node_modules', 'pdfjs-dist', 'standard_fonts') + '/';

// PDFs oficiais do INEP (caderno AZUL). D1 azul = CD1; D2 azul = CD7.
// Em outros anos o numero do caderno azul muda — adicione o ano aqui.
const INEP_BASE = 'https://download.inep.gov.br/enem/provas_e_gabaritos';
const PROVA_URLS: Record<number, { dia1: string; dia2: string }> = {
  2023: {
    dia1: `${INEP_BASE}/2023_PV_impresso_D1_CD1.pdf`,
    dia2: `${INEP_BASE}/2023_PV_impresso_D2_CD7.pdf`,
  },
  2025: {
    dia1: `${INEP_BASE}/2025_PV_impresso_D1_CD1.pdf`,
    dia2: `${INEP_BASE}/2025_PV_impresso_D2_CD7.pdf`,
  },
};

// Gabaritos oficiais do INEP (mesmo caderno AZUL das provas acima). O script
// lê a camada de texto destes PDFs e preenche as posições '?' do config.
const GABARITO_URLS: Record<number, { dia1: string; dia2: string }> = {
  2025: {
    dia1: `${INEP_BASE}/2025_GB_impresso_D1_CD1.pdf`,
    dia2: `${INEP_BASE}/2025_GB_impresso_D2_CD7.pdf`,
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
  /** x (px) da calha entre as 2 colunas; -1 = página de coluna única. */
  gutterX: number;
}

/**
 * Detecta a calha (gutter) entre as colunas direto na imagem renderizada:
 * procura, no centro da página, a faixa vertical branca mais alta. Se ela
 * cobrir boa parte da altura -> página de 2 colunas (devolve o x da calha);
 * senão -> coluna única (devolve -1). Imune a figuras largas pontuais.
 */
async function detectGutter(
  png: Buffer,
  width: number,
  height: number,
): Promise<number> {
  const { data, info } = await sharp(png)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const y0 = Math.floor(h * 0.14);
  const y1 = Math.floor(h * 0.86);
  let bestX = -1;
  let bestRun = 0;
  for (let x = Math.floor(w * 0.4); x <= Math.floor(w * 0.6); x++) {
    let run = 0;
    let mx = 0;
    for (let y = y0; y < y1; y++) {
      let white = true;
      for (let dx = -2; dx <= 2; dx++) {
        if ((data[y * w + x + dx] ?? 0) < 235) {
          white = false;
          break;
        }
      }
      if (white) {
        run++;
        if (run > mx) mx = run;
      } else {
        run = 0;
      }
    }
    if (mx > bestRun) {
      bestRun = mx;
      bestX = x;
    }
  }
  void width;
  void height;
  return bestRun / (y1 - y0) >= 0.5 ? bestX : -1;
}

interface QuestionMarker {
  questionNum: number;
  pageNum: number;
  yTop: number;
  xLeft: number;
}

/**
 * Renderiza as páginas relevantes do PDF e extrai os marcadores QUESTAO-NN.
 */
async function renderPdf(
  pdfPath: string,
): Promise<{
  pages: PageRender[];
  markers: QuestionMarker[];
  contentBottom: number;
}> {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    standardFontDataUrl: STANDARD_FONTS,
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

  // Detecta marcadores "QUESTÃO N". Detalhes da camada de texto do INEP:
  //  - o cabeçalho vem com letter-spacing → sai como "Q UEST ã O 95";
  //  - às vezes o fim do corpo de uma questão e o cabeçalho da outra coluna
  //    caem na mesma linha de texto ("...recebido Q UEST ã O 150").
  // Por isso: agrupa itens por linha (y), concatena rastreando a posição
  // (x,y) de cada caractere, e usa regex GLOBAL — a posição do marcador é a
  // do token "QUESTÃO", não a do início da linha (que pode ser corpo).
  const markers: QuestionMarker[] = [];
  // yPdf do rodapé (cabeçalho do INEP repetido no pé): a linha mais baixa
  // que contém "CADERNO". yPdf menor = mais embaixo na página.
  const footerYPdf = new Map<number, number>();
  for (const [p, items] of pageItems) {
    const rows: { y: number; cells: { str: string; x: number; y: number }[] }[] =
      [];
    for (const it of items) {
      if (!it.str.trim()) continue;
      let row = rows.find((r) => Math.abs(r.y - it.y) <= 3);
      if (!row) {
        row = { y: it.y, cells: [] };
        rows.push(row);
      }
      row.cells.push({ str: it.str, x: it.x, y: it.y });
    }
    for (const row of rows) {
      row.cells.sort((a, b) => a.x - b.x);
      let text = '';
      const charPos: { x: number; y: number }[] = [];
      for (let ci = 0; ci < row.cells.length; ci++) {
        const cell = row.cells[ci]!;
        if (ci > 0) {
          text += ' ';
          charPos.push({ x: cell.x, y: cell.y });
        }
        for (let k = 0; k < cell.str.length; k++) {
          text += cell.str[k];
          charPos.push({ x: cell.x, y: cell.y });
        }
      }
      if (text.replace(/\s/g, '').toLowerCase().includes('caderno')) {
        const prev = footerYPdf.get(p);
        if (prev === undefined || row.y < prev) footerYPdf.set(p, row.y);
      }
      const re = /q\s*u\s*e\s*s\s*t\s*[ãa]\s*o\s*(\d{1,3})/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const num = parseInt(m[1]!, 10);
        if (num < 1 || num > TOTAL_QUESTIONS) continue;
        const pos = charPos[m.index] ?? { x: row.cells[0]!.x, y: row.y };
        markers.push({
          questionNum: num,
          pageNum: p,
          yTop: pos.y,
          xLeft: pos.x,
        });
      }
    }
  }

  if (markers.length === 0) {
    console.warn(`  [warn] nenhum marcador QUESTAO-NN em ${pdfPath}`);
    await doc.destroy();
    return { pages: [], markers: [], contentBottom: 0 };
  }

  // Renderiza da primeira à última página com marcador (+1 de folga).
  const pagesWithMarkers = new Set(markers.map((m) => m.pageNum));
  const minP = Math.min(...pagesWithMarkers);
  const maxP = Math.min(doc.numPages, Math.max(...pagesWithMarkers) + 1);
  const pages: PageRender[] = [];
  const viewportByPage = new Map<number, any>();
  for (let p = minP; p <= maxP; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    viewportByPage.set(p, viewport);
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const png = canvas.toBuffer('image/png');
    pages.push({
      pageNum: p,
      width: canvas.width,
      height: canvas.height,
      png,
      gutterX: await detectGutter(png, canvas.width, canvas.height),
    });
  }

  // Converte as coords do marcador (espaço PDF) -> pixel da imagem com o
  // transform do viewport. Isso respeita o offset de CropBox dos PDFs do
  // INEP — a conversão manual antiga ignorava o CropBox e errava o Y ~30pt.
  const HEADER_PAD = Math.round(16 * RENDER_SCALE);
  for (const mk of markers) {
    const vp = viewportByPage.get(mk.pageNum);
    if (!vp) continue;
    const [vx, vy] = vp.convertToViewportPoint(mk.xLeft, mk.yTop) as [
      number,
      number,
    ];
    mk.xLeft = vx;
    mk.yTop = Math.max(0, Math.floor(vy - HEADER_PAD));
  }

  // contentBottom: y (px) logo acima do rodapé. As fatias de coluna param
  // aqui pra não capturar a linha de rodapé repetida do INEP.
  let contentBottom = pages.length
    ? Math.min(...pages.map((p) => p.height))
    : 0;
  for (const pg of pages) {
    const fy = footerYPdf.get(pg.pageNum);
    const vp = viewportByPage.get(pg.pageNum);
    if (fy === undefined || !vp) continue;
    const cy = (vp.convertToViewportPoint(0, fy) as number[])[1]!;
    contentBottom = Math.min(
      contentBottom,
      Math.floor(cy - 12 * RENDER_SCALE),
    );
  }

  await doc.destroy();
  return { pages, markers, contentBottom };
}

// ---------------------------------------------------------------------------
// Gabarito — extrai questão -> letra da camada de texto dos PDFs GB_impresso
// ---------------------------------------------------------------------------
/**
 * Lê um PDF "GB_impresso" do INEP e devolve um mapa questão -> letra (A-E).
 *
 * Best-effort: agrupa os itens de texto por linha (tolerante a tabelas de
 * colunas largas — não usa o corte de 60u do groupItemsToLines) e casa pares
 * `numero ... letra`. Em tabela multi-caderno pega a 1a letra após o número
 * (coluna azul, sempre a primeira). Conflitos (mesma questão com letras
 * diferentes) são descartados — a checagem de '?' bloqueia upload incompleto.
 *
 * @param minQ/maxQ  intervalo esperado (dia 1 = 1..90, dia 2 = 91..180). Se o
 *   arquivo renumerou o dia 2 como 1..90, desloca +90 automaticamente.
 */
async function parseGabaritoPdf(
  pdfPath: string,
  minQ: number,
  maxQ: number,
): Promise<Map<number, string>> {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    standardFontDataUrl: STANDARD_FONTS,
  }).promise;

  const raw = new Map<number, string>();
  const conflict = new Set<number>();
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    let items: { str: string; x: number; y: number }[] = [];
    try {
      const content = await page.getTextContent();
      items = (content.items as any[]).map((item) => ({
        str: String(item.str ?? ''),
        x: Number(item.transform?.[4] ?? 0),
        y: Number(item.transform?.[5] ?? 0),
      }));
    } catch {
      items = [];
    }
    // Agrupa por linha (y), tolerante a colunas largas.
    const rows: { y: number; cells: { x: number; str: string }[] }[] = [];
    for (const it of items) {
      if (!it.str.trim()) continue;
      let row = rows.find((r) => Math.abs(r.y - it.y) <= 3);
      if (!row) {
        row = { y: it.y, cells: [] };
        rows.push(row);
      }
      row.cells.push({ x: it.x, str: it.str });
    }
    for (const row of rows) {
      row.cells.sort((a, b) => a.x - b.x);
      const text = row.cells
        .map((c) => c.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      const re = /\b(\d{1,3})\b[^0-9A-Ea-e]{0,6}([A-Ea-e])\b/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const num = parseInt(m[1]!, 10);
        const letter = m[2]!.toUpperCase();
        if (num < 1 || num > TOTAL_QUESTIONS) continue;
        const prev = raw.get(num);
        if (prev && prev !== letter) conflict.add(num);
        else raw.set(num, letter);
      }
      // "NN Anulado" -> questão anulada (marcador '*').
      const reAnn = /\b(\d{1,3})\b[^0-9A-Za-z]{0,4}anulad/gi;
      let a: RegExpExecArray | null;
      while ((a = reAnn.exec(text)) !== null) {
        const num = parseInt(a[1]!, 10);
        if (num >= 1 && num <= TOTAL_QUESTIONS) {
          conflict.delete(num);
          raw.set(num, '*');
        }
      }
    }
  }
  await doc.destroy();
  for (const n of conflict) raw.delete(n);

  // Dia 2: se o arquivo renumerou como 1..90, desloca pro intervalo 91..180.
  let normalized = raw;
  if (minQ > 90 && raw.size > 0 && Math.max(...raw.keys()) <= 90) {
    normalized = new Map();
    for (const [k, v] of raw) normalized.set(k + 90, v);
  }
  const out = new Map<number, string>();
  for (const [k, v] of normalized) {
    if (k >= minQ && k <= maxQ) out.set(k, v);
  }
  return out;
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
 * Recorta cada questão respeitando o layout do ENEM, que MISTURA páginas de
 * 2 colunas e de coluna única (questões com figuras/tabelas largas).
 *
 * Cada página vira 1 ou 2 "segmentos" de coluna conforme a calha detectada
 * na imagem (PageRender.gutterX). A leitura flui segmento a segmento; cada
 * questão ocupa do seu marcador ao da próxima, empilhando os segmentos
 * atravessados. Resolve tanto o layout 2-colunas quanto figuras largas.
 */
async function cropQuestions(
  pages: PageRender[],
  markers: QuestionMarker[],
  contentBottom: number,
): Promise<QuestionCrop[]> {
  if (markers.length === 0 || pages.length === 0) return [];

  const orderedPages = [...pages].sort((a, b) => a.pageNum - b.pageNum);
  const pageMap = new Map<number, PageRender>();
  for (const p of pages) pageMap.set(p.pageNum, p);

  // Segmentos de coluna em ordem de leitura. Página de 2 colunas -> 2
  // segmentos (esq/dir na calha); página de coluna única -> 1 segmento.
  interface ColSeg {
    pageNum: number;
    x0: number;
    x1: number;
  }
  const colSeq: ColSeg[] = [];
  for (const p of orderedPages) {
    if (p.gutterX > 0) {
      colSeq.push({ pageNum: p.pageNum, x0: 0, x1: p.gutterX });
      colSeq.push({ pageNum: p.pageNum, x0: p.gutterX, x1: p.width });
    } else {
      colSeq.push({ pageNum: p.pageNum, x0: 0, x1: p.width });
    }
  }
  const segIndexFor = (pageNum: number, x: number): number => {
    let first = -1;
    for (let i = 0; i < colSeq.length; i++) {
      if (colSeq[i]!.pageNum !== pageNum) continue;
      if (first < 0) first = i;
      if (x >= colSeq[i]!.x0 && x < colSeq[i]!.x1) return i;
    }
    return first;
  };

  // Topo do conteúdo (logo abaixo do cabeçalho): o marcador mais alto.
  const contentTop = Math.max(0, Math.min(...markers.map((m) => m.yTop)));

  // dedup + segmento de cada marcador.
  const seen = new Set<number>();
  const ordered: (QuestionMarker & { seg: number })[] = [];
  for (const m of markers) {
    if (seen.has(m.questionNum) || !pageMap.has(m.pageNum)) continue;
    const seg = segIndexFor(m.pageNum, m.xLeft);
    if (seg < 0) continue;
    seen.add(m.questionNum);
    ordered.push({ ...m, seg });
  }
  // Ordem de leitura: índice do segmento (já é página+coluna) e depois y.
  ordered.sort((a, b) => a.seg - b.seg || a.yTop - b.yTop);

  const crops: QuestionCrop[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const cur = ordered[i]!;
    const nxt = ordered[i + 1] ?? null;
    const startIdx = cur.seg;
    let endIdx: number;
    let endY: number; // y final no último segmento; -1 = até a base
    if (nxt) {
      endIdx = nxt.seg >= startIdx ? nxt.seg : startIdx;
      endY = nxt.yTop;
    } else {
      endIdx = startIdx;
      endY = -1;
    }

    const slices: Buffer[] = [];
    let maxW = 0;
    for (let c = startIdx; c <= endIdx; c++) {
      const seg = colSeq[c]!;
      const page = pageMap.get(seg.pageNum);
      if (!page) continue;
      const top = c === startIdx ? cur.yTop : contentTop;
      const segBottom = contentBottom > 0 ? contentBottom : page.height;
      const bottom = c === endIdx && endY >= 0 ? endY : segBottom;
      const w = Math.min(seg.x1 - seg.x0, page.width - seg.x0);
      const h = Math.min(bottom, page.height) - top;
      if (w < 20 || h < 20) continue;
      slices.push(await cropPngRaw(page.png, seg.x0, top, w, h));
      if (w > maxW) maxW = w;
    }
    if (slices.length === 0) continue;
    let jpeg = await stackVertical(slices, maxW);
    if (!nxt) {
      // Última questão: corta o branco que sobra até o pé da coluna.
      try {
        jpeg = await sharp(jpeg)
          .trim({ background: '#ffffff', threshold: 15 })
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
      } catch {
        /* sem borda pra cortar — mantém como está */
      }
    }
    crops.push({ questionNum: cur.questionNum, jpeg });
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
  const { pages, markers, contentBottom } = await renderPdf(pdfPath);
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

  let crops = await cropQuestions(pages, markers, contentBottom);
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
    // '*' no gabarito = questão anulada pelo INEP (entra com annulled=true
    // e correct_answer=null; o app já trata isso em quiz-runner/simulado).
    const annulledQ = correct === '*';

    if (DRY_RUN) {
      if (!existsSync(DEBUG_DIR)) mkdirSync(DEBUG_DIR, { recursive: true });
      const dbgPath = join(DEBUG_DIR, `Q${numPad}.jpg`);
      writeFileSync(dbgPath, crop.jpeg);
      stats.uploaded++;
      continue;
    }

    if (!annulledQ && !/^[A-E]$/.test(correct)) {
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
          annulledQ ? null : correct,
          annulledQ,
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
 * Baixa um PDF do INEP via `curl` (User-Agent de navegador, redirects,
 * retries) — bem mais tolerante que o `fetch` do Node, que o WAF do INEP
 * derruba na conexão ("fetch failed"). Best-effort: se falhar, segue e o
 * PDF pode ser colocado à mão em PROVAS ENEM/{ano}/.
 */
async function downloadIfMissing(url: string, dest: string): Promise<void> {
  if (existsSync(dest)) {
    console.log(`[pdf] já existe: ${dest}`);
    return;
  }
  console.log(`[download] ${url}`);
  if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
  const res = spawnSync(
    'curl',
    [
      '-fsSL',
      '--retry', '4',
      '--retry-delay', '3',
      '--retry-all-errors',
      '--connect-timeout', '30',
      '--max-time', '600',
      '-A',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      '-H',
      'Accept: application/pdf,application/octet-stream,*/*',
      '-o', dest,
      url,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
  if (res.status !== 0 || !existsSync(dest)) {
    console.warn(`  [warn] download falhou (curl exit ${res.status ?? '?'})`);
    rmSync(dest, { force: true });
    return;
  }
  // O WAF do INEP às vezes responde 200 com uma página HTML de bloqueio.
  const head = readFileSync(dest).subarray(0, 5).toString('latin1');
  if (!head.startsWith('%PDF')) {
    console.warn(`  [warn] resposta não é PDF (começa com "${head.trim()}")`);
    rmSync(dest, { force: true });
    return;
  }
  const mb = (statSync(dest).size / 1024 / 1024).toFixed(1);
  console.log(`  salvo: ${dest} (${mb} MB)`);
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
  const gabUrls = GABARITO_URLS[YEAR];
  if (gabUrls) {
    await downloadIfMissing(gabUrls.dia1, join(PROVAS_DIR, 'gabarito-dia1.pdf'));
    await downloadIfMissing(gabUrls.dia2, join(PROVAS_DIR, 'gabarito-dia2.pdf'));
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

  // Gabarito: extrai automaticamente dos PDFs GB_impresso do INEP e preenche
  // as posições '?' do config. O que não der pra ler continua '?' — a checagem
  // mais abaixo bloqueia upload com gabarito incompleto.
  if (cfg) {
    const gab1 = join(PROVAS_DIR, 'gabarito-dia1.pdf');
    const gab2 = join(PROVAS_DIR, 'gabarito-dia2.pdf');
    const parsed = new Map<number, string>();
    for (const [path, lo, hi] of [
      [gab1, 1, 90],
      [gab2, 91, 180],
    ] as [string, number, number][]) {
      if (!existsSync(path)) continue;
      try {
        for (const [k, v] of await parseGabaritoPdf(path, lo, hi)) {
          parsed.set(k, v);
        }
      } catch (err) {
        console.warn(`  [warn] falha ao ler ${path}: ${(err as Error).message}`);
      }
    }
    if (parsed.size > 0) {
      const chars = cfg.gabarito.padEnd(TOTAL_QUESTIONS, '?').split('');
      let filled = 0;
      for (const [num, letter] of parsed) {
        if (num >= 1 && num <= TOTAL_QUESTIONS && chars[num - 1] === '?') {
          chars[num - 1] = letter;
          filled++;
        }
      }
      cfg.gabarito = chars.join('');
      console.log(
        `[gabarito] ${parsed.size} respostas lidas dos PDFs do INEP, ${filled} preenchidas`,
      );
    }
    const missing = cfg.gabarito.split('').filter((c) => c === '?').length;
    console.log(
      missing > 0
        ? `[gabarito] ${missing} questão(ões) ainda sem resposta — preencha ${CONFIG_PATH}`
        : `[gabarito] completo (${TOTAL_QUESTIONS}/${TOTAL_QUESTIONS})`,
    );
    if (DEBUG || DRY_RUN) {
      for (let r = 0; r < TOTAL_QUESTIONS; r += 30) {
        const lo = String(r + 1).padStart(3, '0');
        const hi = String(Math.min(r + 30, TOTAL_QUESTIONS)).padStart(3, '0');
        console.log(
          `  Q${lo}-${hi}: ${cfg.gabarito.slice(r, r + 30).split('').join(' ')}`,
        );
      }
    }
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
