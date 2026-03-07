// ChartChemistry Service Worker
// Handles push notifications, notification clicks, and basic offline caching.

const CACHE_NAME = "cc-v2";
const PRECACHE_URLS = ["/", "/compatibility", "/pricing", "/learn"];

// ============================================================
// Install — pre-cache app shell assets
// ============================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ============================================================
// Activate — clean up old caches
// ============================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ============================================================
// Fetch — stale-while-revalidate for pages and assets
// ============================================================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Network-first for API calls
  if (event.request.url.includes("/api/")) return;

  // Stale-while-revalidate for pages and assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});

// ============================================================
// Push — display notification from push event payload
// ============================================================
self.addEventListener("push", (event) => {
  let data = {
    title: "ChartChemistry",
    body: "You have a new cosmic update!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      // If payload is plain text, use it as the body
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: { url: data.url },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

// ============================================================
// Notification click — open the app to the relevant URL
// ============================================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});
