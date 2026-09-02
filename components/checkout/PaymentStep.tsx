"use client";

import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { track } from "@/lib/analytics/posthog";
import { mockPaymentProvider } from "@/lib/payment/mockPaymentProvider";
import { useProductDetailQuery } from "@/lib/query/useProductDetailQuery";
import { placeOrder } from "@/lib/services/orderService";
import type { CartItem } from "@/types/cart";
import type { Address, Order } from "@/types/order";

function OrderSummaryLine({ item }: { item: CartItem }) {
  const { data: product } = useProductDetailQuery(item.productId);
  if (!product) return null;

  return (
    <li className="flex justify-between text-sm text-neutral-700">
      <span>
        {product.name} × {item.count}
      </span>
      <span>${(product.price * item.count).toFixed(2)}</span>
    </li>
  );
}

export type PaymentStepProps = {
  items: CartItem[];
  address: Address;
  onEditAddress: () => void;
  onPlaced: (order: Order) => void;
};

export function PaymentStep({ items, address, onEditAddress, onPlaced }: PaymentStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlaceOrder(event: SubmitEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // The card fields above are uncontrolled and never read here — this
      // mirrors a real Stripe Elements integration, where tokenize() reads
      // from a mounted card element the app never sees raw values from.
      const { token } = await mockPaymentProvider.tokenize();
      const order = await placeOrder({ items, address, paymentToken: token });
      track("order_placed", { orderId: order.id, itemCount: items.length });
      onPlaced(order);
    } catch {
      setError("Could not place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-2 text-sm font-medium text-neutral-900">Shipping to</h2>
        <p className="text-sm text-neutral-600">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.postalCode},{" "}
          {address.country}
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onEditAddress}>
          Edit address
        </Button>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-neutral-900">Order summary</h2>
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <OrderSummaryLine key={item.productId} item={item} />
          ))}
        </ul>
      </Card>

      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
        <FormField label="Card number" htmlFor="cardNumber">
          <Input
            id="cardNumber"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            required
          />
        </FormField>
        <div className="flex gap-4">
          <FormField label="Expiry" htmlFor="expiry" className="flex-1">
            <Input id="expiry" autoComplete="off" placeholder="MM/YY" required />
          </FormField>
          <FormField label="CVC" htmlFor="cvc" className="flex-1">
            <Input id="cvc" inputMode="numeric" autoComplete="off" placeholder="123" required />
          </FormField>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Placing order…" : "Place order"}
        </Button>
      </form>
    </div>
  );
}
