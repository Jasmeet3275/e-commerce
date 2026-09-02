import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CartItemRow } from "../../components/cart/CartItemRow";
import { productKeys } from "../../lib/query/keys";
import { useCartStore } from "../../lib/store/useCartStore";

const product = {
  id: "product-1",
  name: "Classic Backpack",
  imageUrl: "/products/placeholder-1.svg",
  price: 100,
  discount: 25,
  description: "A great backpack.",
  images: ["/products/placeholder-1.svg"],
};

function mountRow(count: number) {
  useCartStore.setState({ items: [{ productId: "product-1", count }] });
  const queryClient = new QueryClient();
  queryClient.setQueryData(productKeys.detail("product-1"), product);
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <CartItemRow productId="product-1" count={count} />
    </QueryClientProvider>,
  );
}

describe("<CartItemRow />", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders the product name and discounted price", () => {
    mountRow(2);
    cy.contains("Classic Backpack");
    cy.contains("$75.00");
  });

  it("shows the current quantity", () => {
    mountRow(3);
    cy.get("[data-testid=cart-item-count]").should("have.text", "3");
  });

  it("increments the quantity in the real store when + is clicked", () => {
    mountRow(1);
    cy.get("[aria-label='Increase quantity']")
      .click()
      .then(() => {
        expect(useCartStore.getState().items).to.deep.equal([{ productId: "product-1", count: 2 }]);
      });
  });

  it("removes the item from the store entirely via the Cancel button", () => {
    mountRow(1);
    cy.contains("button", "Cancel")
      .click()
      .then(() => {
        expect(useCartStore.getState().items).to.deep.equal([]);
      });
  });
});
