var CACHE_NAME = "basic-draw-v1";
var ASSETS = [
  "/basic-draw/",
  "/basic-draw/index.html",
  "/basic-draw/manifest.json",
  "/basic-draw/icons/icon-192.png",
  "/basic-draw/icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
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
        // Cache font files and other assets dynamically
        if (response && response.status === 200) {
          var url = e.request.url;
          if (url.indexOf("fonts.gstatic.com") !== -1 || url.indexOf("fonts.googleapis.com") !== -1) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, clone);
            });
          }
        }
        return response;
      }).catch(function () {
        // Offline fallback - return cached index for navigation requests
        if (e.request.mode === "navigate") {
          return caches.match("/basic-draw/index.html");
        }
      });
    })
  );
});
