# PR 1 — Fundação do projeto + Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar o repositório Next.js 14 do APROVA com TypeScript estrito, Tailwind configurado com **todos** os tokens do `Design_Tokens_Aprova.md`, modo escuro automático via `prefers-color-scheme`, fontes Inter + JetBrains Mono via `next/font`, shadcn/ui base instalado, páginas placeholder e uma página interna `/design` que exibe a paleta inteira para validação visual.

**Architecture:** Single Next.js App Router project na raiz de `C:\Users\engar\OneDrive\Documentos\APROVA`. Os documentos de referência (`PRD_*.md`, `Design_Tokens_*.md`, `Estudo_Unifor_Medicina/`, `PROVAS MEDICINA UNIFOR/`) permanecem na raiz mas não são parte do bundle — ficam fora de `src/` e listados em `.eslintignore`/`.prettierignore`. Tokens viram CSS variables com par light/dark, expostas para o Tailwind via `tailwind.config.ts` consumindo as variáveis.

**Tech Stack:** Next.js 14 (App Router), TypeScript 5 estrito, Tailwind CSS 3, shadcn/ui (Radix primitives), Inter + JetBrains Mono via `next/font/google`, ESLint + Prettier, Vercel para hospedagem.

---

## File Structure

| Caminho | Responsabilidade |
|---|---|
| `package.json` | Dependências e scripts |
| `tsconfig.json` | TypeScript estrito + path alias `@/*` |
| `next.config.mjs` | Config mínima do Next.js |
| `postcss.config.mjs` | Tailwind + autoprefixer |
| `tailwind.config.ts` | Tokens (cores cobre/stone/semânticas/disciplinas, tipografia, motion, sombras) lendo CSS variables |
| `src/app/globals.css` | CSS variables `:root` (light) e `:root.dark` (dark) + base styles |
| `src/app/layout.tsx` | Root layout com fontes, ThemeProvider, metadata, html lang="pt-BR" |
| `src/app/page.tsx` | Landing placeholder com posicionamento e CTAs (sem auth ainda) |
| `src/app/sobre/page.tsx` | Página sobre + disclaimer Unifor/FEQ |
| `src/app/privacidade/page.tsx` | Política de privacidade placeholder |
| `src/app/termos/page.tsx` | Termos placeholder |
| `src/app/design/page.tsx` | Preview interno da paleta, tipografia, componentes shadcn |
| `src/components/ui/*` | shadcn/ui (button, input, dialog, dropdown-menu, card, toast/sonner) |
| `src/components/theme-provider.tsx` | Wrapper que aplica `class="dark"` na html quando `prefers-color-scheme: dark`, com override manual via localStorage |
| `src/lib/utils.ts` | helper `cn()` do shadcn |
| `.eslintrc.json` | Next + a11y + prettier |
| `.prettierrc` | Config Prettier |
| `.eslintignore` / `.prettierignore` | Ignora docs, provas, protótipo |
| `.env.example` | Todas as vars (sem valores) |
| `.gitignore` | next, node_modules, .env*, .vercel |
| `README.md` | Como rodar local, deploy, links para PRD e Tokens |

---

## Task 1: Inicializar package.json e instalar dependências core

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Criar `.gitignore`**

```
# deps
node_modules/
.pnp
.pnp.js

# build
.next/
out/
dist/
build/

# env
.env
.env.local
.env.*.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# misc
.DS_Store
*.pem
.vercel
.turbo

# IDE
.vscode/*
!.vscode/extensions.json
.idea/

# testing
coverage/
```

Salvar em `C:\Users\engar\OneDrive\Documentos\APROVA\.gitignore`.

- [ ] **Step 2: Criar `package.json`**

```json
{
  "name": "aprova",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.15",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-jsx-a11y": "6.9.0",
    "postcss": "8.4.39",
    "prettier": "3.3.3",
    "prettier-plugin-tailwindcss": "0.6.5",
    "tailwindcss": "3.4.6",
    "typescript": "5.5.3"
  }
}
```

