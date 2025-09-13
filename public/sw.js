// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
