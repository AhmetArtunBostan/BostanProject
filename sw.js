const CACHE_NAME = 'weather-app-v1';
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/style.css',
    '/css/animations.css',
    '/js/weather.js',
    '/manifest.json',
    '/images/icons/icon-72x72.png',
    'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
];

// Service Worker Kurulumu
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Önbellek açıldı');
                return cache.addAll(STATIC_CACHE);
            })
    );
});

// Aktifleştirme ve Eski Önbellekleri Temizleme
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Olayını Yakalama
self.addEventListener('fetch', (event) => {
    event.respondWith(
        // Önce önbellekte ara
        caches.match(event.request)
            .then((response) => {
                // Önbellekte varsa döndür
                if (response) {
                    return response;
                }

                // Önbellekte yoksa ağdan al
                return fetch(event.request)
                    .then((response) => {
                        // Geçersiz yanıt veya opaque yanıt ise önbellekleme
                        if (!response || response.status !== 200 || response.type === 'opaque') {
                            return response;
                        }

                        // Yanıtı önbelleğe ekle
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Ağ hatası durumunda offline sayfasını göster
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        
                        // Diğer kaynaklar için önbellekteki versiyonu dene
                        return caches.match(event.request);
                    });
            })
    );
});