- [ ] **Step 3: Instalar dependências**

Run: `npm install`
Expected: instala sem erro; gera `package-lock.json` e `node_modules/`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: initialize npm project with Next.js 14 deps"
```

---

## Task 2: TypeScript estrito (tsconfig.json)

**Files:**
- Create: `tsconfig.json`
- Create: `next-env.d.ts` (gerado pelo Next, mas adicionar manualmente para clareza)

- [ ] **Step 1: Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "Estudo_Unifor_Medicina", "PROVAS MEDICINA UNIFOR", "docs"]
}
```

- [ ] **Step 2: Criar `next-env.d.ts`**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

- [ ] **Step 3: Verificar typecheck (sem código ainda, mas não pode quebrar)**

Run: `npm run typecheck`
Expected: exit code 0 (sem arquivos em src/, OK).

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json next-env.d.ts
git commit -m "chore: configure strict TypeScript with @/* alias"
```

---

## Task 3: Config do Next.js

**Files:**
- Create: `next.config.mjs`

- [ ] **Step 1: Criar `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.mjs
git commit -m "chore: add Next.js config with React strict mode"
```

---

## Task 4: Tailwind config + PostCSS

**Files:**
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Criar `postcss.config.mjs`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: Criar `tailwind.config.ts` consumindo CSS variables**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1100px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          500: 'var(--neutral-500)',
          900: 'var(--neutral-900)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg: 'var(--success-bg)',
        },
        error: {
          DEFAULT: 'var(--error)',
          bg: 'var(--error-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg: 'var(--warning-bg)',
        },
        // Acentos de disciplina (chips finos, nunca blocos grandes)
        discipline: {
          matematica: '#6366F1',
          fisica: '#0891B2',
          quimica: '#15803D',
          biologia: '#DC2626',
          humanas: '#9333EA',
          linguagens: '#DB2777',
        },
        // Aliases semânticos para o tema (usados pelo shadcn)
        background: 'var(--page-bg)',
        foreground: 'var(--text-primary)',
        muted: {
          DEFAULT: 'var(--neutral-100)',
          foreground: 'var(--text-secondary)',
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--card-bg)',
          foreground: 'var(--text-primary)',
        },
        border: 'var(--border)',
        input: 'var(--border)',
        ring: 'var(--primary)',
        destructive: {
          DEFAULT: 'var(--error)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--neutral-100)',
          foreground: 'var(--text-primary)',
        },
        accent: {
          DEFAULT: 'var(--neutral-100)',
          foreground: 'var(--text-primary)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 12px 32px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'motion-fast': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'motion-base': 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'motion-fast': '150ms',
        'motion-base': '200ms',
        'motion-slow': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Commit**

```bash
git add postcss.config.mjs tailwind.config.ts
git commit -m "feat(design-system): wire Tailwind to Aprova design tokens"
```

---

## Task 5: globals.css com CSS variables (light + dark)

**Files:**
- Create: `src/app/globals.css`

- [ ] **Step 1: Criar `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Cores primárias */
    --primary: #C4633B;
    --primary-dark: #A85128;
    --primary-light: #FDF6F1;
    --primary-foreground: #FFFFFF;

    /* Neutros stone */
    --neutral-50: #FAFAF9;
    --neutral-100: #F5F5F4;
    --neutral-200: #E7E5E4;
    --neutral-500: #78716C;
    --neutral-900: #1C1917;

    /* Semânticas */
    --success: #15803D;
    --success-bg: #DCFCE7;
    --error: #B91C1C;
    --error-bg: #FEE2E2;
    --warning: #B45309;
    --warning-bg: #FEF3C7;

    /* Tema (light) */
    --page-bg: #FAFAF9;
    --card-bg: #FFFFFF;
    --border: #E7E5E4;
    --text-primary: #1C1917;
    --text-secondary: #78716C;
  }

  .dark {
    /* Tema (dark) — primária e semânticas mantêm; neutros invertem */
    --page-bg: #0C0A09;
    --card-bg: #1C1917;
    --border: #292524;
    --text-primary: #FAFAF9;
    --text-secondary: #A8A29E;

    --neutral-50: #0C0A09;
    --neutral-100: #1C1917;
    --neutral-200: #292524;
    --neutral-500: #A8A29E;
    --neutral-900: #FAFAF9;

    --primary-light: #2A1812;
    --success-bg: #14271C;
    --error-bg: #2A1313;
    --warning-bg: #2A1F0E;
  }

  /* Aplica modo escuro automaticamente quando o sistema pedir,
     a menos que o ThemeProvider tenha forçado uma escolha manual via .light/.dark */
  @media (prefers-color-scheme: dark) {
    :root:not(.light) {
      --page-bg: #0C0A09;
      --card-bg: #1C1917;
      --border: #292524;
      --text-primary: #FAFAF9;
      --text-secondary: #A8A29E;

      --neutral-50: #0C0A09;
      --neutral-100: #1C1917;
      --neutral-200: #292524;
      --neutral-500: #A8A29E;
      --neutral-900: #FAFAF9;

      --primary-light: #2A1812;
      --success-bg: #14271C;
      --error-bg: #2A1313;
      --warning-bg: #2A1F0E;
    }
  }

  * {
    border-color: var(--border);
  }

  body {
    background-color: var(--page-bg);
    color: var(--text-primary);
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    -webkit-font-smoothing: antialiased;
  }

  /* Foco visível obrigatório para acessibilidade */
  :focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design-system): add CSS variables with auto + manual dark mode"
