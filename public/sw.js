const CACHE_NAME = 'wisebil-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/notification.mp3'
];
const ALARM_NAME = 'wisebil-reminder-alarm';

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for the alarm
self.addEventListener('alarm', (event) => {
  if (event.name === ALARM_NAME) {
    showNotification();
  }
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'schedule-reminders') {
        createAlarm();
    } else if (event.data && event.data.action === 'cancel-reminders') {
        cancelAlarm();
    }
});

function createAlarm() {
    if (self.alarms) {
        self.alarms.create(ALARM_NAME, {
            periodInMinutes: 1, // Changed to 1 minute for testing
        });
        console.log('Wisebil reminder alarm created to fire every 1 minute.');
    } else {
        console.warn('Alarms API not supported in this service worker context.');
    }
}

function cancelAlarm() {
    if (self.alarms) {
        self.alarms.delete(ALARM_NAME);
        console.log('Wisebil reminder alarm cancelled.');
    }
}


function showNotification() {
  const notificationMessages = [
    { title: "Rappel Financier", body: "N'oubliez pas d'enregistrer vos dépenses et revenus du jour !" },
    { title: "Astuce Wisebil", body: "Saviez-vous que suivre même les petites dépenses peut révéler de grandes opportunités d'épargne ?" },
    { title: "Votre bilan financier", body: "Prenez un moment pour vérifier votre budget. Chaque saisie compte !" },
    { title: "Hello !", body: "C'est votre assistant Wisebil. Pensez à mettre à jour vos finances." }
  ];

  const randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];

  const notificationOptions = {
    body: randomMessage.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    sound: '/notification.mp3',
    vibrate: [200, 100, 200], // Vibration pattern
    actions: [
        { action: 'open_app', title: 'Ouvrir Wisebil' }
    ]
  };

  self.registration.showNotification(randomMessage.title, notificationOptions);
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'open_app') {
    clients.openWindow('/');
  }
}, false);
