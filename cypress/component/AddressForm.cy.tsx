import { AddressForm } from "../../components/checkout/AddressForm";

describe("<AddressForm />", () => {
  it("shows validation errors when submitted empty", () => {
    cy.mount(<AddressForm onSubmit={cy.stub()} />);
    cy.contains("button", "Continue to payment").click();
    cy.contains("Address line 1 is required");
    cy.contains("City is required");
    cy.contains("Postal code is required");
    cy.contains("Country is required");
  });

  it("calls onSubmit with the parsed address when valid", () => {
    const onSubmit = cy.stub().as("onSubmit");
    cy.mount(<AddressForm onSubmit={onSubmit} />);
    cy.get("#line1").type("1 Main St");
    cy.get("#city").type("Springfield");
    cy.get("#postalCode").type("12345");
    cy.get("#country").type("US");
    cy.contains("button", "Continue to payment").click();

    cy.get("@onSubmit").should("have.been.calledOnce").should("have.been.calledWithMatch", {
      line1: "1 Main St",
      city: "Springfield",
      postalCode: "12345",
      country: "US",
    });
  });

  it("pre-fills fields from defaultValues", () => {
    cy.mount(
      <AddressForm
        defaultValues={{
          line1: "9 Oak Ave",
          city: "Metropolis",
          postalCode: "54321",
          country: "US",
        }}
        onSubmit={cy.stub()}
      />,
    );
    cy.get("#line1").should("have.value", "9 Oak Ave");
    cy.get("#city").should("have.value", "Metropolis");
  });
});
