import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PaymentStep } from "../../components/checkout/PaymentStep";
import { productKeys } from "../../lib/query/keys";

const product = {
  id: "product-1",
  name: "Classic Backpack",
  imageUrl: "/products/placeholder-1.svg",
  price: 100,
  discount: 0,
  description: "A great backpack.",
  images: ["/products/placeholder-1.svg"],
};

const address = {
  line1: "1 Main St",
  city: "Springfield",
  postalCode: "12345",
  country: "US",
};

function mountStep(
  onPlaced: ReturnType<typeof cy.stub>,
  onEditAddress: ReturnType<typeof cy.stub>,
) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(productKeys.detail("product-1"), product);
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <PaymentStep
        items={[{ productId: "product-1", count: 2 }]}
        address={address}
        onEditAddress={onEditAddress}
        onPlaced={onPlaced}
      />
    </QueryClientProvider>,
  );
}

function fillCardFields() {
  cy.get("#cardNumber").type("4242424242424242");
  cy.get("#expiry").type("12/30");
  cy.get("#cvc").type("123");
}

describe("<PaymentStep />", () => {
  it("shows the shipping address and order summary", () => {
    mountStep(cy.stub(), cy.stub());
    cy.contains("1 Main St");
    cy.contains("Classic Backpack");
    cy.contains("Qty 2");
    cy.contains("$200.00");
  });

  it("shows the cart total and carries it onto the submit button", () => {
    mountStep(cy.stub(), cy.stub());
    cy.get("[data-testid=order-total]").should("have.text", "$200.00");
    cy.contains("button", "Place order — $200.00").should("exist");
  });

  it("calls onEditAddress when Edit address is clicked", () => {
    const onEditAddress = cy.stub().as("onEditAddress");
    mountStep(cy.stub(), onEditAddress);
    cy.contains("button", "Edit address").click();
    cy.get("@onEditAddress").should("have.been.calledOnce");
  });

  it("places the order and calls onPlaced with the created order", () => {
    cy.intercept("POST", "**/api/orders", {
      statusCode: 201,
      body: {
        id: "order-1",
        items: [{ productId: "product-1", count: 2 }],
        address,
        status: "placed",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    }).as("placeOrder");

    const onPlaced = cy.stub().as("onPlaced");
    mountStep(onPlaced, cy.stub());
    fillCardFields();
    cy.contains("button", "Place order").click();

    cy.wait("@placeOrder");
    cy.get("@onPlaced").should("have.been.calledOnce");
  });

  it("shows an error message when placing the order fails", () => {
    cy.intercept("POST", "**/api/orders", { statusCode: 500, body: {} }).as("placeOrder");
    mountStep(cy.stub(), cy.stub());
    fillCardFields();
    cy.contains("button", "Place order").click();

    cy.wait("@placeOrder");
    cy.contains("Could not place your order");
  });
});
