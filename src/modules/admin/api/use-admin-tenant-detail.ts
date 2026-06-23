import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  legalName?: string;
  createdAt: string;
}

export interface TenantDetailInput {
  name?: string;
  legalName?: string;
  status?: string;
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
    mutationFn: (input: TenantDetailInput) =>
      api.patch<TenantDetail>(`/admin/tenants/${tenantId}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'tenant', tenantId] });
      void qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
}

export function useCreateAdminTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; slug: string; legalName?: string }) =>
      api.post<TenantDetail>('/admin/tenants', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
}