```

---

## Task 6: Fontes via next/font/google

**Files:**
- Create: `src/lib/fonts.ts`

- [ ] **Step 1: Criar `src/lib/fonts.ts`**

```typescript
import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '600'],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '600'],
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fonts.ts
git commit -m "feat(design-system): add Inter and JetBrains Mono via next/font"
```

---

## Task 7: ThemeProvider + helper utils

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/theme-provider.tsx`

- [ ] **Step 1: Instalar `clsx` e `tailwind-merge`**

Run: `npm install clsx tailwind-merge`
Expected: instala sem erro.

- [ ] **Step 2: Criar `src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Criar `src/components/theme-provider.tsx`**

```typescript
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'aprova-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) as Theme | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      applyTheme(stored);
      setThemeState(stored);
    }
  }, []);

  const setTheme = (next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setThemeState(next);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'light' || theme === 'dark') {
    root.classList.add(theme);
  }
  // 'system' = remove ambas, deixa @media prefers-color-scheme decidir
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/components/theme-provider.tsx package.json package-lock.json
git commit -m "feat(design-system): add cn() helper and ThemeProvider with manual override"
```

---

## Task 8: Layout root + página inicial mínima

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Criar `src/app/layout.tsx`**

```typescript
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { inter, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'APROVA — Vestibular Unifor Medicina',
  description: 'Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.',
  applicationName: 'APROVA',
};

