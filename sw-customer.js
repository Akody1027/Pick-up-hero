const CACHE_NAME = "pickuphero-cust-v1";
const STATIC_ASSETS = [
  "./customer.html",
  "./manifest-customer.json",
  "./Roadwatchero.mp3",
  "./heroimg192.png",
  "./heroimg512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (
    requestUrl.origin.includes("firestore.googleapis.com") ||
    requestUrl.origin.includes("firebase") ||
    requestUrl.origin.includes("stripe.com") ||
    requestUrl.origin.includes("maps.googleapis.com") ||
    requestUrl.pathname.includes(".run.app")
  ) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(
    fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type !== "basic") return response;
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
