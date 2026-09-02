import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";

describe("<FormField />", () => {
  it("associates the label with its input via htmlFor/id", () => {
    cy.mount(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>,
    );
    cy.contains("label", "Email").click();
    cy.get("input#email").should("be.focused");
  });

  it("shows the error message when provided", () => {
    cy.mount(
      <FormField label="Email" htmlFor="email" error="Required">
        <Input id="email" />
      </FormField>,
    );
    cy.get("[role=alert]").contains("Required");
  });

  it("renders no error message when none is provided", () => {
    cy.mount(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>,
    );
    cy.get("[role=alert]").should("not.exist");
  });
});
