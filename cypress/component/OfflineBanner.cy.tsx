import { OfflineBanner } from "../../components/pwa/OfflineBanner";

function setOnLine(win: Cypress.AUTWindow, value: boolean) {
  Object.defineProperty(win.navigator, "onLine", { value, configurable: true });
}

describe("<OfflineBanner />", () => {
  it("shows nothing while online", () => {
    cy.mount(<OfflineBanner />);
    cy.contains("You're offline").should("not.exist");
  });

  it("shows a banner when the browser goes offline", () => {
    cy.mount(<OfflineBanner />);
    cy.window().then((win) => {
      setOnLine(win, false);
      win.dispatchEvent(new Event("offline"));
    });
    cy.contains("You're offline");
  });

  it("hides the banner again once back online", () => {
    cy.mount(<OfflineBanner />);
    cy.window().then((win) => {
      setOnLine(win, false);
      win.dispatchEvent(new Event("offline"));
    });
    cy.contains("You're offline");

    cy.window().then((win) => {
      setOnLine(win, true);
      win.dispatchEvent(new Event("online"));
    });
    cy.contains("You're offline").should("not.exist");
  });
});
