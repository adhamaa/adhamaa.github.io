import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      // TinaCMS output: the built editor and its generated client.
      "public/admin/**",
      "tina/__generated__/**",
    ],
  },
  {
    extends: [...nextCoreWebVitals],
  },
]);
