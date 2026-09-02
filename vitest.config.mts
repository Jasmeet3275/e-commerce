import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/cypress/**"],
    coverage: {
      provider: "v8",
      // Per ARCHITECTURE §13, React components (.tsx) are covered by Cypress
      // (component tests + E2E), not Vitest — Vitest only tracks pure logic:
      // stores, services, schemas, utils, server-side business logic.
      include: ["**/*.ts"],
      exclude: [
        "**/node_modules/**",
        "**/.next/**",
        "**/cypress/**",
        "**/*.d.ts",
        // proxy.ts needs a full NextRequest/NextResponse runtime — covered by E2E.
        "proxy.ts",
        // React hooks (use*.ts) are render-context-bound like components, even
        // though they're .ts not .tsx — covered by Cypress component/E2E tests.
        // Scoped to lib/query/ and components/ specifically — NOT lib/store/,
        // since Zustand stores share the "use" naming convention for component
        // consumption but are plain testable objects (getState()/setState()),
        // no render context needed. A blanket "**/use*.ts" glob incorrectly
        // excluded lib/store/useAuthStore.ts's coverage since Story 2.
        "lib/query/use*.ts",
        "components/**/use*.ts",
        // Type-only declaration files, no runtime logic to cover.
        "types/**",
        "*.config.{ts,js,mjs}",
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
