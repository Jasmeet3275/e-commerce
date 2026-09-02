import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let initialized = false;

export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (initialized) return;
  if (!POSTHOG_KEY) return; // no project configured (e.g. local dev) — no-op, not an error

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Manual track() calls (below) are the single source of journey events —
    // autocapture would double up on the same clicks under noisier,
    // auto-generated event names.
    autocapture: false,
    disable_session_recording: false,
    capture_exceptions: true,
  });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}
