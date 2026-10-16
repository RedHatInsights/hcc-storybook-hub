declare var __dirname: string;

interface CreateMainConfigOptions {
  stories?: string[];
  extraAddons?: any[];
  staticDirs?: string[];
  /**
   * Exact-match import aliases, applied through `viteFinal` (`resolve.alias`).
   * Keys must be bare specifiers (e.g. `@scope/pkg/module`); they are matched
   * exactly — subpath imports of an aliased specifier are not rewritten.
   */
  extraAliases?: Record<string, string>;
  docs?: Record<string, any>;
  typescript?: Record<string, any>;
  remarkPlugins?: any[];
  msw?: boolean;
  a11y?: boolean;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createMainConfig(options: CreateMainConfigOptions = {}) {
  const {
    stories = ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    extraAddons = [],
    staticDirs,
    extraAliases = {},
    docs = { defaultName: "Documentation" },
    typescript,
    remarkPlugins,
    msw = true,
    a11y = true,
  } = options;

  const addons: any[] = ["@storybook/addon-vitest"];

  if (remarkPlugins?.length) {
    addons.push({
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins,
          },
        },
      },
    });
  } else {
    addons.push("@storybook/addon-docs");
  }

  if (msw) {
    addons.push("msw-storybook-addon");
  }

  if (a11y) {
    addons.push("@storybook/addon-a11y");
  }

  addons.push(...extraAddons);

  const config: Record<string, any> = {
    stories,
    addons,
    framework: {
      name: "@storybook/react-vite",
      options: {},
    },
    docs,
    typescript: typescript ?? {
      check: false,
      reactDocgen: "react-docgen-typescript",
      reactDocgenTypescriptOptions: {
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop: any) =>
          prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      },
    },
    viteFinal: async (viteConfig: any) => {
      const path = await import("path");
      const { fileURLToPath } = await import("url");
      const currentDir =
        typeof __dirname !== "undefined"
          ? __dirname
          : path.dirname(fileURLToPath(import.meta.url));
      const hubMocksDir = path.resolve(currentDir, "mocks");

      // Hub mocks + app-specific aliases. The webpack-era object alias map is
      // converted to Vite's array form with exact-match regexes.
      const aliases: Record<string, string> = {
        "@redhat-cloud-services/frontend-components/useChrome": path.join(
          hubMocksDir,
          "useChrome.js",
        ),
        "@redhat-cloud-services/frontend-components-utilities/RBACHook":
          path.join(hubMocksDir, "RBACHook.js"),
        "@unleash/proxy-client-react": path.join(hubMocksDir, "unleash.js"),
        "@project-kessel/react-kessel-access-check": path.join(
          hubMocksDir,
          "kesselAccessCheck.js",
        ),
        ...extraAliases,
      };

      viteConfig.resolve = viteConfig.resolve ?? {};
      viteConfig.resolve.alias = [
        ...(Array.isArray(viteConfig.resolve.alias)
          ? viteConfig.resolve.alias
          : []),
        ...Object.entries(aliases).map(([find, replacement]) => ({
          find: new RegExp(`^${escapeRegExp(find)}$`),
          replacement,
        })),
      ];

      return viteConfig;
    },
  };

  if (staticDirs) {
    config.staticDirs = staticDirs;
  }

  config.previewBody = () => '<div id="chrome-app-render-root"></div>';

  return config;
}
