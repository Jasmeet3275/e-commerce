import type { Mock } from "vitest";

import { api } from "@/lib/api/axios";
import { login, logout } from "@/lib/services/authService";
import type { AuthSession } from "@/types/auth";

vi.mock("@/lib/api/axios", () => ({
  api: { post: vi.fn() },
}));

const mockedPost = api.post as Mock;

beforeEach(() => {
  mockedPost.mockReset();
});

describe("authService (client)", () => {
  it("login posts credentials and returns the session", async () => {
    const session: AuthSession = {
      accessToken: "token-abc",
      user: { id: "user-1", name: "Demo User", avatarUrl: null, country: "US" },
    };
    mockedPost.mockResolvedValueOnce({ data: session });

    const result = await login({ email: "demo@example.com", password: "password123" });

    expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
      email: "demo@example.com",
      password: "password123",
    });
    expect(result).toEqual(session);
  });

  it("logout posts to /auth/logout", async () => {
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });
    await logout();
    expect(mockedPost).toHaveBeenCalledWith("/auth/logout");
  });
});
