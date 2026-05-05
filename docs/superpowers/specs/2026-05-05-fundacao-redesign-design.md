# Fundação Redesign — Spec (PR 15)

> Status: aprovado pelo user via brainstorming dia 2026-05-05.
> Próximo passo: escrever plano de execução via skill `superpowers:writing-plans` e executar via `superpowers:subagent-driven-development`.

## Objetivo

Refazer a fundação visual do APROVA pra resolver: desktop concentrado no meio, ausência de sidebar, paleta sem identidade, hero estático, paywalls com copy fraca, admin batendo paywall por bug, e cards da landing não-clicáveis. Tudo num PR coeso. Manter mobile parity em cada mudança.

## Escopo (in)

1. **Layout shell desktop**: sidebar colapsável Notion-style (240px aberto, 60px colapsado), persistido em `localStorage`, mobile vira drawer overlay. Aplicado a todas as rotas autenticadas (`/dashboard`, `/quiz/*`, `/simulado/*`, `/jogos/*`, `/ranking`, `/trilha`, `/configuracoes`, `/admin/*`, `/chat`).
2. **Paleta de acentos por área**: mantém base escura + laranja primário, adiciona acentos por seção (azul/verde/roxo/âmbar/teal) em ícones, badges, glows e bordas dos cards do dashboard.
3. **Landing (hero) animado**: aurora gradient pulsante (8s loop) + grid sutil respirando + count-up no número "1.000+" + glow no CTA. Zero bibliotecas pesadas — só CSS animations + 1 SVG.
4. **Cards da landing clicáveis** com destinos:
   - "1.000+ questões oficiais" → `/quiz`
   - "IA tira dúvidas" → `/chat`
   - "Ranking de Fortaleza" → `/ranking`
   - "10 mini-games" → `/jogos`
5. **Texto fixo "1.000+ questões"** em vez de número exato hardcoded. Localizar todas as ocorrências de `680`/contagens fixas e substituir.
6. **Login redesign** alinhado ao novo hero (mesma aurora + card mais elegante, sem ficar pesado).
7. **Admin bypass do paywall**:
   - `checkQuestionsCap`/`checkSimuladoCap` retornam `allowed: true` se `is_admin = true`.
   - Telas com paywall mostram banner discreto: "Modo admin — acesso ilimitado · [Ver como usuário free]".
   - Botão "Ver como free" liga query param `?preview=free` que força paywall só na navegação atual (não altera contadores reais).
8. **Paywall copy nova**:
   - Título: "Você está pegando o ritmo 🔥"
   - Subtítulo: "Já resolveu suas 30 questões grátis. Estude com TUDO o que cai na Unifor — 20 anos de prova oficial."
   - Card anual em destaque com badge, mensal secundário.
   - Bullets reformulados (Banco completo, Simulados ilimitados, IA 24/7, Ranking semanal, Mini-games).
   - CTA primário: "Garantir minha vaga → R$ 119/ano".
   - Microcopy: "Cancela quando quiser · 7 dias de garantia · PIX ou cartão".
   - Link discreto "Continuar com 30 questões grátis" em vez de "Agora não".
   - Estado fallback (Stripe não configurado): "Pagamento liberado em 48h. Garanta acesso antecipado com 50% off pelo email eng.arocha@gmail.com".
9. **Frequência por disciplina no /quiz setup** (versão leve): barra horizontal mostrando `count(questions) por disciplina` lida do banco existente. Sem migration nova. Versão drill-down completa fica pra PR seguinte.

## Escopo (out — PRs futuros)

- Light mode (PR próprio — exige auditoria de contraste em todas as telas).
- Gráfico interativo full do quiz com drill-down por tópicos e frequência (PR próprio — precisa view SQL nova agregando frequência de tópicos, componente Recharts/treemap, drill-down).
- Extração de questões de Linguagens dos PDFs (script offline, sem relação com este redesign).
- Integração da Trilha como card no dashboard (já acessível por URL; após sidebar nova ela ganha link nativo no menu).

