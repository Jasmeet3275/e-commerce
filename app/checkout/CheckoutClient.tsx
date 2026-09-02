"use client";

import Link from "next/link";
import { useState } from "react";

import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { useCheckoutStore } from "@/lib/store/useCheckoutStore";
import type { Order } from "@/types/order";

export function CheckoutClient() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const address = useCheckoutStore((state) => state.address);
  const setAddress = useCheckoutStore((state) => state.setAddress);
  const clearCheckout = useCheckoutStore((state) => state.clear);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  if (placedOrder) {
    return <OrderConfirmation order={placedOrder} onCancelled={setPlacedOrder} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-neutral-500">Your cart is empty.</p>
        <Link href="/products">
          <Button type="button">Browse products</Button>
        </Link>
      </div>
    );
  }

  if (!address || isEditingAddress) {
    return (
      <AddressForm
        defaultValues={address ?? undefined}
        onSubmit={(value) => {
          setAddress(value);
          setIsEditingAddress(false);
        }}
      />
    );
  }

  return (
    <PaymentStep
      items={items}
      address={address}
      onEditAddress={() => setIsEditingAddress(true)}
      onPlaced={(order) => {
        setPlacedOrder(order);
        clearCart();
        clearCheckout();
      }}
    />
  );
}
