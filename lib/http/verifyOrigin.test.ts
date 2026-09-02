// @vitest-environment node
import { isTrustedOrigin } from "@/lib/http/verifyOrigin";

function makeRequest(url: string, origin: string | null) {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  return new Request(url, { method: "POST", headers });
}

describe("isTrustedOrigin", () => {
  it("accepts a matching same-origin request", () => {
    const request = makeRequest("http://localhost:3000/api/auth/login", "http://localhost:3000");
    expect(isTrustedOrigin(request)).toBe(true);
  });

  it("rejects a cross-origin request", () => {
    const request = makeRequest("http://localhost:3000/api/auth/login", "https://evil.com");
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a missing Origin header", () => {
    const request = makeRequest("http://localhost:3000/api/auth/login", null);
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a malformed Origin header", () => {
    const request = makeRequest("http://localhost:3000/api/auth/login", "not-a-url");
    expect(isTrustedOrigin(request)).toBe(false);
  });
});
