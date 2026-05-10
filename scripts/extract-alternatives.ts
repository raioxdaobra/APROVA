/**
 * Extrai o texto das 5 alternativas de cada questao usando Groq Llama 4
 * Scout multimodal. Salva em questions.alternatives (jsonb).
 *
 * Uso:
 *   tsx scripts/extract-alternatives.ts                 # processa pendentes
 *   tsx scripts/extract-alternatives.ts --limit=50      # limita batch
 *   tsx scripts/extract-alternatives.ts --redo          # processa tudo (UPDATE)
 *
 * Por que Groq e nao Gemini:
 *   - Free tier generoso (14400 req/dia vs 20 do Gemini)
 *   - Multimodal Llama 4 Scout testado e funcionando
 *   - Output curto (so as 5 alternativas) — barato e rapido
 *
 * NAO renderiza a questao no UI — apenas alimenta analise estatistica
 * (correlacoes alternativa correta vs erradas).
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(0, Number(limitArg.split('=')[1])) : 0;
const REDO = args.includes('--redo');

const PROMPT = `Voce ve a imagem de uma questao de vestibular Unifor Medicina.

Transcreva LITERALMENTE o texto das 5 alternativas (A, B, C, D, E) que aparecem na imagem.

Retorne APENAS um JSON valido neste formato exato (sem markdown, sem explicacao, sem texto adicional):

{"a":"texto da alternativa A","b":"texto da alternativa B","c":"texto da alternativa C","d":"texto da alternativa D","e":"texto da alternativa E"}

Regras:
- Mantenha acentos e pontuacao originais.
- Se houver formula matematica, use LaTeX inline ($...$) ou texto simples.
- Se a alternativa tiver multiplas linhas, junte com espaco em branco.
- NAO invente conteudo — se nao conseguir ler uma alternativa, use "" (string vazia).
- Apenas o JSON. Nada antes, nada depois.`;

interface AlternativesJson {
  a?: string;
  b?: string;
  c?: string;
  d?: string;
  e?: string;
}

async function fetchImageBase64(
  imageUrl: string,
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
    return { data: buffer.toString('base64'), mimeType };
  } catch {
    return null;
  }
}

async function extractViaGroq(
  imageUrl: string,
  apiKey: string,
): Promise<AlternativesJson | null> {
  const image = await fetchImageBase64(imageUrl);
  if (!image) return null;

  const dataUrl = `data:${image.mimeType};base64,${image.data}`;
  const models = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: PROMPT },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 800,
            response_format: { type: 'json_object' },
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (res.status === 429) {
          // Rate limit — espera 30s e tenta proximo modelo
          await new Promise((r) => setTimeout(r, 30000));
        }
        console.warn(`  ${model}: ${res.status} ${errText.slice(0, 100)}`);
        continue;
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) continue;

      // Remove possiveis markdown code fences
      const cleaned = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      try {
        const parsed = JSON.parse(cleaned) as AlternativesJson;
        // Sanity check: precisa ter pelo menos 3 das 5 alternativas
        const filled = ['a', 'b', 'c', 'd', 'e'].filter(
          (k) => typeof parsed[k as 'a'] === 'string' && (parsed[k as 'a'] ?? '').length > 0,
        ).length;
        if (filled < 3) {
          console.warn(`  ${model}: so ${filled}/5 alternativas extraidas`);
          continue;
        }
        return parsed;
      } catch (err) {
        console.warn(`  ${model}: JSON invalido — ${(err as Error).message.slice(0, 80)}`);
        continue;
      }
    } catch (err) {
      console.warn(`  ${model}: ${((err as Error).message ?? '').slice(0, 100)}`);
      continue;
    }
  }

  return null;
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  const groqKey = process.env.GROQ_API_KEY;
  if (!dbUrl) throw new Error('SUPABASE_DB_URL ausente');
  if (!groqKey) throw new Error('GROQ_API_KEY ausente');

  const url = new URL(dbUrl);
  const projectRef = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)![1];
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const filterPending = REDO ? '' : 'and alternatives is null';
  const limitClause = LIMIT > 0 ? `limit ${LIMIT}` : '';

  const { rows } = await client.query<{ id: string; image_url: string }>(`
    select id, image_url
      from public.questions
     where exam = 'unifor-medicina'
       and coalesce(annulled, false) = false
       and image_url is not null
       and length(image_url) > 0
       ${filterPending}
     order by id
     ${limitClause}
  `);

  console.log(`Candidatas: ${rows.length}`);
  if (rows.length === 0) {
    console.log('Nada a processar.');
    await client.end();
    return;
  }

  let ok = 0;
  let fail = 0;
  const startMs = Date.now();

  for (let i = 0; i < rows.length; i++) {
    const q = rows[i]!;
    process.stdout.write(`[${i + 1}/${rows.length}] ${q.id}: `);

    const result = await extractViaGroq(q.image_url, groqKey);
    if (!result) {
      console.log('✗ pulando');
      fail++;
      continue;
    }

    await client.query(
      `update public.questions set alternatives = $2::jsonb where id = $1`,
      [q.id, JSON.stringify(result)],
    );
    console.log(
      `✓ A=${(result.a ?? '').slice(0, 30)}... E=${(result.e ?? '').slice(0, 25)}...`,
    );
    ok++;

    // Rate limit cooperative pause (Groq aceita ~30 req/min em multimodal)
    await new Promise((r) => setTimeout(r, 200));
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(0);
  console.log(`\nDone em ${elapsed}s. ok=${ok} fail=${fail}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
