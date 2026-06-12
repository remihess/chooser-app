const CACHE_NAME = 'chooser-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  '/icon-192.png',
];

// Install-Event: Speichert alle Core-Dateien im Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate-Event: Alte Caches aufräumen, falls die Version (CACHE_NAME) hochgesetzt wird
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch-Event: Network-First mit Fallback auf den Offline-Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Wenn wir online sind und eine valide Antwort bekommen:
        // Klonen wir die Antwort und updaten damit dynamisch unseren Cache.
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response; // Die frische Netzwerk-Antwort an die App zurückgeben
      })
      .catch(() => {
        // Wenn das Netzwerk fehlschlägt (Offline), schaue im Cache nach
        return caches.match(event.request);
      })
  );
});