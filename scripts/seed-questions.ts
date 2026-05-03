/**
 * Seed das 480 questoes da Unifor Medicina (2015.2 a 2026.1).
 *
 * Pipeline por questao:
 *   1. Le questao do <script id="questions-data"> em
 *      Estudo_Unifor_Medicina/Estudo_Unifor_Medicina.html.
 *   2. Aplica override de anuladas (FORCE_ANNULLED_IDS).
 *   3. Otimiza imagem (RGB, max 1200px, JPEG q=85) via sharp.
 *   4. Faz upload para o bucket 'questions' em {discipline}/{id}.jpg.
 *   5. Upsert na tabela public.questions com a URL publica.
 *
 * Idempotente: re-rodar nao duplica nem apaga questoes pre-existentes que
 * nao estejam no JSON.
 *
 * Uso: npm run db:seed
 */
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import { config } from 'dotenv';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { Database } from '../src/lib/supabase/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY!;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL!;
if (!SUPABASE_URL || !SUPABASE_SECRET || !SUPABASE_DB_URL) {
  console.error('Variáveis de ambiente faltando em .env.local');
  process.exit(1);
}

const HTML_PATH = join(ROOT, 'Estudo_Unifor_Medicina', 'Estudo_Unifor_Medicina.html');
const IMAGES_ROOT = join(ROOT, 'Estudo_Unifor_Medicina', 'images');
const BUCKET = 'questions';
const BATCH = 8;

interface RawQuestion {
  id: string;
  discipline: string;
  year: number;
  semester: number;
  prova: string;
  question_num: number;
  subtopic: string;
  subtopic_idx: number;
  description: string | null;
  image_path: string;
  correct_answer: string | null;
  annulled: boolean;
  discipline_display: string;
  subtopic_short: string;
}

// IDs forcados a anulados, complementando flags do JSON original. Alguns sao
// de provas que talvez nao estejam no banco — sao filtrados antes do upsert.
const FORCE_ANNULLED_IDS = new Set([
  '2015-2_Q18',
  '2015-2_Q21',
  '2015-2_Q22',
  '2016-1_Q06',
  '2019-2_Q16',
  '2019-2_Q18',
  '2019-2_Q25',
  '2020-1_Q40',
  '2021-1_Q08',
  '2021-1_Q25',
]);

function normalizeId(id: string): string {
  // Garante formato '{ano}-{semestre}_Q{num}' onde num pode ter qualquer
  // numero de digitos. Re-emite com 2 digitos minimos (Q08 padrao do dataset).
  const m = id.match(/^([0-9]{4})-([12])_Q([0-9]+)$/);
  if (!m) return id;
  return `${m[1]}-${m[2]}_Q${String(parseInt(m[3], 10)).padStart(2, '0')}`;
}

function readQuestions(): RawQuestion[] {
  const html = readFileSync(HTML_PATH, 'utf8');
  const m = html.match(
    /<script id="questions-data" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!m) throw new Error('Bloco <script id="questions-data"> nao encontrado.');
  return JSON.parse(m[1]) as RawQuestion[];
}

