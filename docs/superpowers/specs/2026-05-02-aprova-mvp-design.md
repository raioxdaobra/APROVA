# Aprova — Design do MVP

*Data:* 2026-05-02
*Status:* Aprovado para execução
*Escopo:* Fase 1 do PRD (MVP em 4–6 semanas)

## Documentos de referência

Esta spec **não substitui** os documentos abaixo. Ela consolida decisões implícitas, ordena a execução em PRs, e define critérios de pronto. Em caso de conflito, prevalece o documento de referência.

- `PRD_Plataforma_Unifor_Medicina.md` — produto, telas, modelo de dados, fórmulas. Fonte da verdade para comportamento.
- `Design_Tokens_Aprova.md` — identidade visual. Fonte da verdade para estilo.
- `Estudo_Unifor_Medicina/Estudo_Unifor_Medicina.html` — protótipo com dataset embutido (`<script id="questions-data">`) e imagens em `images/{discipline}/`.

## Posicionamento

> *"Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria."*

Três promessas que governam todas as decisões: volume (1.000+), profundidade temporal (20 anos), organização (por matéria).

## Estado do banco no lançamento

- **480 questões** (12 provas, 5 disciplinas: Matemática 180, Humanas 120, Biologia 60, Física 60, Química 60).
- Linguagens e Códigos (~240 questões) **não entra** no MVP — pipeline de seed projetado para receber depois sem mudança estrutural.
- Selo "banco em expansão para 1.000+" visível na home/landing.

## Decisões implícitas tomadas

1. **Nome:** APROVA. Branding consistente desde o primeiro deploy.
2. **Login obrigatório** para experimentar (sem modo anônimo no MVP).
3. **Auth providers:** email+senha, Google OAuth, recuperação por email. **Sem** Apple Sign-In, **sem** Facebook, **sem** SMS.
4. **Microcópia:** pt-BR direta, sem "olá!", sem emojis decorativos.
5. **Diagnóstico opcional** de 5 questões pós-onboarding.
6. **Feedback de resposta:** transição 200ms + `navigator.vibrate` quando suportado + indicador "+15 XP" deslizando do canto. Sem som, sem confete, sem modal celebratório.
7. **Branch model:** `main` = produção, `develop` = preview. Push em `main` dispara deploy Vercel.
8. **Mobile-first.** Desktop é segundo cidadão (importante mas não primário).

## Stack

- Next.js 14 (App Router) + TypeScript estrito
- Tailwind CSS com tokens do `Design_Tokens_Aprova.md`
- shadcn/ui como base de componentes
- Supabase (Auth, Postgres com RLS, Storage, Edge Functions onde necessário)
- Vercel (hospedagem, free tier)
- PostHog (analytics, free tier)
- Sentry (erros, free tier)
- next-pwa (Progressive Web App)
- Inter + JetBrains Mono via `next/font/google`

**Vetado:** UI library além do shadcn; state management além de React + Server Components + Supabase realtime; CSS-in-JS além do Tailwind; libs não listadas neste documento sem justificativa.

## Variáveis de ambiente

Listar em `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(apenas em scripts de seed/migração — nunca exposta ao cliente)*
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`

## Estrutura de diretórios

```
/app                    # App Router (rotas)
/components/ui          # shadcn/ui (primitivos)
/components/{feature}   # componentes por feature (questao, simulado, ranking, etc.)
/lib/supabase           # cliente tipado + helpers de auth
/lib/analytics          # PostHog wrapper
/lib/utils              # utilitários genéricos
/scripts                # seed-questions.ts e afins
/supabase/migrations    # SQL versionado
/public                 # manifest, ícones PWA, favicon
/docs/superpowers       # specs e plans
```

## Plano de execução — 11 PRs

Ordenação **híbrida**: fundação mínima → walking skeleton com primeira questão respondida → polimento por jornada. Cada PR entrega valor demonstrável e mergeável independente via `develop` → `main`.

