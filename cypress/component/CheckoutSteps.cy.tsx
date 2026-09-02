import { CheckoutSteps } from "../../components/checkout/CheckoutSteps";

describe("<CheckoutSteps />", () => {
  it("marks the current step", () => {
    cy.mount(<CheckoutSteps current={2} />);
    cy.get("[aria-current=step]").parent().should("contain.text", "Payment");
  });

  it("renders all three step labels", () => {
    cy.mount(<CheckoutSteps current={1} />);
    cy.contains("Address");
    cy.contains("Payment");
    cy.contains("Confirmation");
  });
});
