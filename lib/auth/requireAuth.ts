import type { NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth/tokens";

const BEARER_PREFIX = "Bearer ";

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  const payload = await verifyToken(header.slice(BEARER_PREFIX.length));
  return payload?.sub ?? null;
}
