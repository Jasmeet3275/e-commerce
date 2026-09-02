import { PaginationFooter } from "../../components/product/PaginationFooter";

describe("<PaginationFooter />", () => {
  it("renders nothing for a single page", () => {
    cy.mount(<PaginationFooter currentPage={1} totalPages={1} />);
    cy.get("nav").should("not.exist");
  });

  it("renders a link per page and marks the current page", () => {
    cy.mount(<PaginationFooter currentPage={2} totalPages={3} />);
    cy.get("a[aria-current=page]").should("have.text", "2");
    cy.contains("a", "1").should("have.attr", "href", "/products");
    cy.contains("a", "3").should("have.attr", "href", "/products?page=3");
  });

  it("disables Previous on the first page", () => {
    cy.mount(<PaginationFooter currentPage={1} totalPages={3} />);
    cy.contains("a", "Previous").should("have.attr", "aria-disabled", "true");
  });

  it("disables Next on the last page", () => {
    cy.mount(<PaginationFooter currentPage={3} totalPages={3} />);
    cy.contains("a", "Next").should("have.attr", "aria-disabled", "true");
  });

  it("links Previous/Next to the adjacent page", () => {
    cy.mount(<PaginationFooter currentPage={2} totalPages={3} />);
    cy.contains("a", "Previous").should("have.attr", "href", "/products");
    cy.contains("a", "Next").should("have.attr", "href", "/products?page=3");
  });
});
