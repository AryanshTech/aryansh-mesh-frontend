import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/use-auth';

export function useTenantScope() {
  const { session } = useAuth();
  const { tenantId: routeTenantId } = useParams();
  const location = useLocation();

  const workspaceMatch = location.pathname.match(
    /^\/admin\/tenants\/([^/]+)\/workspace(?:\/|$)/,
  );
  const workspaceTenantId = workspaceMatch?.[1] ?? routeTenantId;
  const isWorkspace = Boolean(workspaceMatch);

  const tenantId = isWorkspace
    ? workspaceTenantId ?? ''
    : session?.tenantId ?? '';

  const basePath = isWorkspace && workspaceTenantId
    ? `/admin/tenants/${workspaceTenantId}/workspace`
    : '';

  function path(suffix: string) {
    if (basePath) {
      return `${basePath}${suffix}`;
    }
    return suffix;
  }

  return {
    tenantId,
    hasTenantContext: Boolean(tenantId),
    isWorkspace,
    basePath,
    path,
  };
}
