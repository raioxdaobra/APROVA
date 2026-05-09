# Multi-Vestibular — Design Spec

**Data:** 2026-05-09
**Autor:** Claude (sessão com user)
**Status:** Aprovado — pronto pra plano de implementação

---

## Contexto e motivação

APROVA hoje é um app monolítico focado em **Vestibular Medicina Unifor**: 1015 questões oficiais, simulado cronometrado, trilha de 8 ranks, revisão SRS, missões diárias, ranking semanal, XP/streak. Toda a navegação assume que o user está estudando "a prova" — não existe conceito de múltiplas provas.

User quer expandir pra **multi-vestibular** com foco inicial em medicina, começando por **Unifor (ativa) + ENEM (em breve) + UECE (em breve)**. Outras provas (Unicristus, USP, UFC) virão depois mas não fazem parte deste spec.

A diferença de paradigma é grande: deixa de ser "o app de quem quer Unifor" pra virar "o app de quem está se preparando pra qualquer vestibular de medicina, escolhendo qual estudar".

## Decisões estruturais (10 perguntas respondidas)

| # | Tópico | Decisão |
|---|---|---|
| 1 | Provas no MVP | Unifor (ativa), ENEM (em breve), UECE (em breve) |
| 2 | Posicionamento | Nova rota `/inicio` antes do `/dashboard` |
| 3 | Modo | Uma prova ativa por vez + botão de trocar |
| 4 | Escopo de dados | Híbrido: streak global, XP/ranking/missões por prova |
| 5 | Paywall | Pro único — assina uma vez, libera todas |
| 6 | Onboarding | `/inicio` é a primeira tela após signup |
| 7 | Trilha | Por prova, diagnóstico opcional ao trocar |
| 8 | Switch UX | Header da sidebar com nome + dropdown; "Início" reaproveitado |
| 9 | Lead capture | 1 clique direto + contador "pessoa #X interessada" |
| 10 | Tela "Em breve" | Lista do que vai ter + 2 botões: "Quero ser avisado" e "Ver Unifor enquanto isso" |

## Arquitetura

### Fluxo do usuário

```
Login/Signup
    ↓
/inicio  ← NOVA: cards Unifor / ENEM / UECE
    ↓
clique em prova ATIVA (Unifor)        clique em prova "EM BREVE" (ENEM/UECE)
    ↓                                            ↓
profiles.active_exam = 'unifor'          /inicio/[exam] (tela de aviso)
    ↓                                            ↓
/dashboard (ou /onboarding/* se novo)     [Quero ser avisado] → grava lead → toast
                                          [Ver Unifor enquanto isso] → vai pro flow ativo
```

### Conceito de "prova ativa"

- Persistência: coluna `profiles.active_exam text` no banco
- Cache rápido: cookie `aprova_active_exam` (sincroniza no login + ao trocar prova)
- Quando middleware encontra user logado **sem** `active_exam` definido, redireciona pra `/inicio`
- Quando user troca de prova, atualiza ambos (DB + cookie) e redireciona pra `/dashboard`

### Estrutura de rotas

| Rota | O que é | Mudança |
|---|---|---|
| `/inicio` | Cards de seleção de prova | **NOVA** |
| `/inicio/[exam]` | Tela "Em breve" pra ENEM/UECE | **NOVA** |
| `/dashboard` | Dashboard de estudo da prova ativa | preservada — opera sob `active_exam` |
| `/quiz`, `/simulado`, `/trilha`, `/revisao` | Modos de estudo | preservadas — operam sob `active_exam` |
| `/ranking` | Ranking semanal | mexe — passa a ser por prova ativa |
| `/onboarding/*` | Flow de novo user | sem mudança no fluxo, só puxa questões da prova escolhida |

**Importante:** `/dashboard` continua sendo dashboard. Não vira por-prova (`/dashboard/unifor`). A prova ativa é estado do user, não da URL.

### Componentes novos

