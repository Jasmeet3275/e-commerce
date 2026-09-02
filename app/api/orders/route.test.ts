// @vitest-environment node
import { NextRequest } from "next/server";

import { POST } from "@/app/api/orders/route";
import { signAccessToken } from "@/lib/auth/tokens";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-at-least-32-bytes-long";
});

const validBody = {
  items: [{ productId: "product-1", count: 2 }],
  address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
  paymentToken: "mock_tok_abc",
};

function makeRequest(
  body: unknown,
  {
    origin = "http://localhost:3000",
    authorization,
  }: { origin?: string; authorization?: string } = {},
) {
  const headers: Record<string, string> = { "content-type": "application/json", origin };
  if (authorization) headers.authorization = authorization;
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders", () => {
  it("places an order for an authenticated user", async () => {
    const token = await signAccessToken("user-1");
    const response = await POST(makeRequest(validBody, { authorization: `Bearer ${token}` }));
    expect(response.status).toBe(201);

    const order = await response.json();
    expect(order.status).toBe("placed");
    expect(order.items).toEqual(validBody.items);
    // raw payment data must never appear anywhere in a response body
    expect(JSON.stringify(order)).not.toMatch(/cvv|cardNumber|paymentToken|userId/i);
  });

  it("rejects an unauthenticated request with 401", async () => {
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(401);
  });

  it("rejects a malformed body with 400", async () => {
    const token = await signAccessToken("user-1");
    const response = await POST(makeRequest({ items: [] }, { authorization: `Bearer ${token}` }));
    expect(response.status).toBe(400);
  });

  it("rejects a cross-origin request with 403", async () => {
    const token = await signAccessToken("user-1");
    const response = await POST(
      makeRequest(validBody, { origin: "https://evil.com", authorization: `Bearer ${token}` }),
    );
    expect(response.status).toBe(403);
  });
});
