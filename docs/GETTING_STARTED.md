# Getting Started with hcc-storybook-hub

One package gives you a fully configured Storybook for HCC frontend applications: Storybook 10, webpack5, MSW, a11y, Chromatic, test runner, and mocks for all HCC platform libraries.

## Setup

### 1. Install

```bash
npm install --save-dev @redhat-cloud-services/hcc-storybook-hub
```

No other Storybook packages needed.

### 2. Create `.storybook/main.ts`

```ts
import { createMainConfig } from '@redhat-cloud-services/hcc-storybook-hub/config';

export default createMainConfig({
  staticDirs: ['../static'],
});
```

### 3. Create `.storybook/preview.tsx`

```tsx
import type { Preview } from '@storybook/react-webpack5';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@redhat-cloud-services/hcc-storybook-hub/css/storybook.css';
import { HccStorybookProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import { initialize, mswLoader } from 'msw-storybook-addon';

const preview: Preview = {
  beforeAll: async () => {
    initialize({ onUnhandledRequest: 'warn' });
  },
  loaders: [mswLoader],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, { parameters }) => (
      <HccStorybookProvider
        bundle="settings"
        app="notifications"
        permissions={[
          'notifications:*:*',
          'integrations:endpoints:read',
          'integrations:endpoints:write',
        ]}
        featureFlags={parameters.featureFlags ?? {}}
      >
        <Story />
      </HccStorybookProvider>
    ),
  ],
};

export default preview;
```

#### `bundle` and `app`

These identify your application in the HCC Chrome environment. Components call `useChrome().getBundle()` and `useChrome().getApp()` to determine routing, navigation, and API base paths.

- **`app`** is your application name — the same value as `insights.appname` in your `package.json`.
- **`bundle`** is the top-level navigation section your app belongs to — the same value as `bundleLabels` in your `frontend.yaml` FEO config.

These values are used by `useChrome().getBundle()` and `useChrome().getApp()`, which some components use for URL construction (e.g. `/${getBundle()}/notifications/eventlog`). In Storybook with `MemoryRouter` the URLs don't navigate anywhere, but setting them correctly makes links render with realistic paths.

Your `package.json` already declares the app name:

```json
{
  "insights": {
    "appname": "notifications"
  }
}
```

And your `frontend.yaml` declares the bundle:

```yaml
bundleSegments:
  - bundleLabels: ["settings"]
```

Use these same values in `HccStorybookProvider`:

| App | bundle (from frontend.yaml) | app (from package.json) |
|---|---|---|
| RBAC / User Access | `iam` | `rbac` |
| Notifications | `settings` | `notifications` |
| Sources | `settings` | `sources` |
| Service Accounts | `iam` | `service-accounts` |

#### `permissions`

Permissions control what your components can do. Buttons, routes, and API calls are often gated by permission checks. HCC uses two permission systems:

**RBAC v1** — `useChrome().getUserPermissions()` returns permission strings in `app:resource:action` format. Use `*` as a wildcard:

```tsx
permissions={['notifications:*:*', 'integrations:endpoints:read']}
```

**Kessel v2** — `useSelfAccessCheck()` checks workspace-level and tenant-level permissions. These are configured separately via `workspacePermissions` and `tenantPermissions`:

```tsx
<HccStorybookProvider
  bundle="iam"
  app="rbac"
  // V1 permissions — used by useChrome().getUserPermissions()
  permissions={['rbac:*:*', 'inventory:groups:read', 'inventory:groups:write']}
  // V2 workspace permissions — used by useSelfAccessCheck() for workspace resources
  workspacePermissions={{
    view: ['*'],       // can view all workspaces
    edit: ['ws-1'],    // can edit only ws-1
    create: ['root'],  // can create under root
    delete: [],        // cannot delete any workspace
    move: [],
  }}
  // V2 tenant permissions — used by useSelfAccessCheck() for tenant resources
  tenantPermissions={{
    rbac_roles_read: true,
    rbac_roles_write: true,
    rbac_groups_read: true,
    rbac_groups_write: false,    // read-only for groups
    rbac_principal_read: true,
    rbac_workspace_view: true,
    rbac_workspace_edit: true,
    rbac_workspace_create: true,
    rbac_workspace_delete: false,
    rbac_workspace_move: false,
  }}
>
```

