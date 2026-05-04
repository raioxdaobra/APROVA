'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';

interface GameLoaderProps {
  gameId: string;
  gameName: string;
}

/**
 * Tenta importar dinamicamente o módulo do jogo.
 *
 * Os componentes vivem em `src/games/<id>/Game.tsx` (donos: worktrees W5/W6).
 * Como esse diretório pode ainda não existir, falhas de import são capturadas
 * e tratadas como "em construção". O webpack consegue gerar split-points
 * porque o prefixo (`@/games/`) é literal — apenas o `gameId` é dinâmico.
 */
/**
 * Carrega o módulo do jogo em runtime via registry.
 *
 * Os componentes vivem em `src/games/<id>/Game.tsx` e são donos de W5/W6.
 * Pra evitar acoplamento de build (este worktree pode subir antes dos jogos),
 * usamos um registry em `@/games/registry` que W5/W6 mantém. Se o registry
 * não existir ou não tiver o id, mostramos placeholder.
 */
async function loadGameModule(gameId: string): Promise<ComponentType | null> {
  try {
    const registry = (await import('../../_lib/registry')) as {
      getGameComponent?: (id: string) => Promise<ComponentType | null>;
    };
    if (typeof registry.getGameComponent !== 'function') return null;
    return await registry.getGameComponent(gameId);
  } catch {
    return null;
  }
}

export function GameLoader({ gameId, gameName }: GameLoaderProps) {
  const [Game, setGame] = useState<ComponentType | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let active = true;
    loadGameModule(gameId)
      .then((Component) => {
        if (!active) return;
        if (Component) {
          setGame(() => Component);
        } else {
          setErrored(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setErrored(true);
      });
    return () => {
      active = false;
    };
  }, [gameId]);

  if (errored) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-sm font-semibold text-foreground">Em construção</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {gameName} ainda está sendo finalizado pela equipe. Volte em instantes.
        </p>
        <Link
          href="/jogos"
          className="text-sm font-medium text-primary hover:underline"
        >
          Voltar pro lobby
        </Link>
      </div>
    );
  }

  if (!Game) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Carregando {gameName}…
      </div>
    );
  }

  return <Game />;
}
