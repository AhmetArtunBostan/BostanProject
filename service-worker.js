const CACHE_NAME = 'weather-app-v1';
const STATIC_CACHE = [
    '/BostanProject/',
    '/BostanProject/index.html',
    '/BostanProject/css/style.css',
    '/BostanProject/css/animations.css',
    '/BostanProject/js/weather.js',
    '/BostanProject/images/icons/icon-72x72.png',
    '/BostanProject/images/icons/icon-96x96.png',
    '/BostanProject/images/icons/icon-128x128.png',
    '/BostanProject/images/icons/icon-144x144.png',
    '/BostanProject/images/icons/icon-152x152.png',
    '/BostanProject/images/icons/icon-192x192.png',
    '/BostanProject/images/icons/icon-384x384.png',
    '/BostanProject/images/icons/icon-512x512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
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
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return a fallback for image requests
                        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                            return caches.match('/BostanProject/images/icons/icon-72x72.png');
                        }
                        // Return the offline page for other requests
                        return caches.match('/BostanProject/offline.html');
                    });
            })
    );
});
