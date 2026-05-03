'use client';
/**
 * Chat tira-dúvidas preso à questão.
 *
 * - GET /api/chat/[questionId] para carregar histórico ao montar.
 * - POST /api/chat/[questionId] (SSE via fetch + ReadableStream) para nova mensagem.
 * - Renderiza Markdown + KaTeX.
 * - Limite duro: 20 mensagens por chat.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MarkdownKatex } from '@/components/markdown-katex';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts?: string;
}

interface Props {
  questionId: string;
  /** Limite máximo (mensagens). Default 20. */
  maxMessages?: number;
}

const MAX_DEFAULT = 20;

export function QuestionChat({ questionId, maxMessages = MAX_DEFAULT }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState<string>(''); // assistant em construção
  const listRef = useRef<HTMLDivElement>(null);

  // Carrega histórico ao montar
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/chat/${encodeURIComponent(questionId)}`, {
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ messages: ChatMessage[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const remaining = Math.max(0, maxMessages - messages.length);
  const canSend = !sending && draft.trim().length > 0 && remaining > 0;

  const handleSend = useCallback(async () => {
    const message = draft.trim();
    if (!message || sending) return;
    setError(null);
    setSending(true);

    // Otimista: adiciona msg do user
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');

    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(questionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        const msg =
          err.message ??
          (err.error === 'rate_limited'
            ? 'Limite diário de mensagens atingido.'
            : err.error === 'chat_full'
              ? 'Esse chat atingiu o limite de mensagens.'
              : err.error === 'no_provider'
                ? 'Chat temporariamente indisponível.'
                : 'Não foi possível enviar a mensagem.');
        setError(msg);
        // remove mensagem otimista para não confundir o usuário
        setMessages((prev) => prev.slice(0, -1));
        setSending(false);
        return;
      }

      // Stream SSE
      if (!res.body) {
        setError('Resposta sem corpo de stream.');
        setSending(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Processa eventos SSE separados por \n\n
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // Cada bloco pode ter linhas event:/data:
          const lines = rawEvent.split('\n');
          let dataLine = '';
          for (const ln of lines) {
            if (ln.startsWith('data:')) dataLine += ln.slice(5).trimStart();
          }
          if (!dataLine) continue;
          try {
            const parsed = JSON.parse(dataLine) as {
              delta?: string;
              done?: boolean;
              error?: string;
            };
            if (parsed.delta) {
              accumulated += parsed.delta;
              setStreaming(accumulated);
            }
            if (parsed.error) {
              setError(parsed.error);
            }
          } catch {
            // ignora linhas malformadas
          }
        }
      }

      // Finaliza
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: accumulated,
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreaming('');
    } catch (err) {
      setError((err as Error)?.message ?? 'Erro ao conversar com o chat.');
      // remove a mensagem do usuário caso a chamada tenha falhado completamente
      setMessages((prev) =>
        prev.length > 0 && prev[prev.length - 1]?.role === 'user'
          ? prev.slice(0, -1)
          : prev,
      );
    } finally {
      setSending(false);
    }
  }, [draft, questionId, sending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={listRef}
        className="max-h-96 min-h-[8rem] overflow-y-auto rounded-md border border-border bg-card p-3"
        aria-live="polite"
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando histórico…</p>
        ) : messages.length === 0 && !streaming ? (
          <p className="text-sm text-muted-foreground">
            Tire sua dúvida sobre essa questão. Ex.: &quot;Por que não pode ser
            a alternativa B?&quot;
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m, idx) => (
              <li
                key={`${m.role}-${idx}-${m.ts ?? ''}`}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'self-end bg-primary text-primary-foreground'
                    : 'self-start border border-border bg-muted',
                  'max-w-[90%]',
                )}
              >
                {m.role === 'assistant' ? (
                  <MarkdownKatex>{m.content}</MarkdownKatex>
                ) : (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                )}
              </li>
            ))}
            {streaming ? (
              <li className="max-w-[90%] self-start rounded-lg border border-border bg-muted px-3 py-2 text-sm">
                <MarkdownKatex>{streaming}</MarkdownKatex>
              </li>
            ) : null}
          </ul>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {remaining === 0 ? (
        <p className="text-xs text-muted-foreground">
          Limite de {maxMessages} mensagens por chat atingido para esta questão.
        </p>
      ) : (
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida sobre esta questão"
            disabled={sending}
            rows={2}
            maxLength={2000}
            className="flex-1 resize-none rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button
            type="button"
            size="md"
            onClick={() => void handleSend()}
            disabled={!canSend}
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        Restam {remaining} de {maxMessages} mensagens neste chat.
      </p>
    </div>
  );
}
