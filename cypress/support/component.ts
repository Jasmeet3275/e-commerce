import { mount } from "cypress/react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required pattern for augmenting Cypress's global namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);
