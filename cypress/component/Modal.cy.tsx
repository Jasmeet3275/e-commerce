import { useState } from "react";

import { Modal } from "../../components/ui/Modal";

function ControlledModal() {
  const [open, setOpen] = useState(true);
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Confirm">
      <p>Are you sure?</p>
    </Modal>
  );
}

describe("<Modal />", () => {
  it("is visible when open", () => {
    cy.mount(<ControlledModal />);
    cy.get("dialog").should("have.prop", "open", true);
    cy.contains("Confirm");
    cy.contains("Are you sure?");
  });

  it("closes when the close button is clicked", () => {
    cy.mount(<ControlledModal />);
    cy.get("[aria-label=Close]").click();
    cy.get("dialog").should("have.prop", "open", false);
  });

  // Escape-to-close is native <dialog> browser behavior (via showModal()), not
  // custom code — untested here since it only fires for trusted (real) key
  // events, which Cypress's synthetic .trigger() can't produce. Backdrop-click
  // and the close button above prove the onClose wiring itself is correct;
  // Escape converges on the same dialog.close() -> "close" event path.

  it("closes on backdrop click", () => {
    cy.mount(<ControlledModal />);
    cy.get("dialog").click("topLeft"); // native <dialog> backdrop = clicking outside content bounds
    cy.get("dialog").should("have.prop", "open", false);
  });

  it("does not close when clicking inside the dialog content", () => {
    cy.mount(<ControlledModal />);
    cy.contains("Are you sure?").click();
    cy.get("dialog").should("have.prop", "open", true);
  });
});
