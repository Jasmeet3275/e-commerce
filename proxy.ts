import { NextResponse, type NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth/tokens";

const PROTECTED_PATHS = ["/checkout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;
  const payload = refreshToken ? await verifyToken(refreshToken) : null;
  if (payload) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

// `matcher` must be a static literal — Next.js parses it via AST at build time
// without executing the module, so it can't be derived from PROTECTED_PATHS.
// Keep the two in sync by hand when adding a protected route.
export const config = {
  matcher: ["/checkout/:path*"],
};
