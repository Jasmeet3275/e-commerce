describe("Home page", () => {
  it("redirects to the product listing", () => {
    cy.visit("/");
    cy.url().should("include", "/products");
    cy.get("h1").contains("Products");
  });
});
