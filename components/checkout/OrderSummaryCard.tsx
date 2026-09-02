"use client";

import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCartTotal } from "@/lib/query/useCartTotal";
import type { CartItem } from "@/types/cart";

export type OrderSummaryCardProps = {
  items: CartItem[];
};

export function OrderSummaryCard({ items }: OrderSummaryCardProps) {
  const { lines, total, isPending } = useCartTotal(items);

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium text-neutral-900">Order summary</h2>
      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lines.map(({ item, product }) => {
            if (!product) return null;
            return (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-900">{product.name}</p>
                  <p className="text-xs text-neutral-500">Qty {item.count}</p>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  ${(product.price * item.count).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="text-sm font-medium text-neutral-900">Total</span>
        <span data-testid="order-total" className="text-lg font-semibold text-neutral-900">
          ${total.toFixed(2)}
        </span>
      </div>
    </Card>
  );
}
