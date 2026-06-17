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
      userIdentity={userIdentity}
    >
      <FeatureFlagsProvider value={featureFlags}>
        {children}
      </FeatureFlagsProvider>
    </StorybookMockProvider>
  );
};
