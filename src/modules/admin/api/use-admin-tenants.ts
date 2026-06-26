import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { Page } from '@/core/api/types';
import { useAuth } from '@/core/auth/use-auth';

interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 100;

export function useAdminTenants(page = DEFAULT_PAGE, size = DEFAULT_SIZE) {
  const { user, status } = useAuth();
  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  return useQuery({
    queryKey: ['admin', 'tenants', page, size],
    queryFn: () =>
      api.get<Page<TenantSummary>>('/admin/tenants', { query: { page, size } }),
    select: (data) => data.items ?? [],
    enabled: status === 'authenticated' && isAdmin,
  });
}
