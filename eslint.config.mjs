import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The pre-migration static site, kept as a reference. It is not part of
    // the build and is not written to modern lint rules.
    "site/**",
  ]),
  {
    rules: {
      /* The stylesheet positions these images by exact element structure —
         cutout trucks pinned inside .stage__rig, gallery figures, the peek
         layer. next/image wraps each one in its own span and rewrites sizing,
         which moves them. Fidelity to the design wins here; if these ever get
         optimised it should be a deliberate pass with the layout re-verified
         in the browser, not a lint autofix. */
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
