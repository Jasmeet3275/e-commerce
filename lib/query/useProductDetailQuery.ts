import { useQuery } from "@tanstack/react-query";

import { productKeys } from "@/lib/query/keys";
import { getProductDetail } from "@/lib/services/productService";

export function useProductDetailQuery(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductDetail(id),
  });
}
