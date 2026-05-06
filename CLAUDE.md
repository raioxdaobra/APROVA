# CLAUDE.md — APROVA

Notas pra Claude Code em sessões futuras. Mantém este arquivo curto e atualizado.

## Stack

- Next.js 14 (App Router) + Supabase + Stripe + Vercel
- Tailwind + Radix + lucide-react
- Repo: `raioxdaobra/APROVA` (branch `main` = produção)

## Deploy é automático

**Não precisa pedir ao user pra rodar `vercel --prod` manualmente.**

Todo `git push origin main` dispara o workflow `.github/workflows/deploy-prod.yml`,
que builda e deploya na Vercel via CLI. Em ~3 min `aprova-five.vercel.app` está atualizado.

Configuração:
- Vercel project `aprova` na conta/team `engarocha-7771s-projects`
- IDs hardcoded no workflow (não-secretos): `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Token em GitHub Secret `VERCEL_TOKEN` (revogável em https://vercel.com/account/tokens)

Se o deploy automático falhar:
1. Conferir Actions tab em https://github.com/raioxdaobra/APROVA/actions
2. Causa comum: `VERCEL_TOKEN` expirado — pedir user pra gerar novo token e atualizar secret
3. Workaround manual (último recurso): user roda `vercel --prod` localmente

## Setup do ambiente

- Variáveis de ambiente vivem só na Vercel (não em `.env` commitado)
- `.env.example` lista todas as chaves sem valores
- User cria conta Supabase / Stripe / PostHog / Sentry e popula no painel da Vercel
- Supabase Site URL deve apontar pra `https://aprova-five.vercel.app` (não localhost) pros emails de auth funcionarem

## Estrutura

- `src/app/` — rotas (App Router)
- `src/components/` — componentes compartilhados; subpasta `landing/` pra hero + features + pricing + faq
- `src/lib/billing/caps.ts` — paywall (free 30q / 1 simulado / 5 IA-dia; admin = ilimitado; Pro = ilimitado)
- `src/lib/supabase/` — clientes server/browser, types gerados
- `src/middleware.ts` — gate de auth + onboarding + admin

## Convenções

- Commits: prefixo `feat:` `fix:` `chore:` `docs:` `merge:` em pt-BR
- PRs: descrição com tabela "Entregue / Adiado", arquitetura, test plan
- Mobile parity: toda mudança visual precisa funcionar em 375px
- Dual UX admin: bypass paywall + banner + `?preview=free` pra testar como user free

## Pendências conhecidas (PR 16)

- Sidebar Notion-style + AppShell pra rotas autenticadas (`(app)` route group)
- Gráfico interativo drill-down do `/quiz` (sunburst/treemap, tópicos)
- Light mode (auditoria de contraste)
- Extração de questões de Linguagens dos PDFs (script offline)
