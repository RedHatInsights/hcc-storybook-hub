import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  refs: {
    "access-requests": {
      title: "Access Requests",
      url:
        process.env.SB_ACCESS_REQUESTS_URL ||
        "https://master--686501da56bb357ec8c2a222.chromatic.com",
      expanded: false,
    },
    rbac: {
      title: "RBAC",
      url:
        process.env.SB_RBAC_URL ||
        "https://master--687a10bbc18d4b17063770ba.chromatic.com",
      expanded: false,
    },
    notifications: {
      title: "Notifications",
      url:
        process.env.SB_NOTIFICATIONS_URL ||
        "https://master--6980bce13ca67d03fef6d1f0.chromatic.com",
      expanded: false,
    },
    "service-accounts": {
      title: "Service Accounts",
      url:
        process.env.SB_SERVICE_ACCOUNTS_URL ||
        "https://main--697750052f76f5beb7bcc562.chromatic.com",
      expanded: false,
    },
    sources: {
      title: "Sources",
      url:
        process.env.SB_SOURCES_URL ||
        "https://master--69aac3ff9c5deda93c28833d.chromatic.com",
      expanded: false,
    },
    "user-preferences": {
      title: "User Preferences",
      url:
        process.env.SB_USER_PREFERENCES_URL ||
        "https://master--699f3dc4cec153f41377352c.chromatic.com",
      expanded: false,
    },
  },
};

export default config;
