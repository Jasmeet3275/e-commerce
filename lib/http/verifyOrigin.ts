/**
 * Defense-in-depth alongside SameSite=Strict on the refresh cookie: rejects
 * cross-origin requests to mutating routes even if a browser's SameSite
 * handling is ever weaker than expected.
 */
export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Browsers always send Origin on POST/PUT/PATCH/DELETE, same-origin or not —
  // a missing header means a non-browser client, which we don't support here.
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
