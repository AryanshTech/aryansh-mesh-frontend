import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { fetchAllPages } from '@/modules/business/api/fetch-paged-list';
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

function collectionKeyFromLabel(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'collection';
}

export interface ContentCollectionInput {
  label: string;
  description?: string;
  key?: string;
}

export function useContentCollections() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.content(tenantId),
    queryFn: async () => {
      const result = await fetchAllPages<ContentCollectionApi>((page) =>
        api.get<ContentCollectionListApi>(`${path}/content-collections`, {
          query: { page, size: 100 },
        }),
      );
      return { items: result.items.map(mapCollection), total: result.total };
    },
    enabled: hasTenant,
  });
}

export function useCreateContentCollection() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: ContentCollectionInput) =>
      api.post<ContentCollectionApi>(`${path}/content-collections`, {
        key: input.key ?? collectionKeyFromLabel(input.label),
        label: input.label,
        description: input.description,
      }),
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
