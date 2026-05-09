import Link from 'next/link';
import { Brain, Share2, Smartphone, Monitor } from 'lucide-react';
import QRCode from 'qrcode';
import { CopyLinkButton } from '@/components/copy-link-button';
import { ShareWhatsAppButton } from '@/components/share-whatsapp-button';

const INVITE_MESSAGE = `🩺 Achei um app pra estudar pra Medicina Unifor que tá demais.

✅ 1015 questões oficiais (todas as provas, 2015 a 2026)
✅ Resolução com IA pra cada questão
✅ Trilha gamificada estilo Duolingo
✅ Revisão espaçada (Anki) com as questões reais
✅ Estatísticas pessoais por matéria
✅ Funciona offline depois de instalar

Sem App Store. Só clicar no link e adicionar à tela inicial:

👉 https://aprova-five.vercel.app/instalar

Tem 7 dias grátis pra testar tudo.`;

export const metadata = {
  title: 'Instalar APROVA — App no celular',
  description:
    'Instale o APROVA na tela inicial do seu celular ou desktop. Sem App Store, sem download, funciona offline.',
};

const SITE_URL = 'https://aprova-five.vercel.app';

export default async function InstalarPage() {
  // Gera QR code SVG inline (pequeno, sem deps client)
  const qrSvg = await QRCode.toString(SITE_URL, {
    type: 'svg',
    margin: 1,
    width: 240,
    color: { dark: '#C4633B', light: '#ffffff00' },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 pb-24 md:pb-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md"
        >
          <span className="text-xl font-bold">A</span>
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Instalar APROVA</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Sem App Store. Sem download pesado. Adicione à tela inicial e estude offline em
          poucos toques.
        </p>
      </header>

      {/* QR Code + link */}
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">
          Escaneie com a câmera do celular
        </p>
        <div
          className="rounded-xl bg-white p-3 shadow-sm dark:bg-white/95"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
          aria-label="QR code para abrir aprova-five.vercel.app"
        />
        <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
          <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-center text-sm">
            aprova-five.vercel.app
          </code>
          <CopyLinkButton url={SITE_URL} />
        </div>
      </section>

      {/* iOS */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">No iPhone / iPad (Safari)</h2>
        </div>
        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <span className="leading-relaxed">
              Abra <strong>aprova-five.vercel.app</strong> no <strong>Safari</strong>{' '}
              (não funciona no Chrome do iOS).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </span>
            <span className="flex flex-wrap items-center gap-1.5 leading-relaxed">
              Toque no botão{' '}
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                Compartilhar
              </span>{' '}
              na barra inferior.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              3
            </span>
            <span className="leading-relaxed">
              Role pra baixo e escolha{' '}
              <strong>Adicionar à Tela de Início</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              4
            </span>
            <span className="leading-relaxed">
              Toque <strong>Adicionar</strong>. Pronto — abre fullscreen como app.
            </span>
          </li>
        </ol>
        <p className="mt-4 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong>Importante (iOS):</strong> depois de instalar, sempre abra pelo ícone na
          tela inicial. Se abrir o link de novo no Safari, vai rodar no Safari (limite da
          Apple — não dá pra forçar abertura no PWA instalado).
        </p>
      </section>

      {/* Android */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">No Android (Chrome)</h2>
        </div>
        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <span className="leading-relaxed">
              Abra <strong>aprova-five.vercel.app</strong> no Chrome.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </span>
            <span className="leading-relaxed">
              Vai aparecer um banner <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.
              Toque nele. Se não aparecer, clique no menu (⋮) → <strong>Instalar app</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              3
            </span>
            <span className="leading-relaxed">Confirme e abra pelo ícone novo.</span>
          </li>
        </ol>
      </section>

      {/* Desktop */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">No computador (Chrome/Edge)</h2>
        </div>
        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <span className="leading-relaxed">
              Na barra de endereços, clique no ícone de instalar (⊕ ou monitor) à direita
              da URL.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </span>
            <span className="leading-relaxed">
              Confirme. Vira app na sua área de trabalho/menu iniciar.
            </span>
          </li>
        </ol>
      </section>

      {/* Compartilhar */}
      <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold">Conhece alguém estudando pra Unifor?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manda o link com a mensagem pronta — explicando os diferenciais do app.
        </p>
        <div className="mt-4">
          <ShareWhatsAppButton message={INVITE_MESSAGE} />
        </div>
      </section>

      {/* CTA volta */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Voltar pra página inicial
        </Link>
      </div>
    </div>
  );
}