## Arquitetura

**Layout shell** vive em `src/components/layout/app-shell.tsx`. Composto de:
- `<AppShell>` — wrapper que decide sidebar/header com base em viewport e estado
- `<AppSidebar>` — sidebar com navegação principal, colapsável, persistido em `localStorage` chave `aprova:sidebar:collapsed`
- `<AppHeader>` — barra topo com toggle sidebar, contagem de dias, toggle tema, avatar
- `<AppMain>` — área principal com `max-w` adaptativo (sm/md/lg/xl conforme rota)

`(app)` route group no Next.js para envolver todas as rotas autenticadas com o shell. Páginas públicas (`/`, `/login`, `/signup`, `/sobre`) ficam fora.

**Paleta de acentos** — adicionar tokens CSS em `src/app/globals.css`:
```css
--accent-quiz: 22 100% 56%;        /* laranja (atual primary) */
--accent-simulado: 217 91% 60%;    /* azul cobalto */
--accent-trilha: 142 76% 45%;      /* verde-esmeralda */
--accent-jogos: 270 76% 60%;       /* roxo */
--accent-ranking: 38 92% 55%;      /* âmbar */
--accent-chat: 173 70% 50%;        /* teal */
```
Cards do dashboard recebem `border-l-4` na cor da área + glow `shadow-[0_0_24px_-12px_<accent>]`.

**Aurora hero** — `<AuroraBackground>` em `src/components/landing/aurora-background.tsx`. Pure CSS:
- Container `position: relative`, dentro 3 divs com `radial-gradient`, `mix-blend-mode: screen`, `animation: aurora 8s ease-in-out infinite`
- SVG grid sobreposto com `opacity` animada de 0.03 → 0.08
- `prefers-reduced-motion` desliga as animações

**Count-up** — hook `useCountUp(target: number, duration = 1500)` em `src/lib/hooks/use-count-up.ts`. RAF-based. Roda só quando elemento está em viewport (IntersectionObserver).

**Admin bypass** — modificar `src/lib/billing/caps.ts`:
- `getPlanInfo` lê também `is_admin` do `profiles`.
- `checkQuestionsCap`/`checkSimuladoCap` retornam `allowed: true, limit: Infinity, plan: 'admin'` quando `is_admin && !previewFreeMode`.
- Adicionar param opcional `previewFreeMode?: boolean` que ignora o bypass.
- Página de quiz/simulado lê `?preview=free` da URL; quando presente, passa `previewFreeMode: true`.

**Banner admin** — `<AdminBanner mode="ilimitado" | "preview-free" />` em `src/components/admin-banner.tsx`. Renderiza no shell quando `is_admin`. Em "ilimitado" mostra link "Ver como usuário free" que adiciona `?preview=free` à URL atual.

**Paywall novo** — refatorar `src/components/paywall-modal.tsx` mantendo a API atual (`open`, `onClose`, `reason`, `fallback`) mas:
- Reescreve copy conforme spec.
- Adiciona prop `realStat?: string` opcional (caso futuramente tenhamos estatística real).
- Card anual recebe `border-2 border-primary` + badge "Mais escolhido".
- Botão CTA mostra preço explícito.
- Fallback usa novo texto de escassez.

**Frequência no quiz setup** — em `src/components/quiz-setup-form.tsx`:
- Server component pai busca `select discipline, count(*) from questions where deleted_at is null group by discipline`.
- Passa pra client component que renderiza barras horizontais (Tailwind) animadas com `transition-[width]` ao montar.
- Hover na barra mostra contagem absoluta.

## Mudanças de arquivo (mapa)

**Criar:**
- `src/components/layout/app-shell.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/app-header.tsx`
- `src/components/layout/sidebar-nav-item.tsx`
- `src/components/landing/aurora-background.tsx`
- `src/components/landing/feature-cards.tsx` (cards clicáveis)
- `src/components/admin-banner.tsx`
- `src/lib/hooks/use-count-up.ts`
- `src/lib/hooks/use-sidebar-state.ts`
- `src/app/(app)/layout.tsx` (route group novo com shell)

