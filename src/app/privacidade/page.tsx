import type { Metadata } from 'next';
import { BackButton } from '@/components/back-button';

export const metadata: Metadata = {
  title: 'Política de Privacidade — APROVA',
  description:
    'Política de Privacidade da APROVA em conformidade com a LGPD: dados coletados, finalidade, base legal, compartilhamento, retenção e direitos do titular.',
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <BackButton fallbackHref="/" />
      <h1 className="mt-6 text-3xl font-bold">
        Política de Privacidade — APROVA
      </h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        Última atualização: 7 de maio de 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">1. Dados coletados</h2>
        <p className="leading-relaxed">
          Coletamos os seguintes dados pessoais: nome (ou apelido), endereço de
          email e dados de progresso de estudo (questões respondidas, tempo de
          uso, simulados realizados, desempenho por matéria). Coletamos também
          dados técnicos automaticamente, como tipo de navegador e endereço IP,
          para fins de segurança e estatística.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">2. Finalidade</h2>
        <p className="leading-relaxed">
          Os dados são utilizados para criar e manter sua conta, fornecer
          conteúdo personalizado de estudo, gerar relatórios de desempenho,
          processar pagamentos do plano Pro e enviar comunicações relevantes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">3. Base legal</h2>
        <p className="leading-relaxed">
          Tratamos seus dados com fundamento no consentimento (art. 7º, I da
          LGPD) e na execução de contrato (art. 7º, V), conforme a finalidade.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          4. Compartilhamento com terceiros
        </h2>
        <p className="leading-relaxed">
          Compartilhamos dados estritamente necessários com operadores de
          serviço: <strong>Supabase</strong> (banco de dados e autenticação) e{' '}
          <strong>Mercado Pago</strong> (processamento de pagamentos). Esses
          parceiros atuam como operadores conforme a LGPD e estão obrigados a
          tratar os dados apenas para as finalidades acordadas.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">5. Retenção</h2>
        <p className="leading-relaxed">
          Os dados são mantidos enquanto sua conta estiver ativa. Após exclusão
          da conta, os dados são apagados em até 30 dias, exceto registros
          necessários por obrigação legal ou regulatória (ex.: documentos
          fiscais).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">6. Direitos do titular</h2>
        <p className="leading-relaxed">
          Nos termos da LGPD, você pode a qualquer momento solicitar:
          confirmação da existência de tratamento, acesso aos dados, correção
          de dados incompletos ou inexatos, anonimização ou exclusão,
          portabilidade e revogação do consentimento. As solicitações devem ser
          enviadas para{' '}
          <a
            href="mailto:contato@aprova.app"
            className="font-semibold text-primary hover:underline"
          >
            contato@aprova.app
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">7. Cookies</h2>
        <p className="leading-relaxed">
          Utilizamos cookies essenciais (necessários para autenticação e
          funcionamento da Plataforma) e cookies de análise (para entender o uso
          agregado e melhorar o produto). Você pode gerenciar cookies nas
          configurações do seu navegador.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">8. Contato</h2>
        <p className="leading-relaxed">
          Dúvidas sobre esta política ou sobre o tratamento de seus dados podem
          ser enviadas para{' '}
          <a
            href="mailto:contato@aprova.app"
            className="font-semibold text-primary hover:underline"
          >
            contato@aprova.app
          </a>
          .
        </p>
      </section>
    </main>
  );
}
