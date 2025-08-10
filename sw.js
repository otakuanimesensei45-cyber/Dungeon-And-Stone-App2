const CACHE_NAME = 'dsheets-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-512.png',
  './icons/icon-192.png',
  './icons/icon-180.png',
  './icons/icon-128.png',
  './icons/icon-96.png',
  './icons/icon-72.png',
  './icons/icon-48.png',
  './icons/icon-32.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        try {
          const url = new URL(req.url);
          if (url.origin === self.location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          }
        } catch(_) {}
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
