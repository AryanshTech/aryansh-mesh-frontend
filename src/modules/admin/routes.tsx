import { Route } from 'react-router-dom';
import TenantListPage from '@/modules/admin/pages/TenantListPage';
import TenantDetailPage from '@/modules/admin/pages/TenantDetailPage';
import TenantCreatePage from '@/modules/admin/pages/TenantCreatePage';

export const adminRoutes = (
  <Route path="admin">
    <Route path="tenants" element={<TenantListPage />} />
    <Route path="tenants/new" element={<TenantCreatePage />} />
    <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
  </Route>
);
