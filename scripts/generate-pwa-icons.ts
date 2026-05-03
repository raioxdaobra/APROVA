import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const COBRE = '#C4633B';
const WHITE = '#FFFFFF';
const ROOT = resolve(process.cwd());
const ICONS_DIR = resolve(ROOT, 'public', 'icons');
const PUBLIC_DIR = resolve(ROOT, 'public');

interface IconSpec {
  size: number;
  out: string;
  letterRatio: number;
  cornerRadius?: number;
}

function fullBleedSvg(size: number, letterRatio: number): string {
  const fontSize = Math.round(size * letterRatio);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="${COBRE}"/>
    <text x="50%" y="50%" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
          text-anchor="middle" dominant-baseline="central" fill="${WHITE}">A</text>
  </svg>`;
}

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

async function writePng(svg: string, outPath: string, size: number): Promise<void> {
  await ensureDir(dirname(outPath));
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .png()
    .toFile(outPath);
}

async function generate(): Promise<void> {
  await ensureDir(ICONS_DIR);

  const icons: IconSpec[] = [
    { size: 192, out: resolve(ICONS_DIR, 'icon-192.png'), letterRatio: 0.6 },
    { size: 512, out: resolve(ICONS_DIR, 'icon-512.png'), letterRatio: 0.6 },
    { size: 180, out: resolve(ICONS_DIR, 'apple-touch-icon.png'), letterRatio: 0.6 },
  ];

  for (const icon of icons) {
    const svg = fullBleedSvg(icon.size, icon.letterRatio);
    await writePng(svg, icon.out, icon.size);
    console.log(`Wrote ${icon.out}`);
  }

  // Maskable icon: full-bleed cobre with smaller "A" inside the safe zone (~60% of size)
  const maskableSize = 512;
  const maskableLetterRatio = 0.42; // smaller letter for maskable safe zone
  const maskableSvg = fullBleedSvg(maskableSize, maskableLetterRatio);
  const maskableOut = resolve(ICONS_DIR, 'icon-maskable-512.png');
  await writePng(maskableSvg, maskableOut, maskableSize);
  console.log(`Wrote ${maskableOut}`);

  // Favicon: 32x32 PNG saved with .ico extension. Browsers accept PNG-encoded ICO.
  const faviconSize = 32;
  const faviconSvg = fullBleedSvg(faviconSize, 0.7);
  const faviconBuffer = await sharp(Buffer.from(faviconSvg), { density: 384 })
    .resize(faviconSize, faviconSize)
    .png()
    .toBuffer();
  const faviconOut = resolve(PUBLIC_DIR, 'favicon.ico');
  await writeFile(faviconOut, faviconBuffer);
  console.log(`Wrote ${faviconOut}`);
}

generate().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
