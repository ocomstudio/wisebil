// public/sw.js

// Ce service worker est intentionnellement simple.
// Son but principal est de permettre à l'application d'être installable (PWA).
// La logique de notification complexe a été déplacée pour assurer la compatibilité.

self.addEventListener('install', (event) => {
  // console.log('Service Worker installing.');
  // Activer le nouveau service worker immédiatement
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // console.log('Service Worker activating.');
  // Prendre le contrôle de la page immédiatement
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Stratégie de mise en cache "network first" pour les requêtes de navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // En cas d'échec du réseau, renvoyer une page de secours hors ligne (si elle existe)
        // Pour l'instant, nous laissons le navigateur gérer l'erreur.
      })
    );
  }
});
