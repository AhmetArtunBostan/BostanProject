const CACHE_NAME = 'weather-app-v1';
const urlsToCache = [
    '/BostanProject/',
    '/BostanProject/index.html',
    '/BostanProject/css/style.css',
    '/BostanProject/css/animations.css',
    '/BostanProject/js/weather.js',
    '/BostanProject/js/history.js',
    '/BostanProject/js/notifications.js',
    '/BostanProject/images/icons/icon-72x72.png',
    '/BostanProject/images/icons/icon-96x96.png',
    '/BostanProject/images/icons/icon-128x128.png',
    '/BostanProject/images/icons/icon-144x144.png',
    '/BostanProject/images/icons/icon-152x152.png',
    '/BostanProject/images/icons/icon-192x192.png',
    '/BostanProject/images/icons/icon-384x384.png',
    '/BostanProject/images/icons/icon-512x512.png',
    '/BostanProject/manifest.json',
    '/BostanProject/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

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

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch(() => {
                    // If the fetch fails, return offline page for navigation
                    if (event.request.mode === 'navigate') {
                        return caches.match('/BostanProject/offline.html');
                    }
                    // Return default icon for image requests
                    if (event.request.url.includes('/images/')) {
                        return caches.match('/BostanProject/images/icons/icon-72x72.png');
                    }
                });
            })
    );
});
