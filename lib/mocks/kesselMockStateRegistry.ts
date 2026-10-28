import type { MockState } from '../contexts/StorybookMockContext';

/**
 * Registry holding the current MockState for module-level Kessel mock
 * functions (`fetchDefaultWorkspace` / `fetchRootWorkspace`), which cannot
 * call `useMockState` themselves. `StorybookMockProvider` pushes the current
 * state here on every render.
 */
let current: MockState | undefined;

export function syncKesselMockState(state: MockState): void {
  current = state;
}

export function getKesselMockState(): MockState {
  if (!current) {
    throw new Error(
      'hcc-storybook-hub: a Kessel mock function was called before mock state was registered. ' +
        'Render the story inside StorybookMockProvider (the hub preview does this automatically).'
    );
  }
  return current;
}