```
src/app/inicio/
  page.tsx                          # tela principal com 3 cards
  [exam]/
    page.tsx                        # tela "Em breve" (ENEM/UECE)
    interest-button.tsx             # client component pra registrar interesse
  _components/
    exam-card.tsx                   # card grande de cada prova
    set-active-exam-action.ts       # server action que persiste escolha + redireciona

src/components/layout/
  active-exam-display.tsx           # nome da prova + dropdown no header da sidebar
  exam-switcher-dropdown.tsx        # dropdown com lista + "Trocar prova" → /inicio
```

### Mudanças em arquivos existentes

```
src/middleware.ts
  - se user logado e sem active_exam → redirect /inicio
  - se user em /inicio mas tem active_exam → permite (pode querer trocar)
  - rota /inicio/[exam] livre (qualquer logged-in pode ver)

src/components/layout/app-sidebar.tsx
  - "Início" passa a apontar pra /inicio (era /dashboard)
  - header da sidebar mostra <ActiveExamDisplay /> embaixo do logo

src/app/dashboard/page.tsx
  - adiciona ActiveExamDisplay no topo do mobile (chip com nome + dropdown)

src/components/dashboard/study-mode-cards.tsx
  - "Resolver questões" usa active_exam pra contar questões (não hardcoded 'unifor-medicina')

src/app/quiz/actions.ts, /simulado/actions.ts, /trilha/actions.ts
  - filtram por active_exam em vez de hardcoded 'unifor-medicina'

src/lib/quiz/selection.ts
  - lê active_exam pra montar pool de questões

src/app/onboarding/diagnostico/page.tsx
  - puxa questões da active_exam (não hardcoded)
```

## Banco de dados

### Tabelas novas

```sql
-- Lead capture pra "Quero ser avisado"
create table public.exam_interest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null check (exam in ('enem','uece','unicristus','usp','ufc','outras')),
  created_at timestamptz not null default now(),
  unique (user_id, exam)
);

create index exam_interest_exam_idx on public.exam_interest (exam);
create index exam_interest_user_idx on public.exam_interest (user_id);

-- RLS: user vê só os próprios; insert escopado ao próprio user_id
alter table public.exam_interest enable row level security;
create policy exam_interest_select_own on public.exam_interest
  for select using (auth.uid() = user_id);
create policy exam_interest_insert_own on public.exam_interest
  for insert with check (auth.uid() = user_id);
```

### Coluna nova em profiles

```sql
alter table public.profiles
  add column active_exam text default 'unifor-medicina' check (
    active_exam in ('unifor-medicina','enem','uece')
  );

-- Backfill: todos os users existentes ficam com Unifor
update public.profiles set active_exam = 'unifor-medicina' where active_exam is null;
```

### Tabelas que precisam de coluna `exam`

Por prova (afetadas):
- `weekly_xp` → adiciona `exam text not null`
- `daily_xp` → adiciona `exam text not null`
- `weekly_leaderboard` → adiciona `exam text not null` (recriar VIEW)
- `simulado_bonuses` → adiciona `exam text not null`
- `study_sessions` → adiciona `exam text not null` (atualmente já existe `type`, adicionar exam separado)
- `subtopic_mastery` → adiciona `exam text not null`
- `attempts` → JÁ tem `question_id` que vincula questão à prova; adicionar `exam` denormalizado pra acelerar queries

Trilha:
- Tabela `user_trilha_full` (ou equivalente) → adiciona `exam text not null`

NÃO ganham `exam` (são globais):
- `streaks` — streak global
- `flashcard_reviews` — flashcards são por subtópico/discipline, neutros
- `profiles` — adicionou `active_exam` mas não vira tabela escopada

Backfill: tudo que existe hoje vira `exam = 'unifor-medicina'`.

### Mudanças em RLS

Sem mudança estrutural — as policies continuam escopadas por user_id. Mas as **queries** passam a filtrar por `exam` na camada de aplicação.

## Tela "Em breve" — copy

