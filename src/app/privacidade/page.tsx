import Link from 'next/link';

export const metadata = { title: 'Privacidade — APROVA' };

export default function PrivacidadePage() {
  return (
    <main className="container max-w-2xl py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">Política de Privacidade</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Versão completa em desenvolvimento. Em breve esta página listará exatamente quais dados coletamos, com
        quais serviços compartilhamos (Supabase, Vercel, PostHog, Sentry), por quanto tempo retemos, e como
        exercer os direitos garantidos pela LGPD.
      </p>
    </main>
  );
}
