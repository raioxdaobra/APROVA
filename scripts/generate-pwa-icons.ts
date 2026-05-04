/**
 * Generates PWA icons, favicons, and iOS splash screens for APROVA.
 *
 * Logo design (kept in sync with src/components/logo-icon.tsx):
 * - Stylized "A" rendered as an outer triangle with an inner triangle cutout
 *   (uses SVG even-odd fill rule).
 * - Subtle horizontal "graduation cap" stroke just above the apex.
 * - Open base / platform stroke beneath the feet.
 * - Cobre-gradient rounded square (iOS-style 22% radius) for the badge variant.
 *
 * Outputs:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-512.png   (full-bleed, safe-zone aware)
 *   public/icons/icon-1024.png
 *   public/icons/apple-touch-icon.png    (180x180)
 *   public/icons/splash-iphone-640x1136.png
 *   public/icons/splash-iphone-750x1334.png
 *   public/icons/splash-iphone-1125x2436.png
 *   public/icons/splash-iphone-1242x2688.png
 *   public/favicon.ico
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const COBRE = '#C4633B';
const COBRE_DARK = '#8F4528';
const COBRE_LIGHT = '#E08A5E';
const WHITE = '#FFFFFF';

const ROOT = resolve(process.cwd());
const ICONS_DIR = resolve(ROOT, 'public', 'icons');
const PUBLIC_DIR = resolve(ROOT, 'public');

const VB = 1024;

function logoSvg(opts: { maskable?: boolean; transparent?: boolean }): string {
  const { maskable = false, transparent = false } = opts;
  const radius = maskable ? 0 : Math.round(VB * 0.22);
  const safe = maskable ? 0.62 : 0.74;
  const markBox = VB * safe;
  const markOffset = (VB - markBox) / 2;

  const px = (n: number): number => Math.round(markOffset + n * markBox);

  const apex = { x: 0.5, y: 0.08 };
  const leftFoot = { x: 0.08, y: 0.92 };
  const rightFoot = { x: 0.92, y: 0.92 };
  const innerApex = { x: 0.5, y: 0.32 };
  const innerLeft = { x: 0.28, y: 0.78 };
  const innerRight = { x: 0.72, y: 0.78 };

  const outerPath = `M ${px(apex.x)} ${px(apex.y)} L ${px(rightFoot.x)} ${px(rightFoot.y)} L ${px(leftFoot.x)} ${px(leftFoot.y)} Z`;
  const innerPath = `M ${px(innerApex.x)} ${px(innerApex.y)} L ${px(innerRight.x)} ${px(innerRight.y)} L ${px(innerLeft.x)} ${px(innerLeft.y)} Z`;

  const capY = markOffset + markBox * 0.06;
  const capX1 = markOffset + markBox * 0.18;
  const capX2 = markOffset + markBox * 0.82;
  const capW = Math.max(2, Math.round(markBox * 0.018));

  const baseY = markOffset + markBox * 0.985;
  const baseX1 = markOffset + markBox * 0.04;
  const baseX2 = markOffset + markBox * 0.96;
  const baseW = Math.max(2, Math.round(markBox * 0.022));

  const bg = transparent
    ? ''
    : `<rect x="0" y="0" width="${VB}" height="${VB}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VB}" height="${VB}" viewBox="0 0 ${VB} ${VB}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${COBRE_LIGHT}"/>
        <stop offset="55%" stop-color="${COBRE}"/>
        <stop offset="100%" stop-color="${COBRE_DARK}"/>
      </linearGradient>
      <linearGradient id="mark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${WHITE}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${WHITE}" stop-opacity="0.92"/>
      </linearGradient>
    </defs>
    ${bg}
    <line x1="${capX1}" y1="${capY}" x2="${capX2}" y2="${capY}"
          stroke="${WHITE}" stroke-opacity="0.85" stroke-width="${capW}" stroke-linecap="round"/>
    <path d="${outerPath} ${innerPath}" fill="url(#mark)" fill-rule="evenodd"/>
    <line x1="${baseX1}" y1="${baseY}" x2="${baseX2}" y2="${baseY}"
          stroke="${WHITE}" stroke-opacity="0.9" stroke-width="${baseW}" stroke-linecap="round"/>
  </svg>`;
}

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

async function writePng(svg: string, outPath: string, size: number): Promise<void> {
  await ensureDir(dirname(outPath));
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outPath);
}

interface SplashSpec {
  width: number;
  height: number;
  out: string;
  /** Logo size in px relative to viewport. */
  logoSize: number;
}

