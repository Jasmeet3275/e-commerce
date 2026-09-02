import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CartList } from "../../app/cart/CartList";
import { productKeys } from "../../lib/query/keys";
import { useCartStore } from "../../lib/store/useCartStore";

const product = {
  id: "product-1",
  name: "Classic Backpack",
  imageUrl: "/products/placeholder-1.svg",
  price: 100,
  discount: 0,
  description: "A great backpack.",
  images: ["/products/placeholder-1.svg"],
};

describe("<CartList />", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("shows an empty state with a link back to products", () => {
    cy.mount(
      <QueryClientProvider client={new QueryClient()}>
        <CartList />
      </QueryClientProvider>,
    );
    cy.contains("Your cart is empty.");
    cy.contains("a", "Browse products").should("have.attr", "href", "/products");
  });

  it("renders cart items and a checkout link when the cart has items", () => {
    useCartStore.setState({ items: [{ productId: "product-1", count: 1 }] });
    const queryClient = new QueryClient();
    queryClient.setQueryData(productKeys.detail("product-1"), product);
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <CartList />
      </QueryClientProvider>,
    );
    cy.contains("Classic Backpack");
    cy.contains("a", "Proceed to checkout").should("have.attr", "href", "/checkout");
  });
});
