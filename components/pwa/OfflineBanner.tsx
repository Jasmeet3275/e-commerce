"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return !navigator.onLine;
}

function getServerSnapshot(): boolean {
  // navigator isn't available during SSR — assume online; useSyncExternalStore
  // re-syncs to the real client value right after hydration, no manual effect
  // or mismatch handling needed.
  return false;
}

export function OfflineBanner() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white"
    >
      You&apos;re offline — showing cached content. Checkout and other actions need a connection.
    </div>
  );
}
