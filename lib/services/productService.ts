import { api } from "@/lib/api/axios";
import type { ProductList } from "@/types/product";

export async function getProducts(params: { limit: number; offset: number }): Promise<ProductList> {
  const response = await api.get<ProductList>("/products", { params });
  return response.data;
}
