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

async function refreshSession(): Promise<AuthSession> {
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
