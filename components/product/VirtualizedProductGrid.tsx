"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { useColumnCount } from "@/components/product/useColumnCount";
import type { Product } from "@/types/product";

export type VirtualizedProductGridProps = {
  products: Product[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

const ROW_HEIGHT_ESTIMATE = 320;
const LOAD_MORE_THRESHOLD_ROWS = 2;

export function VirtualizedProductGrid({
  products,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: VirtualizedProductGridProps) {
  const columns = useColumnCount();
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(products.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const lastVirtualRowIndex = virtualRows[virtualRows.length - 1]?.index;

  useEffect(() => {
    if (lastVirtualRowIndex === undefined) return;
    if (
      lastVirtualRowIndex >= rowCount - LOAD_MORE_THRESHOLD_ROWS &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      onLoadMore();
    }
  }, [lastVirtualRowIndex, rowCount, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div ref={parentRef} data-testid="product-grid-scroll" className="h-[80vh] overflow-auto">
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
