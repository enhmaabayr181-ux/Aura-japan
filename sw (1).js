// AURA · Service Worker
const CACHE = 'aura-v33';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png', './bg-app.jpg', './bg-landing.jpg', './bg-grammar.jpg', './bg-kana.jpg', './bg-vocab.jpg', './bg-game.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Зөвхөн өөрийн домэйн (Supabase / CDN → сүлжээгээр)
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // HTML → шинэ хувилбар авахыг эрхэмлэнэ, офлайнд кэшээс
    e.respondWith(
      fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
                .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    // Дүрс/статик → кэшээс, байхгүй бол сүлжээ
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
