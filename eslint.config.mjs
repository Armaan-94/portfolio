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
  ]),
  {
    // React Three Fiber's render loop (useFrame) is an imperative escape hatch:
    // mutating the camera, meshes, and shader uniforms every frame is the
    // intended pattern and has no non-mutating equivalent. The React-Compiler
    // immutability/purity rules assume pure render semantics, so we scope them
    // off for the 3D engine only. The rest of the app keeps them enforced.
    files: ["src/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
