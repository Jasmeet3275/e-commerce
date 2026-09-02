// @vitest-environment node
import { NextRequest } from "next/server";

import { GET } from "@/app/api/products/route";

function makeRequest(query: string) {
  return new NextRequest(`http://localhost:3000/api/products${query}`);
}

describe("GET /api/products", () => {
  it("returns the first page by default", async () => {
    const response = await GET(makeRequest(""));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(20);
    expect(body.pagination.currentPage).toBe(1);
  });

  it("sets the documented Cache-Control header", async () => {
    const response = await GET(makeRequest(""));
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=60, stale-while-revalidate=300",
    );
  });

  it("respects limit and offset query params", async () => {
    const response = await GET(makeRequest("?limit=5&offset=10"));
    const body = await response.json();
    expect(body.items).toHaveLength(5);
    expect(body.items[0].id).toBe("product-11");
  });

  it("rejects an invalid limit with 400", async () => {
    const response = await GET(makeRequest("?limit=0"));
    expect(response.status).toBe(400);
  });

  it("rejects a negative offset with 400", async () => {
    const response = await GET(makeRequest("?offset=-1"));
    expect(response.status).toBe(400);
  });

  it("filters by the search query param", async () => {
    const response = await GET(makeRequest("?search=backpack"));
    const body = await response.json();
    expect(body.pagination.totalItems).toBe(10);
  });
});
