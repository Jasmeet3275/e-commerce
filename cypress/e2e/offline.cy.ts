describe("Offline / Service Worker", () => {
  it("registers the service worker and takes control after a reload", () => {
    cy.visit("/products");
    cy.window().its("navigator.serviceWorker.ready", { timeout: 10000 }).should("exist");

    cy.reload();
    cy.window().should((win) => {
      expect(win.navigator.serviceWorker.controller).to.not.equal(null);
    });
  });

  it("caches product API responses and catalog images for offline reuse", () => {
    cy.visit("/products");
    cy.window().its("navigator.serviceWorker.ready", { timeout: 10000 }).should("exist");
    cy.reload();
    cy.contains("Classic Backpack");

    // The /products page itself is fully SSR'd (no client-side fetch to
    // /api/products) — the SW only ever sees this endpoint via a real
    // browser fetch, same as the app's own hover-prefetch/cart-row paths.
    cy.window()
      .then((win) => win.fetch("/api/products/product-1"))
      .its("status")
      .should("eq", 200);

    cy.window().then(async (win) => {
      const apiCache = await win.caches.open("api-v1");
      const apiKeys = await apiCache.keys();
      expect(apiKeys.some((request) => request.url.includes("/api/products/product-1"))).to.equal(
        true,
      );

      const imageCache = await win.caches.open("images-v1");
      const imageKeys = await imageCache.keys();
      expect(imageKeys.length).to.be.greaterThan(0);
    });
  });

  function goOffline() {
    return Cypress.automation("remote:debugger:protocol", {
      command: "Network.emulateNetworkConditions",
      params: { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 },
    });
  }

  function goOnline() {
    return Cypress.automation("remote:debugger:protocol", {
      command: "Network.emulateNetworkConditions",
      params: { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
    });
  }

  it("still renders a page reached only by clicking through the app (not a hard load) when offline", () => {
    // This is the real, previously-broken path: Next's <Link> navigation is
    // an RSC fetch, not a `navigate`-mode request — a page only ever reached
    // this way (as opposed to cy.visit()'s hard load) had nothing cached for
    // a later direct/offline visit until warmPageCache() in sw.js fixed it.
    cy.visit("/products");
    cy.window().its("navigator.serviceWorker.ready", { timeout: 10000 }).should("exist");
    cy.reload(); // SW now controls this tab

    cy.contains("a", "Classic Backpack").click();
    cy.url().should("include", "/products/product-1");
    cy.contains("button", "Add to cart");

    cy.contains("a", "Cart").click();
    cy.url().should("include", "/cart");

    // Let the background warmPageCache() fetches (fired on each RSC nav) land.
    cy.wait(500);
    cy.then(goOffline);

    cy.visit("/products/product-1", { failOnStatusCode: false });
    cy.contains("button", "Add to cart", { timeout: 10000 });

    cy.visit("/cart", { failOnStatusCode: false });
    cy.contains("Cart", { timeout: 10000 });

    cy.then(goOnline);
  });

  it("shows an offline banner when the connection drops, and hides it again when restored", () => {
    cy.visit("/products");
    cy.contains("You're offline").should("not.exist");

    cy.then(goOffline);
    cy.contains("You're offline — showing cached content", { timeout: 10000 });

    cy.then(goOnline);
    cy.contains("You're offline").should("not.exist");
  });
});
