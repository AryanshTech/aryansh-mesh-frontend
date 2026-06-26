import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan?: string;
  currency?: string;
  timezone?: string;
  onboardingComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantStatusInput {
  status: string;
}

export function useAdminTenantDetail(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tenant', tenantId],
    queryFn: () => api.get<TenantDetail>(`/admin/tenants/${tenantId!}`),
    enabled: !!tenantId,
  });
}

export function useUpdateAdminTenant(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantStatusInput) =>
      api.patch<TenantDetail>(`/admin/tenants/${tenantId}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'tenant', tenantId] });
      void qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  currency: string;
  timezone: string;
}

export function useCreateAdminTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) =>
      api.post<TenantDetail>('/admin/tenants', {
        name: input.name,
        slug: input.slug,
        currency: input.currency.toUpperCase(),
        timezone: input.timezone,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
}
