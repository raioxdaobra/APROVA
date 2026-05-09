# Dashboard Hero — Redesign (Approach C híbrido)

**Data:** 2026-05-08
**Origem:** Diretoria (marketing + operacional + comercial) considerou a entrada atual "muito fria". User aprovou Approach C híbrida em brainstorming.

---

## 1. Objetivo

Quebrar a frieza visual da tela `/dashboard` mantendo proeminência da ação principal e ergonomia do user que volta no meio de uma sessão. Sem virar Tinder gamificado nem Duolingo infantil.

## 2. Estado atual

```
Olá, QA Final     [streak] [rank chip]                [theme] [avatar]
[Continuar de onde parou]   ← sempre presente, dominante mesmo sem sessão
Missões diárias 0/3 (3 cards detalhados, ocupam altura)
Quiz | Trilha
Revisão (SRS) | Simulado completo
Revisar erros | Jogos
Progresso da semana
Pomodoro / Diagnóstico residual
```

Problemas:
- Header textual sem cor
- "Continuar de onde parou" laranjão domina mesmo quando não há sessão recente
- Cards de modos brancos, sem identidade visual de cada disciplina
- Nada motivacional / contextual

## 3. Design (Approach C)

### 3.1 Header
```
              🔥 2d  [📚 Estudante]      [🌗 Claro] [Q]
```
- Streak chip e rank chip viram pequenos no canto superior direito (ao lado do theme toggle e avatar). Não são CTAs.
- Header esquerdo: nada de fixo. Saudação vem dentro da seção motivacional abaixo.

### 3.2 Hero motivacional
```
Olá, Alex.
"Pequenos passos diários viram aprovação."
                       ↑ rotativa
```
- **Saudação** dinâmica baseada em horário (`Bom dia / Boa tarde / Boa noite`) + primeiro nome (do `display_name`).
- **Frase motivacional** rotativa: banco curado de ~40 frases pt-BR. Seleção determinística por dia (hash do user_id + data) — fica estável dentro do dia, muda no dia seguinte.
- Variantes contextuais (override do random):
  - Streak ≥ 7d: prioriza frase de "consistência ganha"
  - Streak quebrada (=0 mas user já teve >3 anteriormente): frase de retomada
  - Hoje fez 0 q: tom convidativo
  - Hoje fez ≥10 q: tom de manutenção
- Tipografia: saudação `text-2xl font-semibold`, frase `text-base text-muted-foreground italic`.

### 3.3 Continuar de onde parou (condicional)
```
┌──────────────────────────────────┐
│ ▶ Continuar de onde parou        │
│ Quiz · 12/30 questões            │
└──────────────────────────────────┘
```
- **Aparece SOMENTE se** existe `study_sessions` com `ended_at IS NULL` E `started_at > now() - 24h` do user.
- Card secundário (não primary). Border accent da disciplina/contexto da sessão se houver.
- Texto contextual: tipo da sessão + progresso (X de Y questões respondidas, calculado via attempts).
- Click → vai pra rota correta (`/quiz/sessao/...` ou `/simulado/sessao/...`).

### 3.4 4 cards de modo grandes e coloridos
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  🎯   │ │  📊   │ │  🗺️  │ │  🧠   │
│ Quiz   │ │Simulado│ │Trilha │ │Revisão │
│        │ │        │ │       │ │        │
│ 1015q  │ │  Real  │ │ R3/8  │ │ 12 hj │
│  ↳ pool│ │ ↳ form.│ │ ↳ rank│ │ ↳ due │
└────────┘ └────────┘ └────────┘ └────────┘
 laranja    azul       verde     teal
```
- Grid 2x2 mobile, 4-col desktop.
- Cada card: ícone grande + label + número motivador + linha de contexto pequena.
- Border-l-4 + bg sutil tint (12% alpha) usando `--accent-quiz` / `--accent-simulado` / `--accent-trilha` / `--accent-chat` que já existem.
- Click no card inteiro = navegação pra rota.
- Números motivadores:
  - **Quiz:** `1015 questões` (pool não-anuladas, server-side via fetchAll)
  - **Simulado:** `Formato real` (estático, ou tempo médio recomendado)
  - **Trilha:** `R<rank>/8` (rank atual do user via `user_trilha_full`)
  - **Revisão:** `<n> hoje` (count de `flashcard_reviews` due_at <= now)

### 3.5 Missões discretas (recolhíveis)
```
Missões hoje · 1 de 3 concluídas    +210 XP no total
░░░░░░░░░░  Domine 1 subtópico hoje
░░░░░░░░░░  Estude 25 min
░░░░░░░░░░  Resolva 10 de Física
[▼ Ver todas]   ← se houver mais ou pra modo expandido
```
- Header curto da seção: "Missões hoje · X de 3 · +XP total"
- Lista compacta com progress bar fina (h-1.5) e label
- Sem cards individuais grandes
- Click no item = expansão inline pra ver detalhes (XP, deadline, ações)
- Recolhe se all done (chip "✓ Tudo feito hoje")

### 3.6 Progresso da semana
- Mantém o gráfico atual (semana de barras)
- Sem mudanças

### 3.7 Outros cards (Revisar erros, Jogos)
- Saem do grid principal de modos
- Viram chips ou linha "Mais ferramentas: Revisar erros · Jogos · Estatísticas" (links sutis)

## 4. Componentes

**Novos:**
- `src/lib/motivational/quotes.ts` — banco de 40 frases + função `getQuoteForUser(userId, date, context)` retornando frase determinística
- `src/components/dashboard/hero-greeting.tsx` — saudação + frase motivacional
- `src/components/dashboard/continue-session-card.tsx` — card condicional "Continuar de onde parou"
- `src/components/dashboard/study-mode-cards.tsx` — grid 4 cards coloridos
- `src/components/dashboard/missions-compact.tsx` — missões linha compacta com progress bars

**Modificados:**
- `src/app/dashboard/page.tsx` — orquestrador novo (substituindo o atual)
- `src/components/daily-missions-card.tsx` — pode ser deprecado em favor do compact

## 5. Dados necessários (server-side)

- `auth.user` + `profiles` (display_name, plan, streak)
- `study_sessions` aberta (last 24h) — pra continue card
- Count `questions` não-anuladas por exam — pra Quiz card (fetchAll)
- `user_trilha_full` — pra Trilha card
- Count `flashcard_reviews` due — pra Revisão card
- Missões diárias (já existe via `daily-missions-card`)

## 6. Compatibilidade

- Mobile: grid 2x2 nos cards, frase quebra natural, missões empilhadas
- Dark mode: cores accent já mantém contraste
- Sem missions ainda criadas (DB vazio): card de missões não aparece OU mostra estado vazio convidativo

## 7. Out of scope (v2)

- A/B testing das frases motivacionais
- Frases personalizadas baseadas em performance (IA escreve)
- Animações lottie/confetti no hero
- Onboarding tour da nova hero

## 8. Definition of Done

- [ ] Saudação dinâmica + frase motivacional rotativa renderizam
- [ ] Continue card aparece SÓ se sessão < 24h existe; senão some
- [ ] 4 cards de modo com cores accent corretas + números reais
- [ ] Missões compactas (sem usar `<Card>` individual por missão)
- [ ] Mobile responsivo (375px)
- [ ] Build CI verde
- [ ] Deploy em prod
- [ ] Smoke test via Chrome MCP

---

**Aprovado em brainstorming pelo user (Approach C). Próximo passo: writing-plans.**
