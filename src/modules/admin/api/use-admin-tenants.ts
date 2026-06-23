import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { useAuth } from '@/core/auth/use-auth';

interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export function useAdminTenants() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => api.get<{ items: TenantSummary[] }>('/admin/tenants'),
    select: (data) => data.items,
    enabled: isAdmin,
  });
}
