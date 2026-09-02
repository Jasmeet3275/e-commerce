import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/requireAuth";
import { isTrustedOrigin } from "@/lib/http/verifyOrigin";
import { placeOrderSchema } from "@/lib/validation/checkoutSchema";
import { placeOrder } from "@/server/services/orderService";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = placeOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const order = placeOrder(userId, parsed.data);
  return NextResponse.json(order, { status: 201 });
}
