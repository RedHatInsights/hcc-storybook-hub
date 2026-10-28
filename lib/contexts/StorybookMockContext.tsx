import React, { type ReactNode, createContext, useContext, useMemo } from 'react';
import { syncKesselMockState } from '../mocks/kesselMockStateRegistry';

export type Environment = 'production' | 'stage';

export interface MockUserIdentity {
  account_number?: string;
  org_id?: string;
  user?: {
    is_org_admin?: boolean;
    username?: string;
    email?: string;
    is_internal?: boolean;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    locale?: string;
  };
  organization?: { name?: string };
  internal?: { account_id?: string; cross_access?: boolean };
  entitlements?: Record<string, { is_entitled?: boolean; is_trial?: boolean }>;
}

export interface WorkspacePermissionsMap {
  view: string[];
  edit: string[];
  delete: string[];
  create: string[];
  move: string[];
  role_binding_view?: string[];
  role_binding_grant?: string[];
  role_binding_revoke?: string[];
}

export const EMPTY_WORKSPACE_PERMISSIONS: WorkspacePermissionsMap = {
  view: [],
  edit: [],
  delete: [],
  create: [],
  move: [],
};

export interface TenantPermissionsMap {
  rbac_roles_read: boolean;
  rbac_roles_write: boolean;
  rbac_groups_read: boolean;
  rbac_groups_write: boolean;
  rbac_principal_read: boolean;
  rbac_workspace_view: boolean;
  rbac_workspace_edit: boolean;
  rbac_workspace_create: boolean;
  rbac_workspace_delete: boolean;
  rbac_workspace_move: boolean;
}

export const EMPTY_TENANT_PERMISSIONS: TenantPermissionsMap = {
  rbac_roles_read: false,
  rbac_roles_write: false,
  rbac_groups_read: false,
  rbac_groups_write: false,
  rbac_principal_read: false,
  rbac_workspace_view: false,
  rbac_workspace_edit: false,
  rbac_workspace_create: false,
  rbac_workspace_delete: false,
  rbac_workspace_move: false,
};

export interface MockWorkspace {
  id: string;
  name: string;
  description?: string | null;
  type: 'default' | 'root' | 'custom';
  parent_id?: string | null;
  created?: string;
  modified?: string;
}