async function writeSplash(spec: SplashSpec): Promise<void> {
  await ensureDir(dirname(spec.out));

  // Cobre-gradient background sized to the splash dimensions.
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${COBRE_LIGHT}"/>
        <stop offset="55%" stop-color="${COBRE}"/>
        <stop offset="100%" stop-color="${COBRE_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
  </svg>`;

  // Render the logo (transparent background, mark-only-style on cobre BG works
  // best as a plain "full" badge centered — but transparent blends onto the
  // gradient nicely with white mark). We use transparent + white-only mark.
  const markSvg = logoSvg({ maskable: false, transparent: true });
  const markBuf = await sharp(Buffer.from(markSvg))
    .resize(spec.logoSize, spec.logoSize)
    .png()
    .toBuffer();

  const bgBuf = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const left = Math.round((spec.width - spec.logoSize) / 2);
  const top = Math.round((spec.height - spec.logoSize) / 2);

  await sharp(bgBuf)
    .composite([{ input: markBuf, left, top }])
    .png()
    .toFile(spec.out);

  console.log(`Wrote ${spec.out}`);
}

async function generate(): Promise<void> {
  await ensureDir(ICONS_DIR);

  // Standard "any" icons (rounded badge, cobre BG, white mark).
  const fullSvg = logoSvg({ maskable: false });
  await writePng(fullSvg, resolve(ICONS_DIR, 'icon-192.png'), 192);
  console.log(`Wrote ${resolve(ICONS_DIR, 'icon-192.png')}`);
  await writePng(fullSvg, resolve(ICONS_DIR, 'icon-512.png'), 512);
  console.log(`Wrote ${resolve(ICONS_DIR, 'icon-512.png')}`);
  await writePng(fullSvg, resolve(ICONS_DIR, 'icon-1024.png'), 1024);
  console.log(`Wrote ${resolve(ICONS_DIR, 'icon-1024.png')}`);

  // Apple touch icon (rounded square baked into the PNG).
  await writePng(fullSvg, resolve(ICONS_DIR, 'apple-touch-icon.png'), 180);
  console.log(`Wrote ${resolve(ICONS_DIR, 'apple-touch-icon.png')}`);

  // Maskable: full-bleed cobre, mark inside the safe zone.
  const maskableSvg = logoSvg({ maskable: true });
  await writePng(maskableSvg, resolve(ICONS_DIR, 'icon-maskable-512.png'), 512);
  console.log(`Wrote ${resolve(ICONS_DIR, 'icon-maskable-512.png')}`);

  // Favicon: 32x32 PNG saved with .ico extension. Browsers accept PNG-encoded ICO.
  const faviconBuffer = await sharp(Buffer.from(fullSvg)).resize(32, 32).png().toBuffer();
  const faviconOut = resolve(PUBLIC_DIR, 'favicon.ico');
  await writeFile(faviconOut, faviconBuffer);
  console.log(`Wrote ${faviconOut}`);

  // iPhone splash screens (cobre gradient + centered logo 180x180).
  const splashes: SplashSpec[] = [
    { width: 640, height: 1136, out: resolve(ICONS_DIR, 'splash-iphone-640x1136.png'), logoSize: 180 },
    { width: 750, height: 1334, out: resolve(ICONS_DIR, 'splash-iphone-750x1334.png'), logoSize: 180 },
    { width: 1125, height: 2436, out: resolve(ICONS_DIR, 'splash-iphone-1125x2436.png'), logoSize: 240 },
    { width: 1242, height: 2688, out: resolve(ICONS_DIR, 'splash-iphone-1242x2688.png'), logoSize: 260 },
  ];

  for (const splash of splashes) {
    await writeSplash(splash);
  }
}

generate().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
