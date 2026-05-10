'use client';

/**
 * Bottom nav GLOBAL — visivel em mobile E desktop em todas as rotas
 * autenticadas. Substitui a sidebar lateral (removida do AppShell)
 * conforme pedido do user "excluir o menu lateral".
 *
 * Itens: Início, Trilha, Missões, Configurações.
 *
 * Estatísticas e Ranking NÃO aparecem aqui — viraram icones grandes
 * coloridos no card "Resolver questões" do dashboard. Regra: o que esta
 * no card nao duplica na barra horizontal.
 *
 * Comportamento:
 * - Esconde em rotas publicas (/, /login, /signup, /sobre, etc)
 * - Esconde em /inicio (selecao de prova, tela limpa)
 * - Esconde em rotas imersivas (sessao ativa de quiz/simulado, jogo)
 *
 * Mantido o nome "MobileBottomNav" pra evitar churn em imports — apesar
 * de agora aparecer tambem no desktop. Pode ser renomeado depois.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ListChecks,
  Map as MapIcon,
  Settings,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Home;
  /** Match prefix to highlight nested routes too. */
  match: (pathname: string) => boolean;
  accentVar: string;
}

// Revisão saiu daqui — virou icone grande no card "Resolver questões" do
// dashboard (regra: o que esta no card nao duplica na barra horizontal).
// Jogos saiu daqui — funcionalidade ainda em refinamento, user pediu pra
// remover ate ele finalizar a melhoria. Reabilitar e simples: re-adicionar
// o entry abaixo + restaurar import { Gamepad2 }.
const ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Início',
    Icon: Home,
    match: (p) => p === '/dashboard' || p.startsWith('/dashboard/'),
    accentVar: '--primary',
  },
  {
    href: '/trilha',
    label: 'Trilha',
    Icon: MapIcon,
    match: (p) => p === '/trilha' || p.startsWith('/trilha/'),
    accentVar: '--accent-trilha',
  },
  {
    href: '/missoes',
    label: 'Missões',
    Icon: ListChecks,
    match: (p) => p === '/missoes' || p.startsWith('/missoes/'),
    accentVar: '--primary',
  },
  {
    href: '/configuracoes',
    label: 'Config.',
    Icon: Settings,
    match: (p) => p === '/configuracoes' || p.startsWith('/configuracoes/'),
    accentVar: '--neutral-500',
  },
];

const PUBLIC_ROUTES = new Set<string>([
  '/',
  '/login',
  '/signup',
  '/sobre',
  '/privacidade',
  '/termos',
  '/instalar',
  // /inicio é a tela "limpa" de seleção de prova — sem nav nem
  // sidebar, pra não distrair da decisão.
  '/inicio',
]);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  // Auth callback / onboarding flow pages should not show the bottom nav.
  if (pathname.startsWith('/auth')) return true;
  if (pathname.startsWith('/onboarding')) return true;
  if (pathname.startsWith('/aguardando-aprovacao')) return true;
  if (pathname.startsWith('/conta-bloqueada')) return true;
  if (pathname.startsWith('/inicio/')) return true;
  return false;
}

/**
 * Rotas "imersivas" — sessões ativas onde a barra atrapalha (cobre teclado
 * virtual no Wordle, esconde alternativa E e botão Próxima no quiz, etc).
 * O `/jogos` (lobby) continua mostrando; só `/jogos/<gameId>/...` esconde.
 */
function isImmersiveRoute(pathname: string): boolean {
  if (pathname.startsWith('/quiz/sessao/')) return true;
  if (pathname.startsWith('/simulado/sessao/')) return true;
  if (pathname.startsWith('/jogos/') && pathname !== '/jogos') return true;
  return false;
}

export function MobileBottomNav(): JSX.Element | null {
  const pathname = usePathname() ?? '/';
  if (isPublicRoute(pathname)) return null;
  if (isImmersiveRoute(pathname)) return null;

  return (
    <nav
      aria-label="Navegação principal"
      // SEM "md:hidden" — agora aparece em mobile e desktop. Substitui
      // a sidebar lateral que foi removida.
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {ITEMS.map(({ href, label, Icon, match, accentVar }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors',
                  active ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  style={{
                    backgroundColor: active
                      ? `hsl(var(${accentVar}) / 0.16)`
                      : 'transparent',
                    color: `hsl(var(${accentVar}))`,
                  }}
                >
                  <Icon
                    className={active ? 'h-[18px] w-[18px] stroke-[2.25]' : 'h-[18px] w-[18px] stroke-[1.75]'}
                    aria-hidden="true"
                  />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
