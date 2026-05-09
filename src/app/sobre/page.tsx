import { BackButton } from '@/components/back-button';

export const metadata = { title: 'Sobre — APROVA' };

export default function SobrePage() {
  return (
    <main className="container max-w-2xl py-12">
      <h1 className="mt-6 text-2xl font-semibold">Sobre o APROVA</h1>
      <p className="mt-4 text-base">
        APROVA é um banco de questões oficiais do vestibular de Medicina da Universidade de Fortaleza
        (Unifor), organizado por disciplina, subtópico e ano da prova. O projeto é gratuito e sem anúncios.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Direitos autorais</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Questões reproduzidas dos vestibulares oficiais da Universidade de Fortaleza para fins educacionais
        sem fins comerciais. Direitos autorais pertencem aos respectivos titulares (FEQ — Fundação Edson
        Queiroz).
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Para notificações de takedown ou contato legal: legal@aprova.app
      </p>

      <div className="mt-10">
        <BackButton fallbackHref="/" />
      </div>
    </main>
  );
}
