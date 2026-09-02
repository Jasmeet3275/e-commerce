import { getProducts } from "@/data/products";
import type { ListProductsQuery } from "@/lib/validation/productSchema";
import type { ProductList } from "@/types/product";

export function listProducts({ limit, offset }: ListProductsQuery): ProductList {
  const allProducts = getProducts();
  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    items: allProducts.slice(offset, offset + limit),
    pagination: { limit, offset, currentPage, totalPages, totalItems },
  };
}
