# APROVA

Banco de questões oficiais do vestibular de Medicina da Unifor (Universidade de Fortaleza), organizado por disciplina, subtópico e ano da prova.

> *Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.*

**Produção:** https://aprova-five.vercel.app · **Design preview:** https://aprova-five.vercel.app/design

## Documentos de referência

- `PRD_Plataforma_Unifor_Medicina.md` — produto, telas, modelo de dados, fórmulas
- `Design_Tokens_Aprova.md` — identidade visual
- `Estudo_Unifor_Medicina/Estudo_Unifor_Medicina.html` — protótipo HTML com dataset embutido
- `docs/superpowers/specs/2026-05-02-aprova-mvp-design.md` — spec consolidado da Fase 1
- `docs/superpowers/plans/` — planos de execução por PR

## Stack

Next.js 14 (App Router) · TypeScript estrito · Tailwind CSS · shadcn/ui · Supabase (Auth + Postgres com RLS + Storage) · Vercel · PostHog · Sentry · PWA

## Rodar local

```bash
npm install
cp .env.example .env.local
# preencher as variáveis do Supabase, PostHog e Sentry
npm run dev
```

Abra `http://localhost:3000`.

Visite `/design` para ver o preview do design system.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — roda build de produção
- `npm run lint` — lint
- `npm run format` — formata com Prettier
- `npm run typecheck` — checagem de tipos sem emit

## Deploy

- Projeto Vercel: `engarocha-7771s-projects/aprova` (linkado via `.vercel/project.json`)
- Produção: `vercel --prod` no diretório raiz
- Preview: `vercel` (sem `--prod`)
- Aliases automáticos: `aprova-five.vercel.app` (produção)
