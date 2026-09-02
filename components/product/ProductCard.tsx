import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { Product } from "@/types/product";

export type ProductCardProps = {
  product: Product;
  priority?: boolean;
  onHoverPrefetch?: () => void;
};

export function ProductCard({ product, priority, onHoverPrefetch }: ProductCardProps) {
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100) * 100) / 100
    : product.price;

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={onHoverPrefetch}
      onFocus={onHoverPrefetch}
      className="block"
    >
      <Card className="flex flex-col gap-2 p-3">
        <div className="relative aspect-square w-full overflow-hidden rounded bg-neutral-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
          />
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
