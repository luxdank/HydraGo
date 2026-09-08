// Service Worker for HidraGo Push Notifications & Offline Support
const CACHE_NAME = 'hidrago-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push events
self.addEventListener('push', (event) => {
  let data = {
    title: 'HidraGo - Hora de Beber Água! 💧',
    body: 'Mantenha sua hidratação em dia e continue acumulando pontos e conquistas!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'hydration-reminder',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: '/' },
    tag: data.tag || 'hydration-reminder',
    renotify: true,
    actions: [
      { action: 'drink', title: '💧 Já bebi (+250ml)' },
      { action: 'snooze', title: '⏰ Lembrar em 15m' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle click on Push Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (action === 'drink') {
            client.postMessage({ type: 'QUICK_ADD_WATER', amount: 250 });
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle messages from the app to show local push notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: options?.icon || '/favicon.ico',
      badge: options?.badge || '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: options?.tag || 'hydration-reminder',
      renotify: true,
      ...options,
    });
  }
});
