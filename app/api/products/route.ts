import { NextResponse, type NextRequest } from "next/server";

import { listProductsQuerySchema } from "@/lib/validation/productSchema";
import { listProducts } from "@/server/services/productService";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listProductsQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = listProducts(parsed.data);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
