/*
 * Service worker: makes the site work offline after the first visit.
 * App files are precached; the bundled Python runtime (vendor/pyodide/) is
 * cached the first time Python runs, so after that everything works offline.
 * The cache version and asset list are filled in by scripts/build-web.js.
 */
const CACHE = 'codemaker-__VERSION__';
const ASSETS = __ASSETS__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('codemaker-') && k !== CACHE && k !== 'codemaker-runtime').map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Large bundled files (the Python runtime) are cached the first time they're used.
  const isPyodide = url.pathname.includes('/vendor/pyodide/');
  e.respondWith(
    caches.match(req, { ignoreSearch: url.origin === self.location.origin }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok && isPyodide) {
          const copy = res.clone();
          caches.open('codemaker-runtime').then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    })
  );
});
