// public/sw.js

const CACHE_NAME = 'wisebil-v1';
let reminderTimeoutId = null;

// Install event: cache the notification sound
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add('/notification.mp3');
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// Function to show the notification
const showNotification = () => {
  const messages = [
    { title: "Rappel d'activité", body: "N'oubliez pas d'enregistrer vos transactions du jour !" },
    { title: "Astuce financière", body: "Pensez à revoir vos abonnements. En avez-vous toujours besoin ?" },
    { title: "Objectif en vue !", body: "Chaque petite dépense compte pour atteindre vos objectifs." },
  ];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  self.registration.showNotification(randomMessage.title, {
    body: randomMessage.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    sound: '/notification.mp3',
    vibrate: [200, 100, 200], // Vibrate for 200ms, pause for 100ms, then vibrate for 200ms
  });
};

// Main logic to handle the reminder loop
const handleReminders = () => {
  // Clear any existing timeout to avoid duplicates
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId);
  }
  
  // The loop function
  const scheduleNext = () => {
    reminderTimeoutId = setTimeout(() => {
      showNotification();
      scheduleNext(); // Re-schedule itself
    }, 5 * 1000); // 5 seconds for testing
  };

  scheduleNext(); // Start the loop
};

// Function to stop reminders
const cancelReminders = () => {
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId);
    reminderTimeoutId = null;
  }
};


self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'schedule-reminders') {
    handleReminders();
  } else if (event.data && event.data.action === 'cancel-reminders') {
    cancelReminders();
  }
});
