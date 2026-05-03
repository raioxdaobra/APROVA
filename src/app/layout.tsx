import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { inter, jetbrainsMono } from '@/lib/fonts';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'APROVA — Vestibular Unifor Medicina',
  description:
    'Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.',
  applicationName: 'APROVA',
};

export const viewport: Viewport = {
  themeColor: '#C4633B',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aprova-theme');if(t==='light'||t==='dark'){document.documentElement.classList.add(t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider initialSession={session}>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}
