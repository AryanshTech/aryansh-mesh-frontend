import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { PublishStatus } from '@/modules/business/types/entities';

interface PublishStatusApi {
  hasUnpublishedChanges: boolean;
  draftCounts?: Record<string, number> | null;
  lastPublishedAt?: string | null;
  lastVersion?: number | null;
}

export type PublishStatusView = PublishStatus;

function mapStatus(raw: PublishStatusApi): PublishStatusView {
  const draftCounts = raw.draftCounts ?? {};
  const pendingChanges = Object.values(draftCounts).reduce(
    (sum, n) => sum + (typeof n === 'number' ? n : 0),
    0,
  );
  return {
    hasUnpublishedChanges: !!raw.hasUnpublishedChanges,
    draftCounts,
    lastPublishedAt: raw.lastPublishedAt ?? null,
    lastVersion: raw.lastVersion ?? null,
    status: raw.hasUnpublishedChanges ? 'DRAFT' : 'PUBLISHED',
    pendingChanges,
  };
}

export function usePublishStatus() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.publishStatus(tenantId),
    queryFn: () => api.get<PublishStatusApi>(`${path}/publish/status`),
    enabled: hasTenant,
    select: mapStatus,
  });
}

export function usePublish() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: () => api.post<PublishStatusApi>(`${path}/publish`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: businessKeys.publishStatus(tenantId) });
    },
  });
}
