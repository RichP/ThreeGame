// Minimal service worker to avoid 404 errors during development.
// This worker does nothing — it installs and immediately activates.

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // No caching or interception — passthrough
})
