import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/app/products/[id]/ProductDetailClient";
import { productKeys } from "@/lib/query/keys";
import { getProductDetail } from "@/server/services/productService";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = getProductDetail(id);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = getProductDetail(id);
  if (!product) notFound();

  const queryClient = new QueryClient();
  await queryClient
    .query({
      queryKey: productKeys.detail(id),
      queryFn: () => getProductDetail(id),
    })
    .catch(() => undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* JSON-LD: server-generated from our own catalog data, no user input. `<`
          is escaped so nothing here can prematurely close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailClient id={id} />
    </HydrationBoundary>
  );
}
