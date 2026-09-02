import { useRef } from "react";

import { Input } from "../../components/ui/Input";

describe("<Input />", () => {
  it("accepts typed input", () => {
    cy.mount(<Input placeholder="Email" />);
    cy.get("input").type("demo@example.com").should("have.value", "demo@example.com");
  });

  it("marks aria-invalid when invalid", () => {
    cy.mount(<Input invalid />);
    cy.get("input").should("have.attr", "aria-invalid", "true");
  });

  it("does not set aria-invalid by default", () => {
    cy.mount(<Input />);
    cy.get("input").should("not.have.attr", "aria-invalid");
  });

  it("forwards a ref that can imperatively focus the underlying input", () => {
    function Wrapper() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <>
          <Input ref={ref} data-testid="my-input" />
          <button type="button" onClick={() => ref.current?.focus()}>
            Focus
          </button>
        </>
      );
    }
    cy.mount(<Wrapper />);
    cy.contains("button", "Focus").click();
    cy.get("[data-testid=my-input]").should("be.focused");
  });
});
