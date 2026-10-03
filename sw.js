// Service worker do Den: funciona offline e recebe notificações.
const VERSION = 'den-v1.3.0';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/parse.js', 'js/md.js', 'js/store.js', 'js/config.js', 'vendor/supabase.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Dados do Supabase sempre pela rede.
  if (url.hostname.endsWith('supabase.co')) return;
  // Fontes: usa o cache e atualiza em segundo plano.
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // App: rede primeiro (para pegar atualizações), cache se estiver offline.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html'))));
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Den', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(data.title || 'Den', {
    body: data.body || '', tag: data.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: data.url || './' },
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow(e.notification.data?.url || './');
  }));
});
