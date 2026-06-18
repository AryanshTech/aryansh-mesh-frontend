import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { Client, ClientListResponse } from '@/modules/business/types/tenant-api';

export function useClients(page: number, size: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.clients(tenantId, page, size),
    queryFn: () =>
      api.get<ClientListResponse>(
        `/tenants/${tenantId}/clients?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}

export function useClient(clientId: string) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.client(tenantId, clientId),
    queryFn: () => api.get<Client>(`/tenants/${tenantId}/clients/${clientId}`),
    enabled: Boolean(tenantId) && Boolean(clientId) && clientId !== 'new',
  });
}

export interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  tags?: string[];
}

export function useCreateClient() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ClientInput) =>
      api.post<Client>(`/tenants/${tenantId}/clients`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'clients'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}

export function useUpdateClient(clientId: string) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<ClientInput>) =>
      api.patch<Client>(`/tenants/${tenantId}/clients/${clientId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'clients'] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.client(tenantId, clientId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}

export function useDeleteClient() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) =>
      api.delete<void>(`/tenants/${tenantId}/clients/${clientId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'clients'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}
