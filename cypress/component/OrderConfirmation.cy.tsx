import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { OrderConfirmation } from "../../components/checkout/OrderConfirmation";
import { productKeys } from "../../lib/query/keys";
import type { Order } from "../../types/order";

const product = {
  id: "product-1",
  name: "Classic Backpack",
  imageUrl: "/products/placeholder-1.svg",
  price: 100,
  discount: 0,
  description: "A great backpack.",
  images: ["/products/placeholder-1.svg"],
};

const placedOrder: Order = {
  id: "order-1",
  items: [{ productId: "product-1", count: 1 }],
  address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
  status: "placed",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function mountConfirmation(order: Order, onCancelled: ReturnType<typeof cy.stub>) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(productKeys.detail("product-1"), product);
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <OrderConfirmation order={order} onCancelled={onCancelled} />
    </QueryClientProvider>,
  );
}

describe("<OrderConfirmation />", () => {
  it("shows the order id, receipt total, and a Cancel order button for a placed order", () => {
    mountConfirmation(placedOrder, cy.stub());
    cy.contains("Order placed!");
    cy.get("[data-testid=order-id]").should("have.text", "order-1");
    cy.get("[data-testid=order-total]").should("have.text", "$100.00");
    cy.contains("button", "Cancel order").should("exist");
  });

  it("shows no Cancel order button once the order is cancelled", () => {
    mountConfirmation({ ...placedOrder, status: "cancelled" }, cy.stub());
    cy.contains("Order cancelled");
    cy.contains("button", "Cancel order").should("not.exist");
  });

  it("cancels the order and calls onCancelled with the updated order", () => {
    cy.intercept("POST", "**/api/orders/order-1/cancel", {
      statusCode: 200,
      body: { ...placedOrder, status: "cancelled" },
    }).as("cancel");

    const onCancelled = cy.stub().as("onCancelled");
    mountConfirmation(placedOrder, onCancelled);
    cy.contains("button", "Cancel order").click();

    cy.wait("@cancel");
    cy.get("@onCancelled")
      .should("have.been.calledOnce")
      .should("have.been.calledWithMatch", { id: "order-1", status: "cancelled" });
  });
});
