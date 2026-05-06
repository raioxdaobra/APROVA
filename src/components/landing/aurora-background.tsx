/**
 * Fundo aurora — 3 blobs radial gradient com mix-blend e grid sutil.
 * Pure CSS via classes globais (.aurora-blob, .aurora-grid).
 * Server Component — sem state, sem JS no cliente.
 */
export function AuroraBackground({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-light via-background to-background" />

      {/* Blob 1 — laranja primário, topo esquerdo */}
      <div
        className="aurora-blob absolute -left-[10%] -top-[20%] h-[60vh] w-[70vw]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(196,99,59,0.45), transparent 65%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Blob 2 — laranja escuro, direita */}
      <div
        className="aurora-blob delay-1 absolute -right-[15%] top-[10%] h-[55vh] w-[60vw]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(168,81,40,0.35), transparent 65%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Blob 3 — calor central, embaixo */}
      <div
        className="aurora-blob delay-2 absolute left-[20%] bottom-[-20%] h-[50vh] w-[60vw]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(232,135,73,0.3), transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Grid respirando */}
      <div
        className="aurora-grid absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
