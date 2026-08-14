import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HccStorybookProvider } from '../../lib/providers/HccStorybookProvider';
import useChrome from '../../lib/mocks/useChrome';

const Field: React.FC<{ label: string; value: unknown }> = ({ label, value }) => (
  <div style={{ marginBottom: 4 }}>
    <strong>{label}:</strong>{' '}
    <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 3 }}>
      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
    </code>
  </div>
);

const EnvironmentDisplay: React.FC = () => {
  const chrome = useChrome();
  return (
    <div>
      <h3>Environment</h3>
      <Field label="getEnvironment()" value={chrome.getEnvironment()} />
      <Field label="isProd" value={chrome.isProd} />
      <Field label="isBeta()" value={chrome.isBeta()} />
      <Field label="getBundle()" value={chrome.getBundle()} />
      <Field label="getApp()" value={chrome.getApp()} />
      <Field label="getEnvironmentDetails()" value={chrome.getEnvironmentDetails()} />
    </div>
  );
};

const AuthDisplay: React.FC = () => {
  const chrome = useChrome();
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    chrome.auth.getToken().then(setToken);
    chrome.auth.getUser().then(setUser);
  }, []);

  return (
    <div>
      <h3>Auth</h3>
      <Field label="getToken()" value={token} />
      <Field label="getUser()" value={user} />
    </div>
  );
};

const PermissionsDisplay: React.FC = () => {
  const chrome = useChrome();
  const [perms, setPerms] = useState<unknown[]>([]);

  useEffect(() => {
    chrome.getUserPermissions('rbac').then(setPerms);
  }, []);

  return (
    <div>
      <h3>Permissions (getUserPermissions)</h3>
      {perms.length === 0 ? (
        <div style={{ color: '#666' }}>No rbac permissions configured</div>
      ) : (
        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
          {perms.map((p: any, i) => (
            <li key={i}>{p.permission}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const VisibilityDisplay: React.FC = () => {
  const chrome = useChrome();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    chrome.visibilityFunctions.isOrgAdmin().then(setIsAdmin);
  }, []);

  return (
    <div>
      <h3>Visibility Functions</h3>
      <Field label="isOrgAdmin()" value={isAdmin} />
      <Field label="isProd()" value={chrome.visibilityFunctions.isProd()} />
      <Field label="isBeta()" value={chrome.visibilityFunctions.isBeta()} />
    </div>
  );
};

const meta: Meta = {
  title: 'Mocks/Chrome',
};
export default meta;

export const StageEnvironment: StoryObj = {
  render: () => (
    <HccStorybookProvider bundle="insights" app="advisor" environment="stage">
      <EnvironmentDisplay />
      <hr />
      <AuthDisplay />
    </HccStorybookProvider>
  ),
};

export const ProductionEnvironment: StoryObj = {
  render: () => (
    <HccStorybookProvider bundle="openshift" app="clusters" environment="production">
      <EnvironmentDisplay />
      <hr />
      <AuthDisplay />
    </HccStorybookProvider>
  ),
};

export const WithPermissions: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      permissions={['rbac:role:read', 'rbac:role:write', 'rbac:group:read']}
    >
      <PermissionsDisplay />
    </HccStorybookProvider>
  ),
};

export const OrgAdmin: StoryObj = {
  render: () => (
    <HccStorybookProvider bundle="iam" app="rbac" isOrgAdmin>
      <VisibilityDisplay />
      <hr />
      <AuthDisplay />
    </HccStorybookProvider>
  ),
};

export const CustomUserIdentity: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      userIdentity={{
        account_number: '123456',
        org_id: 'org-789',
        user: {
          is_org_admin: false,
          username: 'janedoe',
          email: 'jane.doe@example.com',
          is_internal: true,
          first_name: 'Jane',
          last_name: 'Doe',
        },
        organization: { name: 'Acme Corp' },
        entitlements: {
          insights: { is_entitled: true, is_trial: false },
          openshift: { is_entitled: false, is_trial: true },
        },
      }}
    >
      <AuthDisplay />
    </HccStorybookProvider>
  ),
};
