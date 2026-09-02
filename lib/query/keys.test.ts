import { productKeys } from "@/lib/query/keys";

describe("productKeys", () => {
  it("includes the limit so different page sizes don't collide in the cache", () => {
    expect(productKeys.list(20)).toEqual(["products", "list", { limit: 20 }]);
    expect(productKeys.list(20)).not.toBe(productKeys.list(50));
  });
});
