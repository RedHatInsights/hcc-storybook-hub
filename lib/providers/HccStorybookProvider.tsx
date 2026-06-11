import React, { type ReactNode } from 'react';
import { StorybookMockProvider } from '../contexts/StorybookMockContext';
import type { Environment, MockUserIdentity, WorkspacePermissionsMap, TenantPermissionsMap } from '../contexts/StorybookMockContext';
import { FeatureFlagsProvider } from './FeatureFlagsProvider';
import { configureChromeMock } from '../mocks/useChrome';

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

if (typeof document !== 'undefined' && !document.getElementById('chrome-app-render-root')) {
  const portalRoot = document.createElement('div');
  portalRoot.id = 'chrome-app-render-root';
  document.body.appendChild(portalRoot);
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
  configureChromeMock({ bundle, app });

  return (
    <StorybookMockProvider
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
