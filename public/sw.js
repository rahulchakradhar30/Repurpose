const CACHE_NAME = 'repurpose-shell-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/offline.html',
];

// Install: Cache essential app shell and offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for navigation, NO clinical API caching, serve offline.html when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If request is to an API route (/api/...)
  // CRITICAL REQUIREMENT: Do NOT cache clinical results as though they are current when offline.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Offline',
            offline: true,
            message: 'You are currently offline. Live biomedical evidence cannot be fetched. Clinical results are never cached offline to prevent stale or inaccurate medical research data.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // App shell / static navigation: if network unavailable, automatically serve offline.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) {
          return offlinePage;
        }
        return new Response(
          '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/offline.html"></head><body>Redirecting to offline page...</body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // Static assets (images, icons)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
