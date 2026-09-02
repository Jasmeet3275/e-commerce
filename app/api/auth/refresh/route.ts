import { NextResponse, type NextRequest } from "next/server";

import { isTrustedOrigin } from "@/lib/http/verifyOrigin";
import { refresh } from "@/server/services/authService";

const REFRESH_COOKIE = "refresh_token";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const result = await refresh(refreshToken);
  if ("error" in result) {
    const response = NextResponse.json({ error: result.error }, { status: 401 });
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  return NextResponse.json(result.session);
}
