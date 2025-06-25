const CACHE_NAME = 'top-ten-cache-v2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        './',
        '../index.html',
        '../styles/style.css',
        './main.js',
        './ids.js',
        './loaders.js',
        './constants.js',
        './signal.js',
        '../manifest.webmanifest',
        '../icon-192.png',
        '../icon-512.png',
        '../assets/logo-s.png',
        '../assets/uni-s1.png',
        '../assets/uni-s2.png',
        '../assets/uni-s3.png',
        '../assets/uni-s4.png',
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