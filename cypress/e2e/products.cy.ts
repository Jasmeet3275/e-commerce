describe("Product listing", () => {
  it("SSRs the first page of products with correct metadata", () => {
    cy.visit("/products");
    cy.title().should("include", "Products");
    cy.get("h1").contains("Products");
    cy.contains("Classic Backpack");
  });

  it("loads more products as the user scrolls (infinite query + virtualization)", () => {
    cy.visit("/products");
    cy.contains("Classic Backpack"); // product-1, first item of page 1
    // Scrolling to the bottom of what's currently loaded (page 1) should
    // trigger fetchNextPage and pull in page 2.
    cy.get("[data-testid=product-grid-scroll]").scrollTo("bottom");
    cy.contains("Classic Water Bottle", { timeout: 10000 }); // product-21, first item of page 2
  });

  it("serves product responses with the documented Cache-Control header", () => {
    cy.request("/api/products").then((response) => {
      expect(response.headers["cache-control"]).to.eq(
        "public, max-age=60, stale-while-revalidate=300",
      );
    });
  });
});
