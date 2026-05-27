import React, { createContext, ReactNode } from 'react';

export interface FeatureFlagsConfig {
  [flagName: string]: boolean;
}

export const FeatureFlagsContext = createContext<FeatureFlagsConfig>({});

export const FeatureFlagsProvider: React.FC<{ value: FeatureFlagsConfig; children: ReactNode }> = ({
  value,
  children,
}) => <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
