import { QueryClient } from "@tanstack/react-query";

// staleTime aligned to the 60s HTTP Cache-Control on GET routes (ARCHITECTURE §9)
const DEFAULT_STALE_TIME_MS = 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
      },
    },
  });
}
