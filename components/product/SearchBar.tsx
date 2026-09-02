import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type SearchBarProps = {
  defaultValue: string;
};

// A plain GET form, not a client component with an onChange/fetch — matches
// the ?page= pagination pattern: SSR'd, crawlable, works with JS disabled.
export function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <form action="/products" method="GET" role="search" className="mb-4 flex flex-wrap gap-2">
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search products…"
        aria-label="Search products"
        className="max-w-sm"
      />
      <Button type="submit">Search</Button>
      {defaultValue && (
        <Link href="/products">
          <Button type="button" variant="outline">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}
