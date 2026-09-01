import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    setupNodeEvents() {},
  },
  component: {
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
