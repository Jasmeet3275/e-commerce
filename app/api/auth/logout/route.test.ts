// @vitest-environment node
import { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/logout/route";

function makeLogoutRequest(origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/auth/logout", {
    method: "POST",
    headers: { origin },
  });
}

describe("POST /api/auth/logout", () => {
  it("clears the refresh cookie", async () => {
    const response = await POST(makeLogoutRequest());
    expect(response.status).toBe(200);
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("rejects a cross-origin request with 403", async () => {
    const response = await POST(makeLogoutRequest("https://evil.com"));
    expect(response.status).toBe(403);
  });
});
