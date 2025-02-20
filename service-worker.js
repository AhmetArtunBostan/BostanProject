const CACHE_NAME = 'weather-app-v1';
const BASE_PATH = '/BostanProject';
const STATIC_CACHE = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/css/style.css`,
    `${BASE_PATH}/css/animations.css`,
    `${BASE_PATH}/js/weather.js`,
    `${BASE_PATH}/js/history.js`,
    `${BASE_PATH}/js/notifications.js`,
    `${BASE_PATH}/images/icons/icon-72x72.png`,
    `${BASE_PATH}/images/icons/icon-96x96.png`,
    `${BASE_PATH}/images/icons/icon-128x128.png`,
    `${BASE_PATH}/images/icons/icon-144x144.png`,
    `${BASE_PATH}/images/icons/icon-152x152.png`,
    `${BASE_PATH}/images/icons/icon-192x192.png`,
    `${BASE_PATH}/images/icons/icon-384x384.png`,
    `${BASE_PATH}/images/icons/icon-512x512.png`,
    `${BASE_PATH}/manifest.json`,
    `${BASE_PATH}/offline.html`
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(STATIC_CACHE);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    // GitHub Pages için URL'i düzelt
    const url = new URL(event.request.url);
    if (url.origin === location.origin) {
        // GitHub Pages yolu ekle
        if (!url.pathname.startsWith(BASE_PATH)) {
            url.pathname = BASE_PATH + url.pathname;
        }
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match(`${BASE_PATH}/offline.html`);
                        }
                        if (event.request.url.includes('/images/')) {
                            return caches.match(`${BASE_PATH}/images/icons/icon-72x72.png`);
                        }
                    });
            })
    );
});
