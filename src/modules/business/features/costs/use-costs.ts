import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { Cost, CostListResponse } from '@/modules/business/types/tenant-api';

export function useCosts(page: number, size: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.costs(tenantId, page, size),
    queryFn: () =>
      api.get<CostListResponse>(
        `/tenants/${tenantId}/costs?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}

export function useCost(costId: string) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.cost(tenantId, costId),
    queryFn: () => api.get<Cost>(`/tenants/${tenantId}/costs/${costId}`),
    enabled: Boolean(tenantId) && Boolean(costId) && costId !== 'new',
  });
}

export interface CostInput {
  label: string;
  amount: number;
  currency?: string;
  category?: string;
  productId?: string | null;
  date?: string;
  notes?: string;
}

export function useCreateCost() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CostInput) =>
      api.post<Cost>(`/tenants/${tenantId}/costs`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'costs'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}

export function useUpdateCost(costId: string) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<CostInput>) =>
      api.patch<Cost>(`/tenants/${tenantId}/costs/${costId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'costs'] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.cost(tenantId, costId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}

export function useDeleteCost() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (costId: string) =>
      api.delete<void>(`/tenants/${tenantId}/costs/${costId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'costs'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}
