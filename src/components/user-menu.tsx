'use client';

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

export function UserMenu({ displayName }: { displayName: string }) {
  const initial = initialOf(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu de ${displayName}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[12rem]">
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" className="w-full cursor-pointer">
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full cursor-pointer text-left outline-none"
            >
              Sair
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
