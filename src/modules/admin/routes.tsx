import { Outlet, Route } from 'react-router-dom';
import { AdminRoute } from '@/core/auth/guards';
import TenantListPage from '@/modules/admin/pages/TenantListPage';
import TenantDetailPage from '@/modules/admin/pages/TenantDetailPage';
import TenantCreatePage from '@/modules/admin/pages/TenantCreatePage';

function AdminLayout() {
  return (
    <AdminRoute>
      <Outlet />
    </AdminRoute>
  );
}

export const adminRoutes = (
  <Route path="admin" element={<AdminLayout />}>
    <Route path="tenants" element={<TenantListPage />} />
    <Route path="tenants/new" element={<TenantCreatePage />} />
    <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
  </Route>
);