**Modificar:**
- `src/app/page.tsx` — usa AuroraBackground + FeatureCards + count-up
- `src/app/login/page.tsx` — aurora + card refinado
- `src/app/signup/page.tsx` — alinhar visual ao login
- `src/app/dashboard/page.tsx` — mover pra dentro de `(app)` ou consumir AppShell direto, cards com acentos por área
- `src/app/quiz/page.tsx`, `src/app/simulado/page.tsx`, `src/app/jogos/**`, `src/app/ranking/**`, `src/app/trilha/**`, `src/app/configuracoes/**`, `src/app/chat/**`, `src/app/admin/**` — mover pra `(app)` ou consumir shell
- `src/app/globals.css` — tokens de acento + animações aurora
- `src/lib/billing/caps.ts` — admin bypass + previewFreeMode
- `src/components/paywall-modal.tsx` — copy + visual nova
- `src/components/quiz-setup-form.tsx` — barras de frequência
- Buscar `680` em todo `src/` e substituir por `1.000+` ou ler dinamicamente

**Tabelas/migrations:**
- Nenhuma migration nesta fase. Frequência usa `questions` existente.

## Estados visuais críticos

- **Sidebar colapsado em mobile (<768px)**: NUNCA colapsado-com-ícones; sempre drawer overlay completo aberto via hambúrguer. Estado `localStorage` de desktop é ignorado em mobile.
- **Sidebar em rotas públicas**: não renderiza. Landing/login/signup/sobre são tela cheia.
- **Aurora com `prefers-reduced-motion`**: animação para, mantém gradiente estático.
- **Admin com `?preview=free`**: paywall aparece, banner muda pra "Modo preview free · [Voltar a admin]".
- **Paywall fallback**: quando `process.env.STRIPE_SECRET_KEY` não está setado, mostra mensagem de escassez nova em vez de "Em breve" frio.

## Testes manuais (gate de deploy)

1. Desktop 1440px: sidebar abre/colapsa/persiste estado após reload.
2. Mobile 375px: hambúrguer abre drawer, fecha ao clicar fora.
3. Tablet 768px: layout transita sem quebrar.
4. Landing: aurora animando, count-up dispara só ao scroll, cards levam aos destinos.
5. Login: visual coerente com landing.
6. Admin loga e vê banner; faz 31 questões sem paywall; clica "Ver como free" e paywall aparece; remove `?preview=free` e volta normal.
7. User free vê paywall novo na 31ª questão.
8. Quiz setup mostra barras de frequência, ordenadas decrescente.
9. `npm run typecheck && npm run lint && npm run build` verdes.
10. Deploy Vercel + smoke test em prod (200 OK em rota raiz).

## Decisões registradas

- **Light mode**: adiado pra PR próprio.
- **Gráfico drill-down quiz**: adiado pra PR próprio. Versão leve (barras) entra aqui.
- **Stat "47% mais"**: descartada — não inventar estatística sem dado real.
- **Linguagens (português) no banco**: pendência separada (script offline). Não bloqueia este PR.
- **Mobile parity**: regra permanente em `aprova_protocols.md`. Toda mudança aqui validada em ambos.
- **Admin dual UX**: regra permanente em `aprova_protocols.md`.

## Próximo PR (já decidido)

**PR 16 — Quiz analytics drill-down**:
> "Construir o gráfico interativo do /quiz solicitado em 2026-05-05. Setup: criar view `topic_frequency` agregando `count(questions) por (discipline, topic)` lendo de `questions`. Componente sunburst ou treemap com Recharts (ou alternativa leve). Drill-down: clicar em disciplina expande tópicos com barra de frequência e link 'Treinar este tópico' que pré-filtra `/quiz`. Manter mobile parity (em mobile vira lista accordion em vez de gráfico). Referência: este spec PR 15."
