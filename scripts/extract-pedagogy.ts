/**
 * Classifica cada questao da Unifor segundo dimensoes pedagogicas,
 * usando Groq Llama 4 Scout multimodal. Salva em questions.pedagogy
 * (jsonb).
 *
 * Schema do output:
 *   {
 *     bloom: 'lembrar'|'compreender'|'aplicar'|'analisar'|'avaliar'|'criar',
 *     tipo: 'factual'|'conceitual'|'procedural'|'interpretativo',
 *     formato: 'pergunta_direta'|'caso'|'interpretacao_texto'|
 *              'analise_dados'|'calculo'|'imagem',
 *     estrategia_distratores: 'concepcao_errada'|'erro_calculo'|
 *              'aplicacao_incompleta'|'erro_unidade_sinal'|
 *              'termo_irrelevante'|'logica_invertida'|'troca_conceitos'|
 *              'misto',
 *     complexidade: 1|2|3|4|5,  (1=trivial, 5=alta carga cognitiva)
 *     palavra_chave_enunciado: string  (palavra-chave central da pergunta)
 *   }
 *
 * Uso:
 *   tsx scripts/extract-pedagogy.ts                    # processa pendentes
 *   tsx scripts/extract-pedagogy.ts --limit=200        # batch limitado
 *   tsx scripts/extract-pedagogy.ts --redo             # re-processa tudo
 *
 * NAO renderiza a questao no UI — apenas alimenta analise estatistica.
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

Analise pedagogicamente e retorne APENAS um JSON valido (sem markdown,
sem texto adicional) com estas dimensoes:

{
  "bloom": "lembrar | compreender | aplicar | analisar | avaliar | criar",
  "tipo": "factual | conceitual | procedural | interpretativo",
  "formato": "pergunta_direta | caso | interpretacao_texto | analise_dados | calculo | imagem",
  "estrategia_distratores": "concepcao_errada | erro_calculo | aplicacao_incompleta | erro_unidade_sinal | termo_irrelevante | logica_invertida | troca_conceitos | misto",
  "complexidade": 1,
  "palavra_chave_enunciado": "string curta com tema central"
}

Definicoes:

BLOOM (taxonomia revisada):
- "lembrar": questao pede so memorizacao/reconhecimento
- "compreender": pede explicar/interpretar conceito
- "aplicar": pede usar formula/conceito em situacao nova
- "analisar": pede decompor, comparar, identificar relacoes
- "avaliar": pede julgar, criticar, decidir entre opcoes
- "criar": pede sintetizar/produzir algo novo

TIPO:
- "factual": pede fato, definicao, dado especifico
- "conceitual": pede compreensao de conceito ou principio
- "procedural": pede aplicacao de metodo, passo-a-passo, calculo
- "interpretativo": pede leitura/interpretacao de texto, grafico, tabela

FORMATO:
- "pergunta_direta": uma pergunta clara sem contexto longo
- "caso": cenario/situacao narrada (clinico, experimental, social)
- "interpretacao_texto": tem texto longo a ser lido/analisado
- "analise_dados": tabela/grafico/dados numericos centrais
- "calculo": pede valor numerico via formula
- "imagem": foto/figura biologica, fisica, etc e essencial

ESTRATEGIA_DISTRATORES (qual o ERRO conceitual mais comum nos distratores):
- "concepcao_errada": confusao com conceito relacionado mas distinto
- "erro_calculo": numero correto mas valor numerico errado
- "aplicacao_incompleta": esqueceu uma etapa do raciocinio
- "erro_unidade_sinal": unidade ou sinal trocado
- "termo_irrelevante": distrator usa conceito sem relacao
- "logica_invertida": inverte causa e consequencia / sujeito e objeto
- "troca_conceitos": substitui conceito-chave por outro
- "misto": combinacao de varios

COMPLEXIDADE (carga cognitiva, 1-5):
- 1: aplicacao direta de definicao / 1 passo
- 2: conceito + aplicacao simples
- 3: 2-3 passos de raciocinio
- 4: integracao de conceitos / 4-5 passos
- 5: alta carga, multiplos conceitos, atencao a detalhes sutis

PALAVRA_CHAVE_ENUNCIADO: 1-3 palavras com o conceito central da pergunta.
Ex: "meia-vida iodo", "fermentacao lactica", "interpretacao texto",
"funcao quadratica vertice", "lei de Hooke", "ironia".

Apenas o JSON. Nada antes, nada depois.`;

interface PedagogyJson {
  bloom?: string;
  tipo?: string;
  formato?: string;
  estrategia_distratores?: string;
  complexidade?: number;
  palavra_chave_enunciado?: string;
}

const VALID_BLOOM = new Set([
  'lembrar', 'compreender', 'aplicar', 'analisar', 'avaliar', 'criar',
]);
const VALID_TIPO = new Set([
  'factual', 'conceitual', 'procedural', 'interpretativo',
]);
const VALID_FORMATO = new Set([
  'pergunta_direta', 'caso', 'interpretacao_texto',
  'analise_dados', 'calculo', 'imagem',
]);
const VALID_ESTRATEGIA = new Set([
  'concepcao_errada', 'erro_calculo', 'aplicacao_incompleta',
  'erro_unidade_sinal', 'termo_irrelevante', 'logica_invertida',
  'troca_conceitos', 'misto',
]);

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

async function callGroq(
  model: string,
  dataUrl: string,
  apiKey: string,
): Promise<{ ok: true; content: string } | { ok: false; status: number; err: string }> {
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
          max_tokens: 400,
          response_format: { type: 'json_object' },
        }),
      },
    );
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        err: (await res.text().catch(() => '')).slice(0, 200),
      };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { ok: true, content: json.choices?.[0]?.message?.content?.trim() ?? '' };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      err: ((err as Error).message ?? String(err)).slice(0, 200),
    };
  }
}

function validate(parsed: PedagogyJson): boolean {
  if (!parsed.bloom || !VALID_BLOOM.has(parsed.bloom)) return false;
  if (!parsed.tipo || !VALID_TIPO.has(parsed.tipo)) return false;
  if (!parsed.formato || !VALID_FORMATO.has(parsed.formato)) return false;
  if (!parsed.estrategia_distratores || !VALID_ESTRATEGIA.has(parsed.estrategia_distratores)) return false;
  if (typeof parsed.complexidade !== 'number' ||
      parsed.complexidade < 1 || parsed.complexidade > 5) return false;
  return true;
}

async function callMistralPixtral(
  dataUrl: string,
  apiKey: string,
): Promise<{ ok: true; content: string } | { ok: false; status: number; err: string }> {
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: dataUrl },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        err: (await res.text().catch(() => '')).slice(0, 200),
      };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { ok: true, content: json.choices?.[0]?.message?.content?.trim() ?? '' };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      err: ((err as Error).message ?? String(err)).slice(0, 200),
    };
  }
}

function tryParsePedagogy(content: string): PedagogyJson | null {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as PedagogyJson;
    if (!validate(parsed)) return null;
    if (parsed.palavra_chave_enunciado) {
      parsed.palavra_chave_enunciado =
        parsed.palavra_chave_enunciado.toLowerCase().trim();
    }
    return parsed;
  } catch {
    return null;
  }
}

async function extractPedagogy(
  imageUrl: string,
  apiKey: string,
): Promise<PedagogyJson | null> {
  const image = await fetchImageBase64(imageUrl);
  if (!image) return null;
  const dataUrl = `data:${image.mimeType};base64,${image.data}`;

  // Mistral primeiro (Groq daily quota esgotou), Groq como fallback.
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const out = await callMistralPixtral(dataUrl, mistralKey);
      if (out.ok) {
        const parsed = tryParsePedagogy(out.content);
        if (parsed) return parsed;
        break;
      } else if (out.status === 429) {
        if (attempt < 2) {
          process.stdout.write(`  mistral 429 (espera 30s) `);
          await new Promise((r) => setTimeout(r, 30000));
          continue;
        }
        process.stdout.write(`  mistral 429 -> groq `);
        break;
      } else {
        console.warn(`  mistral: ${out.status} ${out.err.slice(0, 60)}`);
        break;
      }
    }
  }

  const groqModel = 'meta-llama/llama-4-scout-17b-16e-instruct';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const out = await callGroq(groqModel, dataUrl, apiKey);
    if (out.ok) {
      const parsed = tryParsePedagogy(out.content);
      if (parsed) return parsed;
      return null;
    } else if (out.status === 429) {
      if (attempt < 2) {
        process.stdout.write(`  groq 429 (espera 65s) `);
        await new Promise((r) => setTimeout(r, 65000));
        continue;
      }
      return null;
    } else {
      console.warn(`  groq: ${out.status} ${out.err.slice(0, 100)}`);
      return null;
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

  // Connection factory pra reconectar quando o pooler dropa idle
  function makeClient(): Client {
    const c = new Client({
      host: poolerHost,
      port: 5432,
      database: 'postgres',
      user: `postgres.${projectRef}`,
      password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
    });
    // Importante: lidar com erro async pra nao quebrar o process
    c.on('error', (err) => {
      console.warn(`\n  pg client error: ${err.message.slice(0, 80)}`);
    });
    return c;
  }

  let client = makeClient();
  await client.connect();

  const filterPending = REDO ? '' : 'and pedagogy is null';
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
    const result = await extractPedagogy(q.image_url, groqKey);
    if (!result) {
      console.log('✗ pulando');
      fail++;
      continue;
    }
    // Update com retry: se conexao caiu, reconecta e tenta de novo
    let updated = false;
    for (let upAttempt = 1; upAttempt <= 3; upAttempt++) {
      try {
        await client.query(
          `update public.questions set pedagogy = $2::jsonb where id = $1`,
          [q.id, JSON.stringify(result)],
        );
        updated = true;
        break;
      } catch (err) {
        console.warn(
          `\n  pg falhou (tentativa ${upAttempt}/3): ${(err as Error).message.slice(0, 80)}`,
        );
        try {
          await client.end();
        } catch {
          /* ignora */
        }
        await new Promise((r) => setTimeout(r, 2000));
        client = makeClient();
        try {
          await client.connect();
          console.warn(`  reconectado`);
        } catch (e) {
          console.warn(`  reconnect falhou: ${(e as Error).message.slice(0, 60)}`);
        }
      }
    }
    if (!updated) {
      console.warn(`  ${q.id}: nao foi possivel salvar, pulando`);
      continue;
    }
    console.log(
      `✓ ${result.bloom}/${result.tipo}/${result.formato} c=${result.complexidade}`,
    );
    ok++;
    await new Promise((r) => setTimeout(r, 2500));
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(0);
  console.log(`\nDone em ${elapsed}s. ok=${ok} fail=${fail}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
