import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { DashboardStats } from '@/modules/business/types/tenant-api';

export function useDashboard() {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.dashboard(tenantId),
    queryFn: () => api.get<DashboardStats>(`/tenants/${tenantId}/dashboard`),
    enabled: Boolean(tenantId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
