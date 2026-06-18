import { Outlet } from 'react-router-dom';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { TenantWorkspaceBanner } from '@/modules/business/features/admin/TenantWorkspaceBanner';

export function TenantWorkspaceLayout() {
  return (
    <CrmPageShell>
      <TenantWorkspaceBanner />
      <Outlet />
    </CrmPageShell>
  );
}
