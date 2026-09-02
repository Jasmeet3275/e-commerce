// @vitest-environment node
import { NextRequest } from "next/server";

import { GET } from "@/app/api/products/[id]/route";

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/products/[id]", () => {
  it("returns the product detail for a known id", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/products/product-1"),
      makeContext("product-1"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("product-1");
    expect(body.images).toHaveLength(3);
  });

  it("sets the documented Cache-Control header", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/products/product-1"),
      makeContext("product-1"),
    );
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=60, stale-while-revalidate=300",
    );
  });

  it("returns 404 for an unknown id", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/products/nope"),
      makeContext("nope"),
    );
    expect(response.status).toBe(404);
  });
});
