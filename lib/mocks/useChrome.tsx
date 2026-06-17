import { useRef } from 'react';
import { fn } from 'storybook/test';
import { useMockState } from '../contexts/StorybookMockContext';
import { DefaultCatalog } from './DefaultCatalog';

export const chromeSpies = new Map<string, ReturnType<typeof fn>>();

function getSpy(path: string): ReturnType<typeof fn> {
  if (!chromeSpies.has(path)) {
    chromeSpies.set(path, fn().mockName(path));
  }
  return chromeSpies.get(path)!;
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
      getBundle: () => mockRef.current.bundle,
      getApp: () => mockRef.current.app,

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
        getOfflineToken: () => Promise.resolve('mock-offline-token'),
        getRefreshToken: () => Promise.resolve('mock-refresh-token'),
        login: () => Promise.resolve(),
        logout: getSpy('auth.logout'),
        reAuthWithScopes: () => Promise.resolve(),
      },

      getUserPermissions: (app: string) =>
        Promise.resolve(
          mockRef.current.permissions
            .filter((p: string) => p.startsWith(`${app}:`))
            .map((permission: string) => ({ permission, resourceDefinitions: [] }))
        ),

      appNavClick: getSpy('appNavClick'),
      appObjectId: getSpy('appObjectId'),
      appAction: getSpy('appAction'),
      addWsEventListener: (_eventType: string, _callback: Function) => {
        return () => {};
      },
      drawerActions: {
        toggleDrawerContent: getSpy('drawerActions.toggleDrawerContent'),
        setDrawerPanelContent: getSpy('drawerActions.setDrawerPanelContent'),
        toggleDrawerPanel: getSpy('drawerActions.toggleDrawerPanel'),
      },
      updateDocumentTitle: (title: string) => {
        if (typeof document !== 'undefined') {
          document.title = title;
        }
      },

      get quickStarts() {
        return {
          Catalog: DefaultCatalog,
          set: getSpy('quickStarts.set'),
          toggle: getSpy('quickStarts.toggle'),
          version: 1,
          activateQuickstart: () => Promise.resolve(),
        };
      },

      // Commonly accessed properties that should return safe defaults
      initialized: true,
      isChrome2: true,
      experimentalApi: false,
      isFedramp: false,
      chromeHistory: { push: getSpy('chromeHistory.push'), replace: getSpy('chromeHistory.replace'), listen: () => () => {} },
      identifyApp: getSpy('identifyApp'),
      on: (_event: string, _callback: Function) => () => {},
      init: getSpy('init'),
      isPenTest: () => false,
      isDemo: () => false,
      forceDemo: getSpy('forceDemo'),
      getAvailableBundles: () => [],
      getBundleData: () => ({ bundleId: mockRef.current.bundle, bundleTitle: 'Insights' }),
      globalFilterScope: getSpy('globalFilterScope'),
      hideGlobalFilter: getSpy('hideGlobalFilter'),
      removeGlobalFilter: getSpy('removeGlobalFilter'),
      mapGlobalFilter: getSpy('mapGlobalFilter'),
      navigation: getSpy('navigation'),
      registerModule: getSpy('registerModule'),
      createCase: getSpy('createCase'),
      toggleFeedbackModal: getSpy('toggleFeedbackModal'),
      toggleDebuggerModal: getSpy('toggleDebuggerModal'),
      enableDebugging: getSpy('enableDebugging'),
      usePendoFeedback: getSpy('usePendoFeedback'),
      enablePackagesDebug: getSpy('enablePackagesDebug'),
      requestPdf: () => Promise.resolve(),
      isAnsibleTrialFlagActive: () => false,
      setAnsibleTrialFlag: getSpy('setAnsibleTrialFlag'),
      clearAnsibleTrialFlag: getSpy('clearAnsibleTrialFlag'),
      segment: { setPageMetadata: getSpy('segment.setPageMetadata') },
      useGlobalFilter: () => undefined,
      visibilityFunctions: {
        isOrgAdmin: () => Promise.resolve(mockRef.current.isOrgAdmin),
        isActive: () => Promise.resolve(true),
        isInternal: () => Promise.resolve(false),
        isEntitled: () => Promise.resolve({}),
        isProd: () => mockRef.current.environment === 'production',
        isBeta: () => false,
        isHidden: () => true as const,
        withEmail: () => Promise.resolve(true),
        loosePermissions: () => Promise.resolve(true),
        loosePermissionsKessel: () => Promise.resolve(true),
        hasPermissions: () => Promise.resolve(true),
        hasLocalStorage: () => false,
        hasCookie: () => false,
        apiRequest: () => Promise.resolve(true),
        featureFlag: () => false,
      },
      helpTopics: {
        addHelpTopics: getSpy('helpTopics.addHelpTopics'),
        enableTopics: () => Promise.resolve([]),
        disableTopics: getSpy('helpTopics.disableTopics'),
        setActiveTopic: () => Promise.resolve(),
        closeHelpTopic: getSpy('helpTopics.closeHelpTopic'),
      },
      enable: {
        iqe: getSpy('enable.iqe'),
        remediationsDebug: getSpy('enable.remediationsDebug'),
        invTags: getSpy('enable.invTags'),
        shortSession: getSpy('enable.shortSession'),
        jwtDebug: getSpy('enable.jwtDebug'),
        reduxDebug: getSpy('enable.reduxDebug'),
        forcePendo: getSpy('enable.forcePendo'),
        allDetails: getSpy('enable.allDetails'),
        inventoryDrawer: getSpy('enable.inventoryDrawer'),
        globalFilter: getSpy('enable.globalFilter'),
        appFilter: getSpy('enable.appFilter'),
        contextSwitcher: getSpy('enable.contextSwitcher'),
        quickstartsDebug: getSpy('enable.quickstartsDebug'),
      },
    };
  }

  return chromeRef.current;
}

export { useChrome };
