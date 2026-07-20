import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HccStorybookProvider } from '../../lib/providers/HccStorybookProvider';
import usePermissions from '../../lib/mocks/RBACHook';

const PermCheck: React.FC<{ app: string; required: string[]; checkAll?: boolean }> = ({ app, required, checkAll }) => {
  const { hasAccess, isLoading } = usePermissions(app, required, false, checkAll);
  return (
    <div style={{ marginBottom: 8 }}>
      <strong>
        usePermissions("{app}", {JSON.stringify(required)}
        {checkAll ? ', checkAll' : ''})
      </strong>
      <br />
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <span style={{ color: hasAccess ? 'green' : 'red', fontWeight: 'bold' }}>
          {hasAccess ? 'HAS ACCESS' : 'NO ACCESS'}
        </span>
      )}
    </div>
  );
};

const meta: Meta = {
  title: 'Mocks/RBAC Hook',
};
export default meta;

export const ExactMatch: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      permissions={['rbac:role:read', 'rbac:group:write']}
    >
      <h3>Exact Permission Matching</h3>
      <PermCheck app="rbac" required={['rbac:role:read']} />
      <PermCheck app="rbac" required={['rbac:role:write']} />
      <PermCheck app="rbac" required={['rbac:group:write']} />
    </HccStorybookProvider>
  ),
};

export const WildcardMatch: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      permissions={['rbac:*:*']}
    >
      <h3>Wildcard Permission (rbac:*:*)</h3>
      <PermCheck app="rbac" required={['rbac:role:read']} />
      <PermCheck app="rbac" required={['rbac:group:write']} />
      <PermCheck app="rbac" required={['inventory:hosts:read']} />
    </HccStorybookProvider>
  ),
};

export const CheckAllMode: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      permissions={['rbac:role:read', 'rbac:group:read']}
    >
      <h3>checkAll Mode (all required permissions must match)</h3>
      <PermCheck app="rbac" required={['rbac:role:read', 'rbac:group:read']} checkAll />
      <PermCheck app="rbac" required={['rbac:role:read', 'rbac:role:write']} checkAll />
    </HccStorybookProvider>
  ),
};

export const NoPermissions: StoryObj = {
  render: () => (
    <HccStorybookProvider bundle="iam" app="rbac" permissions={[]}>
      <h3>No Permissions Granted</h3>
      <PermCheck app="rbac" required={['rbac:role:read']} />
    </HccStorybookProvider>
  ),
};
