import { productsPageParamSchema } from "@/lib/validation/productSchema";

describe("productsPageParamSchema", () => {
  it("parses a valid numeric page", () => {
    expect(productsPageParamSchema.parse("3")).toBe(3);
  });

  it("defaults to 1 when undefined", () => {
    expect(productsPageParamSchema.parse(undefined)).toBe(1);
  });

  it("falls back to 1 for a non-numeric value", () => {
    expect(productsPageParamSchema.parse("not-a-number")).toBe(1);
  });

  it("falls back to 1 for zero or negative pages", () => {
    expect(productsPageParamSchema.parse("0")).toBe(1);
    expect(productsPageParamSchema.parse("-2")).toBe(1);
  });

  it("falls back to 1 for a non-integer page", () => {
    expect(productsPageParamSchema.parse("1.5")).toBe(1);
  });
});
