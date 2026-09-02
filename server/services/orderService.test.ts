import type { PlaceOrderInput } from "@/lib/validation/checkoutSchema";
import { placeOrder } from "@/server/services/orderService";

const input: PlaceOrderInput = {
  items: [{ productId: "product-1", count: 1 }],
  address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
  paymentToken: "mock_tok_abc",
};

describe("placeOrder", () => {
  it("places an order for the given user", () => {
    const order = placeOrder("user-1", input);
    expect(order.status).toBe("placed");
    expect(order.items).toEqual(input.items);
    expect(order.address).toEqual(input.address);
  });
});
