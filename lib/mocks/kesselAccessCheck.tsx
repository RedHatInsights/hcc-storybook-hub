import React, { useRef } from 'react';
import { useMockState } from '../contexts/StorybookMockContext';
import type { MockWorkspace, TenantPermissionsMap, WorkspacePermissionsMap } from '../contexts/StorybookMockContext';
import { getKesselMockState } from './kesselMockStateRegistry';

/**
 * Canonical relation scopes, mirroring the real Kessel model (see
 * insights-rbac-ui's useRbacAccess: rbac-domain relations are granted at
 * TENANT scope; role bindings are granted per WORKSPACE). When a known
 * relation is checked against the wrong resource scope, the mock resolves
 * it to `false` instead of falling through to permission state — the same
 * way the real backend would not grant a mis-scoped check. This makes
 * scope mistakes in consumer apps fail in journeys instead of shipping.
 *
 * Relations not listed here (app-specific relations such as the
 * notifications/integrations ones) keep the pass-through behavior and are
 * resolved by resource type as before.
 */
const TENANT_SCOPED_RELATIONS = new Set<string>([
  'rbac_roles_read',
  'rbac_roles_write',
  'rbac_groups_read',
  'rbac_groups_write',
  'rbac_principal_read',
  'rbac_workspace_view',
  'rbac_workspace_edit',
  'rbac_workspace_create',
  'rbac_workspace_delete',
  'rbac_workspace_move',
]);
const WORKSPACE_SCOPED_RELATIONS = new Set(['role_binding_view', 'role_binding_grant', 'role_binding_revoke']);

function isScopeMismatch(relation: string, resourceType: string): boolean {
  if (TENANT_SCOPED_RELATIONS.has(relation)) {
    return resourceType !== 'tenant' && resourceType !== 'role';
  }
  if (WORKSPACE_SCOPED_RELATIONS.has(relation)) {
    return resourceType !== 'workspace';
  }
  return false;
}

interface Resource {
  id: string;
  type: string;
  reporter?: { type: string };
  relation?: string;
}

interface AccessCheckResult {
  resource: Resource;
  allowed: boolean;
  relation: string;
}

type SingleParams = { relation: string; resource: Resource };
type BulkWithTopRelation = { relation: string; resources: Resource[] };
type BulkWithPerResourceRelation = { resources: (Resource & { relation: string })[] };
type UseSelfAccessCheckOptions = SingleParams | BulkWithTopRelation | BulkWithPerResourceRelation;

function checkTenantPermission(relation: string, tenantPerms: TenantPermissionsMap): boolean {
  return tenantPerms[relation as keyof TenantPermissionsMap] ?? false;
}

/**
 * Role binding relations that have optional granular keys in WorkspacePermissionsMap.
 * When the granular key is set, it takes priority; otherwise we fall back to the
 * coarse workspace relation via `wsFallbackMap`.
 */
const rbGranularKey: Record<string, keyof WorkspacePermissionsMap> = {
  role_binding_view: 'role_binding_view',
  role_binding_grant: 'role_binding_grant',
  role_binding_revoke: 'role_binding_revoke',
};

const wsFallbackMap: Record<string, keyof WorkspacePermissionsMap> = {
  rbac_workspace_view: 'view',
  rbac_workspace_edit: 'edit',
  rbac_workspace_create: 'create',
  rbac_workspace_delete: 'delete',
  rbac_workspace_move: 'move',
  role_binding_view: 'view',
  role_binding_grant: 'create',
  role_binding_revoke: 'delete',
  view: 'view',
  edit: 'edit',
  create: 'create',
  delete: 'delete',
  move: 'move',
};

function checkWorkspacePermission(relation: string, resourceId: string, wsPerms: WorkspacePermissionsMap): boolean {
  const granular = rbGranularKey[relation];
  if (granular) {
    const granularIds = wsPerms[granular];
    if (granularIds !== undefined) {
      return granularIds.includes('*') || granularIds.includes(resourceId);
    }
  }

  const fallback = wsFallbackMap[relation];
  if (!fallback) return false;
  const ids = wsPerms[fallback] ?? [];
  return ids.includes('*') || ids.includes(resourceId);
}

