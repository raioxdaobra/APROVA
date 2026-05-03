# PR 12 — AI Helper + Gamification + UX polish (Design)

*Data:* 2026-05-03 *Status:* Aprovado *Depende de:* PRs 1-11 (todos mergeados)

## Goal

Adicionar três módulos coesos sobre o produto existente: **(1) ajuda do estudante na questão** (resolução pré-gerada + teoria por subtópico + chat IA preso à questão), **(2) gamificação extra** (badges, sons, animações, ranks, missões diárias) e **(3) polimento UX** (atalhos teclado, indicador de dificuldade, countdown vestibular, share de conquistas, modo foco).

## Decisões aprovadas (15)

| # | Decisão |
|---|---|
| A1 | LLM chain: Gemini 2.5 Flash → Groq Llama 3.3 70B → Cerebras Llama 3.1 70B → Mistral free. Circuit breaker 5min. |
| A2 | Streaming SSE no chat (texto aparece em tempo real). |
| A3 | KaTeX inline `$...$` e block `$$...$$`. |
| A4 | Hard cap 100 msg/dia/user + 5000 msg/dia global + alerta 80%. |
| A5 | Chat salvo em Postgres, exportável (LGPD), apagável com a conta. |
| Q1 | Resolução **pré-gerada** offline, valida concordância com gabarito (regex + LLM-judge). |
| Q2 | Teoria híbrida: resumo LLM + 3 links curados de allowlist (wikipedia, khanacademy, brasilescola, mundoeducacao, todamateria, infoescola, biologianet). |
| Q3 | Surface por modo: Quiz = só após responder, Simulado = só na resultado, Revisão/Histórico = sempre. |
| G1 | 15 badges iniciais (Primeira questão, Maratona, 100 acertos, Domínio Mat, Madrugador, Coruja, etc). |
| G2 | Sons curtos discretos (ding/tum/melodia/chime), default ON mobile 50% / OFF desktop, toggle Configurações. |
| G3 | Confete em badge (canvas-confetti 800ms), pulse no streak, rolling number nas stats. |
| G4 | 7 ranks por XP: Calouro / Estudante / Candidato / Aspirante / Vestibulando / Quase Lá / Aprovado. Modal celebratório no upgrade. |
| G5 | 3 missões diárias rotativas, recompensa XP + badge raro, reset 00h Fortaleza. |
| P1 | Atalhos A-E + Espaço + Enter na questão. Dica visual na 1ª sessão. |
| P2 | Chip de dificuldade por % acerto global: Fácil >75%, Média 40-75%, Difícil <40%. |
| P3 | Countdown vestibular no header da Home, configurável em `app_settings`. |
| P4 | Share PNG dinâmico via Vercel OG (`/api/og?type=streak&days=30`). |
| P5 | Pomodoro 25/5 visível no canto durante quiz, stat "minutos focados hoje". |

## Modelo de dados (novas tabelas)

```sql
-- Migration 0012: solutions + theory + resources
create table public.question_solutions (
  question_id text primary key references public.questions(id) on delete cascade,
  content_md text not null,                    -- markdown com fórmulas KaTeX
  conclusion char(1) not null check (conclusion in ('A','B','C','D','E')),
  generated_by text not null,                  -- 'gemini-2.5-flash' etc
  reviewed boolean not null default false,
  generated_at timestamptz default now()
);

create table public.subtopic_theory (
  discipline text not null,
  subtopic text not null,
  summary_md text not null,                    -- 1-2 parágrafos com fórmulas
  links jsonb not null,                        -- [{title, url, source}]
  generated_at timestamptz default now(),
  primary key (discipline, subtopic)
);

-- Migration 0013: chat
create table public.question_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  messages jsonb not null default '[]',        -- [{role:'user'|'assistant', content, ts}]
  msg_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, question_id)
);

create table public.daily_chat_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  msg_count int not null default 0,
  primary key (user_id, day)
);

create table public.global_chat_usage (
  day date primary key,
  msg_count int not null default 0,
  by_provider jsonb not null default '{}'      -- {gemini:N, groq:N, cerebras:N, mistral:N}
);

-- Migration 0014: gamification
create table public.achievements (
  id text primary key,                         -- 'first_q', 'marathon_50', 'streak_30', etc
  title text not null,
  description text not null,
  icon text not null,                          -- lucide icon name
  rarity text not null check (rarity in ('common','rare','epic','legendary'))
);

create table public.user_achievements (
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_id text references public.achievements(id),
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

create table public.daily_missions (
  user_id uuid references public.profiles(id) on delete cascade,
  day date not null,
  missions jsonb not null,                     -- [{id, label, goal, progress, completed, xp_reward}]
  primary key (user_id, day)
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
-- Seed: ('vestibular_target_date', '"2026-12-15"')

-- Migration 0015: question stats materialized view
create materialized view public.question_stats as
  select question_id,
         count(*) as total_attempts,
         count(*) filter (where is_correct) as total_correct,
         case when count(*) > 0
              then round(count(*) filter (where is_correct)::numeric / count(*) * 100)
              else null end as correct_pct
  from public.attempts
  where context in ('quiz','simulado','revisao','review')
  group by question_id;
create unique index on public.question_stats (question_id);
-- Refresh por cron ou trigger (1x/hora)
```

