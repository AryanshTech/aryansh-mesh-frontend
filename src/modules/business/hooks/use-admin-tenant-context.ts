import { useLocation } from 'react-router-dom';

/** Resolves tenant id from workspace or tenant detail admin routes. */
export function useAdminTenantContext() {
  const { pathname } = useLocation();

  const workspaceMatch = pathname.match(
    /^\/admin\/tenants\/([^/]+)\/workspace(?:\/|$)/,
  );
  const detailMatch = pathname.match(/^\/admin\/tenants\/([^/]+)$/);
  const rawTenantId = workspaceMatch?.[1] ?? detailMatch?.[1] ?? null;
  const tenantId = rawTenantId === 'new' ? null : rawTenantId;
  const isWorkspace = Boolean(workspaceMatch);
  const isTenantDetail = Boolean(detailMatch);
  const workspaceBase = tenantId
    ? `/admin/tenants/${tenantId}/workspace`
    : null;

  return {
    tenantId,
    isWorkspace,
    isTenantDetail,
    workspaceBase,
  };
}
