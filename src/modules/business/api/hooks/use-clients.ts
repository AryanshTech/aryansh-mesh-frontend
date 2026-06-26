import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { fetchAllPages } from '@/modules/business/api/fetch-paged-list';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { Client } from '@/modules/business/types/entities';

interface ClientApi {
  id: string;
  tenantId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
}

interface ClientListApi {
  items: ClientApi[];
  total?: number;
  totalElements?: number;
}

export type ClientView = Client;

function mapClient(c: ClientApi): ClientView {
  return {
    id: c.id,
    tenantId: c.tenantId,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    notes: c.notes ?? null,
    tags: c.tags ?? null,
    createdAt: c.createdAt ?? '',
    updatedAt: c.updatedAt ?? '',
  };
}

function mapList(raw: ClientListApi | ClientApi[]): { items: ClientView[]; total: number } {
  if (Array.isArray(raw)) return { items: raw.map(mapClient), total: raw.length };
  return {
    items: (raw.items ?? []).map(mapClient),
    total: raw.total ?? raw.totalElements ?? raw.items?.length ?? 0,
  };
}

export interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  tags?: string[];
}

export function useClients() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.clients(tenantId),
    queryFn: async () => {
      const result = await fetchAllPages<ClientApi>((page) =>
        api.get<ClientListApi>(`${path}/clients`, { query: { page, size: 100 } }),
      );
      return { items: result.items.map(mapClient), total: result.total };
    },
    enabled: hasTenant,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: ClientInput) => api.post<ClientApi>(`${path}/clients`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'clients'] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ClientInput> }) =>
      api.patch<ClientApi>(`${path}/clients/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'clients'] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`${path}/clients/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'clients'] });
    },
  });
}
