/**
 * Geração multimodal de flashcards conceituais usando Gemini Vision.
 *
 * Usado pra cobrir as questões SEM description significativa (Mat/Fis/Quim/Bio/Hum)
 * que ficaram sem flashcard no script texto-puro `generate-flashcards.ts`.
 *
 * Pipeline:
 *  1. Busca questões com `length(description) <= 50` que ainda não têm conceito.
 *  2. Faz fetch do image_url, converte pra base64.
 *  3. Manda Gemini Vision (gemini-2.5-flash) com prompt rigoroso.
 *  4. Salva front/back em flashcard_concepts.
 *
 * Uso:
 *   npx tsx scripts/generate-flashcards-vision.ts             # todas as elegíveis
 *   npx tsx scripts/generate-flashcards-vision.ts --limit=20
 *   npx tsx scripts/generate-flashcards-vision.ts --discipline=matematica
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const args = process.argv.slice(2);
const LIMIT = parseInt(args.find((a) => a.startsWith('--limit='))?.slice(8) ?? '0', 10) || null;
const DISCIPLINE = args.find((a) => a.startsWith('--discipline='))?.slice(13) ?? null;

const SYSTEM_PROMPT = `Você é um especialista em vestibular Unifor Medicina criando flashcards conceituais a partir de IMAGEM de questão.

Recebe a foto de uma questão de vestibular. Sua tarefa: ler a imagem, identificar o CONCEITO-CHAVE, e gerar um flashcard Anki autocontido.

REGRAS DURAS DE SKIP (use {"skip": true, "reason": "..."} se QUALQUER uma se aplicar):
1. Imagem ilegível, parcial, ou questão sem conceito generalizável (puramente cálculo de valores específicos sem fórmula explícita).
2. Questão pede pra interpretar texto/charge/poema específico citado na própria imagem — interpretação contextual NÃO vira flashcard útil.
3. O flashcard precisaria dizer "no texto", "na figura", "segundo o gráfico" — proibido. Cada flashcard precisa ser AUTOCONTIDO.
4. Você não consegue identificar um conceito CLARO e GENERALIZÁVEL.

Quando NÃO skipar:
- Front = pergunta direta sobre conceito, definição, regra, fórmula, mecanismo, classificação. Max 200 chars.
- Back = resposta direta, objetiva, completa o suficiente pra ensinar. Max 350 chars.
- Tom didático, pt-BR claro. Sem markdown. Sem emojis. Sem "no texto", "na questão".

Exemplos BONS:

Q (imagem): questão de Mat sobre função quadrática
{"front": "O que o discriminante Δ=b²-4ac de uma função quadrática indica sobre as raízes?", "back": "Δ>0: duas raízes reais distintas. Δ=0: uma raiz real dupla. Δ<0: nenhuma raiz real."}

Q (imagem): questão de Fis sobre Lei de Ohm
{"front": "Qual a relação entre tensão (U), corrente (i) e resistência (R) num condutor ôhmico?", "back": "U = R × i. A resistência é constante (independente de U e i) num condutor ôhmico. Unidades: U em volts (V), i em amperes (A), R em ohms (Ω)."}

Q (imagem): questão sobre Lei dos Senos
{"front": "Como enunciar a Lei dos Senos num triângulo qualquer?", "back": "Em qualquer triângulo, a/sen(A) = b/sen(B) = c/sen(C) = 2R, onde a, b, c são lados opostos aos ângulos A, B, C, e R é o raio da circunferência circunscrita."}

Q (imagem): "Calcule x sabendo que sen(30°)=0,5..."
{"skip": true, "reason": "cálculo pontual sem conceito generalizável"}

RETORNE APENAS o JSON válido, sem texto extra, sem markdown.`;

interface QuestionRow {
  id: string;
  discipline: string;
  subtopic: string;
  description: string | null;
  image_url: string;
  correct_answer: string | null;
}

interface ConceptResult {
  front?: string;
  back?: string;
  skip?: boolean;
  reason?: string;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url.slice(0, 80)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') ?? 'image/jpeg';
  const mimeType = ct.split(';')[0]!.trim();
  return { data: buf.toString('base64'), mimeType };
}

async function generateFromImage(
  q: QuestionRow,
): Promise<{ result: ConceptResult; provider: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY ausente');

  const mod = await import('@google/generative-ai');
  const client = new mod.GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
  });

  const { data: imageBase64, mimeType } = await fetchImageAsBase64(q.image_url);

  const userText = [
    `Disciplina: ${q.discipline}`,
    `Subtópico: ${q.subtopic}`,
    `Gabarito: ${q.correct_answer ?? '?'}`,
    q.description ? `Texto disponível: ${q.description.slice(0, 800)}` : 'Sem texto — só imagem.',
    'Extraia o conceito-chave da questão na imagem.',
  ].join('\n');

  const result = await model.generateContent([
    { inlineData: { data: imageBase64, mimeType } },
    { text: userText },
  ]);

  const content = result.response.text();
  let raw = content.trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  }
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    raw = raw.slice(firstBrace, lastBrace + 1);
  }

  let parsed: ConceptResult;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`JSON inválido: ${(err as Error).message}. Raw: ${raw.slice(0, 200)}`);
  }
  return { result: parsed, provider: 'gemini-vision' };
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL ausente');
    process.exit(1);
  }
  const url = new URL(dbUrl);
  const ref = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)?.[1];
  if (!ref) throw new Error('SUPABASE_DB_URL host inesperado');

  const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: `postgres.${ref}`,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const where: string[] = [
    'q.annulled = false',
    'q.image_url is not null',
    "q.image_url <> ''",
    'fc.question_id is null',
    // Foco em questões sem description útil (que falharam no texto-puro).
    '(q.description is null or length(q.description) <= 50)',
  ];
  const params: unknown[] = [];
  if (DISCIPLINE) {
    params.push(DISCIPLINE);
    where.push(`q.discipline = $${params.length}`);
  }
  let query = `select q.id, q.discipline, q.subtopic, q.description, q.image_url, q.correct_answer
    from public.questions q
    left join public.flashcard_concepts fc on fc.question_id = q.id
    where ${where.join(' and ')}
    order by random()`;
  if (LIMIT) query += ` limit ${LIMIT}`;

  const { rows } = await client.query<QuestionRow>(query, params);
  console.log(`Processando ${rows.length} questões via Gemini Vision...`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const t0 = Date.now();

  for (let i = 0; i < rows.length; i++) {
    const q = rows[i]!;
    process.stdout.write(`[${i + 1}/${rows.length}] ${q.id} (${q.discipline}/${q.subtopic.slice(0, 30)})... `);
    try {
      const { result, provider } = await generateFromImage(q);

      if (result.skip) {
        console.log(`SKIP (${result.reason ?? 'no reason'})`);
        skipped++;
        continue;
      }
      if (!result.front || !result.back) {
        console.log(`SKIP (resposta inválida)`);
        skipped++;
        continue;
      }
      const front = result.front.trim().slice(0, 600);
      const back = result.back.trim().slice(0, 800);
      if (front.length === 0 || back.length === 0) {
        console.log(`SKIP (vazio)`);
        skipped++;
        continue;
      }

      await client.query(
        `insert into public.flashcard_concepts (question_id, front_text, back_text, model)
         values ($1, $2, $3, $4)
         on conflict (question_id) do update set front_text = excluded.front_text, back_text = excluded.back_text, model = excluded.model, generated_at = now()`,
        [q.id, front, back, provider],
      );
      console.log(`OK`);
      ok++;
    } catch (err) {
      const msg = (err as Error).message;
      console.log(`FAIL (${msg.slice(0, 80)})`);
      failed++;
      // Rate limit: se Gemini fica down, espera 60s
      if (msg.includes('429') || msg.includes('quota')) {
        console.log('  → rate limit, esperando 60s...');
        await new Promise((r) => setTimeout(r, 60000));
      }
    }

    // Throttle 5s/req — Gemini Vision tem limite menor que text.
    await new Promise((r) => setTimeout(r, 5000));
  }

  await client.end();
  const dt = Math.round((Date.now() - t0) / 1000);
  console.log(`\nVision: ok=${ok} skipped=${skipped} failed=${failed} em ${dt}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
