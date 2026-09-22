// A "cache name" is just a label for a storage bucket in the browser.
// Bump this number whenever you update index.html, so the browser knows
// to fetch and cache the new version instead of reusing the old one.
const CACHE_NAME = "gym-app-cache-v52";

const FILES_TO_CACHE = [
  "index.html",
  "sw.js"
];

// "install" runs once, when the service worker is first registered.
// Here we download and save the files we need for offline use.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// "activate" runs after install, and cleans up old cache versions
// so your phone doesn't fill up with outdated copies.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// "fetch" runs every time the page requests something (like loading itself).
// Strategy: try the cache first (works offline), fall back to the network
// if it's not cached yet.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
