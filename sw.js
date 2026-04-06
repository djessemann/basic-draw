var CACHE_NAME = "basic-draw-v2";
var ASSETS = [
  "/basic-draw/",
  "/basic-draw/index.html",
  "/basic-draw/manifest.json",
  "/basic-draw/lib/react.min.js",
  "/basic-draw/lib/react-dom.min.js",
  "/basic-draw/icons/icon-192.png",
  "/basic-draw/icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (response) {
        return response;
      }).catch(function () {
        if (e.request.mode === "navigate") {
          return caches.match("/basic-draw/index.html");
        }
      });
    })
  );
});
