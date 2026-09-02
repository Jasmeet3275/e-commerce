"use client";

import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProductDetailQuery } from "@/lib/query/useProductDetailQuery";
import { useCartStore } from "@/lib/store/useCartStore";

export type CartItemRowProps = {
  productId: string;
  count: number;
};

export function CartItemRow({ productId, count }: CartItemRowProps) {
  const { data: product, isPending } = useProductDetailQuery(productId);
  const updateCount = useCartStore((state) => state.updateCount);
  const removeItem = useCartStore((state) => state.removeItem);

  if (isPending) {
    return (
      <div className="flex items-center gap-4 border-b border-neutral-200 py-4">
        <Skeleton className="h-16 w-16 shrink-0" />
        <Skeleton className="h-4 flex-1" />
      </div>
    );
  }

  // Product removed from the catalog since it was added to the cart — drop the row silently.
  if (!product) return null;

  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100) * 100) / 100
    : product.price;

  return (
    <div className="flex items-center gap-4 border-b border-neutral-200 py-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-neutral-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
        <p className="text-sm text-neutral-600">${discountedPrice.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Decrease quantity"
          onClick={() => updateCount(productId, count - 1)}
        >
          −
        </Button>
        <span data-testid="cart-item-count" className="w-6 text-center text-sm">
          {count}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Increase quantity"
          onClick={() => updateCount(productId, count + 1)}
        >
          +
        </Button>
      </div>
      <Button type="button" variant="outline" onClick={() => removeItem(productId)}>
        Cancel
      </Button>
    </div>
  );
}
