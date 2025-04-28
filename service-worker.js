/* =========================================================
   FitFusion PWA — Service Worker  (network-first for JS)
   ========================================================= */

   const CACHE_NAME = 'fitfusion-v2';

   /* 1️⃣  “app-shell” files cached on install */
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
   
     /* core JS that must be available offline */
     '/js/login.js',
     '/js/signup.js',
     '/js/navbar.js'
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
   
     /* 1. Network-first for every JS file  */
     if (url.pathname.endsWith('.js')) {
       event.respondWith(
         fetch(request)
           .then(resp => {
             /* on success, update the cache */
             if (resp.status === 200) {
               const clone = resp.clone();
               caches.open(CACHE_NAME).then(c => c.put(request, clone));
             }
             return resp;
           })
           .catch(() => caches.match(request))   // offline fallback
       );
       return;   // stop processing, we handled it
     }
   
     /* 2. Cache-first for everything else (HTML, CSS, images…) */
     event.respondWith(
       caches.match(request).then(cached =>
         cached ||
         fetch(request).then(networkResp => {
           /* runtime-cache GET requests so they’re available offline next time */
           if (request.method === 'GET' && networkResp.status === 200) {
             const clone = networkResp.clone();
             caches.open(CACHE_NAME).then(c => c.put(request, clone));
           }
           return networkResp;
         })
       )
     );
   });
   
   /* ---------- activate (clean old caches) ---------- */
   self.addEventListener('activate', event => {
     event.waitUntil(
       caches.keys().then(keys =>
         Promise.all(
           keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
         )
       )
     );
   });
   