import { Header } from "../../components/layout/Header";
import { useAuthStore } from "../../lib/store/useAuthStore";
import { useCartStore } from "../../lib/store/useCartStore";

const demoUser = { id: "user-1", name: "Demo User", avatarUrl: null, country: "US" };

describe("<Header />", () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    useCartStore.setState({ items: [] });
  });

  it("shows no cart badge when the cart is empty", () => {
    cy.mount(<Header />);
    cy.get("[data-testid=cart-count-badge]").should("not.exist");
  });

  it("shows the total item count as a badge", () => {
    useCartStore.setState({
      items: [
        { productId: "product-1", count: 2 },
        { productId: "product-2", count: 1 },
      ],
    });
    cy.mount(<Header />);
    cy.get("[data-testid=cart-count-badge]").should("have.text", "3");
  });

  it("shows no Log out button when unauthenticated", () => {
    cy.mount(<Header />);
    cy.contains("button", "Log out").should("not.exist");
  });

  it("shows Log out when authenticated", () => {
    useAuthStore.getState().setSession("token-abc", demoUser);
    cy.mount(<Header />);
    cy.contains("button", "Log out").should("exist");
  });

  it("links Cart to /cart", () => {
    cy.mount(<Header />);
    cy.contains("a", "Cart").should("have.attr", "href", "/cart");
  });
});
