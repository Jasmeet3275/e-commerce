describe("Home page", () => {
  it("loads and renders the placeholder heading", () => {
    cy.visit("/");
    cy.get("h1").contains("Shop");
  });
});
