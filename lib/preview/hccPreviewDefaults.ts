import { initialize, mswLoader } from 'msw-storybook-addon';

export const hccPreviewDefaults = {
  beforeAll: async () => {
    initialize({ onUnhandledRequest: 'warn' });
  },
  loaders: [mswLoader],
  parameters: {
    layout: 'fullscreen' as const,
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};
