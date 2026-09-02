const DEFAULT_REDIRECT = "/";

/**
 * Only allow same-origin, path-only redirects (e.g. "/checkout") — rejects
 * absolute URLs, protocol-relative ("//evil.com") and anything with a scheme,
 * so a `redirect` query param can never send a logged-in user off-site.
 */
export function safeRedirectPath(candidate: string | null | undefined): string {
  if (!candidate) return DEFAULT_REDIRECT;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return DEFAULT_REDIRECT;
  if (candidate.includes("://")) return DEFAULT_REDIRECT;
  return candidate;
}
