import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'APROVA — Vestibular Unifor Medicina',
    short_name: 'APROVA',
    description:
      'Resolva mais de 1.000 questões reais do vestibular Unifor Medicina, organizadas por matéria. Estude com IA, simulados e trilha personalizada.',
    start_url: '/',
    scope: '/',
    id: '/',
    display: 'standalone',
    background_color: '#C4633B',
    theme_color: '#C4633B',
    orientation: 'portrait',
    icons: [
      // "any" purpose: shown as-is on Android/desktop launchers.
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      // "maskable" purpose: full-bleed asset cropped by the platform shape.
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education'],
    lang: 'pt-BR',
  };
}
