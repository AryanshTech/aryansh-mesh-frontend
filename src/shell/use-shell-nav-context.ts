import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/core/permissions/use-permissions';

export type ShellNavMode =
  | 'default'
  | 'admin-hub'
  | 'business-workspace'
  | 'marketing-company'
  | 'marketing-project';

export function useShellNavContext() {
  const { pathname } = useLocation();
  const { isPlatformAdmin, isSuperAdmin, canAccessMarketing } = usePermissions();
  const isPlatformOperator = isPlatformAdmin || isSuperAdmin;

  const workspaceMatch = pathname.match(
    /^\/admin\/tenants\/([^/]+)\/workspace(?:\/|$)/,
  );
  const workspaceTenantId = workspaceMatch?.[1] ?? null;

  const projectMatch = pathname.match(/^\/marketing\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1] ?? null;

  const companyMatch = pathname.match(/^\/marketing\/companies\/([^/]+)/);
  const companyId = companyMatch?.[1] ?? null;

  const workspaceBase = workspaceTenantId
    ? `/admin/tenants/${workspaceTenantId}/workspace`
    : null;

  let mode: ShellNavMode = 'default';

  if (isPlatformOperator) {
    if (workspaceTenantId) {
      mode = 'business-workspace';
    } else if (projectId && canAccessMarketing) {
      mode = 'marketing-project';
    } else if (companyId && canAccessMarketing) {
      mode = 'marketing-company';
    } else {
      mode = 'admin-hub';
    }
  } else if (canAccessMarketing && projectId) {
    mode = 'marketing-project';
  }

  return {
    mode,
    isPlatformOperator,
    workspaceTenantId,
    workspaceBase,
    projectId,
    companyId,
    pathname,
  };
}
