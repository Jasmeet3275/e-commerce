"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { createQueryClient } from "@/lib/query/queryClient";

export function Providers({ children }: { children: ReactNode }) {
  // useState (not module-level) so each browser session gets its own client,
  // and a fresh one is created per server request — never shared across users.
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
