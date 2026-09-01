import HomePage from "../../app/page";

describe("<HomePage />", () => {
  it("renders the placeholder heading", () => {
    cy.mount(<HomePage />);
    cy.get("h1").contains("Shop");
  });
});
