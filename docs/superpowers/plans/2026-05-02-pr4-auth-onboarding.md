# PR 4 — Auth + Onboarding + Walking skeleton (Plano)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Signup/login funcional + onboarding 3 passos + diagnóstico calibrado opcional + dashboard placeholder. Spec: `docs/superpowers/specs/2026-05-02-pr4-auth-onboarding-design.md`.

**Architecture:** Supabase Auth (@supabase/ssr) com email+senha + Google OAuth. Onboarding como Server Components com Server Actions. Middleware raiz com rules de guard. Diagnóstico via SQL function SECURITY DEFINER que retorna 1 questão por disciplina principal.

**Tech Stack:** Next.js 14 App Router, Supabase Auth + Postgres, React Hook Form + zod, shadcn/ui (Radix), sonner toasts, PostHog tracking.

---

### Task 1: Migrations 0009 + 0011 + 0012 (schema do PR 4)

**Files:**
- Create: `supabase/migrations/0009_onboarding_and_diagnostic.sql`
- Create: `scripts/_apply_migration.ts` (executar uma única migration; descartável após uso)
- Modify: `src/lib/supabase/types.ts` (adicionar `onboarding_completed` em profiles e função `get_diagnostic_questions`)

- [ ] **Step 1: Ler corpo atual de `fn_update_weekly_xp_on_attempt` e `fn_update_streak_on_attempt`**

Antes de criar 0009, ler `supabase/migrations/0006_review_fixes.sql` integralmente (lá está a versão final). As funções têm lógica complexa (cap diário 2000 atômico via `daily_xp`, bonus 200 domínio, sequência 30 idênticas) que **não deve ser reescrita** — apenas adicionar early-return no início.

- [ ] **Step 2: Criar `supabase/migrations/0009_onboarding_and_diagnostic.sql`**

Esqueleto (preencher os corpos de XP/streak copiando de 0006 e injetando o early-return marcado com comentário `-- PR4: skip diagnostic`):

```sql
-- 1. Coluna onboarding_completed em profiles
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- 2. Função get_diagnostic_questions: 1 questão por disciplina principal,
-- de subtópicos com pelo menos 5 questões não-anuladas, escolha aleatória.
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
  for d in select unnest(array['matematica','fisica','quimica','biologia','humanas']::text[])
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

revoke all on function public.get_diagnostic_questions() from public;
grant execute on function public.get_diagnostic_questions() to authenticated;

-- 3. Patch das funções de XP e streak: ignorar attempts de session_type='diagnostic'.
-- IMPORTANTE: copiar o corpo atual de 0006_review_fixes.sql e inserir o bloco abaixo
-- imediatamente após o BEGIN da função. NÃO reescrever do zero — manter cap diário,
-- sequência 30 idênticas, bonus 200 etc.

create or replace function public.fn_update_weekly_xp_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
-- <<<< INÍCIO: declarações ATUAIS de 0006 + uma nova:
declare
  is_diag boolean := false;
  -- ... resto das declarações copiadas de 0006 ...
begin
  -- PR4: skip diagnostic sessions (não contam XP)
  if new.session_id is not null then
    select coalesce(s.type = 'diagnostic', false) into is_diag
      from public.study_sessions s where s.id = new.session_id;
    if is_diag then return new; end if;
  end if;

  -- ... CORPO ATUAL DE 0006 PRESERVADO INTEGRALMENTE ABAIXO ...
end;
$$;

create or replace function public.fn_update_streak_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_diag boolean := false;
  -- ... resto das declarações copiadas de 0006 ...
begin
  -- PR4: skip diagnostic sessions (não contam streak)
  if new.session_id is not null then
    select coalesce(s.type = 'diagnostic', false) into is_diag
      from public.study_sessions s where s.id = new.session_id;
    if is_diag then return new; end if;
  end if;

  -- ... CORPO ATUAL DE 0006 PRESERVADO INTEGRALMENTE ABAIXO ...
end;
$$;
```

**Validação obrigatória do implementer:** após preencher os corpos, rodar diff lógico — abrir `0006_review_fixes.sql` lado a lado e confirmar que o **único delta é**: declaração de `is_diag` + 4 linhas de skip no topo do BEGIN. Qualquer outra mudança = bug.

- [ ] **Step 2: Aplicar migration via script existente**

Run: `npm run db:push` (script `apply-migrations.ts` já lê `supabase/migrations/*.sql` em ordem).
Expected: log `aplicando 0009_onboarding_and_diagnostic.sql ... ok`.

