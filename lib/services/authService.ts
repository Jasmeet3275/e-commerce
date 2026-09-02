import { api } from "@/lib/api/axios";
import type { AuthSession, LoginInput } from "@/types/auth";

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await api.post<AuthSession>("/auth/login", input);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
