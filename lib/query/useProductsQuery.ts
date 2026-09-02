import { useInfiniteQuery } from "@tanstack/react-query";

import { productKeys } from "@/lib/query/keys";
import { getProducts } from "@/lib/services/productService";

export const PRODUCTS_PAGE_SIZE = 20;

export function useProductsQuery() {
  return useInfiniteQuery({
    queryKey: productKeys.list(PRODUCTS_PAGE_SIZE),
    queryFn: ({ pageParam }) => getProducts({ limit: PRODUCTS_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, limit, offset } = lastPage.pagination;
      if (currentPage >= totalPages) return undefined;
      return offset + limit;
    },
  });
}
