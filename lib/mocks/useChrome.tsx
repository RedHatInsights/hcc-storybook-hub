import React, { useRef } from 'react';
import { fn } from 'storybook/test';
import { useMockState } from '../contexts/StorybookMockContext';

export const chromeAppNavClickSpy = fn();

interface ChromeConfig {
  bundle?: string;
  app?: string;
  quickStartsCatalog?: React.FC;
}

const defaultTutorials = [
  { id: 'getting-started', title: 'Getting Started', description: 'Learn the basics.', time: '10 min', level: 'Beginner' },
  { id: 'custom-roles', title: 'Creating Custom Roles', description: 'Configure custom roles.', time: '15 min', level: 'Intermediate' },
  { id: 'user-groups', title: 'Managing User Groups', description: 'Organize users into groups.', time: '12 min', level: 'Beginner' },
  { id: 'workspaces', title: 'Workspace Administration', description: 'Master workspace management.', time: '20 min', level: 'Advanced' },
];

const DefaultCatalog: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 300 }}>Quick starts</h2>
    <p style={{ color: '#6a6e73', margin: '0 0 24px', fontSize: '14px' }}>
      Step-by-step instructions and guided tours.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {defaultTutorials.map((t) => (
        <div key={t.id} style={{ border: '1px solid #d2d2d2', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>{t.title}</h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#6a6e73' }}>{t.description}</p>
        </div>
      ))}
    </div>
  </div>
);

let _config: ChromeConfig = {};

export function configureChromeMock(config: ChromeConfig) {
  _config = config;
}

export default function useChrome() {
  const mock = useMockState();
  const mockRef = useRef(mock);
  mockRef.current = mock;

  const chromeRef = useRef<any>(null);

  if (!chromeRef.current) {
    chromeRef.current = {
      getEnvironment: () => (mockRef.current.environment === 'production' ? 'prod' : 'stage'),
      getEnvironmentDetails: () => ({
        environment: mockRef.current.environment === 'production' ? 'prod' : 'stage',
        sso: mockRef.current.environment === 'production' ? 'https://sso.redhat.com' : 'https://sso.stage.redhat.com',
        portal: 'https://console.redhat.com',
      }),
      get isProd() {
        return mockRef.current.environment === 'production';
      },
      isBeta: () => false,
      getBundle: () => _config.bundle || 'insights',
      getApp: () => _config.app || 'unknown',

      auth: {
        getToken: () => Promise.resolve('mock-token-12345'),
        getUser: () => {
          const id = mockRef.current.userIdentity;
          return Promise.resolve({
            identity: {
              account_number: id?.account_number,
              org_id: id?.org_id ?? 'mock-org-id',
              organization: id?.organization,
              internal: id?.internal,
              user: {
                is_org_admin: id?.user?.is_org_admin ?? mockRef.current.isOrgAdmin,
                username: id?.user?.username ?? 'test-user',
                email: id?.user?.email ?? 'test@redhat.com',
                is_internal: id?.user?.is_internal ?? false,
                first_name: id?.user?.first_name,
                last_name: id?.user?.last_name,
                is_active: id?.user?.is_active ?? true,
                locale: id?.user?.locale ?? 'en_US',
              },
            },
            entitlements: id?.entitlements ?? {},
          });
        },
      },

      getUserPermissions: (app: string) =>
        Promise.resolve(
          mockRef.current.permissions
            .filter((p) => p.startsWith(`${app}:`) || p.startsWith('*:'))
            .map((permission) => ({ permission, resourceDefinitions: [] }))
        ),

      appNavClick: chromeAppNavClickSpy,
      appObjectId: () => {},
      appAction: () => {},
      updateDocumentTitle: (title: string) => {
        if (typeof document !== 'undefined') {
          document.title = title;
        }
      },

      quickStarts: {
        Catalog: _config.quickStartsCatalog || DefaultCatalog,
        set: () => {},
        toggle: () => {},
      },
    };
  }

  return chromeRef.current;
}

export { useChrome };
