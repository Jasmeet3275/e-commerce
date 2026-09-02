import { cancelOrder, createOrder } from "@/data/orders";
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

describe("cancelOrder", () => {
  it("cancels an order owned by the given user", () => {
    const order = createOrder("user-1", input);
    const cancelled = cancelOrder("user-1", order.id);
    expect(cancelled?.status).toBe("cancelled");
  });

  it("is idempotent — cancelling an already-cancelled order is a no-op", () => {
    const order = createOrder("user-1", input);
    cancelOrder("user-1", order.id);
    const result = cancelOrder("user-1", order.id);
    expect(result?.status).toBe("cancelled");
  });

  it("returns undefined for an unknown order id", () => {
    expect(cancelOrder("user-1", "order-does-not-exist")).toBeUndefined();
  });

  it("returns undefined when the order belongs to a different user", () => {
    const order = createOrder("user-1", input);
    expect(cancelOrder("user-2", order.id)).toBeUndefined();
  });
});
