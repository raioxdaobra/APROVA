/**
 * Generates PWA icons, favicons, and iOS splash screens for APROVA.
 *
 * Sources of truth (PR 32):
 *   public/brand/aprova-icon.svg            — símbolo principal (cobre BG, A+check brancos)
 *   public/brand/aprova-icon-maskable.svg   — full-bleed maskable (Android crop)
 *   public/brand/aprova-icon-mono.svg       — monocromático currentColor
 *   public/brand/aprova-logo.svg            — símbolo + wordmark (não usado aqui)
 *
 * Outputs:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-1024.png
 *   public/icons/icon-maskable-512.png
 *   public/icons/apple-touch-icon.png       (180x180, com background)
 *   public/icons/favicon-16.png
 *   public/icons/favicon-32.png
 *   public/icons/splash-iphone-{640x1136,750x1334,1125x2436,1242x2688}.png
 *   public/favicon.ico                      (multi-size 16+32+48)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const COBRE = '#C4633B';
const COBRE_DARK = '#8F4528';
const COBRE_LIGHT = '#E08A5E';

const ROOT = resolve(process.cwd());
const BRAND_DIR = resolve(ROOT, 'public', 'brand');
const ICONS_DIR = resolve(ROOT, 'public', 'icons');
const PUBLIC_DIR = resolve(ROOT, 'public');

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

async function readSvg(name: string): Promise<Buffer> {
  return readFile(resolve(BRAND_DIR, name));
}

async function renderPng(svgBuffer: Buffer, outPath: string, size: number): Promise<void> {
  await ensureDir(dirname(outPath));
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  console.log(`Wrote ${outPath} (${size}x${size})`);
}

interface SplashSpec {
  width: number;
  height: number;
  out: string;
  /** Logo size in px relative to viewport. */
  logoSize: number;
}

async function writeSplash(spec: SplashSpec, iconSvg: Buffer): Promise<void> {
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

  // Render the icon at the requested size.
  const iconBuf = await sharp(iconSvg, { density: 384 })
    .resize(spec.logoSize, spec.logoSize)
    .png()
    .toBuffer();

  const bgBuf = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const left = Math.round((spec.width - spec.logoSize) / 2);
  const top = Math.round((spec.height - spec.logoSize) / 2);

  await sharp(bgBuf)
    .composite([{ input: iconBuf, left, top }])
    .png()
    .toFile(spec.out);

  console.log(`Wrote ${spec.out}`);
}

async function buildIco(): Promise<void> {
  // Generate multi-size ICO by encoding three PNG buffers and concatenating
  // them with proper ICONDIR + ICONDIRENTRY headers.
  const iconSvg = await readSvg('aprova-icon.svg');
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(iconSvg, { density: 384 })
        .resize(s, s)
        .png()
        .toBuffer(),
    ),
  );

  // ICO header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(sizes.length, 4); // image count

  const entries: Buffer[] = [];
  const images: Buffer[] = [];
  let offset = 6 + sizes.length * 16;

  sizes.forEach((s, i) => {
    const png = pngs[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // width (0 means 256)
    entry.writeUInt8(s === 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(png.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    entries.push(entry);
    images.push(png);
    offset += png.length;
  });

  const ico = Buffer.concat([header, ...entries, ...images]);
  const out = resolve(PUBLIC_DIR, 'favicon.ico');
  await writeFile(out, ico);
  console.log(`Wrote ${out} (multi-size 16+32+48)`);
}

async function generate(): Promise<void> {
  await ensureDir(ICONS_DIR);

  // Read SVG sources once.
  const iconSvg = await readSvg('aprova-icon.svg');
  const maskableSvg = await readSvg('aprova-icon-maskable.svg');

  // Standard "any" icons (rounded badge baked in by the SVG itself).
  await renderPng(iconSvg, resolve(ICONS_DIR, 'icon-192.png'), 192);
  await renderPng(iconSvg, resolve(ICONS_DIR, 'icon-512.png'), 512);
  await renderPng(iconSvg, resolve(ICONS_DIR, 'icon-1024.png'), 1024);

  // Apple touch icon: iOS aplica máscara própria, então reusamos o icon "any"
  // (que já tem cantos arredondados ~22%). iOS re-aplica seu próprio raio.
  await renderPng(iconSvg, resolve(ICONS_DIR, 'apple-touch-icon.png'), 180);

  // Maskable: full-bleed cobre, mark inside the safe zone.
  await renderPng(maskableSvg, resolve(ICONS_DIR, 'icon-maskable-512.png'), 512);

  // Standalone PNG favicons (alguns browsers e MP usam isso).
  await renderPng(iconSvg, resolve(ICONS_DIR, 'favicon-16.png'), 16);
  await renderPng(iconSvg, resolve(ICONS_DIR, 'favicon-32.png'), 32);

  // Multi-size .ico para legado.
  await buildIco();

  // iPhone splash screens (cobre gradient + centered logo).
  const splashes: SplashSpec[] = [
    { width: 640, height: 1136, out: resolve(ICONS_DIR, 'splash-iphone-640x1136.png'), logoSize: 180 },
    { width: 750, height: 1334, out: resolve(ICONS_DIR, 'splash-iphone-750x1334.png'), logoSize: 180 },
    { width: 1125, height: 2436, out: resolve(ICONS_DIR, 'splash-iphone-1125x2436.png'), logoSize: 240 },
    { width: 1242, height: 2688, out: resolve(ICONS_DIR, 'splash-iphone-1242x2688.png'), logoSize: 260 },
  ];

  for (const splash of splashes) {
    await writeSplash(splash, iconSvg);
  }
}

generate().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
