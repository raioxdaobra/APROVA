'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PUBLIC_PREFIXES = ['/', '/login', '/signup', '/sobre', '/privacidade', '/termos'];
const PUBLIC_DYNAMIC = ['/auth', '/onboarding', '/aguardando-aprovacao', '/conta-bloqueada'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PREFIXES.includes(pathname)) return true;
  return PUBLIC_DYNAMIC.some((p) => pathname.startsWith(p));
}

function buildHref(pathname: string, params: URLSearchParams, key: string, value: string | null) {
  const next = new URLSearchParams(params);
  if (value === null) {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function AdminBannerInner({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();

  if (!isAdmin) return null;
  if (isPublicRoute(pathname)) return null;

  const previewFree = searchParams?.get('preview') === 'free';
  const params = new URLSearchParams(searchParams?.toString() ?? '');

  if (previewFree) {
    const back = buildHref(pathname, params, 'preview', null);
    return (
      <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
        <span className="font-medium">Modo preview free</span>
        <span aria-hidden="true"> · </span>
        <Link href={back} className="font-medium underline-offset-2 hover:underline">
          Voltar a admin
        </Link>
      </div>
    );
  }

  const preview = buildHref(pathname, params, 'preview', 'free');
  return (
    <div className="border-b border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-xs text-emerald-700 dark:text-emerald-300">
      <span className="font-medium">Modo admin</span>
      <span aria-hidden="true"> — </span>
      <span>acesso ilimitado</span>
      <span aria-hidden="true"> · </span>
      <Link href={preview} className="font-medium underline-offset-2 hover:underline">
        Ver como usuário free
      </Link>
    </div>
  );
}

export function AdminBanner({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Suspense fallback={null}>
      <AdminBannerInner isAdmin={isAdmin} />
    </Suspense>
  );
}