### PR 1 — Fundação do projeto + design system
Next.js 14 + TS estrito + Tailwind com **todos** os tokens (cobre, stone, semânticas, 6 acentos de disciplina, 8 tamanhos tipográficos, sombras, motion). CSS variables com modo escuro automático via `prefers-color-scheme`. Inter + JetBrains Mono via `next/font/google`. shadcn/ui (`button`, `input`, `dialog`, `dropdown-menu`, `card`, `toast`) ajustados aos tokens. Páginas placeholder `/`, `/sobre`, `/privacidade`, `/termos`. `.env.example`. Deploy inicial Vercel.

**Demonstrável:** site no ar com tipografia, modo escuro automático, paleta visível em página `/design` interna.

### PR 2 — Supabase: schema, RLS, triggers
Projeto Supabase. `supabase/migrations/` versionado. 7 tabelas da seção 7 do PRD com índices. RLS para todas. View `weekly_leaderboard` filtrando `is_public_in_leaderboard`. 3 triggers com fórmulas exatas da seção 9: `update_streak_on_attempt`, `update_weekly_xp_on_attempt`, `update_user_question_status_on_attempt`. Anti-cheat embutido (tempo<2s ignorado, cap 2.000 XP/dia, sequências suspeitas descartadas para XP). Cliente Supabase tipado em `lib/supabase/`.

**Demonstrável:** migrations rodam em fresh DB; insert manual de attempt atualiza streak/xp.

### PR 3 — Seed de questões + upload de imagens
`scripts/seed-questions.ts`: extrai JSON de `<script id="questions-data">`, faz upload de `images/{discipline}/` para bucket Storage `questions/{discipline}/{filename}`, insere 480 linhas em `questions` com `image_url` pública, marca anuladas. Idempotente. Otimização opcional via `sharp` (largura ≤1200, qualidade 82). README com instruções.

**Demonstrável:** banco com 480 questões e imagens servidas via CDN.

### PR 4 — Auth + onboarding + walking skeleton
Signup email+senha e Google OAuth, login, logout, recuperação por email. Tela 8.1 (boas-vindas) + onboarding 8.2 (3 passos: username com validação ao vivo, meta diária, privacidade do ranking). Diagnóstico opcional de 5 questões. Middleware de proteção de rotas. PostHog: `signup_started`, `signup_completed`, `onboarding_step_completed`, `onboarding_finished`, `diagnostic_started`, `diagnostic_completed`. Sentry configurado.

**Demonstrável:** signup → onboarding → diagnóstico → attempt no banco. Métrica norte (signup → primeira questão respondida em <60s) já mensurável.

### PR 5 — Modo Quiz: setup + tela de questão + fim de sessão
Tela 8.4 (setup com filtros: disciplina, subtópico dependente, ano, status pessoal, esconder anuladas, contador "X questões correspondem" reativo, sequencial vs aleatório). Tela 8.5 (questão) com feedback verde/vermelho 200ms, vibração háptica, indicador "+15 XP" deslizante, "marcar p/ revisar depois", prefetch da próxima imagem. Estado anulada com banner amarelo. Tela 8.6 (fim de sessão) com stats e comparação com média histórica. PostHog: `session_started`, `question_viewed`, `question_answered`, `session_completed`. A11y: foco visível, navegação Tab, alt via `description`.

**Demonstrável:** "filtros → 10 questões → resultado → XP/streak no banco".

### PR 6 — Modo Revisão + status pessoal por questão
Variante de 8.5 sem cor vermelha em incorretas, botão "Mostrar gabarito" manual. Filtro "minhas erradas / marcadas para revisar" via `user_question_status`. Sub-rota "Revisar erros — N pendentes" acessível pela home. Modo Revisão registra `attempts` com `context='review'` mas **não computa XP** (revisão é estudo, não tentativa nova).

**Demonstrável:** após errar uma questão no Quiz, ela aparece em "revisar erros" e posso revisitar.

### PR 7 — Modo Simulado (8.7 → 8.8 → 8.9)
Setup com presets (15/30/60/90 questões; 45/90/180/240 min; aviso "60q em 180min é o formato oficial"; proporção real de disciplinas quando "todas"). Em andamento: cronômetro com mudança de cor (amarelo<10min, vermelho<1min), alternativas como toggle sem feedback imediato, grade de navegação numérica, "Finalizar agora" com confirmação. Resultado: 3 cards (stats, breakdown por disciplina, lista questão a questão clicável → modo revisão). Bônus: 100 base + acertos×20 + 200 se dentro do tempo. Auto-finaliza ao zerar cronômetro. Persistência local para sobreviver refresh.

