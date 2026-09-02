import { mount } from "cypress/react";

// Real Tailwind styles for component tests — without this, components render
// unstyled and tests asserting on computed layout (height, scroll, etc.) rather
// than just className presence will fail or silently pass for the wrong reason.
import "../../app/globals.css";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required pattern for augmenting Cypress's global namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);
