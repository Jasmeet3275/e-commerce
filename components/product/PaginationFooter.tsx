import Link from "next/link";

import { cn } from "@/lib/cn";

export type PaginationFooterProps = {
  currentPage: number;
  totalPages: number;
  search?: string;
};

function pageHref(page: number, search?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("q", search);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function PaginationFooter({ currentPage, totalPages, search }: PaginationFooterProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      aria-label="Product pages"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        href={pageHref(currentPage - 1, search)}
        aria-disabled={isFirstPage}
        tabIndex={isFirstPage ? -1 : undefined}
        className={cn(
          "rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50",
          isFirstPage && "pointer-events-none opacity-40",
        )}
      >
        Previous
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page, search)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "rounded border px-3 py-1.5 text-sm",
            page === currentPage
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50",
          )}
        >
          {page}
        </Link>
      ))}
      <Link
        href={pageHref(currentPage + 1, search)}
        aria-disabled={isLastPage}
        tabIndex={isLastPage ? -1 : undefined}
        className={cn(
          "rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50",
          isLastPage && "pointer-events-none opacity-40",
        )}
      >
        Next
      </Link>
    </nav>
  );
}
