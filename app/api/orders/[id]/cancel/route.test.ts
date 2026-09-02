// @vitest-environment node
import { NextRequest } from "next/server";

import { POST as cancelOrderPOST } from "@/app/api/orders/[id]/cancel/route";
import { POST as placeOrderPOST } from "@/app/api/orders/route";
import { signAccessToken } from "@/lib/auth/tokens";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

const validBody = {
  items: [{ productId: "product-1", count: 2 }],
  address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
  paymentToken: "mock_tok_abc",
};

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeCancelRequest(
  orderId: string,
  {
    origin = "http://localhost:3000",
    authorization,
  }: { origin?: string; authorization?: string } = {},
) {
  const headers: Record<string, string> = { origin };
  if (authorization) headers.authorization = authorization;
  return new NextRequest(`http://localhost:3000/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers,
  });
}

describe("POST /api/orders/[id]/cancel", () => {
  it("cancels an order owned by the requesting user", async () => {
    const token = await signAccessToken("user-1");
    const placeResponse = await placeOrderPOST(
      new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validBody),
      }),
    );
    const order = await placeResponse.json();

    const response = await cancelOrderPOST(
      makeCancelRequest(order.id, { authorization: `Bearer ${token}` }),
      makeContext(order.id),
    );
    expect(response.status).toBe(200);
    const cancelled = await response.json();
    expect(cancelled.status).toBe("cancelled");
  });

  it("rejects an unauthenticated request with 401", async () => {
    const response = await cancelOrderPOST(makeCancelRequest("order-1"), makeContext("order-1"));
    expect(response.status).toBe(401);
  });

  it("returns 404 for an unknown order id", async () => {
    const token = await signAccessToken("user-1");
    const response = await cancelOrderPOST(
      makeCancelRequest("order-does-not-exist", { authorization: `Bearer ${token}` }),
      makeContext("order-does-not-exist"),
    );
    expect(response.status).toBe(404);
  });

  it("returns 404 when the order belongs to a different user", async () => {
    const ownerToken = await signAccessToken("user-1");
    const placeResponse = await placeOrderPOST(
      new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
          authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify(validBody),
      }),
    );
    const order = await placeResponse.json();

    const otherToken = await signAccessToken("user-2");
    const response = await cancelOrderPOST(
      makeCancelRequest(order.id, { authorization: `Bearer ${otherToken}` }),
      makeContext(order.id),
    );
    expect(response.status).toBe(404);
  });

  it("rejects a cross-origin request with 403", async () => {
    const token = await signAccessToken("user-1");
    const response = await cancelOrderPOST(
      makeCancelRequest("order-1", {
        origin: "https://evil.com",
        authorization: `Bearer ${token}`,
      }),
      makeContext("order-1"),
    );
    expect(response.status).toBe(403);
  });
});
