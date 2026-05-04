import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function BillingSucessoPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-12">
      <Card className="w-full text-center">
        <div className="flex flex-col items-center gap-4 py-6">
          <div
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-3xl text-primary"
          >
            ✓
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Bem-vindo ao Pro!
          </h1>
          <p className="text-sm text-muted-foreground">
            Pagamento processado. Em alguns segundos seu acesso fica ativo. Se
            ainda aparecerem limites, recarregue a página.
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">Ir para o painel</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/quiz">Começar a praticar</Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
