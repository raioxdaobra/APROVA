# PR 4 — Auth + Onboarding + Walking skeleton (Design)

*Data:* 2026-05-02
*Status:* Aprovado para execução
*Depende de:* PR 1 (design system) ✅, PR 2 (schema + RLS) ✅, PR 3 (seed 680) ✅, telemetria ✅

## Goal

Um vestibulando anônimo entra em `/`, escolhe um provedor de auth, completa 3 passos rápidos de onboarding, opcionalmente faz um diagnóstico calibrado de 5 questões (1 por disciplina), e cai num `/dashboard` placeholder. A partir do segundo login, vai direto pra `/dashboard`.

## Documentos de referência

- `PRD_Plataforma_Unifor_Medicina.md` — telas 8.1, 8.2, seção 13 (analytics)
- `Design_Tokens_Aprova.md` — cor primária cobre, neutros stone, Inter
- `docs/superpowers/specs/2026-05-02-aprova-mvp-design.md` — PR 4 listado como "Auth + Onboarding"

## Não-objetivos

- **Sem** Apple Sign-In, Facebook, SMS — apenas email+senha + Google OAuth (decisão implícita 3 da spec MVP)
- **Sem** dashboard real — `/dashboard` é placeholder, vira PR 5/6
- **Sem** edição de perfil pelo usuário pós-onboarding (PR 11)
- **Sem** recuperação de senha por email — fluxo completo vem em PR 5 (sub-rotina), no PR 4 só link "Esqueci a senha" sem implementação
- **Sem** verificação dupla de email — Supabase manda magic link no signup; usuário verifica na hora ou pula (config `email_confirm = false` em dev/prod inicialmente)
- **Sem** captcha — adicionar quando virar problema (registro como follow-up)

## Arquitetura

```
                                 Supabase Auth
                                      │
   ┌─────────┐                        │
   │ Browser │ ──signup/login─────────┤
   └─────────┘                        │
        │                             │
        │ cookies sb-* (httpOnly)     │
        │                             │
        ▼                             ▼
   ┌────────────────────┐      ┌──────────────┐
   │  src/middleware.ts │      │ public.profiles      │
   │  updateSession()   │      │ public.streaks       │
   │  guard rules       │      │ public.user_question_status
   └────────────────────┘      └──────────────┘
        │
        ▼
   ┌────────────────────┐
   │ Server Components  │  ← Supabase server client (cookies)
   │ /dashboard         │
   │ /onboarding/*      │
   └────────────────────┘
```

**Auth via Supabase**: `@supabase/ssr` já está integrado (PR 1). Middleware refresh-de-sessão já existe (`src/lib/supabase/middleware.ts`). Falta o `src/middleware.ts` na raiz com regras de proteção de rota.

**Onboarding como Server Components com Server Actions**: cada passo é uma rota (`/onboarding/perfil`, `/onboarding/meta`, `/onboarding/privacidade`, `/onboarding/diagnostico`). Submit chama Server Action → escreve no Supabase → redireciona pro próximo passo. Sem state global, sem client store. Validação dupla: client (zod via React Hook Form) + server (zod no action).

**Diagnóstico calibrado**: SQL function `public.get_diagnostic_questions()` SECURITY DEFINER:

```sql
-- Pseudocódigo: 1 questão de cada disciplina principal,
-- de subtópicos com count(*) >= 5 não-anulados,
-- aleatoriamente escolhida dentro do filtro.
select * from public.questions q
where exam = 'unifor-medicina'
  and not annulled
  and discipline = $1
  and subtopic in (
    select subtopic from public.questions
    where exam = 'unifor-medicina' and not annulled and discipline = $1
    group by subtopic having count(*) >= 5
  )
order by random()
limit 1;
```

A função retorna 5 questões (1 por disciplina: matematica, fisica, quimica, biologia, humanas). Linguagens fica de fora — não tem questões no banco.

## Telas detalhadas

