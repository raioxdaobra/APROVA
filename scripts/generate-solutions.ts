/**
 * Pré-gera resoluções para todas as questões em public.questions que ainda
 * não tenham row em public.question_solutions.
 *
 * Estratégia:
 *   - Se GEMINI_API_KEY estiver setado, usa @google/generative-ai com o
 *     modelo gemini-2.5-flash (multimodal — lê a imagem da questão pela URL).
 *   - Caso contrário, usa um stub textual:
 *       "[stub] Resolução pendente. Gabarito: {LETRA}."
 *     Isso permite popular a tabela em desenvolvimento sem chave LLM.
 *
 * Validação após gerar:
 *   - Regex /letra ([A-E])\.?\s*$/i no fim do conteúdo extrai a conclusão.
 *   - Se a letra divergir de questions.correct_answer → 3 retries.
 *   - Após retries esgotados, salva com reviewed=false (revisão manual).
 *
 * Idempotente: pula questões que já tenham row.
 *
 * Uso: npm run gen:solutions [-- --limit=N] [-- --dry-run]
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const ANSWER_REGEX = /letra ([A-E])\.?\s*$/i;
const MAX_RETRIES = 3;

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(0, Number(limitArg.split('=')[1])) : 0;
const DRY_RUN = args.includes('--dry-run');
// Modo regen: pega as resolucoes que NAO tem "Análise das alternativas" e
// regenera (UPDATE em vez de INSERT). Usado pra atualizar resolucoes antigas
// pro novo formato item-a-item, sem perder as ja boas.
const REGEN_OLD = args.includes('--regen-old');

interface QuestionRow {
  id: string;
  discipline: string;
  subtopic: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  image_url: string;
  annulled: boolean | null;
}

interface GenerationResult {
  content: string;
  conclusion: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  generatedBy: string;
}

function buildPrompt(q: QuestionRow): string {
  const letter = q.correct_answer ?? 'A';
  // Prompt CURTO + alinhado ao on-demand (3 secoes: Conceito / Caminho da
  // resolucao / Por que a resposta e LETRA). Aqui temos a IMAGEM da questao
  // (multimodal Gemini), entao o LLM PODE referenciar o enunciado real.
  // Pedimos pra ele basear na questao real, nao inventar.
  return [
    'Você é um professor universitário. Você está vendo a imagem da questão',
    'de vestibular Unifor Medicina abaixo. Resolva-a de forma CONCISA',
    `(máximo 250 palavras). A resposta correta é a letra ${letter}.`,
    '',
    'Disciplina: ' + q.discipline,
    'Subtópico: ' + q.subtopic,
    '',
    'ESTRUTURA OBRIGATÓRIA (use exatamente esses headers H2):',
    '',
    '## Conceito',
    'Em 2-3 frases, identifique o que a questão está testando.',
    '',
    '## Caminho da resolução',
    'Em 3-5 passos curtos (use sub-bullets ou sub-headers `### Passo X`),',
    'mostre o raciocínio essencial pra chegar na resposta. Use LaTeX',
    '($...$ inline, $$...$$ display) para fórmulas.',
    '',
    `## Por que a resposta é ${letter}`,
    'Em 2-3 frases, explique pontualmente por que a alternativa ' + letter,
    'é a correta com base no que a questão pede. Você PODE mencionar 1-2',
    'distratores principais (a/b/c/d/e que vê na imagem) e o erro',
    'conceitual de cada um — mas seja BREVE. Não liste todas as 5.',
    '',
    'OBRIGATÓRIO: termine com a frase EXATA:',
    '"Portanto, a alternativa correta é a letra ' + letter + '."',
  ].join('\n');
}

function extractConclusion(content: string): 'A' | 'B' | 'C' | 'D' | 'E' | null {
  const m = content.trim().match(ANSWER_REGEX);
  if (!m || !m[1]) return null;
  const letter = m[1].toUpperCase();
  if (letter === 'A' || letter === 'B' || letter === 'C' || letter === 'D' || letter === 'E') {
    return letter;
  }
  return null;
}

function buildStub(q: QuestionRow): GenerationResult {
  const letter = q.correct_answer ?? 'A';
  const content =
    `[stub] Resolução pendente. Gabarito: ${letter}.\n\n` +
    `Portanto, a alternativa correta é a letra ${letter}.`;
  return {
    content,
    conclusion: letter,
    generatedBy: 'stub',
  };
}

interface GeminiClient {
  call(prompt: string, imageUrl: string): Promise<string>;
  modelName: string;
}

async function loadGeminiClient(apiKey: string): Promise<GeminiClient | null> {
  try {
    const mod = (await import('@google/generative-ai')) as typeof import('@google/generative-ai');
    const genAI = new mod.GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });
    return {
      modelName,
      async call(prompt: string, imageUrl: string): Promise<string> {
        // Baixa a imagem como base64 para passar ao modelo (multimodal).
        const res = await fetch(imageUrl);
        if (!res.ok) {
          throw new Error(`fetch image ${imageUrl} status ${res.status}`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
        const result = await model.generateContent([
          { inlineData: { data: buffer.toString('base64'), mimeType } },
          { text: prompt },
        ]);
        return result.response.text();
      },
    };
  } catch (err) {
    console.warn('[gen:solutions] Gemini não disponível, usando stubs:', err);
    return null;
  }
}

async function generateOne(
  q: QuestionRow,
  gemini: GeminiClient | null
): Promise<{ result: GenerationResult; reviewed: boolean } | null> {
  if (!gemini) {
    return { result: buildStub(q), reviewed: false };
  }

  let lastContent = '';
  let lastConclusion: 'A' | 'B' | 'C' | 'D' | 'E' | null = null;
  let lastErrorWasRateLimit = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const content = await gemini.call(buildPrompt(q), q.image_url);
      const conclusion = extractConclusion(content);
      lastContent = content;
      lastConclusion = conclusion;
      if (conclusion && conclusion === q.correct_answer) {
        return {
          result: { content, conclusion, generatedBy: gemini.modelName },
          reviewed: true,
        };
      }
      console.warn(
        `[gen:solutions] ${q.id} tentativa ${attempt}: conclusão=${conclusion} esperada=${q.correct_answer}`
      );
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      lastErrorWasRateLimit = msg.includes('429') || msg.toLowerCase().includes('quota');
      console.warn(`[gen:solutions] ${q.id} tentativa ${attempt} erro:`, msg.slice(0, 200));
      if (lastErrorWasRateLimit) {
        // Rate limit: espera 65s antes de tentar de novo. Free-tier
        // do Gemini-2.5-flash e 20 req/dia, entao normalmente nao vale
        // a pena retry — mas damos uma chance.
        await new Promise((r) => setTimeout(r, 65000));
      }
    }
  }

  // CRITICAL: quando TODAS as tentativas deram erro (lastContent vazio),
  // NAO grava stub — retorna null pra o caller PULAR a questao. Isso
  // protege o regen-old de sobrescrever conteudo bom com stub quando
  // o quota da API estourar. Antes desse fix, o script sobrescrevia 28
  // resolucoes boas com "[stub] Geração falhou..." quando o quota free
  // do Gemini foi atingido.
  if (!lastContent) {
    return null;
  }

  // Tem conteudo mas a conclusao nao bate. Salva mesmo assim (reviewed=false).
  const fallbackConclusion = lastConclusion ?? q.correct_answer ?? 'A';
  return {
    result: {
      content: lastContent,
      conclusion: fallbackConclusion,
      generatedBy: gemini.modelName,
    },
    reviewed: false,
  };
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
  console.log(`[gen:solutions] conectado ao pooler ${poolerHost}.`);

  const apiKey = process.env.GEMINI_API_KEY;
  const gemini = apiKey ? await loadGeminiClient(apiKey) : null;
  if (!gemini) {
    console.log('[gen:solutions] modo stub (sem GEMINI_API_KEY).');
  } else {
    console.log(`[gen:solutions] usando ${gemini.modelName}.`);
  }

  // IMPORTANTE: spec diz "só roda se chave LLM existir; sem chave, 0 é OK".
  // Mantemos esse contrato — o stub é opt-in via flag explícita ou ambiente
  // de dev. Aqui, sem chave, encerramos zerados a tabela.
  if (!gemini && !args.includes('--allow-stub')) {
    console.log(
      '[gen:solutions] sem GEMINI_API_KEY e sem --allow-stub; saindo (0 rows).'
    );
    await client.end();
    return;
  }

  const filterLimit = LIMIT > 0 ? `limit ${LIMIT}` : '';

  // Filtro varia por modo:
  // - default (gerar novas): so questoes SEM resolucao
  // - --regen-old: so questoes COM resolucao no formato antigo (sem o
  //   header "## Por que a resposta é" — marca distintiva do prompt novo)
  const existsClause = REGEN_OLD
    ? `and exists (
         select 1 from public.question_solutions s
          where s.question_id = q.id
            and s.content_md not ilike '%Por que a resposta%'
       )`
    : `and not exists (
         select 1 from public.question_solutions s where s.question_id = q.id
       )`;

  const res = await client.query<QuestionRow>(`
    select q.id, q.discipline, q.subtopic, q.correct_answer, q.image_url, q.annulled
      from public.questions q
     where q.exam = 'unifor-medicina'
       and coalesce(q.annulled, false) = false
       and q.correct_answer is not null
       ${existsClause}
     order by q.id
     ${filterLimit}
  `);

  console.log(
    `[gen:solutions] modo=${REGEN_OLD ? 'regen-old' : 'gerar-novas'} candidatas=${res.rowCount}`
  );
  if (DRY_RUN) {
    console.log('[gen:solutions] --dry-run; não escreve.');
    await client.end();
    return;
  }

  let okCount = 0;
  let skipCount = 0;
  let reviewFlag = 0;
  for (const q of res.rows) {
    const out = await generateOne(q, gemini);

    if (!out) {
      skipCount++;
      console.log(`[gen:solutions] ${q.id}: PULADA (LLM falhou em todas as tentativas)`);
      // Em modo regen-old, isso e o comportamento desejado (preserva o
      // conteudo antigo). Em modo gerar-novas, simplesmente nao insere.
      continue;
    }

    const { result, reviewed } = out;

    if (REGEN_OLD) {
      await client.query(
        `update public.question_solutions
            set content_md = $2,
                conclusion = $3,
                generated_by = $4,
                reviewed = $5
          where question_id = $1`,
        [q.id, result.content, result.conclusion, result.generatedBy, reviewed]
      );
    } else {
      await client.query(
        `insert into public.question_solutions
           (question_id, content_md, conclusion, generated_by, reviewed)
         values ($1, $2, $3, $4, $5)
         on conflict (question_id) do nothing`,
        [q.id, result.content, result.conclusion, result.generatedBy, reviewed]
      );
    }
    okCount++;
    if (!reviewed) reviewFlag++;
    if ((okCount + skipCount) % 5 === 0 || okCount + skipCount === res.rowCount) {
      console.log(
        `[gen:solutions] progresso ${okCount + skipCount}/${res.rowCount} (ok=${okCount} skip=${skipCount})`
      );
    }
  }

  console.log(
    `[gen:solutions] done. ${REGEN_OLD ? 'atualizados' : 'inseridos'}=${okCount} skip=${skipCount} reviewed=false=${reviewFlag}`
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
