import { getProductDetail, listProducts } from "@/server/services/productService";

describe("listProducts", () => {
  it("returns the first page with correct pagination metadata", () => {
    const result = listProducts({ limit: 20, offset: 0 });
    expect(result.items).toHaveLength(20);
    expect(result.items[0]?.id).toBe("product-1");
    expect(result.pagination).toEqual({
      limit: 20,
      offset: 0,
      currentPage: 1,
      totalPages: 8, // 150 items / 20 per page, rounded up
      totalItems: 150,
    });
  });

  it("returns a middle page at the correct offset", () => {
    const result = listProducts({ limit: 20, offset: 40 });
    expect(result.items[0]?.id).toBe("product-41");
    expect(result.pagination.currentPage).toBe(3);
  });

  it("returns a partial last page", () => {
    const result = listProducts({ limit: 20, offset: 140 });
    expect(result.items).toHaveLength(10); // 150 - 140
    expect(result.pagination.currentPage).toBe(8);
    expect(result.pagination.totalPages).toBe(8);
  });

  it("returns no items when offset is beyond the catalog", () => {
    const result = listProducts({ limit: 20, offset: 1000 });
    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(150);
  });

  it("respects a custom limit", () => {
    const result = listProducts({ limit: 5, offset: 0 });
    expect(result.items).toHaveLength(5);
    expect(result.pagination.totalPages).toBe(30);
  });
});

describe("listProducts with search", () => {
  it("filters by a case-insensitive substring match on name", () => {
    const result = listProducts({ limit: 50, offset: 0, search: "backpack" });
    expect(result.items).toHaveLength(10);
    expect(result.items.every((item) => item.name.toLowerCase().includes("backpack"))).toBe(true);
    expect(result.pagination.totalItems).toBe(10);
  });

  it("is case-insensitive", () => {
    const result = listProducts({ limit: 50, offset: 0, search: "BACKPACK" });
    expect(result.pagination.totalItems).toBe(10);
  });

  it("returns no items for a non-matching search", () => {
    const result = listProducts({ limit: 50, offset: 0, search: "zzzznotfound" });
    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("recalculates pagination based on the filtered count, not the full catalog", () => {
    const result = listProducts({ limit: 5, offset: 0, search: "backpack" });
    expect(result.pagination.totalPages).toBe(2); // 10 matches / 5 per page
  });
});

describe("getProductDetail", () => {
  it("returns the detail for a known product", () => {
    const detail = getProductDetail("product-1");
    expect(detail?.id).toBe("product-1");
    expect(detail?.images).toHaveLength(3);
  });

  it("returns undefined for an unknown product", () => {
    expect(getProductDetail("nope")).toBeUndefined();
  });
});
