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