async function optimizeImage(absPath: string): Promise<Buffer> {
  let img = sharp(absPath, { failOn: 'none' }).flatten({ background: '#ffffff' });
  const meta = await img.metadata();
  if (meta.width && meta.width > 1200) {
    img = img.resize({ width: 1200, withoutEnlargement: true });
  }
  return img
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

interface SeedStats {
  uploaded: number;
  uploadFailed: number;
  upserted: number;
  upsertFailed: number;
  annulledMarked: number;
  warningsNullCorrect: string[];
  missingImages: string[];
}

async function processOne(
  q: RawQuestion,
  supabase: ReturnType<typeof createClient<Database>>,
  pg: Client,
  stats: SeedStats
): Promise<void> {
  const id = normalizeId(q.id);
  const annulled = q.annulled === true || FORCE_ANNULLED_IDS.has(id);
  if (annulled !== q.annulled) stats.annulledMarked++;
  if (!annulled && q.correct_answer == null) {
    stats.warningsNullCorrect.push(id);
  }
  const correctAnswer = annulled ? null : q.correct_answer;

  const localImage = join(IMAGES_ROOT, q.discipline, `${id}.jpg`);
  if (!existsSync(localImage)) {
    stats.missingImages.push(id);
    return;
  }

  // Upload
  try {
    const buf = await optimizeImage(localImage);
    const remotePath = `${q.discipline}/${id}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, buf, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) throw error;
    stats.uploaded++;
  } catch (err) {
    stats.uploadFailed++;
    console.error(`[seed] upload fail ${id}:`, (err as Error).message);
    return;
  }

  // Upsert via pg client (bypass RLS, mais rapido em batch). PG tipa array
  // de bigints para id serial; nao se aplica aqui pois id eh text.
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${q.discipline}/${id}.jpg`;
  try {
    await pg.query(
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
         description = excluded.description,
         image_url = excluded.image_url,
         correct_answer = excluded.correct_answer,
         annulled = excluded.annulled,
         exam = excluded.exam`,
      [
        id,
        q.discipline,
        q.subtopic,
        q.subtopic_short || q.subtopic,
        q.year,
        q.semester,
        q.question_num,
        q.description,
        imageUrl,
        correctAnswer,
        annulled,
        'unifor-medicina',
      ]
    );
    stats.upserted++;
  } catch (err) {
    stats.upsertFailed++;
    console.error(`[seed] upsert fail ${id}:`, (err as Error).message);
  }
}

async function main() {
  console.log('[seed] lendo HTML...');
  const questions = readQuestions();
  console.log(`[seed] ${questions.length} questoes encontradas`);
  if (questions.length !== 480) {
    console.warn(`[seed] aviso: esperava 480 questoes, recebeu ${questions.length}`);
  }

  const url = new URL(SUPABASE_DB_URL);
  const ref = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)![1];
  const pg = new Client({
    host: process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: `postgres.${ref}`,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SECRET, {
    auth: { persistSession: false },
  });

  const stats: SeedStats = {
    uploaded: 0,
    uploadFailed: 0,
    upserted: 0,
    upsertFailed: 0,
    annulledMarked: 0,
    warningsNullCorrect: [],
    missingImages: [],
  };

  let processed = 0;
  for (let i = 0; i < questions.length; i += BATCH) {
    const slice = questions.slice(i, i + BATCH);
    await Promise.allSettled(slice.map((q) => processOne(q, supabase, pg, stats)));
    processed += slice.length;
    if (processed % 50 === 0 || processed === questions.length) {
      console.log(
        `[seed] progresso ${processed}/${questions.length} ` +
          `up=${stats.uploaded} db=${stats.upserted} ` +
          `failU=${stats.uploadFailed} failD=${stats.upsertFailed}`
      );
    }
  }

  if (stats.warningsNullCorrect.length > 0) {
    console.warn(
      `[seed] anomalia: ${stats.warningsNullCorrect.length} questoes sem correct_answer e nao anuladas`,
      stats.warningsNullCorrect.slice(0, 20)
    );
  }
  if (stats.missingImages.length > 0) {
    console.warn(
      `[seed] imagens faltando: ${stats.missingImages.length}`,
      stats.missingImages.slice(0, 20)
    );
  }

  const { rows } = await pg.query(
    `select count(*)::int as n from public.questions where exam='unifor-medicina'`
  );
  const total = rows[0].n;
  await pg.end();

  console.log('[seed] resumo final:');
  console.log(`  uploadadas:        ${stats.uploaded}`);
  console.log(`  upload falhou:     ${stats.uploadFailed}`);
  console.log(`  upserts:           ${stats.upserted}`);
  console.log(`  upsert falhou:     ${stats.upsertFailed}`);
  console.log(`  forcadas anuladas: ${stats.annulledMarked}`);
  console.log(`  total no banco:    ${total} (exam=unifor-medicina)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
