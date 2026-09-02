describe("Product detail", () => {
  it("SSRs the product detail with correct metadata and JSON-LD", () => {
    cy.visit("/products/product-1");
    cy.title().should("eq", "Classic Backpack | Shop"); // root layout's title template
    cy.get("h1").contains("Classic Backpack");
    // product-1 (i=0): price = 15 + (0 % 200) = 15, discount = 10 + (0 % 30) = 10%
    cy.contains("$13.50");

    cy.get('script[type="application/ld+json"]')
      .should("exist")
      .then(($script) => {
        const data = JSON.parse($script.text());
        expect(data["@type"]).to.eq("Product");
        expect(data.name).to.eq("Classic Backpack");
        expect(data.offers.price).to.be.a("number");
      });
  });

  it("navigates from the product list to the detail page", () => {
    cy.visit("/products");
    cy.contains("Classic Backpack").click();
    cy.url().should("include", "/products/product-1");
    cy.get("h1").contains("Classic Backpack");
  });

  it("shows a not-found state for an unknown product id", () => {
    // notFound() is called in the page body, but generateMetadata's response can
    // already start streaming as 200 before it throws — Next's documented
    // trade-off. It compensates with an automatic noindex tag (a "soft 404"); a
    // true HTTP 404 would require the existence check to happen in proxy.ts
    // instead, which isn't worth the complexity for a mock catalog.
    cy.visit("/products/does-not-exist", { failOnStatusCode: false });
    cy.get('meta[name="robots"]').should("have.attr", "content", "noindex");
  });

  // No E2E test for hover-prefetch: under real network contention (next/link's
  // own automatic RSC prefetching for every visible card competes with our
  // explicit hover-prefetch for connections), the timing to confirm the actual
  // network call is unreliable even at a 6s wait — flaky beyond what's worth
  // chasing. The mechanism itself is proven at the component level instead:
  // cypress/component/ProductCard.cy.tsx confirms onHoverPrefetch fires on
  // hover, and it was directly observed firing a real /api/products/product-1
  // request via a manual network capture during development.
});
