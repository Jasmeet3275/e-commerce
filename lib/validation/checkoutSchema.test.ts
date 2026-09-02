import { addressSchema, placeOrderSchema } from "@/lib/validation/checkoutSchema";

describe("addressSchema", () => {
  it("accepts a valid address without line2", () => {
    const result = addressSchema.safeParse({
      line1: "1 Main St",
      city: "Springfield",
      postalCode: "12345",
      country: "US",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an optional line2", () => {
    const result = addressSchema.safeParse({
      line1: "1 Main St",
      line2: "Apt 2",
      city: "Springfield",
      postalCode: "12345",
      country: "US",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing required field", () => {
    expect(
      addressSchema.safeParse({ line1: "1 Main St", city: "Springfield", country: "US" }).success,
    ).toBe(false);
  });

  it("rejects a blank required field", () => {
    expect(
      addressSchema.safeParse({
        line1: "  ",
        city: "Springfield",
        postalCode: "12345",
        country: "US",
      }).success,
    ).toBe(false);
  });
});

describe("placeOrderSchema", () => {
  const address = { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" };

  it("accepts a valid order", () => {
    const result = placeOrderSchema.safeParse({
      items: [{ productId: "product-1", count: 2 }],
      address,
      paymentToken: "mock_tok_abc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty items array", () => {
    expect(placeOrderSchema.safeParse({ items: [], address, paymentToken: "tok" }).success).toBe(
      false,
    );
  });

  it("rejects a non-positive item count", () => {
    expect(
      placeOrderSchema.safeParse({
        items: [{ productId: "product-1", count: 0 }],
        address,
        paymentToken: "tok",
      }).success,
    ).toBe(false);
  });

  it("rejects a missing payment token", () => {
    expect(
      placeOrderSchema.safeParse({ items: [{ productId: "product-1", count: 1 }], address })
        .success,
    ).toBe(false);
  });
});
