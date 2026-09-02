"use client";

import { useEffect } from "react";

import { refreshSession } from "@/lib/api/axios";
import { useAuthStore } from "@/lib/store/useAuthStore";

// The access token lives only in memory, so it's gone after a reload or a
// new tab — but the httpOnly refresh cookie may still be valid. Without
// this, the UI shows "logged out" (wrong) until something coincidentally
// makes an API call that 401s and triggers the interceptor's reactive
// refresh. This makes the correct state show up immediately on load instead.
export function SessionBootstrap() {
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) return;

    refreshSession()
      .then((session) => useAuthStore.getState().setSession(session.accessToken, session.user))
      .catch(() => undefined); // no valid refresh cookie — correctly stay logged out
  }, []);

  return null;
}