### 8.1 Boas-vindas (`/`)

Layout vertical centralizado. Topo: logo APROVA grande. Abaixo:

> **"Resolva mais de 1.000 questões da Unifor Medicina."**
> *20 anos de vestibular, organizados por matéria.*

Dois CTAs empilhados, largura ≈ 80% da tela:

1. **"Entrar com Google"** (primário, ícone Google à esquerda)
2. **"Criar conta com email"** (secundário)

Link discreto abaixo: *"Já tenho conta — entrar"* → leva pra `/login`.

Rodapé: *"Sem custo. Sem anúncios. Para vestibulandos, por vestibulandos."* + links pequenos pra `/sobre`, `/privacidade`, `/termos`.

### `/signup` (cadastro com email)

Form: display_name (1–60 chars), email, senha (min 8). Submit → Supabase signup → redireciona pra `/onboarding/perfil`. Erro de email duplicado: mensagem clara + link "Já tem conta? Entrar".

### `/login` (login com email)

Form: email, senha. Link "Esqueci a senha" → `mailto:eng.arocha@gmail.com?subject=Recuperar+senha+APROVA` no PR 4 (placeholder; fluxo real PR 5). Submit → cria sessão → middleware redireciona conforme `onboarding_completed`.

### `/auth/callback` (OAuth)

Recebe redirect do Google, troca code por session, redireciona pra `/onboarding/perfil` ou `/dashboard` conforme `onboarding_completed`.

### 8.2 Onboarding — 3 passos + diagnóstico opcional

Layout: stepper compacto no topo (1–2–3), card central com pergunta única, botão grande "Próximo" no rodapé.

#### Passo 1 — `/onboarding/perfil`

Campo único: **username**. Validação em tempo real:
- regex `^[a-z0-9_]+$`, length 3–20
- query `select 1 from profiles where username = $1` → unique check
- estados visuais: cinza (vazio), laranja (validando), verde (disponível), vermelho (inválido/em uso)

Sugestão automática: se veio do Google, deriva da parte local do email (sem `.`, lowercase, truncado). Se veio do signup com email, usa display_name normalizado.

Submit → Server Action que cria row em `public.profiles` com `username` + `display_name` + `daily_goal_questions=20` (default) + `is_public_in_leaderboard=true` (default temporário, confirma no passo 3) + cria row em `public.streaks` com `current_streak=0`.

#### Passo 2 — `/onboarding/meta`

Três cards selecionáveis grandes (radio group estilizado):

- **Leve** — 10 questões/dia
- **Médio** — 20 questões/dia *(pré-selecionado)*
- **Intenso** — 40 questões/dia

Submit → Server Action atualiza `profiles.daily_goal_questions`.

#### Passo 3 — `/onboarding/privacidade`

Toggle único: *"Aparecer no ranking semanal de Fortaleza?"* (default `on`).

Microcópia em uma linha abaixo: *"Sempre como `seu_username`, nunca seu nome real. Pode mudar depois nas configurações."*

Submit → Server Action atualiza `profiles.is_public_in_leaderboard`.

#### Tela "Pronto pro diagnóstico?" — `/onboarding/diagnostico`

Após o passo 3, esta tela é o card visível com a microcópia "recorte original como feature":

> **Antes de começar, uma observação importante.**
> As questões aparecem no formato original da prova oficial — mesma diagramação, mesma tipografia, mesmo espaçamento. Você chega no dia do vestibular acostumado.

Abaixo, dois botões:
- **"Fazer diagnóstico (5 questões)"** — primário, leva pra `/diagnostico`
- **"Pular pro app"** — secundário (link), leva pra `/dashboard`

Marca `profiles.onboarding_completed = true` em ambos os casos.

#### `/diagnostico`

Reusa minimamente o componente de questão (versão diet — sem cabeçalho persistente, só posição "1/5"). Cada attempt vai pra `attempts` com `context='diagnostic'` e flag `is_diagnostic=true` na row do `study_sessions` (tipo `'diagnostic'`).

