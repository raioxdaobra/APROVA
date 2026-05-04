'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

export function UserMenu({
  displayName,
  isAdmin = false,
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
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[12rem]">
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/usuarios" className="w-full cursor-pointer">
                Admin
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/estatisticas" className="w-full cursor-pointer">
            Estatísticas
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/jogos" className="w-full cursor-pointer">
            Jogos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/ranking" className="w-full cursor-pointer">
            Ranking
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" className="w-full cursor-pointer">
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Form fora do Item: o item dispara requestSubmit via onSelect.
            Aninhar form dentro de Radix.Item com asChild faz o onSelect
            fechar o menu antes do submit propagar — quebra o logout. */}
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
