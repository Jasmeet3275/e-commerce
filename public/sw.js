// Vanilla Service Worker — no Workbox/next-pwa (CLAUDE.md: no new dependency
// for something hand-rollable at this scope). Covers PRD's offline
// requirement: last-viewed products/detail stay visible offline; nothing
// mutating is ever cached (see the GET-only guard below).
//
// Bump this on any change to the strategies/precache list below — it forces
// old caches to be dropped in `activate` instead of serving stale entries.
const CACHE_VERSION = "v1";
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, API_CACHE, IMAGE_CACHE];

// Known-stable static assets, not the hashed Next.js build output (that's
// content-hashed and already immutably cached by the browser's own HTTP
// cache — duplicating it here would just be redundant).
const SHELL_ASSETS = [
  "/favicon.ico",
  "/products/placeholder-1.svg",
  "/products/placeholder-2.svg",
  "/products/placeholder-3.svg",
  "/products/placeholder-4.svg",
  "/products/placeholder-5.svg",
  "/products/placeholder-6.svg",
  "/products/placeholder-7.svg",
  "/products/placeholder-8.svg",
];

const OFFLINE_FALLBACK_HTML = `<!doctype html>
<title>Offline</title>
<p style="font-family:sans-serif;padding:2rem;color:#404040">
  You're offline and haven't visited this page yet. Reconnect and try again.
</p>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Keyed by pathname (not the raw Request) so a page reached only via a
// client-side <Link> navigation (RSC fetch, cached under this same key by
// the warmPageCache() background fetch below) still satisfies a later
// direct/hard-reload navigation to that same URL.
async function networkFirst(request, cacheName) {
  const cacheKey = new URL(request.url).pathname;
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(cacheKey, response.clone());
    return response;
  } catch {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    return new Response(OFFLINE_FALLBACK_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached ?? (await networkFetch) ?? Response.error();
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

// Next's App Router <Link> navigation fetches the next page as an RSC
// payload (header `RSC: 1`), not a full-document `navigate`-mode request —
// so the networkFirst() branch above never sees normal in-app browsing, and
// a page only ever reached by clicking through the app would have no cached
// HTML for a later direct/offline visit. Fire a background plain-document
// fetch (no RSC header) for the same pathname so it ends up in PAGES_CACHE
// too, under the same pathname key networkFirst() reads from.
function warmPageCache(pathname) {
  return fetch(pathname, { headers: { accept: "text/html" } })
    .then((response) => {
      if (response.ok)
        return caches.open(PAGES_CACHE).then((cache) => cache.put(pathname, response));
    })
    .catch(() => undefined);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept mutations — only GET is safe to cache/replay.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGES_CACHE));
    return;
  }

  if (url.pathname.startsWith("/api/products")) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (request.headers.get("RSC") === "1") {
    event.waitUntil(warmPageCache(url.pathname));
  }
});
