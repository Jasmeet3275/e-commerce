import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { OrderSummaryCard } from "../../components/checkout/OrderSummaryCard";
import { productKeys } from "../../lib/query/keys";

const productA = {
  id: "product-1",
  name: "Classic Backpack",
  imageUrl: "/products/placeholder-1.svg",
  price: 100,
  discount: 0,
  description: "A great backpack.",
  images: ["/products/placeholder-1.svg"],
};

const productB = {
  id: "product-2",
  name: "Modern Sneakers",
  imageUrl: "/products/placeholder-2.svg",
  price: 50,
  discount: 0,
  description: "Great sneakers.",
  images: ["/products/placeholder-2.svg"],
};

function mountSummary(items: { productId: string; count: number }[]) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(productKeys.detail("product-1"), productA);
  queryClient.setQueryData(productKeys.detail("product-2"), productB);
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <OrderSummaryCard items={items} />
    </QueryClientProvider>,
  );
}

describe("<OrderSummaryCard />", () => {
  it("shows each line item with its name, quantity, and line total", () => {
    mountSummary([{ productId: "product-1", count: 2 }]);
    cy.contains("Classic Backpack");
    cy.contains("Qty 2");
    cy.contains("$200.00");
  });

  it("sums all line items into the total", () => {
    mountSummary([
      { productId: "product-1", count: 2 }, // $200
      { productId: "product-2", count: 1 }, // $50
    ]);
    cy.get("[data-testid=order-total]").should("have.text", "$250.00");
  });

  it("shows $0.00 for an empty cart", () => {
    mountSummary([]);
    cy.get("[data-testid=order-total]").should("have.text", "$0.00");
  });
});
