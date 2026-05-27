export interface PermissionsArgs {
  orgAdmin?: boolean;
  userAccessAdministrator?: boolean;
}

export interface ChromeArgs {
  environment?: 'prod' | 'stage' | 'ci-beta' | 'ci-stable' | 'qa-beta' | 'qa-stable';
}

export interface FeatureFlagsArgs {
  [key: string]: boolean | undefined;
}

export type DecoratorArgs = PermissionsArgs & ChromeArgs & FeatureFlagsArgs;

export type StoryArgs<T = {}> = T & DecoratorArgs;

export const DEFAULT_DECORATOR_ARGS = {
  orgAdmin: false,
  userAccessAdministrator: false,
  environment: 'prod',
};

export const DECORATOR_ARG_TYPES = {
  orgAdmin: {
    control: 'boolean',
    description: 'Organization admin permissions',
    table: { category: 'Permissions' },
  },
  userAccessAdministrator: {
    control: 'boolean',
    description: 'User access administrator permissions',
    table: { category: 'Permissions' },
  },
  environment: {
    control: 'select',
    options: ['prod', 'stage', 'ci-beta', 'ci-stable', 'qa-beta', 'qa-stable'],
    description: 'Environment for Chrome API',
    table: { category: 'Chrome' },
  },
} as const;
