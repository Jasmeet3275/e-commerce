import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginationFooter } from "@/components/product/PaginationFooter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";
import { productsPageParamSchema, productsSearchParamSchema } from "@/lib/validation/productSchema";
import { listProducts } from "@/server/services/productService";

const PRODUCTS_PAGE_SIZE = 50;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(searchParamsPage: string | string[] | undefined): number {
  return productsPageParamSchema.parse(firstValue(searchParamsPage));
}

function parseSearch(searchParamsQuery: string | string[] | undefined): string {
  return productsSearchParamSchema.parse(firstValue(searchParamsQuery) ?? "");
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const { page, q } = await searchParams;
  const pageNumber = parsePage(page);
  const search = parseSearch(q);

  const title = search ? `Search: "${search}"` : "Products";
  return {
    title: pageNumber > 1 ? `${title} — Page ${pageNumber}` : title,
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { page, q } = await searchParams;
  const pageNumber = parsePage(page);
  const search = parseSearch(q);
  const offset = (pageNumber - 1) * PRODUCTS_PAGE_SIZE;

  const { items, pagination } = listProducts({
    limit: PRODUCTS_PAGE_SIZE,
    offset,
    search: search || undefined,
  });
  if (pageNumber > 1 && pageNumber > pagination.totalPages) notFound();

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>
      <SearchBar defaultValue={search} />
      {items.length === 0 ? (
        <p className="text-neutral-500">No products found for &ldquo;{search}&rdquo;.</p>
      ) : (
        <>
          <ProductGrid products={items} />
          <PaginationFooter
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            search={search || undefined}
          />
        </>
      )}
    </main>
  );
}