RLS: todas as tabelas user-owned têm SELECT/INSERT/UPDATE só pra `auth.uid() = user_id`. `achievements`, `app_settings`, `question_stats`, `subtopic_theory`, `question_solutions` são públicas (SELECT) mas write só via service role.

## Arquitetura — módulo IA

```
src/lib/llm/
  ├ providers/
  │   ├ gemini.ts        — Google Gemini 2.5 Flash
  │   ├ groq.ts          — Groq Llama 3.3 70B Versatile
  │   ├ cerebras.ts      — Cerebras Llama 3.1 70B
  │   └ mistral.ts       — Mistral Large free tier
  ├ chain.ts             — fallback orchestrator + circuit breaker
  ├ prompts.ts           — templates: solve, theory, chat
  └ stream.ts            — SSE helper

src/app/api/
  ├ chat/[questionId]/route.ts   — POST {message} → SSE stream
  └ og/route.ts                  — OG image generator

scripts/
  ├ generate-solutions.ts         — popula question_solutions (1x)
  ├ generate-theory.ts            — popula subtopic_theory (1x)
  ├ seed-achievements.ts          — popula achievements (idempotente)
  └ refresh-question-stats.ts     — refresh da materialized view
```

**Prompt da resolução** (entrada: image_url, correct_answer, subtopic, alternatives_text):
```
Você é um professor universitário. Resolva esta questão de vestibular Unifor Medicina,
mostrando o raciocínio passo a passo. A resposta CORRETA é a alternativa {LETRA}.
Sua resolução DEVE convergir para esta alternativa. Use Markdown e LaTeX KaTeX para
fórmulas. Cite fontes confiáveis quando aplicável.

OBRIGATÓRIO: termine com a frase EXATA:
"Portanto, a alternativa correta é a letra {LETRA}."
```

Validação após gerar: regex `/letra ([A-E])\.?\s*$/i` no final + comparar com correct_answer. Se divergir, regenera (3 tentativas) ou marca `reviewed=false` para revisão manual.

## Arquitetura — gamificação

```
src/lib/achievements/
  ├ definitions.ts        — 15 badges com regras de unlock
  └ check.ts              — função check(userId, event) avaliada após cada attempt

src/lib/missions/
  ├ generator.ts          — gera 3 missões por user/dia
  └ progress.ts           — atualiza progress após attempt

src/lib/audio/
  └ player.ts             — Howler.js OU Web Audio API com 4 sons base64

src/components/
  ├ achievement-toast.tsx       — toast celebratório (sonner custom)
  ├ rank-badge.tsx              — badge do rank atual
  ├ rank-up-modal.tsx           — modal de upgrade
  ├ confetti-burst.tsx          — wrapper canvas-confetti
  ├ rolling-number.tsx          — animação rolling
  ├ streak-pulse.tsx            — pulse animation
  └ daily-missions-card.tsx     — card 3 missões na home
```

## Arquitetura — UX

```
src/components/
  ├ keyboard-hints.tsx          — overlay primeira sessão
  ├ difficulty-chip.tsx         — Fácil/Média/Difícil
  ├ vestibular-countdown.tsx    — contador no header home
  ├ share-button.tsx            — gera OG image, copy/native share
  └ pomodoro-timer.tsx          — 25/5 com toggle on/off

src/hooks/
  ├ use-keyboard-shortcuts.ts   — A-E, Space, Enter
  └ use-pomodoro.ts             — timer state machine
```

## Surfaces — onde cada feature aparece

| Tela | Resolução | Teoria | Chat | Difficulty | Atalhos | Pomodoro |
|---|---|---|---|---|---|---|
| /quiz/sessao/[id] (Quiz) | Após responder | Após responder | Após responder | ✓ | ✓ | toggle |
| /simulado/sessao/[id] | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| /simulado/sessao/[id]/resultado | Sim | Sim | Sim | ✓ | ✗ | ✗ |
| Revisão (PR 5/6) | Sempre | Sempre | Sempre | ✓ | ✓ | ✗ |
| Histórico (link de attempt) | Sempre | Sempre | Sempre | ✓ | ✗ | ✗ |

