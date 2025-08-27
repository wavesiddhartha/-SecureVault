// SecureVault Pro Service Worker
// Version 2.0.0

const CACHE_NAME = 'securevault-pro-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';

// Files to cache for offline functionality
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(CACHE_URLS);
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
    
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        return cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME;
                    })
                    .map(cacheName => {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (request.method === 'GET') {
        // For navigation requests, always try network first
        if (request.mode === 'navigate') {
            event.respondWith(
                fetch(request)
                    .then(response => {
                        // If successful, cache the response
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    })
                    .catch(() => {
                        // If offline, serve from cache
                        return caches.match('/index.html');
                    })
            );
            return;
        }
        
        // For static assets, try cache first, then network
        if (isStaticAsset(url)) {
            event.respondWith(
                caches.match(request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        return fetch(request)
                            .then(response => {
                                // Cache successful responses
                                if (response.ok) {
                                    const responseClone = response.clone();
                                    caches.open(STATIC_CACHE).then(cache => {
                                        cache.put(request, responseClone);
                                    });
                                }
                                return response;
                            });
                    })
                    .catch(() => {
                        // Return a fallback for failed requests
                        if (request.destination === 'image') {
                            return new Response('', { status: 200, statusText: 'OK' });
                        }
                        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                    })
            );
            return;
        }
        
        // For API requests, try network first with timeout
        if (isAPIRequest(url)) {
            event.respondWith(
                Promise.race([
                    fetch(request),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), 5000)
                    )
                ])
                .catch(() => {
                    // Return cached response or offline indicator
                    return caches.match(request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Return offline response for API calls
                        return new Response(JSON.stringify({
                            error: 'Offline',
                            message: 'This feature requires an internet connection'
                        }), {
                            status: 503,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    });
                })
            );
            return;
        }
    }
    
    // Default: try network first, fallback to cache
    event.respondWith(
        fetch(request)
            .catch(() => {
                return caches.match(request);
            })
    );
});

// Background sync for data synchronization
self.addEventListener('sync', event => {
    console.log('Background sync:', event.tag);
    
    if (event.tag === 'backup-data') {
        event.waitUntil(syncBackupData());
    }
    
    if (event.tag === 'breach-check') {
        event.waitUntil(syncBreachCheck());
    }
});

// Push notifications (for future use)
self.addEventListener('push', event => {
    console.log('Push message received:', event);
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'SecureVault Pro notification',
            icon: '/icon-192x192.png',
            badge: '/icon-96x96.png',
            tag: 'securevault-notification',
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/icon-96x96.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'SecureVault Pro', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from the main thread
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic background sync (requires permission)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'backup-sync') {
        event.waitUntil(performPeriodicBackup());
    }
});

// Helper functions
function isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
           url.hostname === 'cdnjs.cloudflare.com' ||
           url.pathname.includes('/assets/');
}

function isAPIRequest(url) {
    return url.hostname === 'api.pwnedpasswords.com' ||
           url.pathname.startsWith('/api/') ||
           url.search.includes('api');
}

async function syncBackupData() {
    try {
        // Get data from IndexedDB or localStorage
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({
                type: 'SYNC_BACKUP',
                timestamp: Date.now()
            });
        }
        
        console.log('Backup sync completed');
        return Promise.resolve();
    } catch (error) {
        console.error('Backup sync failed:', error);
        return Promise.reject(error);
    }
}

async function syncBreachCheck() {
    try {
        // Perform breach check for stored passwords
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({
                type: 'SYNC_BREACH_CHECK',
                timestamp: Date.now()
            });
        }
        
        console.log('Breach check sync completed');
        return Promise.resolve();
    } catch (error) {
        console.error('Breach check sync failed:', error);
        return Promise.reject(error);
    }
}

async function performPeriodicBackup() {
    try {
        // Perform periodic backup
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({
                type: 'PERIODIC_BACKUP',
                timestamp: Date.now()
            });
        }
        
        console.log('Periodic backup completed');
        return Promise.resolve();
    } catch (error) {
        console.error('Periodic backup failed:', error);
        return Promise.reject(error);
    }
}

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('SecureVault Pro Service Worker loaded successfully');