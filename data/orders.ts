import type { PlaceOrderInput } from "@/lib/validation/checkoutSchema";
import type { Order } from "@/types/order";

type StoredOrder = Order & { userId: string };

const orders: StoredOrder[] = [];

function toPublicOrder(storedOrder: StoredOrder): Order {
  const { id, items, address, status, createdAt } = storedOrder;
  return { id, items, address, status, createdAt };
}

export function createOrder(userId: string, input: PlaceOrderInput): Order {
  const order: StoredOrder = {
    id: `order-${crypto.randomUUID()}`,
    items: input.items,
    address: input.address,
    status: "placed",
    createdAt: new Date().toISOString(),
    userId,
  };
  orders.push(order);
  return toPublicOrder(order);
}
