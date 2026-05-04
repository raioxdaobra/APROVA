import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OAuthErrorToast } from '@/components/oauth-error-toast';
import { signInWithGoogle } from '@/app/(auth-actions)/google';

/**
 * Hero da landing: gradient cobre→stone animado, headline forte, CTAs.
 * Server Component — usa form action para Google OAuth (escondido por feature flag).
 */
export function HeroSection() {
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Gradient animado de fundo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-light via-background to-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196,99,59,0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(168,81,40,0.12), transparent 70%)',
        }}
      />
      {/* Grid sutil em cima do gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <Suspense fallback={null}>
        <OAuthErrorToast />
      </Suspense>

      <div className="container mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          Plataforma oficial de preparação Unifor Medicina
        </span>

        <h1
          id="hero-title"
          className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          Resolva mais de{' '}
          <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
            1.000 questões
          </span>{' '}
          da Unifor Medicina.
        </h1>

        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          20 anos de provas oficiais, organizadas por matéria e ano. Com IA pra tirar suas dúvidas
          na hora — em qualquer questão, a qualquer momento.
        </p>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="group relative w-full overflow-hidden shadow-[0_0_40px_-12px_rgba(196,99,59,0.6)] hover:shadow-[0_0_50px_-8px_rgba(196,99,59,0.8)] sm:w-auto"
          >
            <Link href="/signup">
              <span className="relative z-10">Começar grátis</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </Link>
          </Button>

          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <a href="#features">Como funciona</a>
          </Button>
        </div>

        {googleEnabled ? (
          <form action={signInWithGoogle} className="w-full max-w-xs">
            <Button type="submit" variant="ghost" size="md" className="w-full gap-2 text-sm">
              <GoogleIcon />
              Entrar com Google
            </Button>
          </form>
        ) : null}

        <Link
          href="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Já tenho conta — entrar
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Sem cartão para começar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Cancela quando quiser
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Feito em Fortaleza
          </span>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="currentColor"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.8595-3.0477.8595-2.344 0-4.3282-1.5832-5.036-3.7104H.9573v2.3318C2.4382 15.9831 5.4818 18 9 18z"
      />
      <path
        fill="currentColor"
        d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="currentColor"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}
