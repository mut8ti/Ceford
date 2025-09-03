const CACHE_NAME = 'ceford-cache-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/styles.min.css',
    '/main.min.js',
    '/images/businessmeeting.webp',
    '/images/logo-final.webp',
    '/js/error-handler.js',
    '/fonts/inter-400.woff2',
    '/fonts/inter-700.woff2'
];

// Add error handling
self.addEventListener('error', function(event) {
    console.warn('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
    console.warn('Service Worker Promise Rejection:', event.reason);
});

// Install service worker and cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching critical assets for LCP optimization');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.warn('Failed to cache some assets:', error);
            })
    );
});

// Serve from cache, falling back to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip non-HTTP(S) requests
    if (!event.request.url.startsWith('http')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Fetch from network and cache successful responses
                return fetch(event.request).then(response => {
                    // Only cache successful responses
                    if (response.status === 200 && response.type === 'basic') {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                // Return offline page or fallback for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('/');
                }
            })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
