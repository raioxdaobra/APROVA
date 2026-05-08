/**
 * Gera flashcards conceituais offline a partir das 1015 questões oficiais.
 *
 * Para cada questão (não-anulada, com description suficiente), pede ao LLM
 * chain (Gemini → Groq → Cerebras → Mistral) pra extrair:
 *   - front: pergunta-conceito objetiva (max 600 chars)
 *   - back: resposta-conceito objetiva (max 800 chars)
 *
 * Se a questão depender de imagem/figura/contexto longo e não puder ser
 * reduzida a conceito puro, o LLM retorna {skip: true} e a questão NÃO vira
 * flashcard.
 *
 * Cache: tabela `flashcard_concepts`. Idempotente: pula questões já geradas.
 *
 * Uso:
 *   npx tsx scripts/generate-flashcards.ts            # gera todas
 *   npx tsx scripts/generate-flashcards.ts --limit=50 # só 50
 *   npx tsx scripts/generate-flashcards.ts --discipline=linguagens
 *   npx tsx scripts/generate-flashcards.ts --redo     # apaga existentes e regera
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { completeChat } from '../src/lib/llm/chain';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const args = process.argv.slice(2);
const LIMIT = parseInt(args.find((a) => a.startsWith('--limit='))?.slice(8) ?? '0', 10) || null;
const DISCIPLINE = args.find((a) => a.startsWith('--discipline='))?.slice(13) ?? null;
const REDO = args.includes('--redo');

const SYSTEM_PROMPT = `Você é um especialista em vestibular Unifor Medicina criando flashcards conceituais.

Recebe uma questão. Sua tarefa: extrair o CONCEITO-CHAVE em formato Anki — pergunta + resposta autocontidas, que façam sentido SEM o enunciado original.

REGRAS DURAS DE SKIP (use {"skip": true, "reason": "..."} se QUALQUER uma se aplicar):
1. A questão depende de imagem/gráfico/figura/charge/tirinha que NÃO foi descrita no enunciado em texto.
2. A questão pede pra interpretar um texto específico citado (poema, fragmento literário, letra de canção, charge transcrita, manchete) — interpretação contextual NÃO vira flashcard útil.
3. A questão é "calcule X com esses dados específicos" sem conceito generalizável.
4. O front teria que dizer "no texto", "na charge", "na figura", "segundo o autor" — isso é proibido. Cada flashcard precisa ser AUTOCONTIDO.
5. A questão é sobre obra/autor/contexto histórico ULTRA específico que não é currículo padrão.
6. Você não consegue extrair um conceito CLARO e GENERALIZÁVEL.

Quando NÃO skipar:
- Front = pergunta direta sobre conceito, definição, regra, fórmula, mecanismo, classificação. Max 200 chars.
- Back = resposta direta, objetiva, completa o suficiente pra ensinar. Max 350 chars.
- Tom didático, pt-BR claro. Sem markdown. Sem emojis. Sem "no texto", "na questão", "no enunciado".

Exemplos BONS:

Q: "Sobre a função quadrática f(x)=ax²+bx+c, o discriminante Δ=b²-4ac indica..." (gabarito sobre raízes)
{"front": "O que o discriminante Δ=b²-4ac de uma função quadrática indica sobre as raízes?", "back": "Δ>0: duas raízes reais distintas. Δ=0: uma raiz real dupla. Δ<0: nenhuma raiz real (raízes complexas conjugadas)."}

Q: "A metáfora difere da comparação porque..." (gabarito B)
{"front": "Qual a diferença entre metáfora e comparação como figuras de linguagem?", "back": "Comparação usa conectivos explícitos (como, tal qual, parece). Metáfora estabelece a analogia de forma implícita, sem conectivos comparativos."}

Q: "Considerando a Revolução Industrial, qual fator foi decisivo para a urbanização?"
{"front": "Que fator econômico-social foi decisivo para a urbanização durante a Revolução Industrial?", "back": "A migração rural-urbana provocada pelos cercamentos, mecanização do campo e demanda de mão de obra fabril concentrada nas cidades industriais."}

Exemplos de SKIP (não geram card):

Q: "Observe a charge a seguir. Qual figura de linguagem predomina?" → {"skip": true, "reason": "depende de charge"}
Q: "No poema acima, o eu lírico..." → {"skip": true, "reason": "interpretação contextual"}
Q: "Calcule o valor de x na equação 3x+5=20" → {"skip": true, "reason": "cálculo pontual"}
Q: "Segundo o texto de Rubem Alves..." → {"skip": true, "reason": "interpretação contextual"}

RETORNE APENAS o JSON válido, sem texto extra, sem markdown, sem fences.`;

interface QuestionRow {
  id: string;
  discipline: string;
  subtopic: string;
  description: string;
  correct_answer: string | null;
}

interface ConceptResult {
  front?: string;
  back?: string;
  skip?: boolean;
  reason?: string;
}

async function generateConcept(q: QuestionRow): Promise<{ result: ConceptResult; provider: string }> {
  const userMsg = [
    `Disciplina: ${q.discipline}`,
    `Subtópico: ${q.subtopic}`,
    `Gabarito: ${q.correct_answer ?? '?'}`,
    `Enunciado: ${q.description.slice(0, 2000)}`,
  ].join('\n');

  const { content, provider } = await completeChat(
    {
      system: SYSTEM_PROMPT,
      history: [],
      userMessage: userMsg,
    },
    20_000,
  );

  // Parse JSON robusto: alguns modelos vêm com markdown
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
    throw new Error(`JSON inválido do provider: ${(err as Error).message}. Raw: ${raw.slice(0, 200)}`);
  }

  return { result: parsed, provider };
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

  if (REDO) {
    console.log('REDO: deletando flashcard_concepts existentes...');
    await client.query('delete from public.flashcard_concepts');
  }

  // Pega questões ainda sem concept
  const where: string[] = [
    'q.annulled = false',
    'q.description is not null',
    'length(q.description) > 50',
    'fc.question_id is null',
  ];
  const params: unknown[] = [];
  if (DISCIPLINE) {
    params.push(DISCIPLINE);
    where.push(`q.discipline = $${params.length}`);
  }
  let query = `select q.id, q.discipline, q.subtopic, q.description, q.correct_answer
    from public.questions q
    left join public.flashcard_concepts fc on fc.question_id = q.id
    where ${where.join(' and ')}
    order by random()`;
  if (LIMIT) query += ` limit ${LIMIT}`;

  const { rows } = await client.query<QuestionRow>(query, params);
  console.log(`Processando ${rows.length} questões...`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const t0 = Date.now();

  for (let i = 0; i < rows.length; i++) {
    const q = rows[i]!;
    process.stdout.write(`[${i + 1}/${rows.length}] ${q.id} (${q.discipline}/${q.subtopic.slice(0, 30)})... `);
    try {
      const { result, provider } = await generateConcept(q);

      if (result.skip) {
        console.log(`SKIP (${result.reason ?? 'no reason'})`);
        skipped++;
        continue;
      }
      if (!result.front || !result.back) {
        console.log(`SKIP (resposta inválida do LLM)`);
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
      console.log(`OK [${provider}]`);
      ok++;
    } catch (err) {
      const msg = (err as Error).message;
      console.log(`FAIL (${msg.slice(0, 80)})`);
      failed++;
      // Se TODOS providers falharam (breakers abertos), espera 90s pra eles fecharem.
      if (msg.includes('Nenhum provedor')) {
        console.log('  → todos providers down, esperando 90s pro breaker reabrir...');
        await new Promise((r) => setTimeout(r, 90000));
      }
    }

    // Throttle: 6s entre requests pra ficar dentro de Gemini (15/min) e Groq (30/min) com folga.
    await new Promise((r) => setTimeout(r, 6000));
  }

  await client.end();
  const dt = Math.round((Date.now() - t0) / 1000);
  console.log(`\nTotal: ok=${ok} skipped=${skipped} failed=${failed} em ${dt}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
