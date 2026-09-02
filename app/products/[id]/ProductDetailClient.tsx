"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useProductDetailQuery } from "@/lib/query/useProductDetailQuery";
import { useCartStore } from "@/lib/store/useCartStore";

export function ProductDetailClient({ id }: { id: string }) {
  const { data: product } = useProductDetailQuery(id);
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null; // SSR hydration should already have this cached; defensive fallback only

  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100) * 100) / 100
    : product.price;

  function handleAddToCart() {
    addItem(id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <div className="relative aspect-square w-full overflow-hidden rounded bg-neutral-100">
          <Image
            src={product.images[0] ?? product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            priority
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex gap-2">
          {product.images.map((image) => (
            <div key={image} className="relative h-16 w-16 overflow-hidden rounded bg-neutral-100">
              <Image src={image} alt="" fill unoptimized sizes="64px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-neutral-900">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-neutral-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-neutral-600">{product.description}</p>
        <Button type="button" onClick={handleAddToCart} className="mt-2 self-start">
          {justAdded ? "Added!" : "Add to cart"}
        </Button>
      </div>
    </main>
  );
}
