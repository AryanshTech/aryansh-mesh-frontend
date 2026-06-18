import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { PublishResult, PublishStatus } from '@/modules/business/types/tenant-api';

export function usePublishStatus() {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.publish.status(tenantId),
    queryFn: () => api.get<PublishStatus>(`/tenants/${tenantId}/publish/status`),
    enabled: Boolean(tenantId),
  });
}

export function usePublishLatest() {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.publish.latest(tenantId),
    queryFn: () =>
      api.get<Record<string, unknown>>(`/tenants/${tenantId}/publish/latest`),
    enabled: Boolean(tenantId),
  });
}

export function usePublish() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<PublishResult>(`/tenants/${tenantId}/publish`),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.publish.status(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.publish.latest(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.dashboard(tenantId),
      });
    },
  });
}
