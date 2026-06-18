import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { BookingListResponse } from '@/modules/business/types/tenant-api';

export function useBookings(page = 0, size = 20) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.bookings.list(tenantId, page, size),
    queryFn: () =>
      api.get<BookingListResponse>(
        `/tenants/${tenantId}/bookings?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}
