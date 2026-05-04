/**
 * Chat tira-dúvidas — POST inicia stream SSE; GET carrega histórico.
 *
 * Fluxo (POST):
 *  1. Auth + cost guards (user/global).
 *  2. Carrega questions row (image_url, subtopic, alternatives, correct_answer)
 *     e question_solutions (se houver) para enriquecer o system prompt.
 *  3. UPSERT em question_chats por (user_id, question_id), append da
 *     mensagem do usuário em `messages`.
 *  4. streamChat com a chain de providers; emite chunks SSE.
 *  5. Após chunk final, persiste mensagem assistant e incrementa contadores.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkGlobalCap,
  checkUserCap,
  incrementUsage,
} from '@/lib/llm/cost-guards';
import { streamChat } from '@/lib/llm/chain';
import { chatSystemPrompt } from '@/lib/llm/prompts';
import { RateLimitError } from '@/lib/llm/types';
import type { ChatMessage } from '@/lib/llm/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPlanInfo, FREE_CHAT_DAILY_LIMIT } from '@/lib/billing/caps';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper para tabelas ainda não tipadas (Worktree A as adiciona).
type AnyDb = SupabaseClient;

const MAX_MESSAGES = 20;

interface ChatRow {
  id: string;
  user_id: string;
  question_id: string;
  messages: ChatMessage[];
  msg_count: number;
}

function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is { role: string; content: string; ts?: string } =>
        Boolean(m) &&
        typeof m === 'object' &&
        typeof (m as { role?: unknown }).role === 'string' &&
        typeof (m as { content?: unknown }).content === 'string',
    )
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
      ts: typeof m.ts === 'string' ? m.ts : undefined,
    }));
}

async function loadOrCreateChat(
  supabase: SupabaseClient,
  userId: string,
  questionId: string,
): Promise<ChatRow> {
  const { data } = await (supabase as AnyDb)
    .from('question_chats')
    .select('id, user_id, question_id, messages, msg_count')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();

  if (data) {
    return {
      id: String((data as { id: string }).id),
      user_id: String((data as { user_id: string }).user_id),
      question_id: String((data as { question_id: string }).question_id),
      messages: parseMessages((data as { messages: unknown }).messages),
      msg_count: Number((data as { msg_count?: number }).msg_count ?? 0),
    };
  }

  const insert = await (supabase as AnyDb)
    .from('question_chats')
    .insert({
      user_id: userId,
      question_id: questionId,
      messages: [],
      msg_count: 0,
    })
    .select('id, user_id, question_id, messages, msg_count')
    .single();

  if (insert.error || !insert.data) {
    throw new Error(`Falha ao criar chat: ${insert.error?.message ?? 'desconhecido'}`);
  }
  const row = insert.data as {
    id: string;
    user_id: string;
    question_id: string;
    messages: unknown;
    msg_count?: number;
  };
  return {
    id: row.id,
    user_id: row.user_id,
    question_id: row.question_id,
    messages: parseMessages(row.messages),
    msg_count: Number(row.msg_count ?? 0),
  };
}

export async function GET(
  _request: Request,
  context: { params: { questionId: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const questionId = context.params.questionId;
  const { data } = await (supabase as AnyDb)
    .from('question_chats')
    .select('messages, msg_count')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .maybeSingle();
  const messages = parseMessages((data as { messages?: unknown } | null)?.messages);
  return NextResponse.json({
    messages,
    msg_count: Number((data as { msg_count?: number } | null)?.msg_count ?? messages.length),
    max: MAX_MESSAGES,
  });
}

export async function POST(
  request: Request,
  context: { params: { questionId: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'message_too_long' }, { status: 400 });
  }

  const questionId = context.params.questionId;

  // Plan-aware cost guards: free plan = 5/dia; pro/global hard cap = 100/dia.
  try {
    const planInfo = await getPlanInfo(
      supabase as unknown as SupabaseClient<Database>,
      user.id,
    );
    if (!planInfo.isPro) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: usage } = await (supabase as SupabaseClient)
        .from('daily_chat_usage')
        .select('msg_count')
        .eq('user_id', user.id)
        .eq('day', today)
        .maybeSingle();
      const used = Number(
        (usage as { msg_count?: number } | null)?.msg_count ?? 0,
      );
      if (used >= FREE_CHAT_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: 'rate_limited',
            scope: 'plan_free',
            message: `Plano grátis limitado a ${FREE_CHAT_DAILY_LIMIT} perguntas/dia. Assine o Pro para chat ilimitado.`,
          },
          { status: 429 },
        );
      }
    }
    await checkUserCap(supabase, user.id);
    await checkGlobalCap(supabase);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'rate_limited', scope: err.scope, message: err.message },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: 'guard_failed' }, { status: 500 });
  }

  // Carrega contexto da questão e resolução pré-gerada (se existir).
  const [{ data: question }, { data: solution }] = await Promise.all([
    supabase
      .from('questions')
      .select('id, discipline, subtopic, image_url, correct_answer')
      .eq('id', questionId)
      .maybeSingle(),
    (supabase as AnyDb)
      .from('question_solutions')
      .select('content_md')
      .eq('question_id', questionId)
      .maybeSingle(),
  ]);

  if (!question) {
    return NextResponse.json({ error: 'question_not_found' }, { status: 404 });
  }

  // Carrega/cria chat e checa limite de mensagens.
  let chat: ChatRow;
  try {
    chat = await loadOrCreateChat(supabase, user.id, questionId);
  } catch (err) {
    return NextResponse.json(
      { error: 'chat_load_failed', message: (err as Error).message },
      { status: 500 },
    );
  }
  if (chat.messages.length >= MAX_MESSAGES) {
    return NextResponse.json(
      { error: 'chat_full', max: MAX_MESSAGES },
      { status: 429 },
    );
  }

  // Append user message
  const now = new Date().toISOString();
  const userMessage: ChatMessage = { role: 'user', content: message, ts: now };
  const newMessagesAfterUser = [...chat.messages, userMessage];
  await (supabase as AnyDb)
    .from('question_chats')
    .update({
      messages: newMessagesAfterUser,
      msg_count: newMessagesAfterUser.length,
      updated_at: now,
    })
    .eq('id', chat.id);

  const systemPrompt = chatSystemPrompt({
    questionId,
    discipline: (question as { discipline?: string | null }).discipline ?? null,
    subtopic: (question as { subtopic?: string | null }).subtopic ?? null,
    correctAnswer: (question as { correct_answer?: string | null }).correct_answer ?? null,
    imageUrl: (question as { image_url?: string | null }).image_url ?? null,
    solutionMd:
      (solution as { content_md?: string | null } | null)?.content_md ?? null,
  });

  // Inicia stream LLM
  let providerId: string;
  let llmStream: AsyncIterable<string>;
  try {
    const result = await streamChat({
      system: systemPrompt,
      history: chat.messages,
      userMessage: message,
    });
    providerId = result.provider;
    llmStream = result.stream;
  } catch (err) {
    return NextResponse.json(
      {
        error: 'no_provider',
        message:
          'Chat temporariamente indisponível. Tente novamente em instantes.',
        detail: (err as Error).message,
      },
      { status: 503 },
    );
  }

  // SSE stream
  const encoder = new TextEncoder();
  const sseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let assistantContent = '';
      try {
        controller.enqueue(
          encoder.encode(
            `event: provider\ndata: ${JSON.stringify({ provider: providerId })}\n\n`,
          ),
        );
        for await (const delta of llmStream) {
          assistantContent += delta;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: (err as Error).message })}\n\n`,
          ),
        );
      } finally {
        // Persistência best-effort + contadores de uso. Erros aqui não
        // afetam o que o cliente já recebeu.
        try {
          if (assistantContent) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: assistantContent,
              ts: new Date().toISOString(),
            };
            const finalMessages = [...newMessagesAfterUser, assistantMessage];
            await (supabase as AnyDb)
              .from('question_chats')
              .update({
                messages: finalMessages,
                msg_count: finalMessages.length,
                updated_at: new Date().toISOString(),
              })
              .eq('id', chat.id);
            await incrementUsage(supabase, user.id, providerId);
          }
        } catch {
          // swallow — já transmitimos para o cliente
        }
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
