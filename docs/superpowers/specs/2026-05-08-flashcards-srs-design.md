# Anki/SRS Flashcards — Design Spec

**Data:** 2026-05-08
**Origem:** Sessão pré-launch APROVA, requisito do user "sistema tipo Anki, sem inventar nada, com base nas 990 questões oficiais já existentes".
**Approach selecionado:** A — Questão pura como flashcard.

---

## 1. Objetivo

Adicionar revisão espaçada (Spaced Repetition System) à APROVA usando como **base exclusiva** as 990 questões oficiais do vestibular Unifor Medicina já cadastradas em `public.questions` (anuladas filtradas). Sem geração de conteúdo novo. Sem cards manuais. Sem flashcards "inventados" pela IA.

Cada card É uma questão real:
- **Front:** imagem da questão (`image_url`) + descrição opcional (`description`).
- **Back:** letra correta (`correct_answer`) + atalho "Ver Resolução IA" (reusa `getOrGenerateResolucao` do PR `3fd7fe0`).

O algoritmo SM-2 (SuperMemo 2 — base do Anki) determina quando o user revê cada card.

## 2. Justificativa

- **Resolver questões = aprender.** Resolver as MESMAS questões em intervalos crescentes é a forma mais direta de internalizar padrões de prova específica.
- **Zero conteúdo novo a manter.** Toda fonte vem das 990 questões já curadas. Sem dependência de IA pra existir o produto.
- **Re-uso máximo de infra existente:** `questions`, `attempts`, `question_solutions` (cache IA), Supabase RLS, AppShell, sidebar.

## 3. Escopo

**In:**
- Tabela `flashcard_reviews` (estado SM-2 por usuário).
- Algoritmo SM-2 isolado em `src/lib/srs/sm2.ts` com testes.
- Server Actions: due cards, submit review, counts.
- Rota `/revisao` (page + client component).
- Card no `/dashboard` "X cards pra revisar hoje".
- Entrada sidebar "Revisão" (ícone `Brain`) entre Trilha e Jogos.
- Card pode disparar `<HelpPanel>` (Resolução IA) ao virar — opcional.

**Out (v2):**
- Filtros por disciplina/subtopic na fila de revisão (v1 vem mix aleatório).
- Estatísticas detalhadas (heatmap, gráfico de retenção).
- Custom decks / cards personalizados.
- Audio/cloze deletion.
- Sincronização com Anki real.

## 4. Modelo de dados

### Migration `0035_flashcards_srs.sql`

```sql
-- 0035_flashcards_srs.sql
-- Spaced Repetition System (SM-2). Cada linha = estado de uma questão pra um user.
-- Quando o user revê uma questão, upsertamos a linha com novo ease_factor / due_at.
-- Cards "novos" (sem linha) tratam-se como (ease_factor=2.5, reps=0, interval=0, due_at=now()).

begin;

create table if not exists public.flashcard_reviews (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id),
  ease_factor numeric(4,2) not null default 2.5
    constraint flashcard_reviews_ef_min check (ease_factor >= 1.3),
  interval_days int not null default 0
    constraint flashcard_reviews_interval_nonneg check (interval_days >= 0),
  repetitions int not null default 0
    constraint flashcard_reviews_reps_nonneg check (repetitions >= 0),
  due_at timestamptz not null default now(),
  last_quality smallint
    constraint flashcard_reviews_quality_valid check (last_quality is null or last_quality between 0 and 5),
  total_reviews int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists idx_flashcard_reviews_user_due
  on public.flashcard_reviews (user_id, due_at);

alter table public.flashcard_reviews enable row level security;

drop policy if exists flashcard_reviews_select_own on public.flashcard_reviews;
create policy flashcard_reviews_select_own
  on public.flashcard_reviews for select
  using (auth.uid() = user_id);

drop policy if exists flashcard_reviews_insert_own on public.flashcard_reviews;
create policy flashcard_reviews_insert_own
  on public.flashcard_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists flashcard_reviews_update_own on public.flashcard_reviews;
create policy flashcard_reviews_update_own
  on public.flashcard_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- View: questões disponíveis pra virar flashcard (anuladas excluídas).
create or replace view public.flashcards_available as
  select
    id as question_id,
    discipline,
    subtopic,
    description,
    image_url,
    correct_answer,
    year,
    semester
  from public.questions
  where annulled = false;

grant select on public.flashcards_available to authenticated;

commit;
```

**Trade-offs:**
- `correct_answer` vai pro client (já é assim no quiz, então RLS não inventa novo problema).
- Sem trigger de updated_at — atualizamos via `update ... set updated_at = now()` na server action (mais simples, evita trigger pra um campo só).
- Não vamos criar tabela separada `flashcards` porque o que é "flashcard" = "questão". Re-uso direto da `public.questions`.

## 5. Algoritmo SM-2

`src/lib/srs/sm2.ts`. Quality input do user mapeada como Anki:

| Botão UI    | Quality | Efeito                                                  |
|-------------|---------|---------------------------------------------------------|
| Errei       | 0       | Reset: reps=0, interval=1d, EF inalterado (mín 1.3)     |
| Difícil     | 3       | Avança: EF cai um pouco                                 |
| Bom         | 4       | Avança: EF estável                                      |
| Fácil       | 5       | Avança: EF sobe                                         |

