const CACHE_NAME = "pickuphero-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./driver.html",
  "./manifest-customer.json",
  "./manifest-driver.json",
  "./Roadwatchero.mp3",
  "./cart1.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// Install: Pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up outdated cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Bypass dynamic realtime network streams, serve cached shell when offline
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Strictly exclude Firestore streams, Google Maps dynamic tiles, and Stripe auth endpoints from cache
  if (
    requestUrl.origin.includes("firestore.googleapis.com") ||
    requestUrl.origin.includes("firebase") ||
    requestUrl.origin.includes("stripe.com") ||
    requestUrl.origin.includes("maps.googleapis.com") ||
    requestUrl.pathname.includes(".run.app")
  ) {
    return event.respondWith(fetch(event.request));
  }

  // Network-First with Cache Fallback for all application shell files
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});