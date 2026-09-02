import type { Mock } from "vitest";

import { api } from "@/lib/api/axios";
import { cancelOrder, placeOrder } from "@/lib/services/orderService";
import type { PlaceOrderInput } from "@/lib/validation/checkoutSchema";
import type { Order } from "@/types/order";

vi.mock("@/lib/api/axios", () => ({
  api: { post: vi.fn() },
}));

const mockedPost = api.post as Mock;

beforeEach(() => {
  mockedPost.mockReset();
});

describe("placeOrder", () => {
  it("posts to /orders and returns the created order", async () => {
    const input: PlaceOrderInput = {
      items: [{ productId: "product-1", count: 1 }],
      address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
      paymentToken: "mock_tok_abc",
    };
    const order: Order = {
      id: "order-1",
      items: input.items,
      address: input.address,
      status: "placed",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    mockedPost.mockResolvedValueOnce({ data: order });

    const result = await placeOrder(input);

    expect(mockedPost).toHaveBeenCalledWith("/orders", input);
    expect(result).toEqual(order);
  });
});

describe("cancelOrder", () => {
  it("posts to /orders/:id/cancel and returns the cancelled order", async () => {
    const order: Order = {
      id: "order-1",
      items: [{ productId: "product-1", count: 1 }],
      address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
      status: "cancelled",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    mockedPost.mockResolvedValueOnce({ data: order });

    const result = await cancelOrder("order-1");

    expect(mockedPost).toHaveBeenCalledWith("/orders/order-1/cancel");
    expect(result).toEqual(order);
  });
});