```
[badge: 🔜 EM BREVE]
ENEM

Estamos preparando o conteúdo do ENEM pra APROVA.
Quando lançarmos, você vai ter:

  ✓ Questões oficiais dos últimos 10 anos
  ✓ Simulados cronometrados com bônus
  ✓ Trilha gamificada de 8 ranks
  ✓ Revisão com IA dos seus erros
  ✓ Flashcards com SM-2

[Quero ser avisado por email]   [Ver Unifor enquanto isso]

(após click no primeiro botão:)
✓ Anotado! Você é a pessoa nº 1 esperando o ENEM.
   Vamos avisar no seu email assim que estiver pronto.
```

## Tela `/inicio` — design

```
┌─────────────────────────────────────────────────┐
│  APROVA · escolha sua prova                     │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │   UNIFOR     │  │     ENEM     │  │  UECE  ││
│  │  Medicina    │  │              │  │        ││
│  │              │  │ 🔜 Em breve  │  │ 🔜 Em  ││
│  │  1015 q      │  │              │  │ breve  ││
│  │              │  │              │  │        ││
│  │ [Estudar →]  │  │ [Avisar →]   │  │ [Avi…]││
│  └──────────────┘  └──────────────┘  └────────┘│
└─────────────────────────────────────────────────┘
```

Cards usam o mesmo estilo dos study-mode-cards (cor accent, border-l-4, hover lift). Active vs em-breve diferenciados por opacidade/badge.

## Header da sidebar — switch de prova

```
┌────────────────┐
│ [A] APROVA     │
│ Vestibular Med │  ← nova linha pequena
│ Unifor   ▼     │  ← clique abre dropdown
├────────────────┤
│ 🏠 Início      │  ← agora aponta /inicio
│ 🎯 Resolver q. │
│ 📊 Simulado    │
│ ...            │
```

Dropdown:
```
┌──────────────────────────┐
│ ✓ Vestibular Med Unifor  │  ← ativa, com check
│   ENEM (em breve)        │
│   UECE (em breve)        │
│ ─────────────────         │
│ Ver todas as provas →    │  ← leva /inicio
└──────────────────────────┘
```

## Diagnóstico opcional ao trocar

Quando user troca pela primeira vez pra uma prova nova (sem `subtopic_mastery` registrado pra essa prova), aparece um banner no `/dashboard`:

```
┌─────────────────────────────────────────────┐
│ 💡 Vamos calibrar sua trilha de Unifor?     │
│ Faça um diagnóstico de 10 minutos pra que   │
│ a trilha comece no nível certo pra você.    │
│ [Fazer diagnóstico]  [Pular por enquanto]   │
└─────────────────────────────────────────────┘
```

Pode dispensar e refazer depois indo no diagnóstico via menu (settings ou trilha).

## Onboarding modificado

Antes:
```
signup → perfil → meta → diagnóstico → privacidade → /dashboard
```

Depois:
```
signup → /inicio → escolhe prova → perfil → meta → diagnóstico (da prova) → privacidade → /dashboard
```

`/inicio` no fluxo de onboarding tem comportamento idêntico ao acesso normal. Distinção única: depois que user clica numa prova ativa, se não tem perfil completo, é redirecionado pra `/onboarding/perfil` (não `/dashboard`).

## Fases de implementação

Spec é grande demais pra um único PR. Proposta de divisão:

### Fase 1: Fundação (banco + middleware + /inicio básico)
- Migrations: `exam_interest`, `profiles.active_exam`, colunas `exam` em tabelas de progresso
- Middleware: redirect para `/inicio` se sem active_exam
- Rota `/inicio` com 3 cards (apenas visual + click no Unifor seta active_exam e redireciona)
- Backfill: todos os users existentes ficam `active_exam = 'unifor-medicina'`
- Sidebar: "Início" aponta pra `/inicio`
- Sem mudança nas queries existentes ainda — tudo continua escopando 'unifor-medicina' hardcoded

**Resultado:** sistema continua funcionando exatamente como hoje, mas com a fundação multi-vestibular instalada e `/inicio` visível pra todo mundo.

### Fase 2: Escopo por prova nas queries + switch UX
- Substitui `'unifor-medicina'` hardcoded por `active_exam` em todas as queries de:
  - dashboard, quiz, simulado, trilha, revisão, ranking, missões
