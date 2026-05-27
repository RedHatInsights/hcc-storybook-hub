import { useContext } from 'react';
import { FeatureFlagsContext } from '../providers/FeatureFlagsProvider';

export { FeatureFlagsProvider as FlagProvider } from '../providers/FeatureFlagsProvider';
export { FeatureFlagsProvider as IFlagProvider } from '../providers/FeatureFlagsProvider';

export const useFlag = (flagName: string): boolean => {
  const flags = useContext(FeatureFlagsContext);
  return flags[flagName] || false;
};

export const UnleashClient = class {};
export const useUnleashContext = () => ({});
export const useVariant = () => ({ name: 'disabled', enabled: false });
export const useFlagsStatus = () => ({ flagsReady: true, flagsError: false });
