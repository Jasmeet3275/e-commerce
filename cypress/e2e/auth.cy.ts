describe("Auth gate + direct-link redirect (PRD FR #6)", () => {
  it("redirects an unauthenticated visit to /checkout through login and back", () => {
    cy.visit("/checkout");
    cy.url().should("include", "/login?redirect=%2Fcheckout");

    cy.get("input[type=email]").type("demo@example.com");
    cy.get("input[type=password]").type("password123");
    cy.get("button[type=submit]").click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/checkout`);
    cy.get("h1").contains("Checkout");
  });

  it("POST /api/auth/logout clears the session cookie server-side", () => {
    // No UI trigger for logout yet — that belongs in a header/nav, not invented
    // early on a placeholder page. Exercise the contract directly instead.
    cy.visit("/checkout"); // unauthenticated, so proxy.ts bounces to /login first
    cy.get("input[type=email]").type("demo@example.com");
    cy.get("input[type=password]").type("password123");
    cy.get("button[type=submit]").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/checkout`);

    cy.request({
      method: "POST",
      url: "/api/auth/logout",
      headers: { origin: Cypress.config().baseUrl },
    })
      .its("status")
      .should("eq", 200);

    // Revisiting /checkout must redirect again — proves the refresh cookie was
    // actually cleared server-side, not just something client-side would need to clear.
    cy.visit("/checkout");
    cy.url().should("include", "/login?redirect=%2Fcheckout");
  });

  it("stays authenticated in the UI after a reload — session bootstraps from the refresh cookie", () => {
    // The access token only ever lives in memory (never persisted), so a
    // reload wipes it — this proves SessionBootstrap silently re-establishes
    // it from the still-valid httpOnly refresh cookie, not just that the
    // cookie itself survives (a separate, already-covered concern).
    cy.visit("/login");
    cy.get("input[type=email]").type("demo@example.com");
    cy.get("input[type=password]").type("password123");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/products");
    cy.contains("Demo User");

    cy.reload();
    cy.contains("Demo User");
    cy.contains("button", "Log out").should("exist");
    cy.contains("a", "Log in").should("not.exist");
  });

  it("shows an error and stays on the login page for bad credentials", () => {
    cy.visit("/login");
    cy.get("input[type=email]").type("demo@example.com");
    cy.get("input[type=password]").type("wrong-password");
    cy.get("button[type=submit]").click();

    cy.get("[role=alert]").contains("Invalid email or password.");
    cy.url().should("include", "/login");
  });
});