## Provedores LLM — chain de fallback

```typescript
const PROVIDERS = [
  { id: 'gemini',   model: 'gemini-2.5-flash',         dailyLimit: 1500, env: 'GEMINI_API_KEY' },
  { id: 'groq',     model: 'llama-3.3-70b-versatile',  dailyLimit: 14400, env: 'GROQ_API_KEY' },
  { id: 'cerebras', model: 'llama3.1-70b',             dailyLimit: 30, env: 'CEREBRAS_API_KEY' }, // free pequeno
  { id: 'mistral',  model: 'mistral-large-latest',     dailyLimit: 1000, env: 'MISTRAL_API_KEY' },
] as const;

// Circuit breaker: se um provedor lança erro, fica fora por 5min.
// Cost guards: rejeita se daily_chat_usage[user] >= 100 ou global >= 5000.
```

Envs novas (Vercel):
- `GEMINI_API_KEY` — https://aistudio.google.com/app/apikey
- `GROQ_API_KEY` — https://console.groq.com/keys
- `CEREBRAS_API_KEY` — https://cloud.cerebras.ai/
- `MISTRAL_API_KEY` — https://console.mistral.ai/api-keys

Documentar em `docs/setup/llm-providers.md`. App funciona sem nenhuma (chat fica desabilitado com mensagem "Chat temporariamente indisponível"); resolução/teoria já foram pré-geradas e ficam OK mesmo sem chave.

## Sons e animações

- Sons embarcados como base64 em `src/lib/audio/sounds.ts` (4 arquivos < 10KB cada — usar https://freesound.org/ CC0). Howler.js NÃO necessário; Web Audio API basta.
- Confete: `canvas-confetti` (1 dep nova, 6KB).
- Rolling number: implementação própria 30 LOC com requestAnimationFrame.

## Cost guardrails

```typescript
// Antes de toda chamada de chat:
if (await getUserDailyMsgs(userId) >= 100) throw new RateLimitError('daily_user');
if (await getGlobalDailyMsgs() >= 5000)    throw new RateLimitError('daily_global');
// Após resposta:
await incrementUsage(userId, provider);
```

Alerta 80%: cron Vercel diário lê usage e dispara email se algum provedor ≥ 80%.

## Pré-geração offline

`scripts/generate-solutions.ts` rodado uma vez:
1. Lê `select * from questions where exam='unifor-medicina'` (680).
2. Para cada uma, monta prompt com `image_url` (LLM lê via Vision API), `correct_answer`, `subtopic`.
3. Chama Gemini 2.5 Flash (suporta multimodal).
4. Valida regex + concordância com gabarito.
5. Insere em `question_solutions`.
6. Idempotente — pula se já existe.
7. Em ~680 chamadas, fica dentro do free tier diário do Gemini (1500/dia).

`scripts/generate-theory.ts` análogo para 80 subtópicos.

## Critério de pronto

1. Build verde + lint + typecheck.
2. ~620+ rows em `question_solutions` (alguns podem requerer revisão manual e ficam `reviewed=false`).
3. ~80 rows em `subtopic_theory`.
4. 15 rows em `achievements`.
5. Chat funcional com pelo menos 1 provider configurado.
6. Cost guards ativos, alerta automatizado.
7. Tela de questão (quiz após responder) mostra: resolução KaTeX renderizada + bloco teoria + botão "Tirar dúvida" que abre chat.
8. Tela de resultado de simulado idem para cada questão.
9. Atalhos A-E funcionam em quiz.
10. Chip de dificuldade renderiza no quiz e revisão.
11. Header da home mostra countdown.
12. Logout funciona ✓ (já corrigido).
13. Smoke test em prod: signup → quiz aleatório → responder → ver resolução → tirar uma dúvida → fechar e logar.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Gemini Vision custa mais que texto | 680 chamadas × free tier 1500/dia = ok. Se exceder, gera em 2 dias. |
| LLM gera resolução divergente do gabarito | Validação + 3 retries + flag `reviewed=false` para revisão manual. |
| Sons irritantes | Toggle ON-mobile/OFF-desktop por default; respeitar `prefers-reduced-motion`. |
| Custo LLM explode | Cost guards + circuit breaker + 4 fallbacks. Free tier dá conta. |
| Chave LLM ausente em dev | Fallback gracioso: chat mostra "Indisponível" sem crashar. |

## Não-objetivos

- Resolução de questão personalizada por usuário (todos veem a mesma).
- Editor admin de resoluções via UI (correção via SQL/Supabase Dashboard por enquanto).
- Multi-língua (pt-BR only).
- Push notifications (PR futuro).
- Chat com voz (futuro).
