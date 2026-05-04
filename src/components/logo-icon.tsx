/**
 * APROVA logo (Server Component).
 *
 * Renders an SVG with a stylized "A" forming a graduation-cap silhouette:
 * - Triangle gradient (cobre -> cobre-dark) for the body
 * - Subtle horizontal cap line near the top
 * - Open base evoking a platform / "aprovado" pedestal
 *
 * Variants:
 * - `full`: badge with rounded-square cobre background (iOS-style 22% radius)
 *           and the A mark inside the safe zone.
 * - `mark-only`: just the A glyph, transparent background, useful for inline UI.
 */

const COBRE = '#C4633B';
const COBRE_DARK = '#8F4528';
const COBRE_LIGHT = '#E08A5E';
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

  // Use 1024 viewBox for crisp gradients regardless of rendered size.
  const VB = 1024;

  // Background rounded square (iOS app-icon ≈ 22% corner radius).
  // Maskable assets must be full-bleed so platforms can crop safely.
  const radius = maskable ? 0 : Math.round(VB * 0.22);

  // Safe zone: maskable variant keeps the mark inside ~80% of the canvas.
  const safe = maskable ? 0.62 : 0.74;
  const markBox = VB * safe;
  const markOffset = (VB - markBox) / 2;

  // "A" geometry inside markBox (0..1 normalized then scaled).
  // Apex at top-center, base feet at bottom corners, crossbar ~ 60% down.
  // Feet are flat (open base / platform).
  const apex = { x: 0.5, y: 0.08 };
  const leftFoot = { x: 0.08, y: 0.92 };
  const rightFoot = { x: 0.92, y: 0.92 };
  // Inner triangle (creates the negative space inside the A).
  const innerApex = { x: 0.5, y: 0.32 };
  const innerLeft = { x: 0.28, y: 0.78 };
  const innerRight = { x: 0.72, y: 0.78 };

  const px = (n: number): number => Math.round(markOffset + n * markBox);

  const outerPath = `M ${px(apex.x)} ${px(apex.y)} L ${px(rightFoot.x)} ${px(rightFoot.y)} L ${px(leftFoot.x)} ${px(leftFoot.y)} Z`;
  const innerPath = `M ${px(innerApex.x)} ${px(innerApex.y)} L ${px(innerRight.x)} ${px(innerRight.y)} L ${px(innerLeft.x)} ${px(innerLeft.y)} Z`;

  // Graduation-cap line: thin horizontal stroke just above the apex.
  const capY = markOffset + markBox * 0.06;
  const capX1 = markOffset + markBox * 0.18;
  const capX2 = markOffset + markBox * 0.82;
  const capW = Math.max(2, Math.round(markBox * 0.018));

  // Open base "platform" line beneath the feet.
  const baseY = markOffset + markBox * 0.985;
  const baseX1 = markOffset + markBox * 0.04;
  const baseX2 = markOffset + markBox * 0.96;
  const baseW = Math.max(2, Math.round(markBox * 0.022));

  const fillId = `aprova-grad-${variant}-${maskable ? 'm' : 'n'}`;
  const bgFillId = `aprova-bg-${variant}-${maskable ? 'm' : 'n'}`;

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
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WHITE} stopOpacity="1" />
          <stop offset="100%" stopColor={WHITE} stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={bgFillId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COBRE_LIGHT} />
          <stop offset="55%" stopColor={COBRE} />
          <stop offset="100%" stopColor={COBRE_DARK} />
        </linearGradient>
      </defs>

      {isFull ? (
        <rect
          x={0}
          y={0}
          width={VB}
          height={VB}
          rx={radius}
          ry={radius}
          fill={`url(#${bgFillId})`}
        />
      ) : null}

      {/* Graduation cap line */}
      <line
        x1={capX1}
        y1={capY}
        x2={capX2}
        y2={capY}
        stroke={isFull ? WHITE : COBRE}
        strokeOpacity={isFull ? 0.85 : 0.9}
        strokeWidth={capW}
        strokeLinecap="round"
      />

      {/* Outer A (triangle) using even-odd fill rule for the inner cutout. */}
      <path
        d={`${outerPath} ${innerPath}`}
        fill={isFull ? `url(#${fillId})` : `url(#${bgFillId})`}
        fillRule="evenodd"
      />

      {/* Open base / platform */}
      <line
        x1={baseX1}
        y1={baseY}
        x2={baseX2}
        y2={baseY}
        stroke={isFull ? WHITE : COBRE}
        strokeOpacity={isFull ? 0.9 : 0.95}
        strokeWidth={baseW}
        strokeLinecap="round"
      />
    </svg>
  );
}
