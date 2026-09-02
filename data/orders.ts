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

// Scoped by userId so cancelling someone else's order id is indistinguishable
// from cancelling a nonexistent one — the route returns 404 either way.
export function cancelOrder(userId: string, orderId: string): Order | undefined {
  const order = orders.find((entry) => entry.id === orderId && entry.userId === userId);
  if (!order) return undefined;

  // No time window / no approval step (PRD FR #7) — cancelling an
  // already-cancelled order is a no-op, not an error.
  order.status = "cancelled";
  return toPublicOrder(order);
}
