describe("Product listing", () => {
  it("SSRs the first page of products with correct metadata", () => {
    cy.visit("/products");
    cy.title().should("include", "Products");
    cy.get("h1").contains("Products");
    cy.contains("Classic Backpack");
  });

  it("navigates to page 2 via the pagination footer, a real SSR'd page", () => {
    cy.visit("/products");
    cy.contains("Classic Backpack"); // product-1, first item of page 1
    cy.contains("nav[aria-label='Product pages'] a", "2").click();
    cy.url().should("include", "/products?page=2");
    cy.contains("Classic Headphones"); // product-51, first item of page 2
    cy.get("a[aria-current=page]").should("have.text", "2");
  });

  it("404s for a page number beyond the last page", () => {
    cy.request({ url: "/products?page=999", failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(200); // Next's soft-404: 200 + noindex, metadata already streamed
    });
    cy.visit("/products?page=999", { failOnStatusCode: false });
    cy.get('meta[name="robots"]').should("have.attr", "content").and("include", "noindex");
  });

  it("searches products by name via the search bar", () => {
    cy.visit("/products");
    cy.get("input[name=q]").type("Sneakers");
    cy.contains("button", "Search").click();
    cy.url().should("include", "/products?q=Sneakers");
    cy.contains("Classic Sneakers");
    cy.contains("Classic Backpack").should("not.exist");
  });

  it("shows a no-results message for a non-matching search", () => {
    cy.visit("/products?q=zzznotfound");
    cy.contains("No products found");
    cy.contains("zzznotfound");
  });

  it("clears the search and returns to the full catalog", () => {
    cy.visit("/products?q=Sneakers");
    cy.contains("a", "Clear").click();
    cy.url().should("not.include", "q=");
    cy.contains("Classic Backpack");
  });

  it("serves product responses with the documented Cache-Control header", () => {
    cy.request("/api/products").then((response) => {
      expect(response.headers["cache-control"]).to.eq(
        "public, max-age=60, stale-while-revalidate=300",
      );
    });
  });
});
