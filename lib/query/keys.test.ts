import { productKeys } from "@/lib/query/keys";

describe("productKeys", () => {
  it("scopes the detail key by product id", () => {
    expect(productKeys.detail("product-1")).toEqual(["products", "detail", "product-1"]);
  });
});
