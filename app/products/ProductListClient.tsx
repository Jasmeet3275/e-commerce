"use client";

import { VirtualizedProductGrid } from "@/components/product/VirtualizedProductGrid";
import { useProductsQuery } from "@/lib/query/useProductsQuery";

export function ProductListClient() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useProductsQuery();

  if (isError) {
    return <p role="alert">Something went wrong loading products.</p>;
  }

  if (isPending) {
    return null; // SSR hydration should already have first-page data cached; this is a defensive fallback only
  }

  const products = data.pages.flatMap((page) => page.items);

  return (
    <VirtualizedProductGrid
      products={products}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    />
  );
}
