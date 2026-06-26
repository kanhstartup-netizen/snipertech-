// SniperTech AI — Service Worker v3
const CACHE = 'sniper-v3';
const PRECACHE = [
  './',
  './index.html',
  './app.js',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
];

// Install — cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network for API calls (Cloudflare Worker, Supabase, Firebase)
  const isAPI = url.hostname.includes('workers.dev') ||
                url.hostname.includes('supabase.co') ||
                url.hostname.includes('googleapis.com') ||
                url.hostname.includes('anthropic.com') ||
                url.hostname.includes('openai.com');

  if (isAPI) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response(JSON.stringify({ error: { message: 'Offline — no network' } }),
        { status: 503, headers: { 'Content-Type': 'application/json' } })
    ));
    return;
  }

  // Network first for HTML/JS (get latest)
  if (e.request.destination === 'document' || url.pathname.endsWith('.js')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for images/fonts
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Push notification handler
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'SniperTech AI';
  const body  = data.body  || 'ມີ signal ໃໝ່';
  e.waitUntil(
    self.registration.showNotification(title, {
      body, icon: './icon-192.png', badge: './icon-192.png',
      tag: 'sniper-signal', renotify: true,
      data: data.data || {},
      actions: [
        { action: 'open',  title: '📊 ເບິ່ງ' },
        { action: 'close', title: 'ປິດ' },
      ]
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'close') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const c = cs.find(x => x.url.includes('snipertech') && 'focus' in x);
      if (c) return c.focus();
      return clients.openWindow('https://kanhstartup-netizen.github.io/snipertech-/snipertech/');
    })
  );
});
