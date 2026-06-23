import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { DashboardSnapshot } from '@/modules/business/types/entities';

// Backend `DashboardResponse` shape — see
// businessManagerBackend/.../model/dto/response/DashboardResponse.java
interface DashboardApi {
  products: number;
  clients: number;
  testimonials: number;
  costs: number;
  hasUnpublishedChanges: boolean;
  lastPublishedAt: string | null;
  bookings?: number;
}

function normalize(raw: DashboardApi | (DashboardSnapshot & Partial<DashboardApi>)): DashboardSnapshot {
  const r = raw as DashboardApi & Partial<DashboardSnapshot>;
  return {
    productCount: r.productCount ?? r.products ?? 0,
    clientCount: r.clientCount ?? r.clients ?? 0,
    testimonialCount: r.testimonialCount ?? r.testimonials ?? 0,
    costCount: r.costCount ?? r.costs ?? 0,
    bookingCount: r.bookingCount ?? r.bookings ?? 0,
    publishStatus:
      r.publishStatus ?? (r.hasUnpublishedChanges ? 'DRAFT' : 'PUBLISHED'),
    lastPublishedAt: r.lastPublishedAt ?? null,
    recentActivity: r.recentActivity ?? [],
  };
}

export function useDashboard() {
  const { tenantId, path, hasTenant } = useTenantPath();
  const query = useQuery({
    queryKey: businessKeys.dashboard(tenantId),
    queryFn: () => api.get<DashboardApi>(`${path}/dashboard`),
    enabled: hasTenant,
  });
  const data = useMemo(() => (query.data ? normalize(query.data) : undefined), [query.data]);
  return { ...query, data };
}
