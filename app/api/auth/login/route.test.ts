// @vitest-environment node
import { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/login/route";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

function makeLoginRequest(body: unknown, origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials and sets the refresh cookie", async () => {
    const response = await POST(
      makeLoginRequest({ email: "demo@example.com", password: "password123" }),
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.user.id).toBe("user-1");
    expect(typeof body.accessToken).toBe("string");
    // cardDetails/cvv/number must never appear anywhere in a response body
    expect(JSON.stringify(body)).not.toMatch(/cvv|cardNumber|password/i);

    const cookie = response.cookies.get("refresh_token");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("strict");
  });

  it("rejects wrong credentials with 401 and no cookie", async () => {
    const response = await POST(
      makeLoginRequest({ email: "demo@example.com", password: "wrong-password" }),
    );
    expect(response.status).toBe(401);
    expect(response.cookies.get("refresh_token")).toBeUndefined();
  });

  it("rejects a malformed body with 400", async () => {
    const response = await POST(makeLoginRequest({ email: "not-an-email", password: "short" }));
    expect(response.status).toBe(400);
  });

  it("rejects a cross-origin request with 403", async () => {
    const response = await POST(
      makeLoginRequest({ email: "demo@example.com", password: "password123" }, "https://evil.com"),
    );
    expect(response.status).toBe(403);
  });
});
