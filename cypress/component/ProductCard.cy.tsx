import { ProductCard } from "../../components/product/ProductCard";

const baseProduct = {
  id: "product-1",
  name: "Classic Backpack",
  imageUrl: "/products/placeholder-1.svg",
  price: 100,
  discount: 0,
};

describe("<ProductCard />", () => {
  it("renders the product name and price", () => {
    cy.mount(<ProductCard product={baseProduct} />);
    cy.contains("Classic Backpack");
    cy.contains("$100.00");
  });

  it("shows a discounted price and the original struck through when discounted", () => {
    cy.mount(<ProductCard product={{ ...baseProduct, discount: 25 }} />);
    cy.contains("$75.00");
    cy.contains("$100.00").should("have.class", "line-through");
  });

  it("shows no strikethrough price when there is no discount", () => {
    cy.mount(<ProductCard product={baseProduct} />);
    cy.get(".line-through").should("not.exist");
  });

  it("renders the product image with alt text", () => {
    cy.mount(<ProductCard product={baseProduct} />);
    cy.get("img[alt='Classic Backpack']").should("exist");
  });
});
