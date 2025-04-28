const CACHE_NAME = 'fitfusion-v1';

/* 1️⃣  app-shell files only */
const APP_SHELL = [
  '/',                           // root
  '/index.html',
  '/login.html',
  '/signup.html',
  '/dashboard.html',
  '/style.css',
  '/dashboard.css',
  '/manifest.json',
  '/logo71.gif',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // JS that runs on first load
  '/js/login.js',
  '/js/signup.js',
  '/js/navbar.js'
];

/* ----- install ----- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

/* ----- fetch ----- */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Try cache first, then network, then fallback
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(networkResp => {
          // runtime-cache other GET requests (e.g. images)
          if (request.method === 'GET' && networkResp.status === 200) {
            const cloned = networkResp.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, cloned));
          }
          return networkResp;
        })
      );
    })
  );
});

/* ----- activate (clean old caches) ----- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
});
