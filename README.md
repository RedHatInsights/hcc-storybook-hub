# hcc-storybooks

Composed meta Storybook that aggregates stories from multiple HCC frontend applications into a single browsable interface. By default, it points to each application's latest master build on Chromatic.

## Composed applications

| Application | Repository | Env Var Override |
|---|---|---|
| Access Requests | `access-requests-frontend` | `SB_ACCESS_REQUESTS_URL` |
| RBAC | `insights-rbac-ui` | `SB_RBAC_URL` |
| Notifications | `notifications-frontend` | `SB_NOTIFICATIONS_URL` |
| Service Accounts | `service-accounts` | `SB_SERVICE_ACCOUNTS_URL` |
| Sources | `sources-ui` | `SB_SOURCES_URL` |
| User Preferences | `user-preferences-frontend` | `SB_USER_PREFERENCES_URL` |

## Quick start

```bash
npm install
npm run storybook
```

The meta Storybook starts on port 6006 and loads all external Storybooks from Chromatic automatically.

## Custom URLs

Point any ref to a local or alternative Storybook by setting its env var:

```bash
SB_NOTIFICATIONS_URL=http://localhost:6012 npm run storybook
```

## Running Storybooks locally

If you want to serve Storybooks from local clones instead of Chromatic, clone the repos as sibling directories and run:

```bash
npm run serve-all
```

This expects the following directory layout:

```
hcc/
├── hcc-storybooks/          # this project
├── access-requests-frontend/
├── insights-rbac-ui/
├── notifications-frontend/
├── service-accounts/
├── sources-ui/
└── user-preferences-frontend/
```

The script builds each repo's Storybook, serves it on a local port, and starts this meta Storybook on port 6006.

## Published package contents

The npm package includes only production artifacts:

- `dist/` — compiled JS, ESM, and type declarations (built by `tsup`)
- `lib/css/` — shared Storybook CSS
- `README.md` and `package.json`

Everything else (source code, config, scripts, Storybook config, docs) is excluded. The `"files"` field in `package.json` acts as the primary allowlist, and `.npmignore` provides a secondary exclusion layer. To verify what gets published, run:

```bash
npm run build
npm pack --dry-run
```

Changes to `.npmignore` require review from `@RedHatInsights/console-framework-leads` (see `CODEOWNERS`).

## What this is (and isn't)

This is a **discovery and browsing hub**. It gives you one place to view all HCC component stories without tracking down individual Storybook deployments.

It is **not a test runner**. Automated tests (interaction tests, a11y checks) must be run against each individual Storybook — composition only provides a unified sidebar, not centralized test execution.