- [ ] **Step 3: Validar via psql**

```sql
-- Verificar coluna
\d public.profiles  -- deve ter onboarding_completed boolean not null default false

-- Verificar função
select count(*) from public.get_diagnostic_questions();  -- deve retornar 5
select discipline from public.get_diagnostic_questions();  -- 5 disciplinas distintas
```

Implementer pode rodar via `npx tsx scripts/_temp_check.ts` com pg client (mesmo padrão do seed-questions.ts).

- [ ] **Step 4: Atualizar `src/lib/supabase/types.ts`**

Adicionar:
- `profiles.Row.onboarding_completed: boolean`
- `profiles.Insert.onboarding_completed?: boolean`
- `profiles.Update.onboarding_completed?: boolean`
- `Functions.get_diagnostic_questions: { Args: Record<string, never>; Returns: { id: string; discipline: string; subtopic: string; subtopic_short: string; year: number; semester: number; question_num: number; image_url: string }[] }`

- [ ] **Step 5: typecheck + commit**

Run: `npm run typecheck` → exit 0.
```bash
git add supabase/migrations/0009_onboarding_and_diagnostic.sql src/lib/supabase/types.ts
git commit -m "feat(db): onboarding flag, diagnostic RPC and diagnostic-aware triggers"
```

---

### Task 2: shadcn/ui components (Label, RadioGroup, Switch, DropdownMenu, Sonner)

**Files:**
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/radio-group.tsx`
- Create: `src/components/ui/switch.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/sonner.tsx`
- Modify: `src/app/layout.tsx` (add `<Toaster />` from sonner)

- [ ] **Step 1: Instalar peer deps Radix + sonner**

Run: `npm install @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-dropdown-menu sonner`

- [ ] **Step 2: Criar `src/components/ui/label.tsx`**

```typescript
'use client';
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;
```

- [ ] **Step 3: Criar `src/components/ui/radio-group.tsx`**

```typescript
'use client';
import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-3', className)} {...props} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'aspect-square h-4 w-4 rounded-full border border-stone-400 text-cobre-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-cobre-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="h-2.5 w-2.5 fill-current text-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
```

- [ ] **Step 4: Criar `src/components/ui/switch.tsx`**

```typescript
'use client';
import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobre-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-cobre-600 data-[state=unchecked]:bg-stone-300',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
```

- [ ] **Step 5: Criar `src/components/ui/dropdown-menu.tsx`**

Use o componente padrão shadcn para dropdown-menu (forwardRef em Trigger/Content/Item/Separator/Label). Conteúdo completo: ver https://ui.shadcn.com/docs/components/dropdown-menu — copiar versão do registry com classes Tailwind ajustadas pra usar `border-stone-200 bg-white text-stone-950 shadow-md` (claro) e `dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50` (escuro).

- [ ] **Step 6: Criar `src/components/ui/sonner.tsx`**

```typescript
'use client';
import { useTheme } from '@/components/theme-provider';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'border bg-background text-foreground shadow-md',
        },
      }}
    />
  );
}
```

Nota: `useTheme` precisa expor `resolvedTheme`. Se hoje só expõe `theme`, ajustar `theme-provider.tsx` para expor também.

- [ ] **Step 7: Adicionar `<Toaster />` em `src/app/layout.tsx`**

```tsx
import { Toaster } from '@/components/ui/sonner';
// ...
<body>
  <ThemeProvider>{children}</ThemeProvider>
  <Suspense fallback={null}><AnalyticsProvider /></Suspense>
  <Toaster />
