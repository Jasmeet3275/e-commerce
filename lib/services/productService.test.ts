import type { Mock } from "vitest";

import { api } from "@/lib/api/axios";
import { getProducts } from "@/lib/services/productService";
import type { ProductList } from "@/types/product";

vi.mock("@/lib/api/axios", () => ({
  api: { get: vi.fn() },
}));

const mockedGet = api.get as Mock;

beforeEach(() => {
  mockedGet.mockReset();
});

describe("getProducts", () => {
  it("requests /products with limit/offset params and returns the data", async () => {
    const productList: ProductList = {
      items: [
        { id: "product-1", name: "Classic Backpack", imageUrl: "/x.svg", price: 100, discount: 0 },
      ],
      pagination: { limit: 20, offset: 0, currentPage: 1, totalPages: 8, totalItems: 150 },
    };
    mockedGet.mockResolvedValueOnce({ data: productList });

    const result = await getProducts({ limit: 20, offset: 0 });

    expect(mockedGet).toHaveBeenCalledWith("/products", { params: { limit: 20, offset: 0 } });
    expect(result).toEqual(productList);
  });
});
