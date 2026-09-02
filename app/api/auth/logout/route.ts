import { NextResponse, type NextRequest } from "next/server";

import { isTrustedOrigin } from "@/lib/http/verifyOrigin";

const REFRESH_COOKIE = "refresh_token";

// Stateless JWTs: logout just drops the refresh cookie client-side. There's no
// server-side revocation list in this mock backend, so an already-issued
// refresh token stays technically valid (only) until it expires (7d) if
// captured before logout — acceptable for this project's scope, called out
// here since a real system would add one.
export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
