/**
 * Geração on-demand de Resolução e Teoria, com cache permanente em DB.
 *
 * - Lê primeiro do cache (`question_solutions` / `subtopic_theory`).
 * - Em miss, chama a chain LLM (`completeChat`) com timeout 25s e
 *   persiste o conteúdo via service role (RLS bloqueia user comum).
 * - Em qualquer falha, retorna `null` — chamador decide se mostra
 *   placeholder "em preparação".
 *
 * Reutiliza a chain existente (Gemini → Groq → Cerebras → Mistral),
 * NÃO introduz dependências novas. Modelo padrão: o que já estiver
 * configurado nas envs (GEMINI_API_KEY costuma vencer).
 */
import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js';
import { completeChat } from './chain';

type AnyDb = SupabaseClient;

function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { persistSession: false } });
}

interface QuestionContext {
  questionId: string;
  discipline: string | null;
  subtopic: string | null;
  correctAnswer: string | null;
  /** URL da imagem da questao — quando presente, tentamos Gemini multimodal
   * pra que o LLM VEJA o enunciado real e possa analisar cada alternativa. */
  imageUrl: string | null;
}

/**
 * Prompt MULTIMODAL — usado quando o LLM VE a imagem da questao (Gemini
 * direto, bypass da chain text-only). Formato padrao definido pelo user:
 * Feedback da Questao (intro) -> bloco por alternativa (### Alternativa X)
 * com ❌/✅ + explicacao) -> Resumo Final.
 */
function resolucaoPromptMultimodal(ctx: QuestionContext): string {
  const letter = ctx.correctAnswer ?? '?';
  return [
    'Você é tutor de vestibular Unifor Medicina. A imagem acima mostra',
    'uma questão real da prova. Sua tarefa é gerar uma resolução no',
    'formato EXATO abaixo, didática e direta. Máximo 450 palavras.',
    '',
    `A resposta CORRETA (gabarito oficial) é a letra ${letter}.`,
    'Sua análise DEVE convergir para essa letra.',
    '',
    '═══════════════════════════════════════════',
    'FORMATO OBRIGATÓRIO (siga literalmente):',
    '═══════════════════════════════════════════',
    '',
    '## Feedback da Questão',
    '',
    '[Em 2-4 frases, explique qual o conceito central que a questão',
    'cobra e a chave pra resolver. Use LaTeX ($...$ inline) se houver',
    'fórmulas.]',
    '',
    'Uma dica importante:',
    '',
    '- [Bullet 1: distinção/conceito chave]',
    '- [Bullet 2: distinção/conceito chave]',
    '',
    '### Alternativa A) [transcreva ou resuma o que diz a alternativa A]',
    '',
    '[**❌ Incorreta** OU **✅ Correta** — uma linha em negrito]',
    '',
    '[1-3 frases explicando POR QUE está errada (qual erro conceitual',
    'ou de cálculo) ou por que está correta. Seja específico, não genérico.]',
    '',
    '### Alternativa B) [transcrição/resumo]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '### Alternativa C) [transcrição/resumo]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '### Alternativa D) [transcrição/resumo]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '### Alternativa E) [transcrição/resumo]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '## Resumo Final',
    '',
    '[Em 2-3 frases, recapitule a ideia central que diferencia a',
    'correta das demais.]',
    '',
    `Por isso, a alternativa correta é a **${letter}**.`,
    '',
    '═══════════════════════════════════════════',
    'REGRAS:',
    '- Use ❌ (incorreta) e ✅ (correta) literalmente — esses emojis.',
    `- Marque APENAS a alternativa ${letter} como ✅ Correta.`,
    '- Transcreva/resuma o conteúdo REAL de cada alternativa que você',
    '  vê na imagem — NÃO invente.',
    '- Termine com a frase: "Portanto, a alternativa correta é a letra ' +
      letter + '."',
    '',
    `Disciplina: ${ctx.discipline ?? 'desconhecida'}`,
    `Subtópico: ${ctx.subtopic ?? 'desconhecido'}`,
  ].join('\n');
}

/**
 * Prompt TEXT-ONLY (fallback) — usado quando o LLM nao ve a imagem da
 * questao. CRITICAMENTE: produz o MESMO template visual do prompt
 * multimodal (Feedback da Questao + bloco por alternativa com ❌/✅ +
 * Resumo Final). Sem a imagem, o LLM INFERE como seriam as 5 alternativas
 * tipicas pra esse subtopico — nao e perfeito, mas o formato fica
 * consistente em qualquer questao (user pediu "mesmo padrao para todas").
 */