**Crítico:** XP do diagnóstico **não conta**. Trigger `update_weekly_xp_on_attempt` precisa ignorar attempts cujo `study_sessions.type = 'diagnostic'`. Mesmo tratamento pra streak.

Após a 5ª: tela de resultado curta com "X de 5 acertos", breakdown por disciplina, botão "Ir pro dashboard".

### `/dashboard` (walking skeleton)

Por ora:
- Header com display_name + sequência ("0 dias seguidos") + ThemeToggle + dropdown de menu (logout)
- Card grande: *"Em breve seu progresso aparece aqui."*
- Botão CTA principal: *"Resolver questões aleatórias"* (desabilitado, com tooltip "Disponível em breve")

PR 5/6 substitui pelo dashboard real.

## Modelo de dados — adições

```sql
-- Migration 0009: onboarding flag
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Migration 0010: study_sessions.type aceita 'diagnostic'
-- (não há check constraint hoje — é text livre — mas documentar.)

-- Migration 0011: get_diagnostic_questions function
create or replace function public.get_diagnostic_questions()
returns table (
  id text, discipline text, subtopic text, subtopic_short text,
  year int, semester int, question_num int, image_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  d text;
begin
  for d in select unnest(array['matematica','fisica','quimica','biologia','humanas'])
  loop
    return query
      select q.id, q.discipline, q.subtopic, q.subtopic_short,
             q.year, q.semester, q.question_num, q.image_url
      from public.questions q
      where q.exam = 'unifor-medicina'
        and not q.annulled
        and q.discipline = d
        and q.subtopic in (
          select subtopic from public.questions
          where exam = 'unifor-medicina' and not annulled and discipline = d
          group by subtopic having count(*) >= 5
        )
      order by random()
      limit 1;
  end loop;
end;
$$;

grant execute on function public.get_diagnostic_questions() to authenticated;

-- Migration 0012: ignorar attempts de diagnóstico em XP/streak
-- (alterar triggers existentes para checar study_sessions.type != 'diagnostic')
```

## Middleware (`src/middleware.ts`)

```typescript
// Rotas publicas: /, /login, /signup, /auth/callback, /sobre, /privacidade, /termos, /design (preview)
// Rotas autenticadas mas sem onboarding: /onboarding/*, /diagnostico
// Rotas com onboarding: /dashboard

// Logica:
// - Sem sessao + rota privada → redirect /
// - Com sessao + onboarding_completed=false + rota nao-/onboarding → redirect /onboarding/perfil
// - Com sessao + onboarding_completed=true + rota /onboarding/* → redirect /dashboard
// - Com sessao em / → redirect /dashboard
```

## Eventos PostHog (PRD §13)

Todos chamam `track()` do `src/lib/analytics.ts`:

| Evento | Quando | Properties |
|---|---|---|
| `signup_started` | Click em "Entrar com Google" ou submit signup email | `provider: 'google' \| 'email'` |
| `signup_completed` | Após Server Action criar row em `profiles` | `provider`, `time_to_signup_sec` |
| `onboarding_step_completed` | Após cada Server Action de passo | `step: 1 \| 2 \| 3` |
| `onboarding_finished` | Após click em qualquer botão da tela `/onboarding/diagnostico` | `did_diagnostic: boolean` |
| `diagnostic_started` | Render da primeira questão de `/diagnostico` | — |
| `diagnostic_completed` | Após 5ª resposta | `score: 0..5`, `time_total_sec` |

`identify(user.id, { username, display_name })` é chamado uma vez no `AuthProvider` quando a sessão carrega.

## Sentry

Integração já está pronta. PR 4 não adiciona código Sentry novo. Erros de Server Action já vão automaticamente via `onRequestError`. Erros client-side via `<ErrorBoundary>` que vou wrappear em layout (já é feature do `@sentry/nextjs`).

## Componentes UI novos