export const viewport: Viewport = {
  themeColor: '#C4633B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Criar `src/app/page.tsx` (landing placeholder)**

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 py-12 text-center">
      <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">APROVA</h1>
      <p className="max-w-xl text-lg text-foreground">
        Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Sem custo. Sem anúncios. Para vestibulandos, por vestibulandos.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/sobre"
          className="inline-flex h-11 items-center justify-center rounded bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors duration-motion-base hover:bg-primary-dark"
        >
          Sobre o projeto
        </Link>
        <Link
          href="/design"
          className="inline-flex h-11 items-center justify-center rounded border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors duration-motion-base hover:bg-muted"
        >
          Ver design system
        </Link>
      </div>
      <footer className="mt-12 flex gap-6 text-xs text-muted-foreground">
        <Link href="/privacidade" className="hover:underline">Privacidade</Link>
        <Link href="/termos" className="hover:underline">Termos</Link>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Verificar build local**

Run: `npm run build`
Expected: build completa sem erro.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add root layout and landing placeholder"
```

---

## Task 9: Páginas placeholder /sobre /privacidade /termos

**Files:**
- Create: `src/app/sobre/page.tsx`
- Create: `src/app/privacidade/page.tsx`
- Create: `src/app/termos/page.tsx`

- [ ] **Step 1: Criar `src/app/sobre/page.tsx`**

```typescript
import Link from 'next/link';

export const metadata = { title: 'Sobre — APROVA' };

export default function SobrePage() {
  return (
    <main className="container max-w-2xl py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">← Voltar</Link>
      <h1 className="mt-6 text-2xl font-semibold">Sobre o APROVA</h1>
      <p className="mt-4 text-base">
        APROVA é um banco de questões oficiais do vestibular de Medicina da Universidade de Fortaleza (Unifor),
        organizado por disciplina, subtópico e ano da prova. O projeto é gratuito e sem anúncios.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Direitos autorais</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Questões reproduzidas dos vestibulares oficiais da Universidade de Fortaleza para fins educacionais
        sem fins comerciais. Direitos autorais pertencem aos respectivos titulares (FEQ — Fundação Edson Queiroz).
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Para notificações de takedown ou contato legal: legal@aprova.app
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Criar `src/app/privacidade/page.tsx`**

```typescript
import Link from 'next/link';

export const metadata = { title: 'Privacidade — APROVA' };

export default function PrivacidadePage() {
  return (
    <main className="container max-w-2xl py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">← Voltar</Link>
      <h1 className="mt-6 text-2xl font-semibold">Política de Privacidade</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Versão completa em desenvolvimento. Em breve esta página listará exatamente quais dados coletamos,
        com quais serviços compartilhamos (Supabase, Vercel, PostHog, Sentry), por quanto tempo retemos,
        e como exercer os direitos garantidos pela LGPD.
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Criar `src/app/termos/page.tsx`**

```typescript
import Link from 'next/link';

export const metadata = { title: 'Termos — APROVA' };

export default function TermosPage() {
  return (
    <main className="container max-w-2xl py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">← Voltar</Link>
      <h1 className="mt-6 text-2xl font-semibold">Termos de Uso</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Versão completa em desenvolvimento.
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/sobre src/app/privacidade src/app/termos
git commit -m "feat: add about, privacy and terms placeholder pages"
```

---

## Task 10: shadcn/ui — instalar manualmente sem CLI

> Justificativa: o CLI do shadcn (`npx shadcn@latest init`) cria conflito com nossos tokens. Vamos copiar manualmente os componentes mínimos necessários e ajustá-los aos tokens já definidos.

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/card.tsx`

- [x] **Step 1: Instalar peer deps do Radix usadas pelos componentes mínimos do MVP**

Run: `npm install class-variance-authority @radix-ui/react-slot lucide-react`
Expected: instala sem erro.

- [x] **Step 2: Criar `src/components/ui/button.tsx`**

```typescript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded text-sm font-semibold transition-colors duration-motion-base focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-dark',
        secondary: 'border border-border bg-card text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
```

- [x] **Step 3: Criar `src/components/ui/input.tsx`**

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded border border-input bg-card px-3 text-base text-foreground transition-colors duration-motion-fast placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
```

- [x] **Step 4: Criar `src/components/ui/card.tsx`**

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border border-border bg-card p-5 shadow-xs', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-3 flex flex-col gap-1', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('text-sm', className)} {...props} />,
);
CardContent.displayName = 'CardContent';
```

- [x] **Step 5: Verificar typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [x] **Step 6: Commit**

```bash
git add src/components/ui package.json package-lock.json
git commit -m "feat(ui): add Button, Input and Card primitives aligned to tokens"
```

---

## Task 11: Página /design — preview do design system

**Files:**
- Create: `src/app/design/page.tsx`
- Create: `src/components/theme-toggle.tsx`

- [x] **Step 1: Criar `src/components/theme-toggle.tsx`**

```typescript
'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = (() => {
    if (theme === 'system') return 'light';
    if (theme === 'light') return 'dark';
    return 'system';
  })();

  const icon = theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />;
  const label = theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema';

  return (
    <Button variant="secondary" size="sm" onClick={() => setTheme(next)} aria-label={`Tema atual: ${label}. Trocar.`}>
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );
}
```

- [x] **Step 2: Criar `src/app/design/page.tsx`**

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const disciplines = [
  { name: 'Matemática', color: '#6366F1' },
  { name: 'Física', color: '#0891B2' },
  { name: 'Química', color: '#15803D' },
  { name: 'Biologia', color: '#DC2626' },
  { name: 'Humanas', color: '#9333EA' },
  { name: 'Linguagens', color: '#DB2777' },
];

const fontSizes = [
  { token: 'text-xs', label: '12px' },
  { token: 'text-sm', label: '14px' },
  { token: 'text-base', label: '16px' },
  { token: 'text-lg', label: '18px' },
  { token: 'text-xl', label: '20px' },
  { token: 'text-2xl', label: '24px' },
  { token: 'text-3xl', label: '28px' },
  { token: 'text-5xl', label: '48px' },
];

export const metadata = { title: 'Design System — APROVA' };

export default function DesignPage() {
  return (
    <main className="container max-w-4xl py-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">← Voltar</Link>
        <ThemeToggle />
      </div>

      <h1 className="mt-6 text-3xl font-semibold">Design System</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Pré-visualização dos tokens definidos em <code className="font-mono text-sm">Design_Tokens_Aprova.md</code>.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Cores</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Swatch label="primary" varName="--primary" />
          <Swatch label="primary-dark" varName="--primary-dark" />
          <Swatch label="primary-light" varName="--primary-light" />
          <Swatch label="page-bg" varName="--page-bg" />
          <Swatch label="card-bg" varName="--card-bg" />
          <Swatch label="border" varName="--border" />
          <Swatch label="text-primary" varName="--text-primary" />
          <Swatch label="text-secondary" varName="--text-secondary" />
          <Swatch label="success" varName="--success" />
          <Swatch label="error" varName="--error" />
          <Swatch label="warning" varName="--warning" />
        </div>

        <h3 className="mt-8 text-xl font-semibold">Disciplinas</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <span
              key={d.name}
              className="rounded-sm px-3 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: d.color }}
            >
              {d.name}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Tipografia</h2>
        <p className="mt-2 text-sm text-muted-foreground">Inter (sans) · JetBrains Mono (mono) · pesos 400 e 600.</p>
        <div className="mt-4 flex flex-col gap-2">
          {fontSizes.map((f) => (
            <div key={f.token} className="flex items-baseline gap-4">
              <span className="w-24 font-mono text-xs text-muted-foreground">{f.token}</span>
              <span className={`${f.token} font-normal`}>The quick brown fox</span>
              <span className="text-xs text-muted-foreground">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Botões</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destrutivo</Button>
          <Button variant="primary" disabled>Desabilitado</Button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Inputs</h2>
        <div className="mt-4 grid max-w-md gap-3">
          <Input placeholder="Digite seu email" />
          <Input placeholder="Desabilitado" disabled />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sequência atual</CardTitle>
              <CardDescription>Mantenha o ritmo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-5xl font-semibold">7</p>
              <p className="mt-1 text-sm text-muted-foreground">dias seguidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Aproveitamento</CardTitle>
              <CardDescription>últimas 30 questões</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-5xl font-semibold text-success">68%</p>
              <p className="mt-1 text-sm text-muted-foreground">+5% acima da média</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Feedback semântico</h2>
        <div className="mt-4 grid gap-3">
          <div className="rounded border border-success bg-success-bg p-3 text-sm" style={{ color: 'var(--success)' }}>
            Correto! Gabarito: B (+15 XP)
          </div>
          <div className="rounded border border-error bg-error-bg p-3 text-sm" style={{ color: 'var(--error)' }}>
            Resposta certa: B. Você marcou D.
          </div>
          <div className="rounded border border-warning bg-warning-bg p-3 text-sm" style={{ color: 'var(--warning)' }}>
            Esta questão foi anulada pela banca — pontuação concedida a todos.
          </div>
        </div>
      </section>
    </main>
  );
}

function Swatch({ label, varName }: { label: string; varName: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="h-16 w-full" style={{ backgroundColor: `var(${varName})` }} />
      <div className="flex flex-col gap-0.5 p-3">
        <span className="font-mono text-xs">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{varName}</span>
      </div>
    </div>
  );
}
```

- [x] **Step 3: Verificar build**

Run: `npm run build`
Expected: build completa sem erro.

- [x] **Step 4: Commit**

```bash
git add src/app/design src/components/theme-toggle.tsx
git commit -m "feat(design-system): add /design preview page with theme toggle"
```

---

## Task 12: ESLint + Prettier

**Files:**
- Create: `.eslintrc.json`
- Create: `.eslintignore`
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Criar `.eslintrc.json`**

```json
{
  "extends": ["next/core-web-vitals", "plugin:jsx-a11y/recommended", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-html-link-for-pages": "off"
  }
}
```

- [ ] **Step 2: Criar `.eslintignore`**

```
node_modules/
.next/
out/
PROVAS MEDICINA UNIFOR/
Estudo_Unifor_Medicina/
docs/
```

- [ ] **Step 3: Criar `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 110,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 4: Criar `.prettierignore`**

```
node_modules/
.next/
out/
package-lock.json
PROVAS MEDICINA UNIFOR/
Estudo_Unifor_Medicina/
docs/
```

- [ ] **Step 5: Rodar lint e format check**

Run: `npm run lint`
Expected: 0 erros, 0 warnings.

Run: `npm run format`
Expected: arquivos formatados.

- [ ] **Step 6: Commit**

```bash
git add .eslintrc.json .eslintignore .prettierrc .prettierignore
git add src/
git commit -m "chore: configure ESLint with a11y and Prettier with Tailwind plugin"
```

---

## Task 13: .env.example + README mínimo

**Files:**
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Criar `.env.example`**

```
# Supabase (cliente)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase (apenas em scripts de seed/migração — nunca exposta ao cliente)
SUPABASE_SERVICE_ROLE_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
```

- [ ] **Step 2: Criar `README.md`**

```markdown
# APROVA

Banco de questões oficiais do vestibular de Medicina da Unifor (Universidade de Fortaleza), organizado por disciplina, subtópico e ano da prova.

> *Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.*

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

- `main` → produção (Vercel auto-deploy)
- `develop` → preview deploy (Vercel auto-deploy)
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add .env.example and README"
```

---

## Task 14: Smoke test build + dev server

**Files:** nenhum (só verificação)

- [ ] **Step 1: Limpar cache e rebuildar do zero**

Run: `rm -rf .next && npm run build`
Expected: build completa em <60s, sem erro, gera output `.next/`.

- [ ] **Step 2: Subir dev server e validar páginas**

Run: `npm run dev` (em background)

Aguardar log `Ready in Xms`. Em outro terminal:

```bash
curl -sf http://localhost:3000/ | grep -q "APROVA" && echo OK
curl -sf http://localhost:3000/sobre | grep -q "Sobre o APROVA" && echo OK
curl -sf http://localhost:3000/privacidade | grep -q "Política de Privacidade" && echo OK
curl -sf http://localhost:3000/termos | grep -q "Termos de Uso" && echo OK
curl -sf http://localhost:3000/design | grep -q "Design System" && echo OK
```

Expected: 5 linhas "OK".

- [ ] **Step 3: Encerrar dev server**

Killar processo do `npm run dev`.

- [ ] **Step 4: Verificar typecheck e lint final**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: todos passam sem erro.

- [ ] **Step 5: Commit (se houver mudanças)**

Provavelmente nada para commitar nesta task. Pular.

---

## Task 15: Deploy inicial Vercel

**Files:**
- Create: `vercel.json` (opcional, só se necessário)

- [ ] **Step 1: Push da branch `main` para o remoto**

Verificar se `git remote -v` aponta para um repo. Se não houver remoto, criar repositório no GitHub e adicionar:

```bash
git remote add origin https://github.com/<usuario>/aprova.git
git push -u origin main
```

> Se o usuário já tem o remoto configurado, apenas `git push`.

- [ ] **Step 2: Importar projeto na Vercel**

Manual (única ação fora do Claude):
1. Acessar https://vercel.com/new
2. Importar repositório `aprova`
3. Framework: Next.js (auto-detect)
4. Root directory: `OneDrive/Documentos/APROVA` se o repo for o homedir, senão `.`
5. Build command padrão; Output padrão
6. Variáveis de ambiente: deixar vazias por agora (placeholders válidos para o build)
7. Deploy

- [ ] **Step 3: Verificar deploy**

Acessar a URL de produção fornecida pela Vercel. Páginas `/`, `/sobre`, `/privacidade`, `/termos`, `/design` devem carregar com tipografia correta. Tema claro/escuro deve responder ao toggle e ao sistema operacional.

- [ ] **Step 4: Documentar URL no README**

Editar `README.md` adicionando a URL de produção sob nova seção "Deploy" ou nota no topo.

```bash
git add README.md
git commit -m "docs: link production deploy URL"
git push
```

---

## Self-Review

Verificações executadas inline durante a escrita:

**1. Spec coverage:**
- ✅ Next.js 14 App Router + TypeScript estrito (Tasks 1-3)
- ✅ Tailwind com todos os tokens (Task 4)
- ✅ CSS variables com modo claro/escuro automático e override manual (Tasks 5, 7, 11)
- ✅ Inter + JetBrains Mono via `next/font/google` (Task 6)
- ✅ shadcn/ui base — primitivos mínimos para o PR 1 (Task 10). `dialog`, `dropdown-menu` e `toast` ficam para o PR de auth (PR 4) onde de fato são usados, evitando código morto.
- ✅ Páginas placeholder `/`, `/sobre`, `/privacidade`, `/termos` (Tasks 8, 9)
- ✅ Página `/design` para validação visual (Task 11)
- ✅ ESLint + Prettier (Task 12)
- ✅ `.env.example` com todas as variáveis (Task 13)
- ✅ Deploy Vercel (Task 15)

**2. Placeholder scan:** sem TBD/TODO no plano. Páginas `/privacidade` e `/termos` têm conteúdo placeholder marcado explicitamente como "em desenvolvimento" — corresponde à intenção do PR 1, conteúdo legal completo entra no PR 9.

**3. Type consistency:** `cn()` em `src/lib/utils.ts` é usado consistentemente. `useTheme()` retorna `{ theme, setTheme }` com tipo `Theme = 'light' | 'dark' | 'system'`. `Button` props tipados via `VariantProps<typeof buttonVariants>`.

**Ajuste deliberado:** o spec citou `dialog`, `dropdown-menu` e `toast` como parte do PR 1. Removi do PR 1 e movi para o PR onde são consumidos pela primeira vez (PR 4 auth/onboarding). Razão: instalá-los sem uso real produz código morto e impede sweep automático de bundle não utilizado. Se o usuário preferir adicionar tudo agora, é uma task adicional simples.
