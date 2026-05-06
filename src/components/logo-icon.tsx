/**
 * APROVA logo (Server Component) — PR 32 redesign.
 *
 * Conceito: letra "A" geométrica com checkmark integrado no espaço do
 * crossbar (substitui o traço horizontal tradicional do A). Comunica
 * "aprovação" diretamente.
 *
 * Mantém em sync com:
 *   public/brand/aprova-icon.svg
 *   public/brand/aprova-icon-maskable.svg
 *   scripts/generate-pwa-icons.ts
 *
 * Variantes:
 * - `full`     : badge cobre arredondado (iOS-style 22% radius), A + check brancos.
 * - `mark-only`: apenas A + check em cobre, fundo transparente. Pra inline UI.
 * - `maskable` : full-bleed cobre (Android crop), conteúdo dentro de safe area 80%.
 */

const COBRE = '#C4633B';
const WHITE = '#FFFFFF';

interface LogoIconProps {
  size?: number;
  variant?: 'full' | 'mark-only';
  /** When true, paints the rounded cobre square as full bleed (no padding). */
  maskable?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function LogoIcon({
  size = 192,
  variant = 'full',
  maskable = false,
  className,
  ariaLabel = 'APROVA',
}: LogoIconProps): JSX.Element {
  const isFull = variant === 'full';
  const VB = 256;

  // Cantos arredondados ~22% (iOS-style). Maskable é full-bleed (sem cantos).
  const radius = maskable ? 0 : 56;

  // Geometria diferente pra maskable (conteúdo encolhido no safe area).
  const geom = maskable
    ? {
        // Apex e pés mais centralizados pra caber em 80% do canvas
        legLeft: { x1: 128, y1: 78, x2: 68, y2: 200 },
        legRight: { x1: 128, y1: 78, x2: 188, y2: 200 },
        legWidth: 26,
        check: '92,160 112,178 156,134',
        checkWidth: 17,
      }
    : {
        legLeft: { x1: 128, y1: 56, x2: 52, y2: 212 },
        legRight: { x1: 128, y1: 56, x2: 204, y2: 212 },
        legWidth: 30,
        check: '84,162 110,184 162,128',
        checkWidth: 20,
      };

  // Cor do mark: branco quando há background cobre, cobre quando transparente.
  const markColor = isFull ? WHITE : COBRE;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${VB} ${VB}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {/* Background cobre arredondado (somente variante 'full') */}
      {isFull ? (
        <rect x={0} y={0} width={VB} height={VB} rx={radius} ry={radius} fill={COBRE} />
      ) : null}

      {/* Perna esquerda do A */}
      <line
        x1={geom.legLeft.x1}
        y1={geom.legLeft.y1}
        x2={geom.legLeft.x2}
        y2={geom.legLeft.y2}
        stroke={markColor}
        strokeWidth={geom.legWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Perna direita do A */}
      <line
        x1={geom.legRight.x1}
        y1={geom.legRight.y1}
        x2={geom.legRight.x2}
        y2={geom.legRight.y2}
        stroke={markColor}
        strokeWidth={geom.legWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Checkmark integrado (substitui o crossbar) */}
      <polyline
        points={geom.check}
        fill="none"
        stroke={markColor}
        strokeWidth={geom.checkWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
