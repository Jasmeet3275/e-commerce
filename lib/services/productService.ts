import { api } from "@/lib/api/axios";
import type { ProductDetail, ProductList } from "@/types/product";

export async function getProducts(params: { limit: number; offset: number }): Promise<ProductList> {
  const response = await api.get<ProductList>("/products", { params });
  return response.data;
}

export async function getProductDetail(id: string): Promise<ProductDetail> {
  const response = await api.get<ProductDetail>(`/products/${id}`);
  return response.data;
}