function resolucaoPromptTextOnly(ctx: QuestionContext): string {
  const letter = ctx.correctAnswer ?? '?';
  return [
    'Você é tutor de vestibular Unifor Medicina. Você NÃO está vendo o',
    'enunciado da questão — apenas sabe disciplina, subtópico e letra',
    'do gabarito. Mesmo assim, gere uma resolução no FORMATO EXATO',
    'abaixo, INFERINDO os distratores típicos que costumam aparecer',
    'nesse subtópico (não invente algo absurdo, baseie-se no que cai',
    'em provas reais desse tema). Máximo 450 palavras.',
    '',
    `A resposta CORRETA (gabarito oficial) é a letra ${letter}.`,
    '',
    '═══════════════════════════════════════════',
    'FORMATO OBRIGATÓRIO (siga literalmente):',
    '═══════════════════════════════════════════',
    '',
    '## Feedback da Questão',
    '',
    '[Em 2-4 frases, explique o conceito central do subtópico e a chave',
    'pra resolver questões desse tipo. Use LaTeX ($...$ inline) se',
    'houver fórmulas.]',
    '',
    'Uma dica importante:',
    '',
    '- [Bullet 1: distinção/conceito chave do tema]',
    '- [Bullet 2: distinção/conceito chave do tema]',
    '',
    '### Alternativa A) [tipo de afirmação que costuma aparecer como ' +
      'distrator A nesse subtópico]',
    '',
    '[**❌ Incorreta** ou **✅ Correta** — só uma será correta]',
    '',
    '[1-3 frases sobre o erro conceitual típico desse tipo de distrator',
    '(ou motivo positivo, no caso da correta).]',
    '',
    '### Alternativa B) [...]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '### Alternativa C) [...]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '### Alternativa D) [...]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '### Alternativa E) [...]',
    '',
    '[❌ Incorreta / ✅ Correta]',
    '',
    '[explicação]',
    '',
    '## Resumo Final',
    '',
    '[Em 2-3 frases, recapitule a ideia central que diferencia a correta',
    'das demais.]',
    '',
    `Por isso, a alternativa correta é a **${letter}**.`,
    '',
    '═══════════════════════════════════════════',
    'REGRAS:',
    '- Use ❌ e ✅ literalmente.',
    `- Marque APENAS a alternativa ${letter} como ✅ Correta.`,
    '- Como você não vê a questão real, descreva tipos de distratores',
    '  que SÃO COMUNS nesse subtópico — afirmações curtas e plausíveis.',
    'OBRIGATÓRIO: termine com a frase EXATA:',
    '"Portanto, a alternativa correta é a letra ' + letter + '."',
    '',
    `Disciplina: ${ctx.discipline ?? 'desconhecida'}`,
    `Subtópico: ${ctx.subtopic ?? 'desconhecido'}`,
  ].join('\n');
}

/**
 * Baixa a imagem da questao como base64 — usado por todos os provedores
 * multimodais. Retorna null se URL invalida/inacessivel.
 */
