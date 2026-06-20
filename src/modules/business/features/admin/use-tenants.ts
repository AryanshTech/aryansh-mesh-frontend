import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import type { Tenant, TenantListResponse } from '@/modules/business/types/entities';

export function useTenants(page: number, size: number) {
  return useQuery({
    queryKey: queryKeys.admin.tenants(page, size),
    queryFn: () =>
      api.get<TenantListResponse>(`/admin/tenants?page=${page}&size=${size}`),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.tenant(id),
    queryFn: () => api.get<Tenant>(`/admin/tenants/${id}`),
    enabled: Boolean(id),
  });
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  currency: string;
  timezone: string;
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) =>
      api.post<Tenant>('/admin/tenants', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
}
