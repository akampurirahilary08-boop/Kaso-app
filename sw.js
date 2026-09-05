const CACHE = 'kaso-v2';
const FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // For the app page itself: always try the network first, so updates are picked up
  // immediately. Only fall back to the cached copy if there's genuinely no internet.
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request)
        .then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }
  // For icons/manifest: cache first is fine, they rarely change
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
