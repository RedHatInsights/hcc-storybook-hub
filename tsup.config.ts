import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "lib/index.ts",
    config: "lib/main/createMainConfig.ts",
    "mocks/useChrome": "lib/mocks/useChrome.tsx",
    "mocks/unleash": "lib/mocks/unleash.ts",
    "mocks/kesselAccessCheck": "lib/mocks/kesselAccessCheck.tsx",
    "mocks/RBACHook": "lib/mocks/RBACHook.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "storybook",
    "@storybook/react-vite",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
    "msw-storybook-addon",
    "msw",
    "@patternfly/react-core",
    "@patternfly/patternfly",
  ],
  tsconfig: "tsconfig.lib.json",
});
