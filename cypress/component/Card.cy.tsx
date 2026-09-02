import { Card } from "../../components/ui/Card";

describe("<Card />", () => {
  it("renders its children", () => {
    cy.mount(<Card>Card content</Card>);
    cy.contains("Card content");
  });

  it("merges a custom className without dropping base styles", () => {
    cy.mount(<Card className="mt-4">Card content</Card>);
    cy.get(".mt-4").should("have.class", "rounded-lg");
  });
});
