import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { BusinessProfile } from '@/modules/business/types/tenant-api';

export function useBusinessProfile() {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.business(tenantId),
    queryFn: () => api.get<BusinessProfile>(`/tenants/${tenantId}/business`),
    enabled: Boolean(tenantId),
  });
}

export interface UpdateBusinessInput {
  legalName?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  allowedWebsiteOrigins?: string[];
  logoUrl?: string;
  address?: Record<string, string>;
  social?: Record<string, string>;
  hours?: Array<Record<string, unknown>>;
  bookingSettings?: Record<string, unknown>;
  status?: string;
}

export function useUpdateBusiness() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBusinessInput) =>
      api.put<BusinessProfile>(`/tenants/${tenantId}/business`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.business(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.dashboard(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.publish.status(tenantId),
      });
    },
  });
}
