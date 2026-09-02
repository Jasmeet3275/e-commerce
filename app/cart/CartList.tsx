"use client";

import Link from "next/link";

import { CartItemRow } from "@/components/cart/CartItemRow";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";

export function CartList() {
  const items = useCartStore((state) => state.items);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        {items.map((item) => (
          <CartItemRow key={item.productId} productId={item.productId} count={item.count} />
        ))}
      </div>
      <Link href="/checkout" className="self-end">
        <Button type="button">Proceed to checkout</Button>
      </Link>
    </div>
  );
}
