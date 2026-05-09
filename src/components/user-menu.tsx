'use client';

import { useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/app/dashboard/actions';

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const codePoint = trimmed.codePointAt(0);
  if (codePoint === undefined) return '?';
  return String.fromCodePoint(codePoint).toUpperCase();
}

/**
 * UserMenu — dropdown ao clicar no avatar/inicial. User pediu pra deixar
 * apenas "Sair" aqui, ja que Estatisticas/Ranking/Jogos/Configuracoes
 * agora vivem nos cards do dashboard e na bottom-nav. Menu fica enxuto:
 * 1 acao apenas. isAdmin prop mantida na assinatura por compat.
 */
export function UserMenu({
  displayName,
}: {
  displayName: string;
  isAdmin?: boolean;
}) {
  const initial = initialOf(displayName);
  const logoutFormRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu de ${displayName}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[10rem]">
        {/* Form fora do Item: requestSubmit() via onSelect; aninhar form
            dentro de Radix.Item com asChild faz o onSelect fechar o menu
            antes do submit propagar — quebra o logout. */}
        <form ref={logoutFormRef} action={logout} className="hidden" />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logoutFormRef.current?.requestSubmit();
          }}
          className="cursor-pointer"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