Most apps only use v1 permissions today. If your components don't call `useSelfAccessCheck`, you can skip `workspacePermissions` and `tenantPermissions`.

Stories that test restricted access can override the defaults:

```tsx
export const ReadOnlyUser: Story = {
  decorators: [
    (Story) => (
      <HccStorybookProvider
        bundle="settings"
        app="notifications"
        permissions={['notifications:events:read']}
      >
        <Story />
      </HccStorybookProvider>
    ),
  ],
};
```

### 4. Initialize MSW

```bash
npx msw init static/ --save
```

This creates `static/mockServiceWorker.js` which MSW needs to intercept API requests in the browser.

### 5. Add scripts to `package.json`

Make sure `staticDirs` in your `main.ts` points to the directory containing `mockServiceWorker.js`.

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "test-storybook --ci --testTimeout=60000"
  }
}
```

### 6. Run

```bash
npm run storybook
```

## Configuring stories

### Permissions

The `HccStorybookProvider` wraps every story with a mock Chrome environment. The `permissions` prop controls what `useChrome().getUserPermissions()` returns.

Set default permissions in `preview.tsx` and override per-story:

```tsx
// Default for all stories (in preview.tsx)
<HccStorybookProvider permissions={['notifications:*:*', 'integrations:endpoints:read']}>

// Override for a specific story
export const ReadOnly: Story = {
  parameters: {
    // The decorator reads parameters and passes them to HccStorybookProvider
  },
  decorators: [
    (Story) => (
      <HccStorybookProvider
        bundle="settings"
        app="notifications"
        permissions={['notifications:events:read']}
      >
        <Story />
      </HccStorybookProvider>
    ),
  ],
};
```

### Org admin vs regular user

```tsx
<HccStorybookProvider
  bundle="settings"
  app="notifications"
  isOrgAdmin={true}
>
```

This affects `useChrome().auth.getUser()` which returns `is_org_admin: true`, and `useSelfAccessCheck` behavior for tenant-level permissions.

### Feature flags

Pass feature flags per-story via parameters:

```tsx
export const WithNewFeature: Story = {
  parameters: {
    featureFlags: {
      'platform.notifications.overhaul': true,
    },
  },
};
```

Your `preview.tsx` decorator should forward `parameters.featureFlags` to `HccStorybookProvider`:

```tsx
<HccStorybookProvider
  featureFlags={parameters.featureFlags ?? {}}
>
```

Components using `useFlag('platform.notifications.overhaul')` will see `true`.

### Environment (staging vs production)

```tsx
<HccStorybookProvider environment="production">
```

This affects `useChrome().getEnvironment()` (returns `'prod'`), `useChrome().isProd` (returns `true`), and `useChrome().getEnvironmentDetails()`.

Default is `'stage'`.

### Kessel workspace permissions

For components using `useSelfAccessCheck` from `@project-kessel/react-kessel-access-check`:

```tsx
<HccStorybookProvider
  permissions={['rbac:*:*', 'inventory:groups:write']}
  workspacePermissions={{
    view: ['root-1', 'ws-1', 'ws-2'],
    edit: ['root-1', 'ws-1'],
    delete: ['ws-1'],
    create: ['root-1', 'ws-1'],
    move: ['ws-1'],
  }}
>
```

Use `['*']` to grant all workspace IDs:

```tsx
workspacePermissions={{
  view: ['*'],
  edit: ['*'],
  delete: ['*'],
  create: ['*'],
  move: ['*'],
}}
```

### User identity

Customize the user returned by `useChrome().auth.getUser()`:

```tsx
<HccStorybookProvider
  userIdentity={{
    org_id: '12345',
    user: {
      username: 'jane.doe',
      email: 'jane@example.com',
      is_org_admin: false,
      is_internal: true,
    },
  }}
