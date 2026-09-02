import { getProductDetailById, getProducts } from "@/data/products";
import type { ListProductsQuery } from "@/lib/validation/productSchema";
import type { ProductDetail, ProductList } from "@/types/product";

export function listProducts({ limit, offset, search }: ListProductsQuery): ProductList {
  const allProducts = getProducts();
  const matchingProducts = search
    ? allProducts.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    : allProducts;
  const totalItems = matchingProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    items: matchingProducts.slice(offset, offset + limit),
    pagination: { limit, offset, currentPage, totalPages, totalItems },
  };
}

export function getProductDetail(id: string): ProductDetail | undefined {
  return getProductDetailById(id);
}
