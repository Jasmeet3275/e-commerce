import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/requireAuth";
import { isTrustedOrigin } from "@/lib/http/verifyOrigin";
import { cancelOrder } from "@/server/services/orderService";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/orders/[id]/cancel">,
) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = cancelOrder(userId, id);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