async function fetchImageBase64(
  imageUrl: string,
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`[multimodal] fetch image ${imageUrl} status ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
    return { data: buffer.toString('base64'), mimeType };
  } catch (err) {
    console.warn('[multimodal] fetch image falhou:', (err as Error).message);
    return null;
  }
}

/**
 * Tenta Gemini 2.5 Flash multimodal — primeira opcao da chain.
 * Free-tier 20 req/dia.
 */
async function tryGeminiMultimodal(
  ctx: QuestionContext,
  image: { data: string; mimeType: string },
): Promise<{ content: string; provider: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const mod = (await import('@google/generative-ai')) as typeof import('@google/generative-ai');
    const genAI = new mod.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { inlineData: { data: image.data, mimeType: image.mimeType } },
      { text: resolucaoPromptMultimodal(ctx) },
    ]);
    const content = result.response.text().trim();
    if (!content) return null;
    return { content, provider: 'gemini-2.5-flash-multimodal' };
  } catch (err) {
    console.warn(
      '[multimodal gemini] falhou:',
      ((err as Error).message ?? String(err)).slice(0, 200),
    );
    return null;
  }
}

/**
 * Tenta Groq com modelo Llama 4 Scout (multimodal). Free-tier generoso.
 * Usa a API OpenAI-compatible do Groq.
 */
async function tryGroqMultimodal(
  ctx: QuestionContext,
  image: { data: string; mimeType: string },
): Promise<{ content: string; provider: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  // Modelos multimodais do Groq, em ordem de preferencia. Se um nao
  // existir mais no catalogo, o proximo e tentado.
  const models = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.2-90b-vision-preview',
    'llama-3.2-11b-vision-preview',
  ];

  for (const model of models) {
    try {
      const dataUrl = `data:${image.mimeType};base64,${image.data}`;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                { type: 'text', text: resolucaoPromptMultimodal(ctx) },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(
          `[multimodal groq:${model}] status ${res.status}: ${errText.slice(0, 200)}`,
        );
        continue; // tenta o proximo modelo
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) {
        continue;
      }
      return { content, provider: `groq-${model}` };
    } catch (err) {
      console.warn(
        `[multimodal groq:${model}] falhou:`,
        ((err as Error).message ?? String(err)).slice(0, 200),
      );
      continue;
    }
  }

  return null;
}

/**
 * Tenta Mistral Pixtral (multimodal). Free-tier disponivel.
 */
async function tryMistralMultimodal(
  ctx: QuestionContext,
  image: { data: string; mimeType: string },
): Promise<{ content: string; provider: string } | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  // Pixtral e o modelo multimodal da Mistral. 12b e o free-tier; large
  // pode requerer pagamento dependendo da chave.
  const models = ['pixtral-12b-2409', 'pixtral-large-latest'];

  for (const model of models) {
    try {
      const dataUrl = `data:${image.mimeType};base64,${image.data}`;
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
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
                { type: 'text', text: resolucaoPromptMultimodal(ctx) },
                { type: 'image_url', image_url: dataUrl },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(
          `[multimodal mistral:${model}] status ${res.status}: ${errText.slice(0, 200)}`,
        );
        continue;
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) continue;
      return { content, provider: `mistral-${model}` };
    } catch (err) {
      console.warn(
        `[multimodal mistral:${model}] falhou:`,
        ((err as Error).message ?? String(err)).slice(0, 200),
      );
      continue;
    }
  }

  return null;
}

/**
 * CHAIN multimodal — tenta Gemini, Groq e Mistral em sequencia. Cada um
 * tem rate limit separado, entao quando o primeiro estoura, os outros
 * provavelmente ainda funcionam. So retorna null se TODOS falharem (ai
 * o caller cai pro text-only sem imagem).
 */
async function tryMultimodalChain(
  ctx: QuestionContext,
): Promise<{ content: string; provider: string } | null> {
  if (!ctx.imageUrl || ctx.imageUrl.trim().length === 0) return null;

  const image = await fetchImageBase64(ctx.imageUrl);
  if (!image) return null;

  // Gemini primeiro (qualidade alta, mas free-tier 20/dia).
  const gemini = await tryGeminiMultimodal(ctx, image);
  if (gemini) return gemini;

  // Groq Llama 4 Scout (rapido + free-tier generoso).
  const groq = await tryGroqMultimodal(ctx, image);
  if (groq) return groq;

  // Mistral Pixtral (free-tier disponivel).
  const mistral = await tryMistralMultimodal(ctx, image);
  if (mistral) return mistral;

  console.warn('[multimodal chain] TODOS os providers falharam, caindo pro text-only');
  return null;
}

function teoriaPrompt(discipline: string, subtopic: string): string {
  return [
    'Você é professor de vestibular. Faça uma revisão conceitual',
    'COMPLETA mas resumida sobre o subtópico abaixo, no nível de',
    'medicina/Unifor. No máximo 500 palavras.',
    '',
    'CUBRA:',
    '- Definições essenciais',
    '- Fórmulas-chave',
    '- Exemplos típicos de prova',
    '- Dicas de pegadinhas',
    '',
    'FORMATO:',
    '- Markdown com headings ## e listas.',
    '- LaTeX inline ($...$) e display ($$...$$) para fórmulas.',
    '- Não invente links.',
    '',
    `Disciplina: ${discipline}`,
    `Subtópico: ${subtopic}`,
  ].join('\n');
}

/**
 * Resolução: lê do cache; se vazio, gera + persiste.
 * Retorna null em qualquer falha (caller mostra placeholder).
 */
export async function getOrGenerateResolucao(
  reader: SupabaseClient,
  ctx: QuestionContext,
): Promise<{
  content_md: string;
  conclusion: string;
  generated_by: string;
  reviewed: boolean;
} | null> {
  // 1. cache hit?
  const { data: cached } = await (reader as AnyDb)
    .from('question_solutions')
    .select('content_md, conclusion, generated_by, reviewed')
    .eq('question_id', ctx.questionId)
    .maybeSingle();
  if (cached && (cached as { content_md?: string }).content_md) {
    return cached as {
      content_md: string;
      conclusion: string;
      generated_by: string;
      reviewed: boolean;
    };
  }

  // 2. precisamos gerar — needs admin pra escrever (RLS).
  const admin = getAdminClient();
  if (!admin) {
    // Sem service role configurado — não dá pra cachear; tenta só gerar
    // efêmero (sem cache) pra não quebrar UX.
    return generateEphemeralResolucao(ctx);
  }

  // 2a. PRIMEIRO TENTA MULTIMODAL: Gemini com a imagem da questao. Sucesso
  // aqui = LLM ve enunciado + 5 alternativas e analisa item-a-item de verdade.
  let content: string;
  let provider: string;
  const multimodal = await tryMultimodalChain(ctx);
  if (multimodal) {
    content = multimodal.content;
    provider = multimodal.provider;
  } else {
    // 2b. FALLBACK text-only: chain Gemini-text → Groq → Cerebras → Mistral
    // com prompt CONSERVADOR (nao inventa enunciado nem alternativas).
    try {
      const res = await completeChat({
        system: resolucaoPromptTextOnly(ctx),
        history: [],
        userMessage: 'Por favor, gere a resolução agora.',
      });
      content = res.content.trim();
      provider = res.provider + ' (text-only)';
    } catch (err) {
      console.warn(
        '[on-demand resolucao] LLM falhou:',
        (err as Error).message,
      );
      return null;
    }
  }

  if (!content) return null;

  const conclusion = ctx.correctAnswer ?? 'A';

  // 3. persiste — best effort, não falha o request se conflict
  try {
    await (admin as AnyDb)
      .from('question_solutions')
      .upsert(
        {
          question_id: ctx.questionId,
          content_md: content,
          conclusion,
          generated_by: provider,
          reviewed: false,
        },
        { onConflict: 'question_id' },
      );
  } catch (err) {
    console.warn('[on-demand resolucao] cache write falhou:', err);
  }

  return {
    content_md: content,
    conclusion,
    generated_by: provider,
    reviewed: false,
  };
}

/** Geração sem cache (sem service role). Tenta multimodal e cai pra text-only. */
async function generateEphemeralResolucao(
  ctx: QuestionContext,
): Promise<{
  content_md: string;
  conclusion: string;
  generated_by: string;
  reviewed: boolean;
} | null> {
  const multimodal = await tryMultimodalChain(ctx);
  if (multimodal) {
    return {
      content_md: multimodal.content,
      conclusion: ctx.correctAnswer ?? 'A',
      generated_by: multimodal.provider + ' (uncached)',
      reviewed: false,
    };
  }
  try {
    const res = await completeChat({
      system: resolucaoPromptTextOnly(ctx),
      history: [],
      userMessage: 'Por favor, gere a resolução agora.',
    });
    const content = res.content.trim();
    if (!content) return null;
    return {
      content_md: content,
      conclusion: ctx.correctAnswer ?? 'A',
      generated_by: res.provider + ' (text-only, uncached)',
      reviewed: false,
    };
  } catch {
    return null;
  }
}

export async function getOrGenerateTeoria(
  reader: SupabaseClient,
  discipline: string,
  subtopic: string,
): Promise<{
  summary_md: string;
  links: Array<{ title: string; url: string; source?: string }>;
} | null> {
  const { data: cached } = await (reader as AnyDb)
    .from('subtopic_theory')
    .select('summary_md, links')
    .eq('discipline', discipline)
    .eq('subtopic', subtopic)
    .maybeSingle();
  if (cached && (cached as { summary_md?: string }).summary_md) {
    const row = cached as { summary_md: string; links: unknown };
    return {
      summary_md: row.summary_md,
      links: Array.isArray(row.links)
        ? (row.links as Array<{ title: string; url: string; source?: string }>)
        : [],
    };
  }

  const admin = getAdminClient();

  let content: string;
  try {
    const res = await completeChat({
      system: teoriaPrompt(discipline, subtopic),
      history: [],
      userMessage: 'Por favor, gere a revisão conceitual agora.',
    });
    content = res.content.trim();
  } catch (err) {
    console.warn('[on-demand teoria] LLM falhou:', (err as Error).message);
    return null;
  }

  if (!content) return null;

  if (admin) {
    try {
      await (admin as AnyDb)
        .from('subtopic_theory')
        .upsert(
          {
            discipline,
            subtopic,
            summary_md: content,
            links: [],
          },
          { onConflict: 'discipline,subtopic' },
        );
    } catch (err) {
      console.warn('[on-demand teoria] cache write falhou:', err);
    }
  }

  return { summary_md: content, links: [] };
}
