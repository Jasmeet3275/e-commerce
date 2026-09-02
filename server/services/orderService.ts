import { cancelOrder as cancelOrderRecord, createOrder } from "@/data/orders";
import type { PlaceOrderInput } from "@/lib/validation/checkoutSchema";
import type { Order } from "@/types/order";

export function placeOrder(userId: string, input: PlaceOrderInput): Order {
  return createOrder(userId, input);
}

export function cancelOrder(userId: string, orderId: string): Order | undefined {
  return cancelOrderRecord(userId, orderId);
}
