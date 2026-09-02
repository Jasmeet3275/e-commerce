// @vitest-environment node
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/auth/tokens";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

describe("access/refresh tokens", () => {
  it("round-trips a valid access token", async () => {
    const token = await signAccessToken("user-1");
    const payload = await verifyToken(token);
    expect(payload).toEqual({ sub: "user-1" });
  });

  it("round-trips a valid refresh token", async () => {
    const token = await signRefreshToken("user-2");
    const payload = await verifyToken(token);
    expect(payload).toEqual({ sub: "user-2" });
  });

  it("rejects a tampered token", async () => {
    const token = await signAccessToken("user-1");
    const tampered = `${token.slice(0, -2)}xx`;
    expect(await verifyToken(tampered)).toBeNull();
  });

  it("rejects garbage input", async () => {
    expect(await verifyToken("not-a-jwt")).toBeNull();
  });
});