export const useSelfAccessCheck = (params: UseSelfAccessCheckOptions) => {
  const mock = useMockState();
  const mockRef = useRef(mock);
  mockRef.current = mock;

  const resolvePermission = (relation: string, resource: Resource): boolean => {
    if (isScopeMismatch(relation, resource.type)) return false;
    if (resource.type === 'tenant') return checkTenantPermission(relation, mockRef.current.tenantPermissions);
    if (resource.type === 'role') {
      const { writableRoleIds } = mockRef.current;
      if (writableRoleIds !== undefined) {
        return relation === 'rbac_roles_write' && writableRoleIds.includes(resource.id);
      }
      return checkTenantPermission(relation, mockRef.current.tenantPermissions);
    }
    return checkWorkspacePermission(relation, resource.id, mockRef.current.workspacePermissions);
  };

  // Single resource check (Overload 1)
  if ('resource' in params && !('resources' in params)) {
    const { relation, resource } = params as SingleParams;
    const allowed = resolvePermission(relation, resource);

    return { data: { resource, allowed }, loading: false };
  }

  // Bulk check — determine relation per resource
  const rawResources = (params as BulkWithTopRelation | BulkWithPerResourceRelation).resources;
  const topRelation = 'relation' in params ? (params as BulkWithTopRelation).relation : undefined;

  const data: AccessCheckResult[] = rawResources.map((resource) => {
    const relation = resource.relation ?? topRelation ?? '';
    const allowed = resolvePermission(relation, resource);

    return { resource, allowed, relation };
  });

  return { data, loading: false };
};

// Mock AccessCheck context — mirrors the real SDK's context shape. The mock
// provider ignores the config (the mock never makes requests) but still
// satisfies `useAccessCheckContext`, which throws outside a provider in the
// real package.
const AccessCheckContext = React.createContext<{
  baseUrl: string;
  apiPath: string;
} | undefined>(undefined);

export function useAccessCheckContext(): { baseUrl: string; apiPath: string } {
  const context = React.useContext(AccessCheckContext);
  if (context === undefined) {
    throw new Error('useAccessCheckContext must be used within an AccessCheckProvider');
  }
  return context;
}

// Mock AccessCheck.Provider - passes children through
export const AccessCheck = {
  Provider: ({
    children,
    baseUrl = window.location?.origin ?? 'http://localhost:6006',
    apiPath = '/api/kessel/v1beta2',
  }: {
    children: React.ReactNode;
    baseUrl?: string;
    apiPath?: string;
  }) => <AccessCheckContext.Provider value={{ baseUrl, apiPath }}>{children}</AccessCheckContext.Provider>,
};

/**
 * Error shape thrown by the real SDK's workspace fetchers when the list is
 * empty (see `workspace-client.js` in @project-kessel/react-kessel-access-check).
 */
function noWorkspaceError(kind: 'default' | 'root'): object {
  return {
    code: 404,
    message: `No ${kind} workspace found in response`,
    details: [],
  };
}

/**
 * Serves the workspace from MockState (`defaultWorkspace`; `null` rejects with
 * the same error shape the real SDK throws for orgs without workspaces).
 * Mirrors `fetchDefaultWorkspace(rbacBaseEndpoint)` from the real package.
 */
export async function fetchDefaultWorkspace(_rbacBaseEndpoint?: string): Promise<MockWorkspace> {
  const workspace = getKesselMockState().defaultWorkspace;
  if (!workspace) {
    throw noWorkspaceError('default');
  }
  return { ...workspace };
}

/** Mirrors `fetchRootWorkspace(rbacBaseEndpoint)` from the real package. */
export async function fetchRootWorkspace(_rbacBaseEndpoint?: string): Promise<MockWorkspace> {
  const workspace = getKesselMockState().defaultWorkspace;
  if (!workspace) {
    throw noWorkspaceError('root');
  }
  return { ...workspace, type: 'root' };
}