</body>
```

- [ ] **Step 8: typecheck + commit**

```bash
npm run typecheck
git add src/components/ui/{label,radio-group,switch,dropdown-menu,sonner}.tsx src/app/layout.tsx package.json package-lock.json
git commit -m "feat(ui): add Label, RadioGroup, Switch, DropdownMenu, Toaster primitives"
```

---

### Task 3: AuthProvider client (sessão + identify PostHog)

**Files:**
- Create: `src/components/auth-provider.tsx`
- Modify: `src/app/layout.tsx` (envolver children com AuthProvider)

- [ ] **Step 1: Criar `src/components/auth-provider.tsx`**

```typescript
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { identify, reset } from '@/lib/analytics';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}
const Ctx = createContext<AuthCtx>({ user: null, session: null, isLoading: true });

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: Session | null;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) identify(s.user.id, { email: s.user.email });
      else reset();
    });
    if (initialSession?.user) identify(initialSession.user.id, { email: initialSession.user.email });
    return () => sub.subscription.unsubscribe();
  }, [initialSession]);

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, isLoading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
```

- [ ] **Step 2: Atualizar `src/app/layout.tsx` para passar sessão inicial**

```tsx
import { createServerClient } from '@/lib/supabase/server';
// (server component default)
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return (
    <html ...>
      <body>
        <ThemeProvider>
          <AuthProvider initialSession={session}>{children}</AuthProvider>
        </ThemeProvider>
        ...
      </body>
    </html>
  );
}
```

- [ ] **Step 3: typecheck + commit**

```bash
npm run typecheck
git add src/components/auth-provider.tsx src/app/layout.tsx
git commit -m "feat(auth): client AuthProvider with PostHog identify on session change"
```

---

### Task 4: Middleware raiz com guard rules

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Criar `src/middleware.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/sobre', '/privacidade', '/termos', '/design'];
const ONBOARDING_ROUTES_PREFIX = '/onboarding';
const DIAGNOSTIC_ROUTE = '/diagnostico';
const APP_ROUTE = '/dashboard';

function isPublic(path: string): boolean {
  return PUBLIC_ROUTES.includes(path) || path.startsWith('/_next') || path.startsWith('/api/auth');
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options) => {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Sem sessao
  if (!user) {
    if (isPublic(path)) return response;
    const u = request.nextUrl.clone(); u.pathname = '/'; return NextResponse.redirect(u);
  }

  // Com sessao — checar onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();
  const completed = profile?.onboarding_completed === true;

  if (path === '/' || path === '/login' || path === '/signup') {
    const u = request.nextUrl.clone();
    u.pathname = completed ? APP_ROUTE : '/onboarding/perfil';
    return NextResponse.redirect(u);
  }
  if (!completed && !path.startsWith(ONBOARDING_ROUTES_PREFIX) && path !== DIAGNOSTIC_ROUTE && !isPublic(path)) {
    const u = request.nextUrl.clone(); u.pathname = '/onboarding/perfil'; return NextResponse.redirect(u);
  }
  if (completed && path.startsWith(ONBOARDING_ROUTES_PREFIX)) {
    const u = request.nextUrl.clone(); u.pathname = APP_ROUTE; return NextResponse.redirect(u);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 2: typecheck + commit**

```bash
npm run typecheck
git add src/middleware.ts
git commit -m "feat(auth): root middleware with onboarding-aware guard rules"
```

---

### Task 5: Tela `/` (boas-vindas) e shells `/login`, `/signup`, `/auth/callback`

**Files:**
- Modify: `src/app/page.tsx` (substituir conteúdo atual pelo design da spec 8.1)
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`
- Create: `src/app/signup/page.tsx`
- Create: `src/app/signup/actions.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/components/google-button.tsx`

- [ ] **Step 1: `src/app/page.tsx` — landing 8.1**

Layout: vertical centralizado, logo + heading + subtítulo + 2 CTAs (`<Link href="/auth/google">Entrar com Google</Link>` via Server Action OR `<form action={signInWithGoogle}>`, e `<Link href="/signup">Criar conta com email</Link>`) + link "Já tenho conta — entrar" → `/login` + rodapé com microcópia + links `/sobre /privacidade /termos`.

Botão Google usa Server Action que chama `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... }})` e devolve URL pra `redirect()`.

- [ ] **Step 2: `src/app/signup/page.tsx`** + `actions.ts`

Form (client component com React Hook Form + zod):
```typescript
const schema = z.object({
  display_name: z.string().min(1).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});
```

Action `signUpWithEmail` chama `supabase.auth.signUp({ email, password, options: { data: { display_name } }})`. Antes: `track('signup_started', { provider: 'email' })`. Sucesso: redirect para `/onboarding/perfil` (criação de profile acontece lá no passo 1, não aqui — mantém atomicidade do username).

Erros amigáveis: email duplicado → "Este email já tem conta. [Entrar]".

- [ ] **Step 3: `src/app/login/page.tsx`** + `actions.ts`

Form: email, senha. Action `signInWithEmail` → `supabase.auth.signInWithPassword`. Sucesso: redirect (middleware decide pra onde). Erro: toast com mensagem genérica "Email ou senha incorretos."

Link discreto "Esqueci a senha" → `mailto:eng.arocha@gmail.com?subject=Recuperar+senha+APROVA`.

- [ ] **Step 4: `src/app/auth/callback/route.ts` (OAuth)**

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // middleware decide se vai pra /onboarding ou /dashboard
  return NextResponse.redirect(`${origin}/`);
}
```

