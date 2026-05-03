# PR 13 — Premium Experience (Design)

*Data:* 2026-05-03 *Status:* Aprovado (user) *Depende de:* PRs 1-12

## Goal

Levar o produto de "MVP funcional" pra "experiência completa de estudo": signup aberto + paywall freemium real (R$14,90), layout fullscreen 2-col da questão, página de aprofundamento por subtópico, **10 mini-games** com ranking + bots, gate de 15min de estudo pra jogar, Pomodoro polido, e linguagens extraída de PDFs.

## Decisões aprovadas

| # | Decisão |
|---|---|
| 1 | Signup **aberto** com email — coleta dados; paywall depois quando user excede free tier |
| 2 | **Free**: 30 questões total · 1 simulado total · 5 chats IA/dia. **Pro**: R$14,90/mês ou R$119/ano. PIX + cartão via Stripe Brasil |
| 3 | Layout questão **2-col em desktop** (≥lg): imagem esquerda 60%, alternativas direita 40%, sem scroll. Mobile: 1-col scroll natural |
| 4 | Modo fullscreen `⛶`: tecla `F`, hide nav/install banners, 100vh |
| 5 | Imagem zoom: pinch/wheel/clique-lightbox |
| 6 | Stats accordion: primeira disciplina aberta default; cada subtópico vira link → `/aprofundar/[disc]/[slug]` |
| 7 | `/aprofundar/[d]/[s]`: 4 seções — resumo teórico, links externos, suas attempts, "Praticar agora" (10 questões filtradas) |
| 8 | **Linguagens** extraída via Gemini Vision dos PDFs em `PROVAS MEDICINA UNIFOR/PROVA` |
| 9 | **10 mini-games** (Mate-Speed, Wordle Vestibular, Memory Periódica, Snake Anatomia, 2048 Vestibular, Trunfo Vestibular, Corrida do Conhecimento, Sudoku, Quebra-Cabeça Lógico, Torre de Hanói 3D) |
| 10 | **Gate**: só joga após 15min de estudo no dia (focus_minutes ≥ 15) |
| 11 | **Bots**: Trunfo e Corrida têm modo single-player vs CPU |
| 12 | **Ranking** por jogo: `game_scores(user_id, game_id, score, played_at)`, view `game_leaderboard` |
| 13 | XP por estudar 15min: +50 XP (mantém engajamento mesmo pra quem joga muito) |

## Modelo de dados (migrations 0018-0020)

```sql
-- 0018: paywall + plan
alter table public.profiles
  add column if not exists plan text not null default 'free' check (plan in ('free','pro')),
  add column if not exists plan_expires_at timestamptz,
  add column if not exists questions_used_count int not null default 0,
  add column if not exists simulados_used_count int not null default 0;

-- Stripe metadata
create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive', -- active|past_due|canceled|inactive
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 0019: mini-games
create table public.game_scores (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null,    -- 'mate_speed' | 'wordle' | 'memory_periodic' | 'snake_anatomy' | '2048' | 'trunfo' | 'corrida' | 'sudoku' | 'logica' | 'hanoi'
  score int not null,
  duration_sec int,
  difficulty text,           -- 'easy'|'medium'|'hard'|'bot_easy'|'bot_hard'
  played_at timestamptz default now()
);
create index idx_game_scores_game_score on public.game_scores (game_id, score desc);
create index idx_game_scores_user on public.game_scores (user_id, played_at desc);

create table public.daily_focus_minutes (
  user_id uuid references public.profiles(id) on delete cascade,
  day date not null,
  minutes int not null default 0,
  primary key (user_id, day)
);

create or replace view public.game_leaderboard as
  select g.game_id,
         p.username, p.display_name,
         max(g.score) as best_score,
         count(*) as plays,
         row_number() over (partition by g.game_id order by max(g.score) desc) as position
  from public.game_scores g
  join public.profiles p on p.id = g.user_id
  where p.is_public_in_leaderboard = true
  group by g.game_id, p.username, p.display_name;

-- 0020: linguagens placeholder (será populada pelo script)
-- (questions e storage já existem; só adicionar tag exam='unifor-medicina' + discipline='linguagens')
```

## Arquitetura

