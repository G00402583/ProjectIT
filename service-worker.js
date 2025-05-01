/* =========================================================
   FitFusion PWA — Service Worker (v10)
   ========================================================= */

   const CACHE_NAME = 'fitfusion-v10';

   /* “app-shell” files – cached at install */
   const APP_SHELL = [
     '/', '/index.html', '/login.html', '/signup.html', '/dashboard.html',
     '/style.css', '/dashboard.css', '/manifest.json',
     '/logo71.gif', '/icons/icon-192x192.png', '/icons/icon-512x512.png',
     /* core JS that must be available offline */
     '/js/login.js', '/js/signup.js', '/js/navbar.js'
   ];
   
   /* ---------- install ---------- */
   self.addEventListener('install', event => {
     event.waitUntil(
       caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
     );
   });
   
   /* ---------- fetch ---------- */
   self.addEventListener('fetch', event => {
     const { request } = event;
     const url = new URL(request.url);
   
     /* 1️⃣  Network-first for every JS file (keeps code fresh) */
     if (url.pathname.endsWith('.js')) {
       event.respondWith(networkFirst(request));
       return;
     }
   
     /* 2️⃣  BYPASS caching for all Supabase / API calls */
     if (url.hostname.includes('.supabase.co')) {
       return;     // let the browser handle it (no SW caching)
     }
   
     /* 3️⃣  Runtime-cache only static images / fonts */
     if (/\.(png|jpe?g|gif|webp|svg|woff2?)$/i.test(url.pathname)) {
       event.respondWith(cacheFirst(request));
       return;
     }
   
     /* 4️⃣  Everything else (HTML / CSS) – cache-first fallback */
     event.respondWith(
       caches.match(request).then(
         cached => cached || fetch(request)
       )
     );
   });
   
   /* ---------- activate (clean old caches) ---------- */
   self.addEventListener('activate', event => {
     event.waitUntil(
       caches.keys().then(keys =>
         Promise.all(keys
           .filter(k => k !== CACHE_NAME)
           .map(k => caches.delete(k)))
       )
     );
   });
   
   /* ===== helper strategies ===== */
   function networkFirst(req) {
     return fetch(req)
       .then(resp => {
         if (resp.ok) {
           const clone = resp.clone();
           caches.open(CACHE_NAME).then(c => c.put(req, clone));
         }
         return resp;
       })
       .catch(() => caches.match(req));
   }
   
   function cacheFirst(req) {
     return caches.match(req).then(
       cached =>
         cached ||
         fetch(req).then(resp => {
           if (resp.ok) {
             const clone = resp.clone();
             caches.open(CACHE_NAME).then(c => c.put(req, clone));
           }
           return resp;
         })
     );
   }
   