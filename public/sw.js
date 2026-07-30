const CACHE = "fitfkr-v1";
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["/","/index.html","/manifest.webmanifest","/icon.svg"]))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response || caches.match("/index.html")))));
