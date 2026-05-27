import React, { createContext, ReactNode } from 'react';

export interface ChromeConfig {
  environment: string;
  [key: string]: any;
}

export const ChromeContext = createContext<ChromeConfig>({
  environment: 'prod',
});

export const ChromeProvider: React.FC<{ value: ChromeConfig; children: ReactNode }> = ({
  value,
  children,
}) => <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