- [ ] **Step 5: `src/components/google-button.tsx`**

Client component que ao click chama Server Action `signInWithGoogle()`. Action retorna URL OAuth → faz `redirect(url)`. Inclui ícone Google (svg inline) à esquerda.

- [ ] **Step 6: typecheck + lint + build**

```bash
npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 7: commit**

```bash
git add src/app/page.tsx src/app/login src/app/signup src/app/auth src/components/google-button.tsx
git commit -m "feat(auth): landing, signup, login pages with email and Google OAuth"
```

---

### Task 6: Onboarding shell + Stepper

**Files:**
- Create: `src/app/onboarding/layout.tsx` (Server Component que checa user existe e renderiza Stepper)
- Create: `src/components/onboarding-stepper.tsx`

- [ ] **Step 1: Stepper visual (3 dots conectados, indicador de step atual)**

Props: `current: 1 | 2 | 3`. Implementação Tailwind, sem deps.

- [ ] **Step 2: Layout `/onboarding/*`**

Container max-w-md mx-auto, padding vertical generoso, Stepper no topo (current vem de prop ou de URL). Sem header/footer global.

- [ ] **Step 3: typecheck + commit**

```bash
git add src/app/onboarding/layout.tsx src/components/onboarding-stepper.tsx
git commit -m "feat(onboarding): shell layout with 3-step visual stepper"
```

---

### Task 7: Passo 1 — `/onboarding/perfil` (username com validação async)

**Files:**
- Create: `src/app/onboarding/perfil/page.tsx`
- Create: `src/app/onboarding/perfil/actions.ts`
- Create: `src/components/username-field.tsx`
- Create: `src/app/api/username-available/route.ts` (route handler GET para check de disponibilidade)

- [ ] **Step 1: API `GET /api/username-available?u=xxx`**

Server route com `createServerClient` que faz `select 1 from profiles where username = $1` e retorna `{ available: boolean }`. Valida regex+length antes da query (400 se inválido).

- [ ] **Step 2: `username-field.tsx` (client component)**

Input + estado debounced (300ms) que chama `fetch('/api/username-available?u=' + value)`. Estados: idle/checking/available/taken/invalid. Visual: borda colorida + ícone à direita.

- [ ] **Step 3: `actions.ts` — Server Action `submitProfile(formData)`**

```typescript
'use server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
});

export async function submitProfile(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Username inválido.' };

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const display_name = (user.user_metadata?.display_name as string | undefined)
    ?? user.email?.split('@')[0]
    ?? parsed.data.username;

  // upsert profile (cria se nao existe)
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: parsed.data.username,
      display_name,
      daily_goal_questions: 20,
      is_public_in_leaderboard: true,
      onboarding_completed: false,
    }, { onConflict: 'id' });
  if (error) {
    if (error.code === '23505') return { error: 'Este username já está em uso.' };
    return { error: 'Erro inesperado. Tente novamente.' };
  }

  // criar streaks row
  await supabase.from('streaks').upsert({
    user_id: user.id, current_streak: 0, longest_streak: 0,
  }, { onConflict: 'user_id' });

  // signup_completed track via API instrumentation? — chamar em client após redirect
  return { ok: true };
}
```

Track `signup_completed` e `onboarding_step_completed` no client após sucesso (page tem `useFormState` + `useEffect` que dispara `track()`).

- [ ] **Step 4: `page.tsx`**

Heading "Como devemos te chamar?", `<UsernameField />`, botão "Próximo" (disabled enquanto não disponível). Submit → redirect `/onboarding/meta`.

- [ ] **Step 5: typecheck + commit**

```bash
git add src/app/onboarding/perfil src/components/username-field.tsx src/app/api/username-available
git commit -m "feat(onboarding): step 1 username with async availability check"
```

---

### Task 8: Passo 2 — `/onboarding/meta` (RadioGroup com 3 opções)

**Files:**
- Create: `src/app/onboarding/meta/page.tsx`
- Create: `src/app/onboarding/meta/actions.ts`

- [ ] **Step 1: Form com RadioGroup, opções 10/20/40, default 20**

Cards grandes selecionáveis (RadioGroupItem estilizado). Label visível, `<Label>` envolvendo cada opção.

- [ ] **Step 2: Action `submitMeta`**

```typescript
const schema = z.object({ daily_goal: z.coerce.number().int().refine(v => [10,20,40].includes(v)) });
// update profiles.daily_goal_questions
```

Track `onboarding_step_completed` com `step: 2`. Redirect `/onboarding/privacidade`.

- [ ] **Step 3: typecheck + commit**

```bash
git add src/app/onboarding/meta
git commit -m "feat(onboarding): step 2 daily goal selection"
```

---

### Task 9: Passo 3 — `/onboarding/privacidade` + tela diagnóstico CTA

**Files:**
- Create: `src/app/onboarding/privacidade/page.tsx`
- Create: `src/app/onboarding/privacidade/actions.ts`
- Create: `src/app/onboarding/diagnostico/page.tsx`
- Create: `src/app/onboarding/diagnostico/actions.ts`

- [ ] **Step 1: Privacidade — `<Switch>` + microcópia explicativa**

Action `submitPrivacy({ leaderboard: boolean })`. Track `onboarding_step_completed` com `step: 3`. Redirect `/onboarding/diagnostico`.

- [ ] **Step 2: Tela `/onboarding/diagnostico` — microcópia "recorte original como feature"**

Layout: card destacado com ícone de relógio/quadrado de prova + texto:

> **Antes de começar, uma observação importante.**
> As questões aparecem no formato original da prova oficial — mesma diagramação, mesma tipografia, mesmo espaçamento. Você chega no dia do vestibular acostumado.

Dois CTAs:
- **"Fazer diagnóstico (5 questões)"** primário → action `startDiagnostic` que cria `study_sessions` (`type='diagnostic'`) + redirect `/diagnostico`
- **"Pular pro app"** secundário → action `skipDiagnostic` que marca `profiles.onboarding_completed=true` + redirect `/dashboard`

Track `onboarding_finished` com `did_diagnostic: boolean` em ambos.

- [ ] **Step 3: typecheck + commit**

```bash
git add src/app/onboarding/privacidade src/app/onboarding/diagnostico
git commit -m "feat(onboarding): step 3 privacy toggle and diagnostic CTA card"
```

---

### Task 10: `/diagnostico` (5 questões calibradas)

**Files:**
- Create: `src/app/diagnostico/page.tsx` (Server Component que carrega 5 questões via RPC)
- Create: `src/app/diagnostico/answer-action.ts`
- Create: `src/components/diagnostic-runner.tsx` (client component que orquestra as 5)

- [ ] **Step 1: Server Component carrega questões e session_id**

```tsx
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();
const { data: questions } = await supabase.rpc('get_diagnostic_questions');
const { data: session } = await supabase
  .from('study_sessions')
  .insert({ user_id: user.id, type: 'diagnostic' })
  .select().single();
return <DiagnosticRunner questions={questions} sessionId={session.id} />;
```

(Se `study_sessions` já foi criado no `startDiagnostic`, reusar; caso contrário criar aqui.)

- [ ] **Step 2: `<DiagnosticRunner>` (client)**

State local: `currentIndex`, `answers[]`, `startedAt`. Renderiza imagem (Next/Image), 5 botões A–E. Click registra resposta + transição (sem feedback verde/vermelho — só na 5ª mostra resultado consolidado).

Track `diagnostic_started` no mount, `diagnostic_completed` ao final com `score` e `time_total_sec`.

- [ ] **Step 3: `answer-action.ts` Server Action `submitAnswer({ session_id, question_id, answer, time_spent_sec })`**

Insert em `attempts` com `context='diagnostic'`. Trigger ignora pra XP/streak (Task 1).

- [ ] **Step 4: Tela final**

Após 5ª: card com "X de 5 acertos", breakdown por disciplina, botão "Ir pro dashboard" que chama action `finishDiagnostic` (marca `profiles.onboarding_completed=true`, atualiza `study_sessions.ended_at`, `total_questions`, `correct_count`).

- [ ] **Step 5: typecheck + commit**

```bash
git add src/app/diagnostico src/components/diagnostic-runner.tsx
git commit -m "feat(diagnostic): 5-question calibrated assessment with no XP impact"
```

---

### Task 11: `/dashboard` placeholder + UserMenu (logout)

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/user-menu.tsx`
- Create: `src/app/dashboard/logout-action.ts`

- [ ] **Step 1: Header com greeting + ThemeToggle + UserMenu (dropdown com Sair)**

Server Component carrega profile (display_name, current_streak via streaks table).

```tsx
<header>
  <h1>Olá, {display_name}</h1>
  <p>{current_streak === 0 ? 'Comece sua sequência hoje' : `${current_streak} dias seguidos`}</p>
  <ThemeToggle /> <UserMenu />
</header>
<main>
  <Card>
    <CardTitle>Em breve seu progresso aparece aqui.</CardTitle>
    <Button disabled>Resolver questões aleatórias</Button>
  </Card>
</main>
```

- [ ] **Step 2: UserMenu (DropdownMenu com items: Configurações [disabled], Sair)**

Click em "Sair" chama Server Action `logout()` → `supabase.auth.signOut()` + `redirect('/')`.

- [ ] **Step 3: typecheck + lint + build**

- [ ] **Step 4: commit**

```bash
git add src/app/dashboard src/components/user-menu.tsx
git commit -m "feat(dashboard): placeholder walking skeleton with logout"
```

---

### Task 12: Setup Google OAuth no Supabase Dashboard (manual + doc)

**Files:**
- Create: `docs/setup/google-oauth.md` (instrução para o user)

- [ ] **Step 1: Criar `docs/setup/google-oauth.md`**

Passos para o user:
1. https://console.cloud.google.com/apis/credentials → Create OAuth client → Web application
2. Authorized redirect URI: `https://udajthekofnfewuxxdcq.supabase.co/auth/v1/callback`
3. Copiar Client ID + Client Secret
4. Supabase dashboard → Auth → Providers → Google → habilitar + colar ID/Secret
5. Site URL e Redirect URLs no Supabase: `https://aprova-five.vercel.app`, `http://localhost:3000`

- [ ] **Step 2: commit**

```bash
git add docs/setup/google-oauth.md
git commit -m "docs(setup): Google OAuth provider instructions"
```

(Implementer **não** executa o setup OAuth; documenta para o user fazer manualmente. Email+senha funciona sem Google config.)

---

### Task 13: Validação E2E manual + deploy

**Files:**
- Modify: `docs/superpowers/plans/2026-05-02-pr4-auth-onboarding.md` (marcar checkboxes finais)

- [ ] **Step 1: Build + deploy**

```bash
npm run typecheck && npm run lint && npm run build
vercel --prod --yes
```

- [ ] **Step 2: Smoke test manual em produção**

Em https://aprova-five.vercel.app:
1. Acessar `/dashboard` deslogado → redirect `/`
2. Click "Criar conta com email" → preencher → submit
3. Verificar email no `auth.users` no dashboard Supabase
4. Onboarding 3 passos sem erro
5. Tela "Pronto pro diagnóstico?" — clicar "Pular pro app" → cair em `/dashboard`
6. Verificar no DB:
   ```sql
   select id, username, onboarding_completed from profiles where id = (select id from auth.users order by created_at desc limit 1);
   select * from streaks where user_id = ...;
   ```
7. Logout → redirect `/`
8. Login com email/senha → cai direto em `/dashboard`
9. Repetir cadastro novo, escolher diagnóstico → 5 questões → resultado → dashboard
10. Verificar no DB: `select count(*) from attempts where context='diagnostic' and user_id=...`  → 5; `select * from weekly_xp where user_id=...` → vazio (XP zerado).

- [ ] **Step 3: Verificar PostHog**

Dashboard PostHog → Events → confirmar fluxo: `signup_started`, `signup_completed`, `onboarding_step_completed×3`, `onboarding_finished`, `diagnostic_started`, `diagnostic_completed`.

- [ ] **Step 4: commit final + tag**

```bash
git tag pr4-auth-onboarding
git push origin pr4-auth-onboarding
```

---

## Self-Review (executar após escrever todas as tasks)

- [ ] Spec coverage check: cada item da spec PR 4 tem task correspondente?
- [ ] Placeholder scan: nenhum "TODO", "TBD", "implement later"?
- [ ] Type consistency: `onboarding_completed`, `study_sessions.type='diagnostic'`, `attempts.context='diagnostic'` aparecem com mesmos nomes em todas as tasks que mencionam.
- [ ] Eventos PostHog: todos os 6 do PRD §13 instrumentados?
- [ ] Critério de pronto da spec: todos os 13 itens cobertos pelas tasks?
