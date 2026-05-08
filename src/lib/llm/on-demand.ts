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
}

function resolucaoPrompt(ctx: QuestionContext): string {
  const letter = ctx.correctAnswer ?? '?';
  return [
    'Você é tutor de vestibular Unifor Medicina. Resolva a questão abaixo',
    'explicando passo-a-passo o raciocínio. Seja conciso e didático,',
    'no máximo 300 palavras.',
    '',
    'FORMATO:',
    '- Use Markdown com listas curtas e headings ##.',
    '- Use LaTeX inline ($...$) e display ($$...$$) para fórmulas.',
    '- Termine SEMPRE com a frase: "Portanto, a alternativa correta é a letra ' +
      letter +
      '."',
    '',
    `Disciplina: ${ctx.discipline ?? 'desconhecida'}`,
    `Subtópico: ${ctx.subtopic ?? 'desconhecido'}`,
    `Resposta correta (gabarito oficial): ${letter}`,
    '',
    'Como você não vê o enunciado, baseie a explicação no subtópico e na',
    'alternativa correta acima — descreva o raciocínio típico para esse',
    'tipo de questão de vestibular, citando fórmulas e conceitos chave.',
  ].join('\n');
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

  let content: string;
  let provider: string;
  try {
    const res = await completeChat({
      system: resolucaoPrompt(ctx),
      history: [],
      userMessage: 'Por favor, gere a resolução agora.',
    });
    content = res.content.trim();
    provider = res.provider;
  } catch (err) {
    console.warn('[on-demand resolucao] LLM falhou:', (err as Error).message);
    return null;
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

/** Geração sem cache (sem service role). */
async function generateEphemeralResolucao(
  ctx: QuestionContext,
): Promise<{
  content_md: string;
  conclusion: string;
  generated_by: string;
  reviewed: boolean;
} | null> {
  try {
    const res = await completeChat({
      system: resolucaoPrompt(ctx),
      history: [],
      userMessage: 'Por favor, gere a resolução agora.',
    });
    const content = res.content.trim();
    if (!content) return null;
    return {
      content_md: content,
      conclusion: ctx.correctAnswer ?? 'A',
      generated_by: res.provider + ' (uncached)',
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
