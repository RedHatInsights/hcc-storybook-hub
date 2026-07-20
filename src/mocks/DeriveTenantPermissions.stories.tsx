import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { deriveTenantPermissions } from '../../lib/helpers/derive-tenant-permissions';

const DeriveDisplay: React.FC<{ permissions: string[] }> = ({ permissions }) => {
  const result = deriveTenantPermissions(permissions);

  return (
    <div>
      <h3>Input Permissions</h3>
      <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 3 }}>
        {JSON.stringify(permissions)}
      </code>

      <h3 style={{ marginTop: 16 }}>Derived Tenant Permissions</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 4 }}>Relation</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 4 }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(result).map(([key, value]) => (
            <tr key={key}>
              <td style={{ padding: 4, borderBottom: '1px solid #eee', fontFamily: 'monospace' }}>{key}</td>
              <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>
                <span style={{ color: value ? 'green' : 'red', fontWeight: 'bold' }}>
                  {String(value)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const meta: Meta = {
  title: 'Mocks/deriveTenantPermissions',
};
export default meta;

export const OrgAdminPermissions: StoryObj = {
  render: () => <DeriveDisplay permissions={['rbac:*:*', 'inventory:groups:read', 'inventory:groups:write']} />,
};

export const ReadOnlyPermissions: StoryObj = {
  render: () => <DeriveDisplay permissions={['rbac:role:read', 'rbac:group:read', 'rbac:principal:read']} />,
};

export const RolesWriteOnly: StoryObj = {
  render: () => <DeriveDisplay permissions={['rbac:role:read', 'rbac:role:write']} />,
};

export const NoPermissions: StoryObj = {
  render: () => <DeriveDisplay permissions={[]} />,
};

export const WorkspacePermissions: StoryObj = {
  render: () => <DeriveDisplay permissions={['inventory:groups:read', 'inventory:groups:write']} />,
};
