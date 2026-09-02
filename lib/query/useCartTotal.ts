import { useQueries } from "@tanstack/react-query";

import { productKeys } from "@/lib/query/keys";
import { getProductDetail } from "@/lib/services/productService";
import type { CartItem } from "@/types/cart";
import type { ProductDetail } from "@/types/product";

export type CartLineResult = {
  item: CartItem;
  product: ProductDetail | undefined;
};

// useQueries (not one useProductDetailQuery call per item spread across
// child components) so a total can actually be computed here — TanStack
// Query still dedupes/caches per productId, so this isn't extra network
// traffic over the old per-line-item fetch pattern.
export function useCartTotal(items: CartItem[]) {
  const results = useQueries({
    queries: items.map((item) => ({
      queryKey: productKeys.detail(item.productId),
      queryFn: () => getProductDetail(item.productId),
    })),
  });

  const isPending = results.some((result) => result.isPending);
  const lines: CartLineResult[] = items.map((item, index) => ({
    item,
    product: results[index]?.data,
  }));
  const total = lines.reduce(
    (sum, { item, product }) => sum + (product ? product.price * item.count : 0),
    0,
  );

  return { lines, total, isPending };
}
