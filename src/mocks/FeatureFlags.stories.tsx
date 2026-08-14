import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HccStorybookProvider } from '../../lib/providers/HccStorybookProvider';
import { useFlag } from '../../lib/mocks/unleash';

const FlagDisplay: React.FC<{ flagName: string }> = ({ flagName }) => {
  const enabled = useFlag(flagName);
  return (
    <div style={{ marginBottom: 4 }}>
      <strong>{flagName}:</strong>{' '}
      <span style={{ color: enabled ? 'green' : 'red', fontWeight: 'bold' }}>
        {enabled ? 'ENABLED' : 'DISABLED'}
      </span>
    </div>
  );
};

const FlagsPanel: React.FC = () => (
  <div>
    <h3>Feature Flags</h3>
    <FlagDisplay flagName="platform.rbac.workspaces" />
    <FlagDisplay flagName="platform.rbac.itless" />
    <FlagDisplay flagName="my-app.new-dashboard" />
    <FlagDisplay flagName="unset-flag" />
  </div>
);

const meta: Meta = {
  title: 'Mocks/Feature Flags',
};
export default meta;

export const MixedFlags: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      featureFlags={{
        'platform.rbac.workspaces': true,
        'platform.rbac.itless': false,
        'my-app.new-dashboard': true,
      }}
    >
      <FlagsPanel />
    </HccStorybookProvider>
  ),
};

export const AllEnabled: StoryObj = {
  render: () => (
    <HccStorybookProvider
      bundle="iam"
      app="rbac"
      featureFlags={{
        'platform.rbac.workspaces': true,
        'platform.rbac.itless': true,
        'my-app.new-dashboard': true,
      }}
    >
      <FlagsPanel />
    </HccStorybookProvider>
  ),
};

export const AllDisabled: StoryObj = {
  render: () => (
    <HccStorybookProvider bundle="iam" app="rbac" featureFlags={{}}>
      <FlagsPanel />
    </HccStorybookProvider>
  ),
};
