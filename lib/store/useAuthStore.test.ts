import { useAuthStore } from "@/lib/store/useAuthStore";
import type { User } from "@/types/user";

const demoUser: User = { id: "user-1", name: "Demo User", avatarUrl: null, country: "US" };

beforeEach(() => {
  useAuthStore.getState().clear();
});

describe("useAuthStore", () => {
  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("sets the session on login", () => {
    useAuthStore.getState().setSession("token-123", demoUser);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("token-123");
    expect(state.user).toEqual(demoUser);
  });

  it("clears the session on logout", () => {
    useAuthStore.getState().setSession("token-123", demoUser);
    useAuthStore.getState().clear();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });
});
