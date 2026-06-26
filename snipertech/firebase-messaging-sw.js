importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAhPABr48S-MQduuiGU1QGsr-4vLAHLPAQ",
  authDomain: "snipertech-c8bfd.firebaseapp.com",
  projectId: "snipertech-c8bfd",
  storageBucket: "snipertech-c8bfd.firebasestorage.app",
  messagingSenderId: "538937895261",
  appId: "1:538937895261:web:1a8e55bfc34e1b67fde0b4"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'SniperTech AI', {
    body: body || 'ມີສັນຍານໃໝ່',
    icon: icon || './logo.png',
    badge: './logo.png',
    tag: 'sniper-signal',
    renotify: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: '📊 ເບິ່ງສັນຍານ' },
      { action: 'close', title: 'ປິດ' }
    ]
  });
});

// Notification click handler
self.addEventListener('notificationclick', (e) => {
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
