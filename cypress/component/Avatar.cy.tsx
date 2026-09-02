import { Avatar } from "../../components/ui/Avatar";

describe("<Avatar />", () => {
  it("shows the first initial, uppercased, when there is no image", () => {
    cy.mount(<Avatar name="demo user" />);
    cy.contains("span", "D");
    cy.get("img").should("not.exist");
  });

  it("renders the image when imageUrl is provided", () => {
    cy.mount(<Avatar name="Demo User" imageUrl="/products/placeholder-1.svg" />);
    cy.get("img[alt='Demo User']").should("exist");
  });

  it("falls back to a placeholder mark for an empty name", () => {
    cy.mount(<Avatar name="" />);
    cy.contains("span", "?");
  });
});
