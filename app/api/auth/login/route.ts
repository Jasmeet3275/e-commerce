import { NextResponse, type NextRequest } from "next/server";

import { isTrustedOrigin } from "@/lib/http/verifyOrigin";
import { loginSchema } from "@/lib/validation/authSchema";
import { login } from "@/server/services/authService";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7d, matches signRefreshToken's TTL

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = await login(parsed.data);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const response = NextResponse.json(result.session);
  response.cookies.set(REFRESH_COOKIE, result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
  return response;
}
