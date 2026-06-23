import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { ProductInput, ProductStatus, ProductView } from '@/modules/business/types/entities';

// Raw backend shape from ProductResponse.java
interface ProductApi {
  id: string;
  tenantId?: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  price?: number | null;
  cost?: number | null;
  currency?: string | null;
  images?: Array<{ url?: string; alt?: string; order?: number }> | null;
  category?: string | null;
  status?: string | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ProductListApi {
  items: ProductApi[];
  total?: number;
  totalElements?: number;
}

const STATUS_FROM_API: Record<string, ProductStatus> = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
  archived: 'ARCHIVED',
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export type { ProductView };

function mapProduct(p: ProductApi): ProductView {
  const status = STATUS_FROM_API[(p.status ?? 'draft').toLowerCase()] ?? 'DRAFT';
  const price = Number(p.price ?? 0);
  const firstImage = p.images?.find((i) => i?.url)?.url ?? null;
  return {
    id: p.id,
    tenantId: p.tenantId,
    name: p.name,
    description: p.description ?? null,
    sku: p.sku ?? null,
    price,
    priceCents: Math.round(price * 100),
    cost: p.cost ?? null,
    currency: p.currency ?? 'CAD',
    status,
    images: p.images ?? null,
    imageUrl: firstImage,
    category: p.category ?? null,
    sortOrder: p.sortOrder ?? null,
    createdAt: p.createdAt ?? '',
    updatedAt: p.updatedAt ?? '',
  };
}

function mapList(raw: ProductListApi | ProductApi[]): { items: ProductView[]; total: number } {
  if (Array.isArray(raw)) return { items: raw.map(mapProduct), total: raw.length };
  return {
    items: (raw.items ?? []).map(mapProduct),
    total: raw.total ?? raw.totalElements ?? raw.items?.length ?? 0,
  };
}

export interface ProductFilters {
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'ALL';
}

export function useProducts(filters: ProductFilters = {}) {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.products(tenantId, filters),
    queryFn: () =>
      api.get<ProductListApi | ProductApi[]>(`${path}/products`, {
        query: {
          search: filters.search || undefined,
          status:
            filters.status && filters.status !== 'ALL'
              ? filters.status.toLowerCase()
              : undefined,
        },
      }),
    enabled: hasTenant,
    select: mapList,
  });
}

export function useProduct(productId: string | undefined) {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: productId ? businessKeys.product(tenantId, productId) : ['noop'],
    queryFn: () => api.get<ProductApi>(`${path}/products/${productId}`),
    enabled: hasTenant && !!productId,
    select: mapProduct,
  });
}

function toApiPayload(input: ProductInput): Record<string, unknown> {
  return {
    name: input.name,
    sku: input.sku,
    description: input.description,
    price: input.price,
    currency: input.currency,
    category: input.category,
    status: input.status.toLowerCase(),
  };
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: ProductInput) =>
      api.post<ProductApi>(`${path}/products`, toApiPayload(input)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      api.patch<ProductApi>(`${path}/products/${id}`, {
        ...input,
        status: input.status ? input.status.toLowerCase() : undefined,
      }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'products'] });
      void qc.invalidateQueries({ queryKey: businessKeys.product(tenantId, vars.id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`${path}/products/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'products'] });
    },
  });
}
