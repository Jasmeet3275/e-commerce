import { createOrder } from "@/data/orders";
import type { PlaceOrderInput } from "@/lib/validation/checkoutSchema";

const input: PlaceOrderInput = {
  items: [{ productId: "product-1", count: 2 }],
  address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
  paymentToken: "mock_tok_abc",
};

describe("createOrder", () => {
  it("returns a placed order with the given items and address", () => {
    const order = createOrder("user-1", input);
    expect(order.status).toBe("placed");
    expect(order.items).toEqual(input.items);
    expect(order.address).toEqual(input.address);
    expect(typeof order.id).toBe("string");
    expect(typeof order.createdAt).toBe("string");
  });

  it("never exposes userId or paymentToken on the returned order", () => {
    const order = createOrder("user-1", input);
    expect(JSON.stringify(order)).not.toMatch(/userId|paymentToken/i);
  });

  it("assigns a unique id per order", () => {
    const first = createOrder("user-1", input);
    const second = createOrder("user-1", input);
    expect(first.id).not.toBe(second.id);
  });
});
