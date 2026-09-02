// @vitest-environment node
import { NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/requireAuth";
import { signAccessToken } from "@/lib/auth/tokens";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/orders", { headers });
}

describe("getAuthenticatedUserId", () => {
  it("resolves the user id from a valid bearer token", async () => {
    const token = await signAccessToken("user-1");
    const userId = await getAuthenticatedUserId(makeRequest({ authorization: `Bearer ${token}` }));
    expect(userId).toBe("user-1");
  });

  it("returns null when the header is missing", async () => {
    expect(await getAuthenticatedUserId(makeRequest())).toBeNull();
  });

  it("returns null when the header has no Bearer prefix", async () => {
    const token = await signAccessToken("user-1");
    expect(await getAuthenticatedUserId(makeRequest({ authorization: token }))).toBeNull();
  });

  it("returns null for a tampered token", async () => {
    const token = await signAccessToken("user-1");
    const tampered = `${token.slice(0, -2)}xx`;
    expect(
      await getAuthenticatedUserId(makeRequest({ authorization: `Bearer ${tampered}` })),
    ).toBeNull();
  });
});
