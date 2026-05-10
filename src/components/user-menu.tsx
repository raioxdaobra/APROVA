'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Shield } from 'lucide-react';
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

function firstNameOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Você';
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  return first;
}

/**
 * UserMenu — dropdown user-friendly: avatar + primeiro nome (visivel em
 * sm+) + chevron de "abre". User reportou que so o avatar de 36px era
 * dificil de achar. Agora e uma "pill" com fundo primary clicavel — fica
 * obvio que e um botao, mesmo pra quem nunca usou.
 *
 * Pra admin: badge "ADMIN" amarelo discreto + icone shield no menu,
 * destacando o atalho "Gerenciar usuarios".
 */
export function UserMenu({
  displayName,
  isAdmin = false,
}: {
  displayName: string;
  isAdmin?: boolean;
}) {
  const initial = initialOf(displayName);
  const firstName = firstNameOf(displayName);
  const router = useRouter();
  const logoutFormRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu de ${displayName}`}
        className="group inline-flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 pl-1 pr-3 text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:gap-2.5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground group-hover:bg-primary-dark">
          {initial}
        </span>
        <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
          {firstName}
        </span>
        {isAdmin ? (
          <span
            className="hidden rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning sm:inline"
            aria-label="Administrador"
          >
            Admin
          </span>
        ) : null}
        <ChevronDown
          className="h-4 w-4 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[14rem]">
        <form ref={logoutFormRef} action={logout} className="hidden" />

        {/* Header do menu — mostra nome completo + badge admin se aplicavel */}
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          {isAdmin ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-warning">
              Administrador
            </p>
          ) : null}
        </div>

        {isAdmin ? (
          <>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                router.push('/admin/usuarios');
              }}
              className="cursor-pointer gap-2"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Gerenciar usuários
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logoutFormRef.current?.requestSubmit();
          }}
          className="cursor-pointer gap-2"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
