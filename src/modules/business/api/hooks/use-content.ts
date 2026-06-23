import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { ContentCollection, ContentItem } from '@/modules/business/types/entities';

interface ContentItemApi {
  id: string;
  title?: string | null;
  value?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

interface ContentCollectionApi {
  id: string;
  tenantId?: string;
  key?: string;
  label: string;
  description?: string | null;
  items?: ContentItemApi[] | null;
  status?: string | null;
  sortOrder?: number | null;
}

interface ContentCollectionListApi {
  items: ContentCollectionApi[];
  total?: number;
  totalElements?: number;
}

export type ContentCollectionView = ContentCollection;

function mapItem(i: ContentItemApi): ContentItem {
  return {
    id: i.id,
    title: i.title ?? null,
    value: i.value ?? null,
    description: i.description ?? null,
    imageUrl: i.imageUrl ?? null,
    sortOrder: i.sortOrder ?? null,
  };
}

function mapCollection(c: ContentCollectionApi): ContentCollectionView {
  const items = (c.items ?? []).map(mapItem);
  return {
    id: c.id,
    tenantId: c.tenantId,
    key: c.key,
    label: c.label,
    description: c.description ?? null,
    items,
    itemCount: items.length,
    status: c.status ?? 'draft',
  };
}

function mapList(raw: ContentCollectionListApi | ContentCollectionApi[]): {
  items: ContentCollectionView[];
  total: number;
} {
  if (Array.isArray(raw)) return { items: raw.map(mapCollection), total: raw.length };
  return {
    items: (raw.items ?? []).map(mapCollection),
    total: raw.total ?? raw.totalElements ?? raw.items?.length ?? 0,
  };
}

export interface ContentCollectionInput {
  label: string;
  description?: string;
}

export function useContentCollections() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.content(tenantId),
    queryFn: () =>
      api.get<ContentCollectionListApi | ContentCollectionApi[]>(
        `${path}/content-collections`,
      ),
    enabled: hasTenant,
    select: mapList,
  });
}

export function useCreateContentCollection() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: ContentCollectionInput) =>
      api.post<ContentCollectionApi>(`${path}/content-collections`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'content'] });
    },
  });
}

export function useUpdateContentCollection() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ContentCollectionInput> }) =>
      api.patch<ContentCollectionApi>(`${path}/content-collections/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'content'] });
    },
  });
}

export function useDeleteContentCollection() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`${path}/content-collections/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'content'] });
    },
  });
}
