import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'lib/index.ts',
    config: 'lib/main/createMainConfig.ts',
    'mocks/useChrome': 'lib/mocks/useChrome.tsx',
    'mocks/unleash': 'lib/mocks/unleash.ts',
    'mocks/kesselAccessCheck': 'lib/mocks/kesselAccessCheck.tsx',
    'mocks/RBACHook': 'lib/mocks/RBACHook.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'storybook',
    '@storybook/react-webpack5',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-webpack5-compiler-swc',
    'msw-storybook-addon',
    'msw',
    '@patternfly/react-core',
    '@patternfly/patternfly',
    'webpack',
  ],
  tsconfig: 'tsconfig.lib.json',
});
