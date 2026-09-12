/* Service worker mínimo: hace la web instalable (PWA) y muestra las
 * notificaciones push del navegador. No cachea nada (la app sigue online). */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Passthrough: requerido por algunos navegadores para considerar la app instalable.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let payload = { title: 'Mery García', body: '', url: '/es/mi-cuenta' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      tag: payload.id || undefined,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/es/mi-cuenta';
  const target = new URL(url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
