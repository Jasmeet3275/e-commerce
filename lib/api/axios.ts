import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/lib/store/useAuthStore";
import type { AuthSession } from "@/types/auth";

export const api = axios.create({ baseURL: "/api" });

export function attachAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
}

api.interceptors.request.use(attachAuthHeader);

export type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export function shouldRetryWithRefresh(
  error: Pick<AxiosError, "response">,
  config: RetriableConfig | undefined,
): config is RetriableConfig {
  return error.response?.status === 401 && !!config && !config._retried;
}

let refreshPromise: Promise<AuthSession> | null = null;

// Exported for SessionBootstrap: on app load there's no access token in
// memory yet (it's never persisted — CLAUDE.md guardrail), but the httpOnly
// refresh cookie may still be valid from an earlier session. Reusing this
// (rather than a separate call) also means a bootstrap attempt and a
// reactive 401-triggered refresh around the same time share one request via
// the refreshPromise de-dupe below, instead of firing twice.
export async function refreshSession(): Promise<AuthSession> {
  refreshPromise ??= axios
    .post<AuthSession>("/api/auth/refresh")
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (!shouldRetryWithRefresh(error, config)) {
      throw error;
    }

    try {
      const session = await refreshSession();
      useAuthStore.getState().setSession(session.accessToken, session.user);
    } catch (refreshError) {
      useAuthStore.getState().clear();
      throw refreshError;
    }

    config._retried = true;
    return api(config);
  },
);