shadcn/ui a adicionar via CLI:
- `label` — para campos de form
- `radio-group` — meta diária no Passo 2
- `switch` — toggle privacidade no Passo 3
- `dropdown-menu` — menu user no header dashboard
- `sonner` — toasts (preferido sobre `toast` legado do shadcn)

Componentes próprios:
- `<OnboardingStepper>` — barrinha de progresso nos 3 passos
- `<UsernameField>` — input com validação assíncrona
- `<DiagnosticQuestion>` — versão diet do componente de questão (PR 5/6 traz versão completa)
- `<UserMenu>` — dropdown de logout no dashboard

## Provedores que entram no layout

```tsx
<RootLayout>
  <ThemeProvider>
    <AuthProvider>           ← novo: hidrata sessão no client + identify()
      {children}
    </AuthProvider>
  </ThemeProvider>
  <AnalyticsProvider />
  <Toaster />                ← sonner
</RootLayout>
```

## Critério de pronto

1. `npm run typecheck && npm run lint && npm run build` passam.
2. **Signup novo (email)**: termina em `/dashboard`. Banco contém: 1 row em `auth.users`, 1 em `profiles` (`onboarding_completed=true`), 1 em `streaks` (`current_streak=0`).
3. **Signup novo (Google OAuth)**: idem, com `provider='google'` em `auth.users`.
4. **Diagnóstico completo**: 5 rows em `attempts` (`context='diagnostic'`), 1 row em `study_sessions` (`type='diagnostic'`), `weekly_xp` permanece em 0 pro usuário, `streaks.current_streak` permanece 0.
5. **Login existente (onboarding completo)**: redireciona direto pra `/dashboard`.
6. **Login existente (onboarding incompleto)**: redireciona pra `/onboarding/perfil`.
7. **Tentar acessar `/dashboard` sem sessão**: redireciona pra `/`.
8. **Tentar acessar `/onboarding/perfil` com onboarding já completo**: redireciona pra `/dashboard`.
9. **Username inválido/duplicado**: erro inline no campo, sem submit.
10. **Eventos PostHog visíveis** no dashboard PostHog após signup completo: `signup_started`, `signup_completed`, `onboarding_step_completed×3`, `onboarding_finished`, opcionalmente `diagnostic_started`/`diagnostic_completed`.
11. **WCAG AA** nos forms — todos os inputs com `<Label>`, focus rings visíveis, mensagens de erro lidas por screen reader (`aria-describedby` + `role=alert`).
12. **Mobile-first** verificado em viewport 375px sem scroll horizontal.
13. **Deploy em produção** com auth funcionando ponta a ponta.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Google OAuth requer config no Supabase Dashboard (Client ID/Secret) | Documentar passo de setup; user (eng.arocha) precisará criar credenciais no Google Cloud Console. **Bloqueante** — registrar como pendência se não estiver pronto. |
| `email_confirm=false` em prod sem verificação | Aceitável pra MVP de 5 usuários internos. Trocar pra `true` antes de abrir cadastro público. |
| Race condition: dois signups simultâneos com mesmo username | Constraint UNIQUE no banco já impede. Server Action retorna erro friendly se conflito. |
| `get_diagnostic_questions()` lento em produção | Indexes existentes (`exam, discipline, subtopic`) já cobrem. Limite 5 disciplinas × 1 random = 5 queries trivials. |

## Decisões implícitas registradas

- **Onboarding obrigatório**: usuário não consegue acessar `/dashboard` sem completar os 3 passos. Diagnóstico é opcional, mas os 3 passos não.
- **Display name livre na criação**: pode ter espaço, acentos. Username é separado e estrito.
- **Email opcional após Google OAuth**: vem do provedor, usuário não escolhe.
- **Sem deletar conta no PR 4**: vai pra `/configuracoes` em PR 11.
- **Senha não tem requisito de complexidade além de 8 chars**: Supabase decide; pode endurecer depois.
