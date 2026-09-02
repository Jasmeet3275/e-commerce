import { VirtualizedProductGrid } from "../../components/product/VirtualizedProductGrid";

function makeProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1}`,
    imageUrl: "/products/placeholder-1.svg",
    price: 50,
    discount: 0,
  }));
}

describe("<VirtualizedProductGrid />", () => {
  beforeEach(() => {
    cy.viewport(1024, 800);
  });

  it("renders a window of product cards, not all of them at once", () => {
    cy.mount(
      <VirtualizedProductGrid
        products={makeProducts(150)}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={cy.stub()}
      />,
    );
    cy.contains("Product 1");
    cy.get("[data-testid=product-grid-scroll]").within(() => {
      cy.get("img").its("length").should("be.lessThan", 150);
    });
  });

  it("calls onLoadMore when scrolled near the bottom of the loaded products", () => {
    const onLoadMore = cy.stub().as("onLoadMore");
    cy.mount(
      <VirtualizedProductGrid
        products={makeProducts(20)}
        hasNextPage={true}
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />,
    );
    cy.get("[data-testid=product-grid-scroll]").scrollTo("bottom");
    cy.get("@onLoadMore").should("have.been.called");
  });

  it("does not call onLoadMore when there is no next page", () => {
    const onLoadMore = cy.stub().as("onLoadMore");
    cy.mount(
      <VirtualizedProductGrid
        products={makeProducts(20)}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />,
    );
    cy.get("[data-testid=product-grid-scroll]").scrollTo("bottom");
    cy.get("@onLoadMore").should("not.have.been.called");
  });

  it("shows a loading indicator while fetching the next page", () => {
    cy.mount(
      <VirtualizedProductGrid
        products={makeProducts(20)}
        hasNextPage={true}
        isFetchingNextPage={true}
        onLoadMore={cy.stub()}
      />,
    );
    cy.get("[role=status]").contains("Loading more");
  });
});
