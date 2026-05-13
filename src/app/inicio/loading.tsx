/**
 * Loading state pro /inicio. Mostra esqueleto durante o fetch do count
 * de questões + profile. Sem isso, click em "Início" no bottom nav fica
 * "branco" por ~50-200ms e parecia que não respondia.
 */
export default function InicioLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-6">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 pb-10">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted/70" />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex h-44 flex-col gap-3 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted/70" />
                <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
              </div>
              <div className="mt-auto h-6 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
