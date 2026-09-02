describe("Checkout", () => {
  function login() {
    cy.visit("/login");
    cy.get("#email").type("demo@example.com");
    cy.get("#password").type("password123");
    cy.get("form").contains("button", "Log in").click();
    cy.url().should("include", "/products");
  }

  function addProductToCart() {
    cy.visit("/products/product-1");
    cy.contains("button", "Add to cart").click();
  }

  it("redirects to login when visiting /checkout unauthenticated, then returns to /checkout", () => {
    cy.visit("/checkout");
    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fcheckout");

    cy.get("#email").type("demo@example.com");
    cy.get("#password").type("password123");
    cy.get("form").contains("button", "Log in").click();
    cy.url().should("include", "/checkout");
  });

  it("shows an empty-cart message when checking out with nothing in the cart", () => {
    login();
    cy.visit("/checkout");
    cy.contains("Your cart is empty.");
  });

  it("completes the full journey: address, payment, confirmation, and clears the cart", () => {
    login();
    addProductToCart();

    cy.visit("/checkout");
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
    cy.get("[data-testid=order-id]").should("not.be.empty");

    cy.contains("a", "Continue shopping").click();
    cy.url().should("include", "/products");
    cy.get("[data-testid=cart-count-badge]").should("not.exist");
  });

  it("cancels a just-placed order, any time, no approval step", () => {
    login();
    addProductToCart();

    cy.visit("/checkout");
    cy.get("#line1").type("1 Main St");
    cy.get("#city").type("Springfield");
    cy.get("#postalCode").type("12345");
    cy.get("#country").type("US");
    cy.contains("button", "Continue to payment").click();

    cy.get("#cardNumber").type("4242424242424242");
    cy.get("#expiry").type("12/30");
    cy.get("#cvc").type("123");
    cy.contains("button", "Place order").click();
    cy.contains("Order placed!");

    cy.contains("button", "Cancel order").click();
    cy.contains("Order cancelled");
    cy.contains("has been cancelled.");
    cy.contains("button", "Cancel order").should("not.exist");
  });

  it("keeps the checkout address draft after cancelling a different item from the cart", () => {
    login();
    addProductToCart(); // product-1

    cy.visit("/products/product-2");
    cy.contains("button", "Add to cart").click();

    cy.visit("/checkout");
    cy.get("#line1").type("1 Main St");
    cy.get("#city").type("Springfield");
    cy.get("#postalCode").type("12345");
    cy.get("#country").type("US");
    cy.contains("button", "Continue to payment").click();
    cy.contains("Shipping to");

    // Leave checkout and cancel one (not all) cart items directly from /cart
    // — useCheckoutStore is a separate store from useCartStore specifically
    // so this can't reset the address draft (PRD FR #7).
    cy.visit("/cart");
    cy.contains("button", "Cancel").first().click();
    cy.get("[data-testid=cart-item-count]").should("have.length", 1);

    cy.visit("/checkout");
    cy.contains("Shipping to"); // straight to payment, not bounced to the address form
    cy.contains("1 Main St");
    cy.get("#line1").should("not.exist");
  });
});
