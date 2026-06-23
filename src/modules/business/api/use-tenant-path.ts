import { useActiveTenant } from '@/core/tenant/ActiveTenantContext';

/** Returns the tenant scope path prefix `/tenants/{tenantId}` for the current user. */
export function useTenantPath() {
  const { activeTenantId } = useActiveTenant();
  const tenantId = activeTenantId;
  return {
    tenantId,
    path: tenantId ? `/tenants/${tenantId}` : '',
    hasTenant: Boolean(tenantId),
  };
}
