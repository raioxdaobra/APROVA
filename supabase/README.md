# Supabase — APROVA

Schema, RLS, triggers e cliente tipado da plataforma APROVA. Tudo aqui é
executado contra um projeto Supabase (Postgres gerenciado + Auth + Storage).

## Estrutura

```
supabase/
  README.md                      <- este arquivo
  migrations/
    0001_initial_schema.sql      tabelas + indices (PRD secao 7)
    0002_rls_policies.sql        Row Level Security
    0003_weekly_leaderboard_view.sql
    0004_triggers.sql            streaks + XP semanal + status (PRD secao 9)
    0005_simulado_xp_function.sql
```

## Pré-requisitos

- Conta no [https://app.supabase.com](https://app.supabase.com).
- Node.js 20+ instalado (já requisito do Next.js).
- (Opcional) Docker Desktop para `supabase start` local.

## Passo 1 — Criar projeto no dashboard

1. Acesse [app.supabase.com](https://app.supabase.com) e clique em **New project**.
2. Escolha região **South America (São Paulo)** para menor latência em Fortaleza.
3. Defina senha forte do Postgres e guarde no gerenciador de senhas.
4. Aguarde provisionamento (~2 min).

## Passo 2 — Coletar credenciais

No dashboard, abra **Settings → API** e copie:

| Env var                          | Origem (dashboard)         | Onde usar                         |
| -------------------------------- | -------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Project URL                | client + server (público)         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `anon` `public` key        | client + server (público)         |
| `SUPABASE_SERVICE_ROLE_KEY`      | `service_role` `secret`    | apenas scripts/seeds, **nunca** no bundle do navegador |

Copie para `.env.local` na raiz do repo (use `.env.example` como base) e
configure no painel da Vercel **(Settings → Environment Variables)**.

## Passo 3 — Instalar Supabase CLI

```bash
# Opção A: global
npm install -g supabase

# Opção B: por execução (sem instalar)
npx supabase --help
```

> No Windows recomenda-se a opção B (`npx`) para evitar PATH issues.

## Passo 4 — Conectar o projeto local ao remoto

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```

`PROJECT_REF` é o sub-domínio antes de `.supabase.co` na URL do projeto.

## Passo 5 — Aplicar migrations

```bash
# Aplica todas as migrations pendentes no projeto remoto
supabase db push
```

> Em produção, prefira aplicar via PR + revisão. Nunca rode `db reset` no
> projeto remoto: ele apaga dados.

## Passo 6 — Gerar tipos TypeScript a partir do schema real

Após aplicar as migrations:

```bash
supabase gen types typescript --project-id <PROJECT_REF> \
  > src/lib/supabase/types.generated.ts
```

O arquivo `src/lib/supabase/types.ts` é a versão manual mantida como
fallback enquanto o projeto Supabase real ainda não existe. Quando a
geração automática estiver disponível, ou bem você (a) substitui o conteúdo
de `types.ts` pelo resultado da geração, ou (b) atualiza os imports do
projeto para apontarem para `types.generated.ts`.

## Rodar localmente com Docker (opcional)

Útil para desenvolvimento offline, testes de migration e CI.

```bash
supabase start         # sobe Postgres + Auth + Storage local
supabase db reset      # aplica todas as migrations do zero
supabase status        # mostra URLs e keys locais
supabase stop          # encerra
```

`supabase start` imprime as URLs e chaves do ambiente local — use-as em
um `.env.local.dev` separado.

## Checagem rápida

Após configurar `.env.local`, rode:

```bash
npm run check:supabase
```

O script valida que as três variáveis estão presentes e tenta uma query
simples contra `public.questions`. Reporta OK ou erro claro.

## Notas

- **Triggers** rodam com `SECURITY DEFINER` para conseguirem gravar em
  `weekly_xp` e `streaks` mesmo com RLS restritiva ao usuário comum.
- **`weekly_leaderboard`** é uma `view` com `security_invoker = true` e
  depende de duas políticas adicionais em `weekly_xp` e `profiles`
  (criadas em `0003_weekly_leaderboard_view.sql`) que permitem leitura
  cruzada **somente** para registros marcados `is_public_in_leaderboard = true`.
- **`award_simulado_xp(uuid)`** é idempotente via tabela
  `simulado_bonuses` (PK = `session_id`).
