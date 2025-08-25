const CACHE = 'friends-snake-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './favicon.ico',
  './manifest.webmanifest',
  './assets/icons/icon-72.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-384.png',
  './assets/icons/icon-512.png',
  './assets/audio/bgm.wav',
  './assets/audio/eat.wav',
  './assets/audio/power.wav',
  './assets/audio/crash.wav'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Offline-first for own-origin requests
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, respClone));
        return resp;
      }).catch(() => caches.match('./index.html')))
    );
  }
});
