import { selectTotalCount, useCartStore } from "@/lib/store/useCartStore";

beforeEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.clear();
});

describe("useCartStore", () => {
  it("starts empty", () => {
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("adds a new item with count 1", () => {
    useCartStore.getState().addItem("product-1");
    expect(useCartStore.getState().items).toEqual([{ productId: "product-1", count: 1 }]);
  });

  it("increments count when adding an item already in the cart", () => {
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().addItem("product-1");
    expect(useCartStore.getState().items).toEqual([{ productId: "product-1", count: 2 }]);
  });

  it("updates the count for an item", () => {
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().updateCount("product-1", 5);
    expect(useCartStore.getState().items).toEqual([{ productId: "product-1", count: 5 }]);
  });

  it("removes the item when updateCount is set to 0 or below", () => {
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().updateCount("product-1", 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("cancels (removes) an item entirely", () => {
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().addItem("product-2");
    useCartStore.getState().removeItem("product-1");
    expect(useCartStore.getState().items).toEqual([{ productId: "product-2", count: 1 }]);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().addItem("product-2");
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("persists items to localStorage", () => {
    useCartStore.getState().addItem("product-1");
    const stored = JSON.parse(localStorage.getItem("cart-storage") ?? "{}");
    expect(stored.state.items).toEqual([{ productId: "product-1", count: 1 }]);
  });
});

describe("selectTotalCount", () => {
  it("sums counts across all items", () => {
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().addItem("product-1");
    useCartStore.getState().addItem("product-2");
    expect(selectTotalCount(useCartStore.getState())).toBe(3);
  });

  it("is 0 for an empty cart", () => {
    expect(selectTotalCount(useCartStore.getState())).toBe(0);
  });
});
