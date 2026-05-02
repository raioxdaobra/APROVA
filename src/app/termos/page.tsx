import Link from 'next/link';

export const metadata = { title: 'Termos — APROVA' };

export default function TermosPage() {
  return (
    <main className="container max-w-2xl py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">Termos de Uso</h1>
      <p className="mt-4 text-sm text-muted-foreground">Versão completa em desenvolvimento.</p>
    </main>
  );
}
