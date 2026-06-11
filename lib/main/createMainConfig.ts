declare var __dirname: string;

interface CreateMainConfigOptions {
  stories?: string[];
  extraAddons?: any[];
  staticDirs?: string[];
  extraAliases?: Record<string, string>;
  extraWebpackRules?: any[];
  webpackFallback?: Record<string, string | false>;
  webpackPlugins?: any[];
  docs?: Record<string, any>;
  typescript?: Record<string, any>;
  remarkPlugins?: any[];
  msw?: boolean;
  a11y?: boolean;
}

export function createMainConfig(options: CreateMainConfigOptions = {}) {
  const {
    stories = ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    extraAddons = [],
    staticDirs,
    extraAliases = {},
    extraWebpackRules = [],
    webpackFallback,
    webpackPlugins = [],
    docs = { defaultName: 'Documentation' },
    typescript,
    remarkPlugins,
    msw = true,
    a11y = true,
  } = options;

  const addons: any[] = ['@storybook/addon-webpack5-compiler-swc'];

  if (remarkPlugins?.length) {
    addons.push({
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins,
          },
        },
      },
    });
  } else {
    addons.push('@storybook/addon-docs');
  }

  if (msw) {
    addons.push('msw-storybook-addon');
  }

  if (a11y) {
    addons.push('@storybook/addon-a11y');
  }

  addons.push(...extraAddons);

  const config: Record<string, any> = {
    stories,
    addons,
    framework: {
      name: '@storybook/react-webpack5',
      options: {},
    },
    docs,
    typescript: typescript ?? {
      check: false,
      reactDocgen: 'react-docgen-typescript',
      reactDocgenTypescriptOptions: {
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop: any) =>
          prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      },
    },
    webpackFinal: async (webpackConfig: any) => {
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const currentDir = typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url));
      const hubMocksDir = path.resolve(currentDir, 'mocks');

      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve?.alias,
          '@redhat-cloud-services/frontend-components/useChrome': path.join(hubMocksDir, 'useChrome.js'),
          '@redhat-cloud-services/frontend-components-utilities/RBACHook': path.join(hubMocksDir, 'RBACHook.js'),
          '@unleash/proxy-client-react': path.join(hubMocksDir, 'unleash.js'),
          '@project-kessel/react-kessel-access-check': path.join(hubMocksDir, 'kesselAccessCheck.js'),
          ...extraAliases,
        },
        fallback: {
          ...webpackConfig.resolve?.fallback,
          ...webpackFallback,
        },
      };

      webpackConfig.module = webpackConfig.module || {};
      webpackConfig.module.rules = webpackConfig.module.rules || [];

      webpackConfig.module.rules.push({
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      });

      webpackConfig.module.rules.push(...extraWebpackRules);

      if (webpackPlugins.length) {
        webpackConfig.plugins = webpackConfig.plugins || [];
        webpackConfig.plugins.push(...webpackPlugins);
      }

      return webpackConfig;
    },
  };

  if (staticDirs) {
    config.staticDirs = staticDirs;
  }

  return config;
}
