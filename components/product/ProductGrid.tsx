"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { productKeys } from "@/lib/query/keys";
import { getProductDetail } from "@/lib/services/productService";
import type { Product } from "@/types/product";

export type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  const queryClient = useQueryClient();

  const prefetchDetail = useCallback(
    (id: string) => {
      void queryClient
        .query({ queryKey: productKeys.detail(id), queryFn: () => getProductDetail(id) })
        .catch(() => undefined);
    },
    [queryClient],
  );

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          onHoverPrefetch={() => prefetchDetail(product.id)}
        />
      ))}
    </div>
  );
}
