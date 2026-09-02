"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog";
import { cancelOrder } from "@/lib/services/orderService";
import type { Order } from "@/types/order";

export type OrderConfirmationProps = {
  order: Order;
  onCancelled: (order: Order) => void;
};

export function OrderConfirmation({ order, onCancelled }: OrderConfirmationProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const isCancelled = order.status === "cancelled";

  async function handleCancelOrder() {
    setIsCancelling(true);
    try {
      const cancelled = await cancelOrder(order.id);
      track("order_cancelled", { orderId: cancelled.id });
      onCancelled(cancelled);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">{isCancelled ? "Order cancelled" : "Order placed!"}</h2>
      <p className="text-neutral-600">
        Order{" "}
        <span data-testid="order-id" className="font-mono">
          {order.id}
        </span>{" "}
        {isCancelled ? "has been cancelled." : "is on its way."}
      </p>
      <div className="flex gap-3">
        {!isCancelled && (
          <Button
            type="button"
            variant="outline"
            disabled={isCancelling}
            onClick={handleCancelOrder}
          >
            {isCancelling ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
        <Link href="/products">
          <Button type="button">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
