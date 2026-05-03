/**
 * Pré-gera conteúdo teórico (resumo + 3 links) para cada (discipline,
 * subtopic) DISTINCT de questions where exam='unifor-medicina'.
 *
 * Estratégia:
 *   - Se GEMINI_API_KEY estiver setado, usa @google/generative-ai
 *     (gemini-2.5-flash, texto puro) para gerar um resumo de 1-2 parágrafos
 *     com fórmulas KaTeX inline.
 *   - Caso contrário: stub "[stub] Conteúdo de {subtopic} em breve." +
 *     3 links default da allowlist por disciplina.
 *
 * Allowlist (spec Q2): wikipedia, khanacademy, brasilescola, mundoeducacao,
 * todamateria, infoescola, biologianet.
 *
 * Idempotente: pula combinações já existentes.
 *
 * Uso: npm run gen:theory [-- --limit=N] [-- --dry-run] [-- --allow-stub]
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TheoryLink } from '../src/lib/supabase/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(0, Number(limitArg.split('=')[1])) : 0;
const DRY_RUN = args.includes('--dry-run');
const ALLOW_STUB = args.includes('--allow-stub');

interface SubtopicRow {
  discipline: string;
  subtopic: string;
}

const ALLOWED_SOURCES: readonly string[] = [
  'wikipedia',
  'khanacademy',
  'brasilescola',
  'mundoeducacao',
  'todamateria',
  'infoescola',
  'biologianet',
];

function defaultLinks(discipline: string, subtopic: string): TheoryLink[] {
  const q = encodeURIComponent(subtopic);
  // Mapeia disciplina → 3 fontes preferenciais da allowlist (todas valid pt-BR).
  const perDiscipline: Record<string, TheoryLink[]> = {
    matematica: [
      {
        title: `${subtopic} — Brasil Escola`,
        url: `https://brasilescola.uol.com.br/?s=${q}`,
        source: 'brasilescola',
      },
      {
        title: `${subtopic} — Khan Academy`,
        url: `https://pt.khanacademy.org/search?page_search_query=${q}`,
        source: 'khanacademy',
      },
      {
        title: `${subtopic} — Toda Matéria`,
        url: `https://www.todamateria.com.br/?s=${q}`,
        source: 'todamateria',
      },
    ],
    fisica: [
      {
        title: `${subtopic} — Mundo Educação`,
        url: `https://mundoeducacao.uol.com.br/?s=${q}`,
        source: 'mundoeducacao',
      },
      {
        title: `${subtopic} — Brasil Escola`,
        url: `https://brasilescola.uol.com.br/?s=${q}`,
        source: 'brasilescola',
      },
      {
        title: `${subtopic} — InfoEscola`,
        url: `https://www.infoescola.com/?s=${q}`,
        source: 'infoescola',
      },
    ],
    quimica: [
      {
        title: `${subtopic} — Brasil Escola`,
        url: `https://brasilescola.uol.com.br/?s=${q}`,
        source: 'brasilescola',
      },
      {
        title: `${subtopic} — Mundo Educação`,
        url: `https://mundoeducacao.uol.com.br/?s=${q}`,
        source: 'mundoeducacao',
      },
      {
        title: `${subtopic} — Toda Matéria`,
        url: `https://www.todamateria.com.br/?s=${q}`,
        source: 'todamateria',
      },
    ],
    biologia: [
      {
        title: `${subtopic} — Biologia Net`,
        url: `https://www.biologianet.com/?s=${q}`,
        source: 'biologianet',
      },
      {
        title: `${subtopic} — Brasil Escola`,
        url: `https://brasilescola.uol.com.br/?s=${q}`,
        source: 'brasilescola',
      },
      {
        title: `${subtopic} — InfoEscola`,
        url: `https://www.infoescola.com/?s=${q}`,
        source: 'infoescola',
      },
    ],
    humanas: [
      {
        title: `${subtopic} — Brasil Escola`,
        url: `https://brasilescola.uol.com.br/?s=${q}`,
        source: 'brasilescola',
      },
      {
        title: `${subtopic} — Mundo Educação`,
        url: `https://mundoeducacao.uol.com.br/?s=${q}`,
        source: 'mundoeducacao',
      },
      {
        title: `${subtopic} — Wikipédia`,
        url: `https://pt.wikipedia.org/wiki/Special:Search?search=${q}`,
        source: 'wikipedia',
      },
    ],
    linguagens: [
      {
        title: `${subtopic} — Toda Matéria`,
        url: `https://www.todamateria.com.br/?s=${q}`,
        source: 'todamateria',
      },
      {
        title: `${subtopic} — Brasil Escola`,
        url: `https://brasilescola.uol.com.br/?s=${q}`,
        source: 'brasilescola',
      },
      {
        title: `${subtopic} — Wikipédia`,
        url: `https://pt.wikipedia.org/wiki/Special:Search?search=${q}`,
        source: 'wikipedia',
      },
    ],
  };

  const picked = perDiscipline[discipline] ?? perDiscipline.humanas ?? [];
  // Sanity: garantir 3 links e todos da allowlist.
  return picked
    .filter((l) => ALLOWED_SOURCES.includes(l.source))
    .slice(0, 3);
}

function buildPrompt(discipline: string, subtopic: string): string {
  return [
    'Você é um professor universitário. Escreva um resumo de 1 a 2 parágrafos',
    'em português sobre o seguinte subtópico de vestibular Unifor Medicina.',
    'Use Markdown. Use LaTeX KaTeX inline ($...$) e display ($$...$$) para',
    'fórmulas, quando aplicável. Não invente links nem fontes — apenas o',
    'texto explicativo, didático, objetivo e correto.',
    '',
    `Disciplina: ${discipline}`,
    `Subtópico: ${subtopic}`,
  ].join('\n');
}

interface GeminiTextClient {
  call(prompt: string): Promise<string>;
  modelName: string;
}

async function loadGeminiClient(apiKey: string): Promise<GeminiTextClient | null> {
  try {
    const mod = (await import('@google/generative-ai')) as typeof import('@google/generative-ai');
    const genAI = new mod.GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });
    return {
      modelName,
      async call(prompt: string): Promise<string> {
        const result = await model.generateContent(prompt);
        return result.response.text();
      },
    };
  } catch (err) {
    console.warn('[gen:theory] Gemini não disponível:', err);
    return null;
  }
}

async function main(): Promise<void> {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL ausente em .env.local');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const refMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (!refMatch) {
    throw new Error(`SUPABASE_DB_URL host inesperado: ${url.hostname}`);
  }
  const projectRef = refMatch[1];
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const poolerUser = `postgres.${projectRef}`;

  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: poolerUser,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`[gen:theory] conectado ao pooler ${poolerHost}.`);

  const apiKey = process.env.GEMINI_API_KEY;
  const gemini = apiKey ? await loadGeminiClient(apiKey) : null;
  if (!gemini && !ALLOW_STUB) {
    console.log(
      '[gen:theory] sem GEMINI_API_KEY e sem --allow-stub; saindo (0 rows).'
    );
    await client.end();
    return;
  }

  const filterLimit = LIMIT > 0 ? `limit ${LIMIT}` : '';
  const res = await client.query<SubtopicRow>(`
    select distinct q.discipline, q.subtopic
      from public.questions q
     where q.exam = 'unifor-medicina'
       and coalesce(q.annulled, false) = false
       and not exists (
         select 1 from public.subtopic_theory t
          where t.discipline = q.discipline and t.subtopic = q.subtopic
       )
     order by q.discipline, q.subtopic
     ${filterLimit}
  `);

  console.log(`[gen:theory] candidatas=${res.rowCount}`);
  if (DRY_RUN) {
    console.log('[gen:theory] --dry-run; não escreve.');
    await client.end();
    return;
  }

  let okCount = 0;
  for (const row of res.rows) {
    let summary: string;
    if (gemini) {
      try {
        summary = await gemini.call(buildPrompt(row.discipline, row.subtopic));
      } catch (err) {
        console.warn(`[gen:theory] erro em ${row.discipline}/${row.subtopic}:`, err);
        summary = `[stub] Conteúdo de ${row.subtopic} em breve.`;
      }
    } else {
      summary = `[stub] Conteúdo de ${row.subtopic} em breve.`;
    }

    const links = defaultLinks(row.discipline, row.subtopic);
    await client.query(
      `insert into public.subtopic_theory
         (discipline, subtopic, summary_md, links)
       values ($1, $2, $3, $4::jsonb)
       on conflict (discipline, subtopic) do nothing`,
      [row.discipline, row.subtopic, summary, JSON.stringify(links)]
    );
    okCount++;
    if (okCount % 10 === 0) {
      console.log(`[gen:theory] progresso ${okCount}/${res.rowCount}`);
    }
  }

  console.log(`[gen:theory] done. inseridos=${okCount}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
