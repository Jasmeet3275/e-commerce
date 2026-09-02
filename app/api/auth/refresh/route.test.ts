// @vitest-environment node
import { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/refresh/route";
import { signRefreshToken } from "@/lib/auth/tokens";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

function makeRefreshRequest(cookieHeader: string | null, origin = "http://localhost:3000") {
  const headers = new Headers({ origin });
  if (cookieHeader) headers.set("cookie", cookieHeader);
  return new NextRequest("http://localhost:3000/api/auth/refresh", { method: "POST", headers });
}

describe("POST /api/auth/refresh", () => {
  it("issues a new access token for a valid refresh cookie", async () => {
    const refreshToken = await signRefreshToken("user-1");
    const response = await POST(makeRefreshRequest(`refresh_token=${refreshToken}`));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user.id).toBe("user-1");
  });

  it("returns 401 with no cookie at all", async () => {
    const response = await POST(makeRefreshRequest(null));
    expect(response.status).toBe(401);
  });

  it("returns 401 and clears the cookie for an invalid refresh token", async () => {
    const response = await POST(makeRefreshRequest("refresh_token=garbage"));
    expect(response.status).toBe(401);
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("rejects a cross-origin request with 403", async () => {
    const refreshToken = await signRefreshToken("user-1");
    const response = await POST(
      makeRefreshRequest(`refresh_token=${refreshToken}`, "https://evil.com"),
    );
    expect(response.status).toBe(403);
  });
});
