export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  // Service workers cache aggressively by design, which fights next dev's
  // own Fast Refresh module invalidation (stale JS served from cache after
  // a hot reload). Production-only.
  if (process.env.NODE_ENV !== "production") return;

  void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
}
