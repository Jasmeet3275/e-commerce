import { getProductDetailById } from "@/data/products";

describe("getProductDetailById", () => {
  it("returns the product with a description and a 3-image gallery", () => {
    const detail = getProductDetailById("product-1");
    expect(detail?.id).toBe("product-1");
    expect(detail?.description.length).toBeGreaterThan(0);
    expect(detail?.images).toHaveLength(3);
    expect(new Set(detail?.images).size).toBe(3); // all distinct
  });

  it("includes price and discount from the base product", () => {
    const detail = getProductDetailById("product-1");
    expect(detail?.price).toBeGreaterThan(0);
    expect(typeof detail?.discount).toBe("number");
  });

  it("returns undefined for an unknown id", () => {
    expect(getProductDetailById("nope")).toBeUndefined();
  });
});