**Demonstrável:** simulado 60q/180min ponta a ponta sem perda de progresso ao recarregar.

### PR 8 — Home + Estatísticas + Ranking (8.3, 8.10, 8.11)
Home (8.3): hero pessoal (sequência, status do dia), CTA dinâmico, 3 cards de modo, gráfico de barras 7 dias com linha da meta, top 5 do ranking + linha do próprio usuário sticky. Estatísticas (8.10): cards top, evolução semanal 12 semanas, tabela por disciplina, tabela por subtópico, exportar JSON, apagar tudo (confirmação dupla). Ranking (8.11): top 50 da semana, contador de reset até segunda 00:00, toggle "aparecer no ranking", linha do usuário sticky se fora do top 50. PostHog: `streak_extended`, `streak_broken`, `xp_milestone_reached`.

**Demonstrável:** dashboard funcional, ranking real entre os 5 usuários internos.

### PR 9 — Configurações (8.12) + LGPD + páginas legais
Tela 8.12: conta (display name, username, email, alterar senha), estudo (meta diária, disciplina favorita), privacidade (toggle ranking), conta destrutiva (apagar com confirmação dupla → cascade; exportar JSON; sair). Toggle manual de modo escuro como override. `/privacidade` (LGPD listando PostHog/Sentry/Supabase/Vercel, retenção, direitos), `/termos`, `/sobre` (disclaimer Unifor/FEQ + `legal@dominio` de contato). Banner discreto não-bloqueante de consentimento na primeira visita.

**Demonstrável:** export, exclusão, troca de tema, páginas legais.

### PR 10 — PWA + performance + offline
`manifest.json` (nome, ícones 192/512/maskable, theme color `#C4633B`, background `#FAFAF9`, display standalone, splash). Service Worker via next-pwa: cacheia shell + fontes + ícones, stale-while-revalidate para imagens das questões, página `/offline`. `next/image` com WebP/AVIF e blur placeholder. `next/dynamic` para gráficos pesados. Targets Lighthouse mobile: Performance ≥90, A11y ≥95, Best Practices ≥95, PWA installable.

**Demonstrável:** instalo na home screen iPhone, abro offline, vejo questões já visitadas; Lighthouse passa.

### PR 11 — Polimento final + endurecimento
Sweep de a11y (contraste 4.5:1, áreas 44×44, foco visível, alt texts, navegação por teclado completa). Endurecimento de RLS (revisão + testes cruzados). Anti-cheat verificado nas 3 frentes. Source maps no Sentry em produção. Smoke test ponta a ponta. `RUNBOOK.md` curto: rodar local, aplicar migration nova, adicionar prova nova ao banco.

**Demonstrável:** MVP pronto para os 5 usuários internos baterem por uma semana.

## Fora do escopo (não entra em nenhum PR)

Conforme PRD seções 4, 10, 16: amizades, grupos, push notifications, conquistas/medalhas, repetição espaçada, modo "Análise de fraqueza", paywall, app nativo, chat, geração de questão por IA, plano de estudo por IA, multiplayer, suporte a outros vestibulares.

## Definição de Pronto da Fase 1

Critério do PRD seção 16: cinco usuários internos (dono + 4 amigos vestibulandos) usam por uma semana sem encontrar bug crítico, completam ao menos um simulado completo cada, e a taxa de retorno em 7 dias é mensurável no PostHog. Bug crítico = travamento, perda de progresso, impedimento de resolver questão.

## Métricas alvo (medidas em PostHog após lançamento beta)

- Retenção D7 ≥ 35%
- Mediana de questões/usuário ativo na semana ≥ 30
- Conclusão de simulado completo ≥ 25% dos que iniciam
- Lighthouse mobile: Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, PWA installable
- Time to Interactive < 3s em 3G simulado
- Bundle JS inicial < 200KB gzip

## Próximo passo

Invocar `writing-plans` para detalhar a implementação do **PR 1 — Fundação do projeto + design system**. PRs subsequentes recebem seu próprio plano antes da execução.
