describe("Golden path", () => {
  it("browses, adds to cart, is redirected to log in, completes checkout, and cancels the order", () => {
    // Browse
    cy.visit("/products");
    cy.contains("Classic Backpack");

    // View detail, reached by clicking through (not cy.visit) like a real user
    cy.contains("a", "Classic Backpack").click();
    cy.url().should("include", "/products/product-1");
    cy.contains("button", "Add to cart").click();
    cy.contains("button", "Added!");

    // Cart
    cy.contains("a", "Cart").click();
    cy.url().should("include", "/cart");
    cy.contains("Classic Backpack");

    // Checkout while unauthenticated — clicking through, not a hard visit,
    // so this exercises proxy.ts's redirect on a client-side navigation too.
    cy.contains("a", "Proceed to checkout").click();
    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fcheckout");

    // Log in
    cy.get("#email").type("demo@example.com");
    cy.get("#password").type("password123");
    cy.contains("button", "Log in").click();

    // Sent straight back to checkout — the cart survived the login detour
    cy.url().should("include", "/checkout");
    cy.get("#line1").type("1 Main St");
    cy.get("#city").type("Springfield");
    cy.get("#postalCode").type("12345");
    cy.get("#country").type("US");
    cy.contains("button", "Continue to payment").click();

    cy.contains("Classic Backpack");
    cy.get("#cardNumber").type("4242424242424242");
    cy.get("#expiry").type("12/30");
    cy.get("#cvc").type("123");
    cy.contains("button", "Place order").click();
    cy.contains("Order placed!");

    // Cancel it — immediate, any time, no approval step (PRD FR #7)
    cy.contains("button", "Cancel order").click();
    cy.contains("Order cancelled");
  });
});
