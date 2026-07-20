import type { TenantPermissionsMap } from '../contexts/StorybookMockContext';
import { EMPTY_TENANT_PERMISSIONS } from '../contexts/StorybookMockContext';

function hasPermission(permissions: string[], perm: string): boolean {
  return permissions.some((p) => {
    if (p === perm) return true;
    const [pApp, pRes, pAct] = p.split(':');
    const [rApp, rRes, rAct] = perm.split(':');
    if (pApp !== rApp) return false;
    if (pRes !== '*' && pRes !== rRes) return false;
    if (pAct !== '*' && pAct !== rAct) return false;
    return true;
  });
}

export function deriveTenantPermissions(permissions: string[]): Partial<TenantPermissionsMap> {
  const has = (perm: string) => hasPermission(permissions, perm);

  return {
    ...EMPTY_TENANT_PERMISSIONS,
    rbac_roles_read: has('rbac:role:read'),
    rbac_roles_write: has('rbac:role:write'),
    rbac_groups_read: has('rbac:group:read'),
    rbac_groups_write: has('rbac:group:write'),
    rbac_principal_read: has('rbac:principal:read'),
    rbac_workspace_view: has('inventory:groups:read'),
    rbac_workspace_edit: has('inventory:groups:write'),
    rbac_workspace_create: has('inventory:groups:write'),
    rbac_workspace_delete: has('inventory:groups:write'),
    rbac_workspace_move: has('inventory:groups:write'),
  };
}
