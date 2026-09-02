describe("Cart", () => {
  it("shows an empty state when nothing has been added", () => {
    cy.visit("/cart");
    cy.contains("Your cart is empty.");
    cy.contains("a", "Browse products").should("have.attr", "href", "/products");
  });

  it("adds a product from the detail page, reflects it in the header badge, and shows it on /cart", () => {
    cy.visit("/products/product-1");
    cy.get("[data-testid=cart-count-badge]").should("not.exist");

    cy.contains("button", "Add to cart").click();
    cy.contains("button", "Added!");
    cy.get("[data-testid=cart-count-badge]").should("have.text", "1");

    cy.visit("/cart");
    cy.contains("Classic Backpack");
    cy.get("[data-testid=cart-item-count]").should("have.text", "1");
  });

  it("increases quantity and updates the header badge accordingly", () => {
    cy.visit("/products/product-1");
    cy.contains("button", "Add to cart").click();

    cy.visit("/cart");
    cy.get("[aria-label='Increase quantity']").click();
    cy.get("[data-testid=cart-item-count]").should("have.text", "2");
    cy.get("[data-testid=cart-count-badge]").should("have.text", "2");
  });

  it("cancels (removes) an item from the cart without affecting other journey state", () => {
    cy.visit("/products/product-1");
    cy.contains("button", "Add to cart").click();

    cy.visit("/cart");
    cy.contains("Classic Backpack");
    cy.contains("button", "Cancel").click();

    cy.contains("Your cart is empty.");
    cy.get("[data-testid=cart-count-badge]").should("not.exist");
  });

  it("persists the cart across a reload", () => {
    cy.visit("/products/product-1");
    cy.contains("button", "Add to cart").click();

    cy.reload();
    cy.get("[data-testid=cart-count-badge]").should("have.text", "1");
  });
});
