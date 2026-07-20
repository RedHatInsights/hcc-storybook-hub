import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HccStorybookProvider } from '../../lib/providers/HccStorybookProvider';
import { useSelfAccessCheck } from '../../lib/mocks/kesselAccessCheck';

const ResultDisplay: React.FC<{ label: string; result: ReturnType<typeof useSelfAccessCheck> }> = ({ label, result }) => {
  const { data, loading } = result;
  if (loading) return <div>{label}: loading...</div>;
  if (Array.isArray(data)) {
    return (
      <div style={{ marginBottom: 8 }}>
        <strong>{label}:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
          {data.map((d, i) => (
            <li key={i}>
              {d.relation} on {d.resource.type}:{d.resource.id} ={' '}
              <span style={{ color: d.allowed ? 'green' : 'red', fontWeight: 'bold' }}>
                {d.allowed ? 'ALLOWED' : 'DENIED'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 8 }}>
      <strong>{label}:</strong>{' '}
      <span style={{ color: data.allowed ? 'green' : 'red', fontWeight: 'bold' }}>
        {data.allowed ? 'ALLOWED' : 'DENIED'}
      </span>{' '}
      <span style={{ color: '#666' }}>
        ({data.resource.type}:{data.resource.id})
      </span>
    </div>
  );
};

const TenantCheck: React.FC = () => {
  const rolesRead = useSelfAccessCheck({
    relation: 'rbac_roles_read',
    resource: { id: 'tenant', type: 'tenant' },
  });
  const rolesWrite = useSelfAccessCheck({
    relation: 'rbac_roles_write',
    resource: { id: 'tenant', type: 'tenant' },
  });
  const groupsRead = useSelfAccessCheck({
    relation: 'rbac_groups_read',
    resource: { id: 'tenant', type: 'tenant' },
  });

  return (
    <div>
      <h3>Tenant Permission Checks</h3>
      <ResultDisplay label="rbac_roles_read" result={rolesRead} />
      <ResultDisplay label="rbac_roles_write" result={rolesWrite} />
      <ResultDisplay label="rbac_groups_read" result={groupsRead} />
    </div>
  );
};

const WorkspaceCheck: React.FC = () => {
  const viewWs1 = useSelfAccessCheck({
    relation: 'view',
    resource: { id: 'ws-1', type: 'workspace' },
  });
  const editWs1 = useSelfAccessCheck({
    relation: 'edit',
    resource: { id: 'ws-1', type: 'workspace' },
  });
  const viewWs2 = useSelfAccessCheck({
    relation: 'view',
    resource: { id: 'ws-2', type: 'workspace' },
  });
  const deleteWs2 = useSelfAccessCheck({
    relation: 'delete',
    resource: { id: 'ws-2', type: 'workspace' },
  });

  return (
    <div>
      <h3>Workspace Permission Checks</h3>
      <ResultDisplay label="view ws-1" result={viewWs1} />
      <ResultDisplay label="edit ws-1" result={editWs1} />
      <ResultDisplay label="view ws-2" result={viewWs2} />
      <ResultDisplay label="delete ws-2" result={deleteWs2} />
    </div>
  );
};

const RoleCheck: React.FC = () => {
  const writeCustom = useSelfAccessCheck({
    relation: 'rbac_roles_write',
    resource: { id: 'role-custom-1', type: 'role' },
  });
  const writeSystem = useSelfAccessCheck({
    relation: 'rbac_roles_write',
    resource: { id: 'role-system-admin', type: 'role' },
  });
  const readCustom = useSelfAccessCheck({
    relation: 'rbac_roles_read',
    resource: { id: 'role-custom-1', type: 'role' },
  });

  return (
    <div>
      <h3>Per-Role Permission Checks (writableRoleIds)</h3>
      <ResultDisplay label="write role-custom-1" result={writeCustom} />
      <ResultDisplay label="write role-system-admin" result={writeSystem} />
      <ResultDisplay label="read role-custom-1" result={readCustom} />
    </div>
  );
};

const BulkCheck: React.FC = () => {
  const result = useSelfAccessCheck({
    relation: 'view',
    resources: [
      { id: 'ws-1', type: 'workspace' },
      { id: 'ws-2', type: 'workspace' },
      { id: 'ws-3', type: 'workspace' },
    ],
  });

  return (
    <div>
      <h3>Bulk Workspace Check (view on ws-1, ws-2, ws-3)</h3>
      <ResultDisplay label="bulk" result={result} />
    </div>
  );
};

const RoleBindingCheck: React.FC = () => {
  const rbView = useSelfAccessCheck({
    relation: 'role_binding_view',
    resource: { id: 'ws-1', type: 'workspace' },
  });
  const rbGrant = useSelfAccessCheck({
    relation: 'role_binding_grant',
    resource: { id: 'ws-1', type: 'workspace' },
  });

  return (
    <div>
      <h3>Role Binding Checks (granular keys)</h3>
      <ResultDisplay label="role_binding_view ws-1" result={rbView} />
      <ResultDisplay label="role_binding_grant ws-1" result={rbGrant} />
    </div>
  );
};

const WildcardCheck: React.FC = () => {
  const viewWs = useSelfAccessCheck({
    relation: 'view',
    resource: { id: 'any-workspace', type: 'workspace' },
  });

  return (
    <div>
      <h3>Wildcard Workspace Check (view on any-workspace)</h3>
      <ResultDisplay label="view any-workspace" result={viewWs} />
    </div>
  );
};

const meta: Meta = {
  title: 'Mocks/Kessel AccessCheck',
};
export default meta;

export const TenantPermissions: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      tenantPermissions={{
        rbac_roles_read: true,
        rbac_roles_write: false,
        rbac_groups_read: true,
      }}
    >
      <TenantCheck />
    </HccStorybookProvider>
  ),
};

export const WorkspacePermissions: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      workspacePermissions={{
        view: ['ws-1', 'ws-2'],
        edit: ['ws-1'],
        delete: [],
        create: ['ws-1'],
        move: [],
      }}
    >
      <WorkspaceCheck />
    </HccStorybookProvider>
  ),
};

export const WritableRoleIds: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      tenantPermissions={{
        rbac_roles_read: true,
        rbac_roles_write: true,
      }}
      writableRoleIds={['role-custom-1', 'role-custom-2']}
    >
      <RoleCheck />
    </HccStorybookProvider>
  ),
};

export const BulkAccessCheck: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      workspacePermissions={{
        view: ['ws-1', 'ws-3'],
        edit: [],
        delete: [],
        create: [],
        move: [],
      }}
    >
      <BulkCheck />
    </HccStorybookProvider>
  ),
};

export const RoleBindingGranular: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      workspacePermissions={{
        view: ['ws-1'],
        edit: ['ws-1'],
        delete: [],
        create: [],
        move: [],
        role_binding_view: ['ws-1'],
        role_binding_grant: [],
      }}
    >
      <RoleBindingCheck />
    </HccStorybookProvider>
  ),
};

export const WildcardPermissions: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      workspacePermissions={{
        view: ['*'],
        edit: [],
        delete: [],
        create: [],
        move: [],
      }}
    >
      <WildcardCheck />
    </HccStorybookProvider>
  ),
};
