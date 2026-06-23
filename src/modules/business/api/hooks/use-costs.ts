import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { Cost } from '@/modules/business/types/entities';

interface CostApi {
  id: string;
  tenantId?: string;
  label: string;
  amount?: number | null;
  currency?: string | null;
  category?: string | null;
  productId?: string | null;
  date?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface CostListApi {
  items: CostApi[];
  total?: number;
}

export interface CostView extends Cost {
  amountCents: number;
  incurredAt: string;
}

function mapCost(c: CostApi): CostView {
  const amount = Number(c.amount ?? 0);
  return {
    id: c.id,
    tenantId: c.tenantId,
    label: c.label,
    amount,
    amountCents: Math.round(amount * 100),
    currency: c.currency ?? 'CAD',
    category: c.category ?? null,
    productId: c.productId ?? null,
    date: c.date ?? '',
    incurredAt: c.date ?? '',
    notes: c.notes ?? null,
    createdAt: c.createdAt ?? '',
    updatedAt: c.updatedAt ?? '',
  };
}

function mapList(raw: CostListApi | CostApi[]): { items: CostView[]; total: number } {
  if (Array.isArray(raw)) return { items: raw.map(mapCost), total: raw.length };
  return { items: (raw.items ?? []).map(mapCost), total: raw.total ?? raw.items?.length ?? 0 };
}

export interface CostInput {
  label: string;
  amount: number;
  currency: string;
  date: string;
  category?: string;
  notes?: string;
}

function toApi(input: CostInput): Record<string, unknown> {
  return {
    label: input.label,
    amount: input.amount,
    currency: input.currency,
    date: input.date,
    category: input.category,
    notes: input.notes,
  };
}

export function useCosts() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.costs(tenantId),
    queryFn: () => api.get<CostListApi | CostApi[]>(`${path}/costs`),
    enabled: hasTenant,
    select: mapList,
  });
}

export function useCreateCost() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: CostInput) => api.post<CostApi>(`${path}/costs`, toApi(input)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'costs'] });
    },
  });
}

export function useUpdateCost() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CostInput> }) =>
      api.patch<CostApi>(`${path}/costs/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'costs'] });
    },
  });
}

export function useDeleteCost() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`${path}/costs/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'costs'] });
    },
  });
}
