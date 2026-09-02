import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginationFooter } from "@/components/product/PaginationFooter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { productsPageParamSchema } from "@/lib/validation/productSchema";
import { listProducts } from "@/server/services/productService";

const PRODUCTS_PAGE_SIZE = 50;

function parsePage(searchParamsPage: string | string[] | undefined): number {
  const raw = Array.isArray(searchParamsPage) ? searchParamsPage[0] : searchParamsPage;
  return productsPageParamSchema.parse(raw);
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNumber = parsePage(page);
  return {
    title: pageNumber > 1 ? `Products — Page ${pageNumber}` : "Products",
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { page } = await searchParams;
  const pageNumber = parsePage(page);
  const offset = (pageNumber - 1) * PRODUCTS_PAGE_SIZE;

  const { items, pagination } = listProducts({ limit: PRODUCTS_PAGE_SIZE, offset });
  if (pageNumber > 1 && pageNumber > pagination.totalPages) notFound();

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>
      <ProductGrid products={items} />
      <PaginationFooter currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
    </main>
  );
}
