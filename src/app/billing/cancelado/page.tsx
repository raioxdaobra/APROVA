import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function BillingCanceladoPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-12">
      <Card className="w-full text-center">
        <div className="flex flex-col items-center gap-4 py-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Pagamento cancelado
          </h1>
          <p className="text-sm text-muted-foreground">
            Tudo bem — você não foi cobrado. Continue praticando no plano grátis
            ou tente novamente quando quiser.
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">Voltar ao painel</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/quiz">Praticar agora</Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
