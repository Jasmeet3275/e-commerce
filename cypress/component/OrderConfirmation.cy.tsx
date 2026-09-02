import { OrderConfirmation } from "../../components/checkout/OrderConfirmation";

const placedOrder = {
  id: "order-1",
  items: [{ productId: "product-1", count: 1 }],
  address: { line1: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" },
  status: "placed" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("<OrderConfirmation />", () => {
  it("shows the order id and a Cancel order button for a placed order", () => {
    cy.mount(<OrderConfirmation order={placedOrder} onCancelled={cy.stub()} />);
    cy.contains("Order placed!");
    cy.get("[data-testid=order-id]").should("have.text", "order-1");
    cy.contains("button", "Cancel order").should("exist");
  });

  it("shows no Cancel order button once the order is cancelled", () => {
    cy.mount(
      <OrderConfirmation order={{ ...placedOrder, status: "cancelled" }} onCancelled={cy.stub()} />,
    );
    cy.contains("Order cancelled");
    cy.contains("button", "Cancel order").should("not.exist");
  });

  it("cancels the order and calls onCancelled with the updated order", () => {
    cy.intercept("POST", "**/api/orders/order-1/cancel", {
      statusCode: 200,
      body: { ...placedOrder, status: "cancelled" },
    }).as("cancel");

    const onCancelled = cy.stub().as("onCancelled");
    cy.mount(<OrderConfirmation order={placedOrder} onCancelled={onCancelled} />);
    cy.contains("button", "Cancel order").click();

    cy.wait("@cancel");
    cy.get("@onCancelled")
      .should("have.been.calledOnce")
      .should("have.been.calledWithMatch", { id: "order-1", status: "cancelled" });
  });
});
