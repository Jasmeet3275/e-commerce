import { NextResponse, type NextRequest } from "next/server";

import { getProductDetail } from "@/server/services/productService";

export async function GET(_request: NextRequest, { params }: RouteContext<"/api/products/[id]">) {
  const { id } = await params;
  const product = getProductDetail(id);

  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(product, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
