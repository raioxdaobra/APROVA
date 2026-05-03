/* APROVA service worker — minimal offline shell. */
const CACHE_VERSION = 'aprova-v1';
const CORE = ['/', '/login', '/signup'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Don't cache Supabase, PostHog or Sentry traffic.
  if (
    url.host.includes('supabase.co') ||
    url.host.includes('posthog.com') ||
    url.host.includes('sentry.io')
  ) {
    return;
  }

  // Network-first for HTML so users always get the freshest shell when online.
  if (req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return r;
        })
        .catch(() => caches.match(req).then((r) => r ?? caches.match('/')))
    );
    return;
  }

  // Cache-first for hashed static assets and PWA icons.
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.match(req).then(
        (r) =>
          r ??
          fetch(req).then((rs) => {
            const copy = rs.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
            return rs;
          })
      )
    );
  }
});
