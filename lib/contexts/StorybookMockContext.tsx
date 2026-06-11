import React, { type ReactNode, createContext, useContext, useMemo } from 'react';

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

export interface MockState {
  environment: Environment;
  isOrgAdmin: boolean;
  permissions: string[];
  workspacePermissions: WorkspacePermissionsMap;
  tenantPermissions: TenantPermissionsMap;
  userIdentity?: MockUserIdentity;
}

export interface StoryParameters {
  noWrapping?: boolean;
  permissions?: readonly string[];
  orgAdmin?: boolean;
  environment?: 'stage' | 'production';
  workspacePermissions?: Partial<WorkspacePermissionsMap>;
  tenantPermissions?: Partial<TenantPermissionsMap>;
  userIdentity?: MockUserIdentity;
  featureFlags?: Record<string, boolean>;
  msw?: { handlers: unknown[] };
}

const defaultState: MockState = {
  environment: 'stage',
  isOrgAdmin: false,
  permissions: [],
  workspacePermissions: EMPTY_WORKSPACE_PERMISSIONS,
  tenantPermissions: EMPTY_TENANT_PERMISSIONS,
};

export const StorybookMockContext = createContext<MockState>(defaultState);

interface ProviderProps {
  children: ReactNode;
  environment?: Environment;
  isOrgAdmin?: boolean;
  permissions?: string[];
  workspacePermissions?: Partial<WorkspacePermissionsMap>;
  tenantPermissions?: Partial<TenantPermissionsMap>;
  userIdentity?: MockUserIdentity;
}

export const StorybookMockProvider: React.FC<ProviderProps> = ({
  children,
  environment = 'stage',
  isOrgAdmin = false,
  permissions = [],
  workspacePermissions = EMPTY_WORKSPACE_PERMISSIONS,
  tenantPermissions = EMPTY_TENANT_PERMISSIONS,
  userIdentity,
}) => {
  const value = useMemo<MockState>(
    () => ({
      environment,
      isOrgAdmin,
      permissions,
      workspacePermissions: { ...EMPTY_WORKSPACE_PERMISSIONS, ...workspacePermissions },
      tenantPermissions: { ...EMPTY_TENANT_PERMISSIONS, ...tenantPermissions },
      userIdentity,
    }),
    [environment, isOrgAdmin, permissions, workspacePermissions, tenantPermissions, userIdentity],
  );
  return <StorybookMockContext.Provider value={value}>{children}</StorybookMockContext.Provider>;
};

export const useMockState = () => useContext(StorybookMockContext);
