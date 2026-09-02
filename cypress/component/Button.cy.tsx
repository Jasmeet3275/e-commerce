import { Button } from "../../components/ui/Button";

describe("<Button />", () => {
  it("renders its children", () => {
    cy.mount(<Button>Click me</Button>);
    cy.get("button").contains("Click me");
  });

  it("fires onClick", () => {
    const onClick = cy.stub().as("onClick");
    cy.mount(<Button onClick={onClick}>Click me</Button>);
    cy.get("button").click();
    cy.get("@onClick").should("have.been.calledOnce");
  });

  it("is disabled when the disabled prop is set", () => {
    const onClick = cy.stub().as("onClick");
    cy.mount(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    );
    cy.get("button").should("be.disabled");
    cy.get("button").click({ force: true });
    cy.get("@onClick").should("not.have.been.called");
  });

  it("applies the variant and size classes", () => {
    cy.mount(
      <Button variant="outline" size="lg">
        Click me
      </Button>,
    );
    cy.get("button").should("have.class", "border").and("have.class", "h-12");
  });

  it("merges a custom className without dropping variant classes", () => {
    cy.mount(<Button className="mt-4">Click me</Button>);
    cy.get("button").should("have.class", "mt-4").and("have.class", "bg-brand-600");
  });
});
