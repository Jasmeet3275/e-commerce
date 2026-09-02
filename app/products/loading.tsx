import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </main>
  );
}
