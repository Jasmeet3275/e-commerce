import { SearchBar } from "../../components/product/SearchBar";

describe("<SearchBar />", () => {
  it("renders a GET form posting to /products", () => {
    cy.mount(<SearchBar defaultValue="" />);
    cy.get("form[role=search]")
      .should("have.attr", "action", "/products")
      .and("have.attr", "method", "GET");
  });

  it("pre-fills the input from defaultValue", () => {
    cy.mount(<SearchBar defaultValue="backpack" />);
    cy.get("input[name=q]").should("have.value", "backpack");
  });

  it("shows no Clear link when there is no active search", () => {
    cy.mount(<SearchBar defaultValue="" />);
    cy.contains("a", "Clear").should("not.exist");
  });

  it("shows a Clear link back to /products when a search is active", () => {
    cy.mount(<SearchBar defaultValue="backpack" />);
    cy.contains("a", "Clear").should("have.attr", "href", "/products");
  });
});
