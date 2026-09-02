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
