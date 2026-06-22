import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import { recordRecentTenant } from '@/shell/recent-workspaces';

export function TenantWorkspaceLayout() {
  const { tenantId = '' } = useParams();
  const { pathname } = useLocation();
  const { data: tenant } = useTenant(tenantId);

  useEffect(() => {
    if (!tenantId) return;
    recordRecentTenant({
      id: tenantId,
      name: tenant?.name ?? tenantId,
      lastPath: pathname,
    });
  }, [tenantId, tenant?.name, pathname]);

  return <Outlet />;
}
