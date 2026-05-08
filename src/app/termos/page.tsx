import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso — APROVA',
  description:
    'Termos de Uso da plataforma APROVA: aceite, idade mínima, propriedade intelectual, isenções e foro.',
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Termos de Uso — APROVA</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        Última atualização: 7 de maio de 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">1. Aceite dos termos</h2>
        <p className="leading-relaxed">
          Ao criar uma conta, acessar ou utilizar a plataforma APROVA
          (&ldquo;Plataforma&rdquo;), você declara ter lido, compreendido e
          aceito integralmente estes Termos de Uso. Caso não concorde com
          qualquer cláusula, você não deve utilizar a Plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">2. Idade mínima</h2>
        <p className="leading-relaxed">
          O uso da Plataforma é permitido a partir dos 13 (treze) anos de idade.
          Usuários menores de 18 anos devem obter consentimento expresso de seus
          pais ou responsáveis legais para criar conta e utilizar os serviços.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          3. Propriedade intelectual
        </h2>
        <p className="leading-relaxed">
          Todo o conteúdo disponibilizado na Plataforma — incluindo questões
          comentadas, materiais didáticos, textos, gráficos, logotipos, software
          e código-fonte — é de propriedade da APROVA ou licenciado a ela, sendo
          protegido pelas leis brasileiras de direitos autorais e propriedade
          intelectual. É vedada a reprodução, distribuição, modificação ou
          exploração comercial sem autorização prévia e expressa.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          4. Isenção de responsabilidade
        </h2>
        <p className="leading-relaxed">
          A APROVA é uma ferramenta de apoio aos estudos e não garante aprovação
          em vestibulares, concursos ou qualquer processo seletivo. O resultado
          em provas depende de múltiplos fatores individuais, incluindo
          dedicação, condições no dia da prova e critérios da banca examinadora.
          A Plataforma é fornecida &ldquo;no estado em que se encontra&rdquo;,
          sem garantias de disponibilidade ininterrupta ou ausência de erros.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">5. Conduta do usuário</h2>
        <p className="leading-relaxed">
          O usuário compromete-se a utilizar a Plataforma de forma lícita,
          respeitando os demais usuários e a legislação vigente. É vedado o
          compartilhamento de credenciais, a tentativa de acesso não autorizado,
          o uso de robôs ou raspadores e a publicação de conteúdo ofensivo.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">6. Foro</h2>
        <p className="leading-relaxed">
          Fica eleito o foro da Comarca de Fortaleza, Estado do Ceará, para
          dirimir quaisquer controvérsias decorrentes destes Termos, com
          renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
      </section>
    </main>
  );
}