- Adiciona `<ActiveExamDisplay>` no header da sidebar com dropdown
- Onboarding/diagnóstico passam a usar a prova escolhida em `/inicio`

**Resultado:** o sistema respeita active_exam de verdade. Como só Unifor está ativa, ainda parece igual — mas trocar pra ENEM (manualmente via DB) já funcionaria.

### Fase 3: Tela "Em breve" + lead capture
- Rota `/inicio/[exam]` com a tela de aviso (copy do spec)
- Server action `registerExamInterest`
- Contador "pessoa #X" lendo `exam_interest.count() WHERE exam = X`

**Resultado:** ENEM/UECE viram clicáveis com captação de leads. Fim do MVP B.

### Fase 4 (opcional, depois de validar): Conteúdo ENEM/UECE
- OCR/seed de questões ENEM
- Flip do flag de "em breve" → "ativo"
- Trilha ENEM funcional

---

## Trabalho fora deste spec (deferred)

- USP, Unicristus, UFC, outros vestibulares — vão entrar em fases futuras seguindo o mesmo padrão
- Estudar duas provas ao mesmo tempo (modo "biblioteca") — só se virar demanda real
- Pro Single (paywall por prova) — só se feedback indicar
- Dashboard combinado (ver progresso somando todas as provas) — feature de poder, não MVP
- Push de WhatsApp pra leads — Fase 4+

## Riscos e contingências

**Risco 1: Queries com `'unifor-medicina'` hardcoded espalhadas**
A Fase 2 vai mexer em ~15 arquivos pra substituir. Risco de esquecer alguma. Mitigação: grep `unifor-medicina` antes de declarar Fase 2 completa; revisão dirigida.

**Risco 2: Migrations conflitantes em RLS**
Adicionar `exam` em tabelas com RLS pode quebrar policies se elas referenciarem todas as colunas. Mitigação: revisar cada policy antes da migration; teste em staging primeiro.

**Risco 3: Backfill de users existentes**
Se algum user tem `active_exam` NULL após migration, middleware redireciona pra `/inicio` no próximo login — pode parecer bug. Mitigação: backfill na própria migration setando `'unifor-medicina'` pra todos.

**Risco 4: User ativo num modo do app é forçado a re-escolher**
Quem está com sessão de quiz aberta no momento do deploy não sabe da `/inicio`. Mitigação: backfill resolve — `active_exam` já vem setado, então middleware deixa passar.

**Risco 5: Testes E2E quebrarem**
Não temos E2E hoje, então sem risco.

## Critérios de pronto

- ✅ User logado sem `active_exam` cai em `/inicio`
- ✅ Cards de Unifor (ativa) e ENEM/UECE (em breve) renderizam corretamente
- ✅ Click em Unifor seta `active_exam` e leva pra `/dashboard`
- ✅ Click em ENEM/UECE leva pra `/inicio/[exam]` com tela de aviso
- ✅ Botão "Quero ser avisado" persiste em `exam_interest`, mostra contador
- ✅ Botão "Ver Unifor enquanto isso" troca prova ativa pra Unifor + redireciona
- ✅ Header da sidebar mostra prova ativa com dropdown funcional
- ✅ "Início" da sidebar aponta pra `/inicio`
- ✅ Banner de diagnóstico aparece ao trocar pra prova nunca estudada
- ✅ Queries do dashboard/quiz/simulado/trilha respeitam `active_exam`
- ✅ XP, ranking, missões escopam por prova; streak permanece global
- ✅ Onboarding novo user funciona com prova escolhida em `/inicio`
- ✅ Build passa sem erros
- ✅ Deploy em produção funciona

## Próximos passos

1. User revisa este spec e aprova/pede ajustes
2. Após aprovação, criar plano de implementação em `docs/superpowers/plans/2026-05-09-multi-vestibular-fase1.md` (Fase 1 primeiro, fases 2-3 em planos separados)
3. Implementar Fase 1 (~3-5 commits, deploy entre cada)
4. Validar Fase 1 em produção, depois Fase 2
5. Fase 3 fecha o MVP B

---

**Fim do spec.**
