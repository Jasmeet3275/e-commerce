import { Skeleton } from "../../components/ui/Skeleton";

describe("<Skeleton />", () => {
  it("renders with an accessible loading label", () => {
    cy.mount(<Skeleton className="h-4 w-32" />);
    cy.get("[role=status]").should("have.attr", "aria-label", "Loading");
  });

  it("applies caller-provided sizing classes", () => {
    cy.mount(<Skeleton className="h-4 w-32" />);
    cy.get("[role=status]").should("have.class", "h-4").and("have.class", "w-32");
  });
});
