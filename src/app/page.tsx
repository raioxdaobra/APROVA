import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InstallPrompt } from '@/components/install-prompt';
import { OAuthErrorToast } from '@/components/oauth-error-toast';
import { signInWithGoogle } from '@/app/(auth-actions)/google';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <Suspense fallback={null}>
        <OAuthErrorToast />
      </Suspense>

      <h1 className="text-5xl font-semibold tracking-tight text-primary">APROVA</h1>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-[28px]">
          Resolva mais de 1.000 questões da Unifor Medicina.
        </h2>
        <p className="text-sm text-muted-foreground">
          20 anos de vestibular, organizados por matéria.
        </p>
      </div>

      <div className="flex w-4/5 max-w-[360px] flex-col gap-3">
        {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true' ? (
          <form action={signInWithGoogle}>
            <Button type="submit" variant="primary" size="lg" className="w-full gap-2">
              <GoogleIcon />
              Entrar com Google
            </Button>
          </form>
        ) : null}

        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href="/signup">Criar conta com email</Link>
        </Button>
      </div>

      <Link href="/login" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        Já tenho conta — entrar
      </Link>

      <footer className="mt-8 flex flex-col items-center gap-3 text-xs text-muted-foreground">
        <p>Sem custo. Sem anúncios. Para vestibulandos, por vestibulandos.</p>
        <div className="flex gap-4">
          <Link href="/sobre" className="hover:underline">
            Sobre
          </Link>
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:underline">
            Termos
          </Link>
        </div>
      </footer>

      <InstallPrompt />
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFFFFF"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="#FFFFFF"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.8595-3.0477.8595-2.344 0-4.3282-1.5832-5.036-3.7104H.9573v2.3318C2.4382 15.9831 5.4818 18 9 18z"
      />
      <path
        fill="#FFFFFF"
        d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="#FFFFFF"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}
