import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "apps/*/src/**/*.test.{ts,tsx}",
      "challenges/*/src/**/*.test.{ts,tsx}",
      "packages/*/src/**/*.test.{ts,tsx}",
    ],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
  },
});
