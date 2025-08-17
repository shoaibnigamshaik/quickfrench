/*
  QuickFrench Service Worker
  - Provides an offline app shell without a PWA manifest
  - Caches navigation requests and static assets
  - Caches API GET responses (network-first, cache fallback)
*/

const SW_VERSION = "2025-08-17T15:30:00";
const STATIC_CACHE = `static-${SW_VERSION}`;
const RUNTIME_CACHE = `runtime-${SW_VERSION}`;

// Precache minimal shell and static public assets
const PRECACHE_URLS = [
  "/",
  "/settings",
  "/offline.html",
  "/favicon.ico",
  "/file.svg",
  "/globe.svg",
  "/vercel.svg",
  "/window.svg",
];

// Detect local dev (avoid caching). Consider http://localhost, 127.0.0.1, and non-https origins.
const isLocalDev = () => {
  const { hostname, protocol } = self.location;
  return (
    protocol !== "https:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  );
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  if (isLocalDev()) {
    // Don't precache during development
    return;
  }
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if available for faster navigations
      if ("navigationPreload" in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {}
      }
      // In dev, clear all caches to avoid any stale assets
      if (isLocalDev()) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } else {
        // Cleanup old caches
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        );
      }
      await self.clients.claim();
    })(),
  );
});

// Helper: fetch with timeout
const fetchWithTimeout = async (request, ms = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(request, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

// Basic type guards
const isNavigation = (request) => request.mode === "navigate";
const isSameOrigin = (url) => url.origin === self.location.origin;
const isNextStatic = (url) => url.pathname.startsWith("/_next/static");
const isStaticAsset = (url) =>
  /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/i.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // In local development, bypass all caching and just proxy network
  if (isLocalDev()) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle application navigations (App Shell pattern)
  if (isNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          // Use navigation preload if available
          const preload = await event.preloadResponse;
          const networkResp =
            preload || (await fetchWithTimeout(request, 6000));
          // Cache successful navigation response
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResp.clone());
          return networkResp;
        } catch {
          // Fallback to cached page for this request, then to cached '/', then offline page
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          const shell = await caches.match("/");
          if (shell) return shell;
          return caches.match("/offline.html");
        }
      })(),
    );
    return;
  }

  // Same-origin static assets: cache-first
  if (
    isSameOrigin(url) &&
    (isNextStatic(url) ||
      isStaticAsset(url) ||
      url.pathname.startsWith("/_next/image"))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const resp = await fetch(request);
          if (resp.ok) cache.put(request, resp.clone());
          return resp;
        } catch {
          return cached || caches.match("/offline.html");
        }
      })(),
    );
    return;
  }

  // API and other same-origin GET: network-first, cache fallback
  if (isSameOrigin(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          const resp = await fetch(request);
          // Cache successful JSON/text responses
          if (
            resp.ok &&
            (resp.headers.get("content-type") || "").match(
              /^(application|text)\//,
            )
          ) {
            cache.put(request, resp.clone());
          }
          return resp;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          // As a last resort, offline fallback for document-like requests
          return caches.match("/offline.html");
        }
      })(),
    );
  }
});

// Allow clients to trigger skipWaiting for updates
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
