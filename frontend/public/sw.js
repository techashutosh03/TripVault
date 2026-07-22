const CACHE_NAME = "tripvault-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/logo.svg"
];

// Install Service Worker
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[TripVault SW] Caching app shell assets...");
      return cache.addAll(ASSETS).catch(err => {
        console.warn("[TripVault SW] Pre-caching warning:", err);
      });
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[TripVault SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Interceptor (Network first, then Cache fallback)
self.addEventListener("fetch", (e) => {
  // Only handle GET requests and local domains
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache successful requests dynamically
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable
        return caches.match(e.request);
      })
  );
});
