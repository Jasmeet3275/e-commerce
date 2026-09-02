import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

import { ProductListClient } from "@/app/products/ProductListClient";
import { productKeys } from "@/lib/query/keys";
import { PRODUCTS_PAGE_SIZE } from "@/lib/query/useProductsQuery";
import { listProducts } from "@/server/services/productService";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const queryClient = new QueryClient();

  // prefetchInfiniteQuery is deprecated in favor of the unified infiniteQuery()
  // method (TanStack Query 5.102+) — errors are swallowed per that method's own
  // guidance, since a failed prefetch shouldn't crash the page render; the
  // client-side hook will just fetch it itself on mount instead.
  await queryClient
    .infiniteQuery({
      queryKey: productKeys.list(PRODUCTS_PAGE_SIZE),
      queryFn: ({ pageParam }) =>
        listProducts({ limit: PRODUCTS_PAGE_SIZE, offset: pageParam as number }),
      initialPageParam: 0,
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="p-4">
        <h1 className="mb-4 text-2xl font-semibold">Products</h1>
        <ProductListClient />
      </main>
    </HydrationBoundary>
  );
}
