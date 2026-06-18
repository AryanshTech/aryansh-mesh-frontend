import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/use-auth';

export function useTenantScope() {
  const { session } = useAuth();
  const { tenantId: routeTenantId } = useParams();
  const location = useLocation();

  const workspaceMatch = location.pathname.match(
    /^\/business\/admin\/tenants\/([^/]+)\/workspace(?:\/|$)/,
  );
  const workspaceTenantId = workspaceMatch?.[1] ?? routeTenantId;
  const isWorkspace = Boolean(workspaceMatch);

  const tenantId = isWorkspace
    ? workspaceTenantId ?? ''
    : session?.tenantId ?? '';

  const basePath = isWorkspace && workspaceTenantId
    ? `/business/admin/tenants/${workspaceTenantId}/workspace`
    : '/business';

  function path(suffix: string) {
    return `${basePath}${suffix}`;
  }

  return {
    tenantId,
    isWorkspace,
    basePath,
    path,
  };
}
