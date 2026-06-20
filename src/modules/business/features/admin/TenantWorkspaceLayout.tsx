import { Outlet } from 'react-router-dom';
import { TenantWorkspaceBanner } from '@/modules/business/features/admin/TenantWorkspaceBanner';

export function TenantWorkspaceLayout() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <TenantWorkspaceBanner />
      <Outlet />
    </div>
  );
}
