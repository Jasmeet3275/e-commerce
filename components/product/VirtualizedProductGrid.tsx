"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { useColumnCount } from "@/components/product/useColumnCount";
import { productKeys } from "@/lib/query/keys";
import { getProductDetail } from "@/lib/services/productService";
import type { Product } from "@/types/product";

export type VirtualizedProductGridProps = {
  products: Product[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

const ROW_HEIGHT_ESTIMATE = 320;
const LOAD_MORE_THRESHOLD_PX = 2 * ROW_HEIGHT_ESTIMATE;

export function VirtualizedProductGrid({
  products,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: VirtualizedProductGridProps) {
  const columns = useColumnCount();
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(products.length / columns);
  const queryClient = useQueryClient();

  const prefetchDetail = useCallback(
    (id: string) => {
      // prefetchQuery is deprecated in favor of the unified query() method —
      // same fix as the SSR list page's prefetch (app/products/page.tsx).
      void queryClient
        .query({
          queryKey: productKeys.detail(id),
          queryFn: () => getProductDetail(id),
        })
        .catch(() => undefined);
    },
    [queryClient],
  );

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Deliberately based on real scroll position, not virtual-item indices:
  // getVirtualItems() includes overscan, so with a small initial page and a
  // generous overscan, the "last virtual row" can already be the actual last
  // row on mount — firing onLoadMore immediately, before the user has
  // scrolled at all. Scroll position is correct regardless of overscan.
  const checkLoadMore = useCallback(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || !hasNextPage || isFetchingNextPage) return;
    const distanceFromBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
    if (distanceFromBottom < LOAD_MORE_THRESHOLD_PX) {
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  useEffect(() => {
    checkLoadMore(); // covers the case where the loaded page doesn't fill the viewport at all
  }, [checkLoadMore, products.length]);

  return (
    <div
      ref={parentRef}
      onScroll={checkLoadMore}
      data-testid="product-grid-scroll"
      className="h-[80vh] overflow-auto"
    >
      <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowProducts = products.slice(startIndex, startIndex + columns);
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              className="grid gap-4 px-1"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {rowProducts.map((product, columnIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={virtualRow.index === 0 && columnIndex < columns}
                  onHoverPrefetch={() => prefetchDetail(product.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
      {isFetchingNextPage && (
        <p role="status" className="py-4 text-center text-sm text-neutral-500">
          Loading more…
        </p>
      )}
    </div>
  );
}
