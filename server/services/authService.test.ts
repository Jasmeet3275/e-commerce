// @vitest-environment node
import { login, refresh } from "@/server/services/authService";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

describe("authService.login", () => {
  it("returns a session for valid credentials", async () => {
    const result = await login({ email: "demo@example.com", password: "password123" });
    expect(result).not.toHaveProperty("error");
    if ("error" in result) return;
    expect(result.session.user.id).toBe("user-1");
    expect(typeof result.session.accessToken).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
  });

  it("rejects a wrong password", async () => {
    const result = await login({ email: "demo@example.com", password: "wrong-password" });
    expect(result).toEqual({ error: "invalid_credentials" });
  });

  it("rejects an unknown email", async () => {
    const result = await login({ email: "nobody@example.com", password: "password123" });
    expect(result).toEqual({ error: "invalid_credentials" });
  });
});

describe("authService.refresh", () => {
  it("issues a new access token for a valid refresh token", async () => {
    const loginResult = await login({ email: "demo@example.com", password: "password123" });
    if ("error" in loginResult) throw new Error("login should have succeeded");

    const result = await refresh(loginResult.refreshToken);
    expect(result).not.toHaveProperty("error");
    if ("error" in result) return;
    expect(result.session.user.id).toBe("user-1");
  });

  it("rejects an invalid refresh token", async () => {
    const result = await refresh("not-a-real-token");
    expect(result).toEqual({ error: "invalid_token" });
  });
});
