import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { AdminBanner } from '@/components/admin-banner';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { AuthProvider } from '@/components/auth-provider';
import { AppShell } from '@/components/layout/app-shell';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from '@/components/theme-provider';
import { TrialBanner } from '@/components/trial-banner';
import { Toaster } from '@/components/ui/sonner';
import { inter, jetbrainsMono } from '@/lib/fonts';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'APROVA — Vestibular Unifor Medicina',
  description:
    'Resolva mais de 1.000 questões. 20 anos de vestibular Unifor Medicina, organizadas por matéria.',
  applicationName: 'APROVA',
  appleWebApp: {
    capable: true,
    title: 'APROVA',
    statusBarStyle: 'default',
    startupImage: [
      // iPhone SE / 5/5s/5c (640x1136 @2x)
      {
        url: '/icons/splash-iphone-640x1136.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      // iPhone 6/7/8 (750x1334 @2x)
      {
        url: '/icons/splash-iphone-750x1334.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      // iPhone X / XS / 11 Pro / 12 mini / 13 mini (1125x2436 @3x)
      {
        url: '/icons/splash-iphone-1125x2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone XS Max / 11 Pro Max (1242x2688 @3x)
      {
        url: '/icons/splash-iphone-1242x2688.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  // `apple-mobile-web-app-capable` é deprecated (Chrome warning).
  // Adiciona o equivalente moderno `mobile-web-app-capable`.
  other: {
    'mobile-web-app-capable': 'yes',
  },
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

  let isAdmin = false;
  let trialEndsAt: string | null = null;
  let isProOrAdmin = false;
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, plan, plan_expires_at, trial_ends_at')
      .eq('id', session.user.id)
      .maybeSingle();
    isAdmin = profile?.is_admin === true;
    trialEndsAt =
      ((profile as { trial_ends_at?: string | null } | null)?.trial_ends_at as string | null | undefined) ??
      null;
    const plan = profile?.plan ?? 'free';
    const exp = profile?.plan_expires_at ? Date.parse(profile.plan_expires_at) : null;
    const proActive = plan === 'pro' && (!exp || Number.isNaN(exp) || exp > Date.now());
    isProOrAdmin = isAdmin || proActive;
  }

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
            <AdminBanner isAdmin={isAdmin} />
            <TrialBanner trialEndsAt={trialEndsAt} isProOrAdmin={isProOrAdmin} />
            <AppShell isAdmin={isAdmin}>{children}</AppShell>
            <MobileBottomNav />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
