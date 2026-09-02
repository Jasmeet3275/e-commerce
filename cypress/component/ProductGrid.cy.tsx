import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProductGrid } from "../../components/product/ProductGrid";

function makeProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1}`,
    imageUrl: "/products/placeholder-1.svg",
    price: 50,
    discount: 0,
  }));
}

function mountGrid(count: number) {
  const queryClient = new QueryClient();
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <ProductGrid products={makeProducts(count)} />
    </QueryClientProvider>,
  );
}

describe("<ProductGrid />", () => {
  it("renders a card for every product, no windowing", () => {
    mountGrid(50);
    cy.get("img").should("have.length", 50);
  });

  it("renders product names and links to their detail pages", () => {
    mountGrid(3);
    cy.contains("Product 1");
    cy.get("a").first().should("have.attr", "href", "/products/product-1");
  });
});
