import React, { type ReactNode } from 'react';
import { StorybookMockProvider } from '../contexts/StorybookMockContext';
import type { Environment, MockUserIdentity, WorkspacePermissionsMap, TenantPermissionsMap } from '../contexts/StorybookMockContext';
import { FeatureFlagsProvider } from './FeatureFlagsProvider';

interface HccStorybookProviderProps {
  bundle: string;
  app: string;
  children: ReactNode;
  permissions?: string[];
  featureFlags?: Record<string, boolean>;
  environment?: Environment;
  isOrgAdmin?: boolean;
  workspacePermissions?: Partial<WorkspacePermissionsMap>;
  tenantPermissions?: Partial<TenantPermissionsMap>;
  /**
   * Per-role write permission allowlist.
   *
   * When set, `useSelfAccessCheck` for the `rbac_roles_write` relation will
   * check if the role's ID is in this list, instead of granting blanket write
   * access. Use this to test stories where only specific custom roles are
   * editable while system roles remain read-only.
   *
   * When omitted, the `tenantPermissions.rbac_roles_write` boolean applies
   * to all roles equally.
   *
   * @example
   * ```tsx
   * // User can edit 'my-custom-role' but NOT 'default-admin-access'
   * <HccStorybookProvider
   *   tenantPermissions={{ rbac_roles_read: true, rbac_roles_write: true }}
   *   writableRoleIds={['my-custom-role']}
   * >
   *   <RolesList />
   * </HccStorybookProvider>
   * ```
   */
  writableRoleIds?: string[];
  userIdentity?: MockUserIdentity;
}

export const HccStorybookProvider: React.FC<HccStorybookProviderProps> = ({
  bundle,
  app,
  children,
  permissions = [],
  featureFlags = {},
  environment = 'stage',
  isOrgAdmin = false,
  workspacePermissions,
  tenantPermissions,
  writableRoleIds,
  userIdentity,
}) => {
  return (
    <StorybookMockProvider
      bundle={bundle}
      app={app}
      environment={environment}
      isOrgAdmin={isOrgAdmin}
      permissions={permissions}
      workspacePermissions={workspacePermissions}
      tenantPermissions={tenantPermissions}
      writableRoleIds={writableRoleIds}
      userIdentity={userIdentity}
    >
      <FeatureFlagsProvider value={featureFlags}>
        {children}
      </FeatureFlagsProvider>
    </StorybookMockProvider>
  );
};
