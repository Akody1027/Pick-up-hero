importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDhSqKn5eg_X-c8uNMjp7BTDWgIpV8dnvI",
  authDomain: "pickuphero-1993f.firebaseapp.com",
  projectId: "pickuphero-1993f",
  storageBucket: "pickuphero-1993f.firebasestorage.app",
  messagingSenderId: "234138921429",
  appId: "1:234138921429:web:61071ce9b8e5e6ce70755c",
  measurementId: "G-88L5X10BTW",
});

const messaging = firebase.messaging();

const CACHE_NAME = "pickuphero-driver-v1";
const STATIC_ASSETS = [
  "./driver.html",
  "./manifest-driver.json",
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

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./heroimg192.png"
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});







