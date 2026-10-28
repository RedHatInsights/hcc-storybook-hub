import React, { type ReactNode } from 'react';
import { StorybookMockProvider } from '../contexts/StorybookMockContext';
import type { Environment, MockUserIdentity, MockWorkspace, WorkspacePermissionsMap, TenantPermissionsMap } from '../contexts/StorybookMockContext';
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
  /**
   * Whether the org is opted into RBAC v2 — drives Chrome's mocked
   * `isKesselOrgOnboarded` visibility function. Defaults to `false` (v1 org).
   */
  orgOptedIn?: boolean;
  /**
   * Workspace served by the mocked `fetchDefaultWorkspace` / `fetchRootWorkspace`.
   * `undefined` (default) serves a sensible default workspace; `null` makes the
   * fetch reject, simulating an org without workspaces.
   */
  defaultWorkspace?: MockWorkspace | null;
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
  orgOptedIn,
  defaultWorkspace,
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
      orgOptedIn={orgOptedIn}
      defaultWorkspace={defaultWorkspace}
    >
      <FeatureFlagsProvider value={featureFlags}>
        {children}
      </FeatureFlagsProvider>
    </StorybookMockProvider>
  );
};
