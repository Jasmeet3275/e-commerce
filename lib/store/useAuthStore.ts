import { create } from "zustand";

import type { User } from "@/types/user";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (accessToken: string, user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setSession: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  clear: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
