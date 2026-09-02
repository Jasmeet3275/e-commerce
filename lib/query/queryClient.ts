import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

// staleTime aligned to the 60s HTTP Cache-Control on GET routes (ARCHITECTURE §9)
const DEFAULT_STALE_TIME_MS = 60 * 1000;
const MAX_RETRIES = 2;

// TanStack Query's own default (retry: 3, unconditional) treats every error
// the same — including a 404, which means "this doesn't exist" and will
// never succeed no matter how many times it's retried. Without this, a
// single missing/removed product turns into ~3 retries with exponential
// backoff (~7s) of a stuck skeleton before the UI gives up. Only network
// failures and 5xx are worth retrying; 4xx is the server telling us the
// request itself is wrong.
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (isAxiosError(error) && error.response && error.response.status < 500) return false;
  return true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        retry: shouldRetryQuery,
      },
    },
  });
}