export const DEFAULT_MOCK_WORKSPACE: MockWorkspace = {
  id: 'default-workspace-123',
  name: 'Default Workspace',
  description: 'Organization default workspace',
  type: 'default',
  parent_id: 'root-workspace-123',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

export interface MockState {
  bundle: string;
  app: string;
  environment: Environment;
  isOrgAdmin: boolean;
  permissions: string[];
  workspacePermissions: WorkspacePermissionsMap;
  tenantPermissions: TenantPermissionsMap;
  /**
   * Whether the org is opted into RBAC v2 — the signal behind Chrome's
   * `isKesselOrgOnboarded` visibility function. Defaults to `false` (v1 org),
   * matching the pre-v2 state so stories that don't care stay unchanged.
   */
  orgOptedIn: boolean;
  /**
   * The workspace served by the mocked `fetchDefaultWorkspace` /
   * `fetchRootWorkspace`. `undefined` serves a sensible default workspace;
   * `null` makes the fetch reject with a 404-style error, simulating an org
   * without workspaces.
   */
  defaultWorkspace: MockWorkspace | null;
  /**
   * Per-resource write permission allowlist for roles.
   *
   * When set, `useSelfAccessCheck` checks if a specific role ID is in this
   * list instead of using the blanket `rbac_roles_write` tenant permission.
   * This allows stories to test fine-grained edit/delete permissions where
   * some roles are writable and others are system-managed (read-only).
   *
   * When undefined, the standard `tenantPermissions.rbac_roles_write` boolean
   * controls write access for all roles.
   *
   * @example
   * // Only 'role-custom-1' and 'role-custom-2' are editable/deletable;
   * // system roles like 'role-default-admin' will be read-only.
   * <HccStorybookProvider
   *   writableRoleIds={['role-custom-1', 'role-custom-2']}
   *   tenantPermissions={{ rbac_roles_read: true, rbac_roles_write: true }}
   * >
   */
  writableRoleIds?: string[];
  userIdentity?: MockUserIdentity;
}

export interface StoryParameters {
  noWrapping?: boolean;
  permissions?: readonly string[];
  orgAdmin?: boolean;
  environment?: 'stage' | 'production';
  workspacePermissions?: Partial<WorkspacePermissionsMap>;
  tenantPermissions?: Partial<TenantPermissionsMap>;
  writableRoleIds?: string[];
  userIdentity?: MockUserIdentity;
  /** Whether the org is opted into RBAC v2 (drives `isKesselOrgOnboarded`). */
  orgOptedIn?: boolean;
  /** Workspace served by the mocked workspace fetchers; `null` = fetch fails. */
  defaultWorkspace?: MockWorkspace | null;
  featureFlags?: Record<string, boolean>;
  msw?: { handlers: unknown[] };
}

const defaultState: MockState = {
  bundle: 'insights',
  app: 'unknown',
  environment: 'stage',
  isOrgAdmin: false,
  permissions: [],
  workspacePermissions: EMPTY_WORKSPACE_PERMISSIONS,
  tenantPermissions: EMPTY_TENANT_PERMISSIONS,
  orgOptedIn: false,
  defaultWorkspace: DEFAULT_MOCK_WORKSPACE,
};

export const StorybookMockContext = createContext<MockState>(defaultState);

interface ProviderProps {
  children: ReactNode;
  bundle?: string;
  app?: string;
  environment?: Environment;
  isOrgAdmin?: boolean;
  permissions?: string[];
  workspacePermissions?: Partial<WorkspacePermissionsMap>;
  tenantPermissions?: Partial<TenantPermissionsMap>;
  /** Per-role write allowlist. See MockState.writableRoleIds for details. */
  writableRoleIds?: string[];
  userIdentity?: MockUserIdentity;
  /** Whether the org is opted into RBAC v2 (drives `isKesselOrgOnboarded`). */
  orgOptedIn?: boolean;
  /** Workspace served by the mocked workspace fetchers; `null` = fetch fails. */
  defaultWorkspace?: MockWorkspace | null;
}

export const StorybookMockProvider: React.FC<ProviderProps> = ({
  children,
  bundle = 'insights',
  app = 'unknown',
  environment = 'stage',
  isOrgAdmin = false,
  permissions = [],
  workspacePermissions = EMPTY_WORKSPACE_PERMISSIONS,
  tenantPermissions = EMPTY_TENANT_PERMISSIONS,
  writableRoleIds,
  userIdentity,
  orgOptedIn = false,
  defaultWorkspace,
}) => {
  const value = useMemo<MockState>(
    () => ({
      bundle,
      app,
      environment,
      isOrgAdmin,
      permissions,
      workspacePermissions: { ...EMPTY_WORKSPACE_PERMISSIONS, ...workspacePermissions },
      tenantPermissions: { ...EMPTY_TENANT_PERMISSIONS, ...tenantPermissions },
      writableRoleIds,
      userIdentity,
      orgOptedIn,
      defaultWorkspace: defaultWorkspace === undefined ? DEFAULT_MOCK_WORKSPACE : defaultWorkspace,
    }),
    [bundle, app, environment, isOrgAdmin, permissions, workspacePermissions, tenantPermissions, writableRoleIds, userIdentity, orgOptedIn, defaultWorkspace],
  );

  // Keep module-level Kessel mock functions (fetchDefaultWorkspace & co.) in
  // sync with the current mock state.
  syncKesselMockState(value);

  return <StorybookMockContext.Provider value={value}>{children}</StorybookMockContext.Provider>;
};

export const useMockState = () => useContext(StorybookMockContext);