**Cálculo:**
```
if quality < 3:
  reps = 0
  interval = 1
  EF = max(1.3, EF)
else:
  reps += 1
  if reps == 1: interval = 1
  elif reps == 2: interval = 6
  else: interval = round(interval_prev * EF_prev)
  EF = EF + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  EF = max(1.3, EF)

due_at = now + interval days
```

Função pura, sem deps de DB. Testável.

## 6. Fluxo de seleção de cards

Endpoint `getDueQueue(limit=20)`:

1. **Cards em revisão devidos:** linhas em `flashcard_reviews` onde `user_id = me AND due_at <= now()`, ordenadas por `due_at ASC`.
2. **Cards novos** (preencher pool até `limit`): questões em `flashcards_available` que NÃO têm linha em `flashcard_reviews` para o user. Aleatórias com seed estável por dia (`order by md5(question_id || aprova_today()::text)`).
3. Se total < `limit`, retorna o que tem.

Isso dá um mix: primeiro o que está atrasado, depois novos.

**Counts** (`getFlashcardCounts`):
- `dueToday`: count em `flashcard_reviews` com `due_at <= aprova_today() + interval '1 day'` E `due_at >= aprova_today()`.
- `overdue`: count em `flashcard_reviews` com `due_at < aprova_today()`.
- `newAvailable`: 990 — count(distinct question_id) em flashcard_reviews do user.
- `totalReviewed`: count(distinct question_id) em flashcard_reviews do user com `total_reviews > 0`.

## 7. UI

### `/revisao/page.tsx` (Server Component)

```
Header: "Revisão"
Tagline: "X atrasadas · Y pra hoje · Z novas"
[Iniciar revisão →]
```

Se `dueToday + overdue + (limite de novos) > 0`, botão habilitado e abre `<FlashcardSession>`.

### `<FlashcardSession>` (Client)

```
[1 / 20]   [discipline · subtopic]
┌─────────────────────────────┐
│       imagem da questão      │  ← clique amplia (lightbox existente)
│                              │
│       (description opcional) │
└─────────────────────────────┘

   [Mostrar resposta]

----- após flip: -----

   Resposta: D
   [Ver resolução IA] (opcional)

   ──────────────────────────
   [Errei] [Difícil] [Bom] [Fácil]
```

- Atalhos teclado: Espaço = flip; 1/2/3/4 = quality.
- Após responder, próximo card carrega.
- Fim da fila: "Revisão concluída! Volte amanhã."

### Dashboard card

Pequeno card no `/dashboard`:

```
🧠 Revisão
12 cards pra hoje
[Revisar →]
```

Se `dueToday + overdue == 0`: "Em dia! ✓".

### Sidebar

Item "Revisão" entre Trilha e Jogos. Ícone `Brain`. Cor accent reusa `--accent-trilha` ou novo `--accent-revisao`.

## 8. Server Actions

`src/app/revisao/actions.ts`:

- `getDueQueue(limit?: number)` → `FlashcardCard[]` (com gabarito).
- `submitReview(questionId: string, quality: 0|3|4|5)` → `ReviewResult` (próximo due_at).
- `getFlashcardCounts()` → `{ dueToday, overdue, newAvailable, totalReviewed }`.

## 9. Métricas / Telemetria

- `track('flashcard_review', { quality, time_ms, discipline, was_new })` via PostHog.
- `track('flashcard_session_complete', { cards_done, accuracy, duration_s })`.

## 10. Compatibilidade / não-regressão

- `/revisao` é nova rota. Middleware bloqueia automaticamente sem onboarding (igual /quiz).
- Mobile bottom-nav não inclui "Revisão" no MVP (4 itens já lotados). Acesso via dashboard card e sidebar desktop.
- Nenhum endpoint existente alterado. Migration aditiva 0035 idempotente.
- RLS: linhas de `flashcard_reviews` são exclusivas por user.

## 11. Riscos

- **Performance:** lookup de "novos" usando `not exists` em 990 rows é trivial; `flashcard_reviews` cresce ~1 row/questão/user. Index `(user_id, due_at)` cobre query principal.
- **Cap free-tier?** Decisão: revisão NÃO conta no cap diário de 30q (mas seria uma decisão futura facilitar adicionar). MVP libera ilimitado pra todos.
- **Imagens grandes:** o lightbox/zoom já lida com isso.

## 12. Definition of Done

- [ ] Migration 0035 aplicada em prod via Supabase CLI.
- [ ] `src/lib/srs/sm2.ts` com pelo menos 4 testes (errar, acertar 3 vezes seguidas, EF mínimo, novo card).
- [ ] `/revisao` renderiza, fila carrega, flip funciona, submit registra linha, próximo due_at correto.
- [ ] Dashboard card mostra count correto.
- [ ] Sidebar item navega.
- [ ] Build CI verde.
- [ ] Deploy em prod.
- [ ] Smoke test E2E via Chrome MCP: criar revisão de 3 cards, marcar Bom em todos, verificar `due_at` =hoje+6 ou +interval correto na DB.

---

**Aprovado pelo user na sessão anterior** ("quero fazer agora!!!"). Próximo passo: plano de execução e dispatch de subagentes.