### Layout 2-col fullscreen (`src/components/quiz-runner.tsx`, `simulado-runner.tsx`)
```tsx
<div className={cn(
  'mx-auto grid gap-6',
  fullscreen && 'fixed inset-0 z-50 overflow-auto bg-background p-6',
  'lg:grid-cols-[3fr_2fr]', // 60/40 desktop
)}>
  <div className="lg:sticky lg:top-6 lg:self-start">
    <QuestionImage onZoom={openLightbox} />
  </div>
  <div className="flex flex-col gap-4">
    <Header />        {/* chips + posição */}
    <Alternatives />  {/* A-E */}
    <Footer />        {/* Anterior/Próxima/Marcar */}
  </div>
  <FullscreenToggle hotkey="F" />
  <Lightbox open={...} src={imageUrl} />
</div>
```

### Paywall (`src/lib/billing/`)
- `caps.ts` — `checkQuestionsCap(profile)`, `checkSimuladoCap(profile)`. Retorna `{ allowed: bool, used, limit, plan }`.
- `paywall-modal.tsx` — modal com benefícios + 2 botões: "Mensal R$14,90" e "Anual R$119" (33% off).
- Stripe Checkout via Server Action: cria session com `payment_method_types: ['card', 'pix']`, redirect.
- Webhook `/api/stripe/webhook` valida signature, atualiza `subscriptions` table.

### Mini-games
- Pasta `src/games/<id>/` — cada um tem `Game.tsx` (Client Component) + `engine.ts` (logic puro). Não dependem entre si.
- Lobby `src/app/jogos/page.tsx`: 10 cards com cover + ranking top 5 + "Jogar".
- Gate: lobby checa `daily_focus_minutes(user, today) >= 15`. Se não, mostra *"Estude 15 min hoje pra desbloquear os jogos."* com link `/quiz`.
- Bots em Trunfo + Corrida: classe `BotPlayer` em `engine.ts` com 2 difficulties.
- Ranking por jogo: cada `Game.tsx` chama `submitScore(game_id, score)` ao terminar.

### Pomodoro integração
- Quando ciclo de **foco termina** (25min), incrementa `daily_focus_minutes` em +25.
- Botão *"Hora do descanso! Joguinho?"* leva pra lobby.

### Linguagens — script `scripts/extract-linguagens.ts`
- Para cada PDF em `PROVAS MEDICINA UNIFOR/PROVA`, abre via pdf-lib + sharp pra renderizar páginas.
- Usa Gemini Vision (multimodal) pra detectar páginas que contêm Linguagens (palavras-chave: literatura, gramática, interpretação).
- Recorta cada questão (heurística por bounding boxes ou cropping manual com Gemini telling coordinates).
- Identifica gabarito da última página.
- UPSERT em `questions` com `exam='unifor-medicina'`, `discipline='linguagens'`, `subtopic` inferido por LLM.
- Idempotente.
- Roda manual: `npm run extract:linguagens`.

## Stripe — envs novas (Vercel)

- `STRIPE_SECRET_KEY` (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- `STRIPE_PRICE_MONTHLY` (price_...)
- `STRIPE_PRICE_ANNUAL` (price_...)

Sem chaves: paywall mostra modal de "Em breve, fale com eng.arocha@gmail.com". Não crasha.

## Critério de pronto

1. Build verde + lint + typecheck.
2. Layout 2-col responsive testado em viewport 1280x720 (sem scroll).
3. Fullscreen `F` toggle funcional.
4. `/aprofundar/[d]/[s]` renderiza com 4 seções.
5. 10 jogos jogáveis em `/jogos`.
6. 2 jogos têm bots: Trunfo e Corrida.
7. Ranking por jogo funcional (top 10 público).
8. Gate de 15min: lobby bloqueia se focus_minutes < 15.
9. Paywall: aparece ao excedimento de 30q/1sim/5IA. Stripe Checkout funciona em test mode (sem chaves vivas).
10. Linguagens script roda sem erro (mesmo sem chave LLM, modo dry-run).
11. Deploy em prod responde 200.

## Não-objetivos PR 13

- App nativo (PWA continua sendo a aposta).
- Multi-língua além de pt-BR.
- Sistema de amigos (Fase 2).
- Push notifications (futuro).
