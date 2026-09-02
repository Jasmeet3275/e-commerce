import { api } from "@/lib/api/axios";
import type { PlaceOrderInput } from "@/lib/validation/checkoutSchema";
import type { Order } from "@/types/order";

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const response = await api.post<Order>("/orders", input);
  return response.data;
}
