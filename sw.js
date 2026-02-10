// Service Worker for Desire Cabinets Estimator PWA

const CACHE_NAME = 'desire-estimator-v11-ultra-tight-padding';
const urlsToCache = [
  '/DesireCabinets/',
  '/DesireCabinets/index.html',
  '/DesireCabinets/css/styles.css',
  '/DesireCabinets/js/auth.js',
  '/DesireCabinets/js/config.js',
  '/DesireCabinets/js/calculator.js',
  '/DesireCabinets/js/report.js',
  '/DesireCabinets/js/app.js',
  '/DesireCabinets/images/logo.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Update service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