>
```

### MSW handlers

Mock API responses per-story using MSW:

```tsx
import { http, HttpResponse } from 'msw';

export const WithData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/notifications/v1/notifications', () =>
          HttpResponse.json({ data: [{ id: '1', title: 'Test' }] })
        ),
      ],
    },
  },
};
```

## Asserting on Chrome spies

All Chrome API functions that represent user actions are spies. Access them via the `chromeSpies` map:

```tsx
import { chromeSpies } from '@redhat-cloud-services/hcc-storybook-hub';
import { expect } from 'storybook/test';

export const ClickNavigation: Story = {
  play: async ({ canvasElement }) => {
    // ... trigger a click that calls chrome.appNavClick

    expect(chromeSpies.get('appNavClick')).toHaveBeenCalled();
    expect(chromeSpies.get('drawerActions.toggleDrawerContent')).toHaveBeenCalledTimes(1);
  },
};
```

Available spy paths: `appNavClick`, `appObjectId`, `appAction`, `auth.logout`, `drawerActions.toggleDrawerContent`, `drawerActions.setDrawerPanelContent`, `drawerActions.toggleDrawerPanel`, `identifyApp`, `init`, and many more. Any function in the Chrome mock that uses `getSpy()` internally is available.

## Adding app-specific providers

Wrap `<Story />` with your app's providers inside `HccStorybookProvider`:

```tsx
<HccStorybookProvider bundle="settings" app="notifications" permissions={[...]}>
  <IntlProvider locale="en" messages={messages}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AppContext.Provider value={appContext}>
          <Story />
        </AppContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  </IntlProvider>
</HccStorybookProvider>
```

`HccStorybookProvider` handles Chrome, Unleash, Kessel, and RBAC mocks. Everything else (routing, i18n, state management, app-specific contexts) is your responsibility.

## `createMainConfig` options

| Option | Default | Description |
|---|---|---|
| `stories` | `['../src/**/*.mdx', '../src/**/*.stories.@(js\|jsx\|mjs\|ts\|tsx)']` | Story glob patterns |
| `staticDirs` | none | Static asset directories |
| `extraAliases` | `{}` | Additional webpack aliases for app-specific mocks |
| `extraAddons` | `[]` | Additional Storybook addons |
| `extraWebpackRules` | `[]` | Additional webpack module rules |
| `webpackFallback` | none | webpack `resolve.fallback` (e.g. polyfills) |
| `webpackPlugins` | `[]` | Additional webpack plugins |
| `remarkPlugins` | none | remark plugins for MDX processing |
| `msw` | `true` | Include MSW addon |
| `a11y` | `true` | Include a11y addon |
| `docs` | `{ defaultName: 'Documentation' }` | Storybook docs config |
| `typescript` | react-docgen-typescript | TypeScript config |

## What's included

The hub bundles these packages — don't install them separately:

- `storybook` (v10)
- `@storybook/react-webpack5`
- `@storybook/addon-docs`
- `@storybook/addon-webpack5-compiler-swc`
- `@storybook/addon-a11y`
- `@storybook/test-runner`
- `msw` + `msw-storybook-addon`
- `chromatic`
- `eslint-plugin-storybook`

## What's mocked automatically

When you use `createMainConfig`, these imports are automatically aliased to hub-provided mocks:

| Import | Mock |
|---|---|
| `@redhat-cloud-services/frontend-components/useChrome` | Full Chrome API with spy registry |
| `@redhat-cloud-services/frontend-components-utilities/RBACHook` | `usePermissions` with wildcard matching |
| `@unleash/proxy-client-react` | `useFlag`, `FlagProvider`, `useFlagsStatus`, etc. |
| `@project-kessel/react-kessel-access-check` | `useSelfAccessCheck`, `AccessCheck.Provider` |
