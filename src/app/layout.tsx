import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { inter, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'APROVA — Vestibular Unifor Medicina',
  description: 'Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.',
  applicationName: 'APROVA',
};

export const viewport: Viewport = {
  themeColor: '#C4633B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
