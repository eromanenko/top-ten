const CACHE_NAME = 'top-ten-cache-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        './',
        './index.html',
        './style.css',
        './main.js',
        './ids.js',
        './loaders.js',
        './constants.js',
        './signal.js',
        './manifest.webmanifest',
        './icon-192.png',
        './icon-512.png',
        './logo-s.png',
      ])
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});