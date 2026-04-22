const CACHE_NAME = 'sth-cartage-v3';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './logo.jpg',
  './icon-192.png',
  './icon-512.png',
  './Cartage_Register_BLANK.xlsx',
  './xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache install error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request.clone()).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'error') return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
