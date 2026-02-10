// Service Worker — Cache-first strategy for Stardust Identity
const CACHE_NAME = 'stardust-v9';
const ASSETS = [
    './',
    './index.html',
    './styles/main.css',
    './js/app.js',
    './js/audio.js',
    './js/bazi.js',
    './js/iching.js',
    './js/stars.js',
    './js/personality.js',
    './js/ai.js',
    './assets/favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Skip non-GET and cross-origin requests
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => caches.match('./index.html'))
    );
});
