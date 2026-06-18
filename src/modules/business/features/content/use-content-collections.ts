import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type {
  ContentCollection,
  ContentCollectionListResponse,
  ContentItem,
} from '@/modules/business/types/tenant-api';

export function useContentCollections(page: number, size: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.contentCollections(tenantId, page, size),
    queryFn: () =>
      api.get<ContentCollectionListResponse>(
        `/tenants/${tenantId}/content-collections?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}

export function useContentCollection(collectionId: string) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.contentCollection(tenantId, collectionId),
    queryFn: () =>
      api.get<ContentCollection>(`/tenants/${tenantId}/content-collections/${collectionId}`),
    enabled: Boolean(tenantId) && Boolean(collectionId) && collectionId !== 'new',
  });
}

export interface ContentItemInput {
  id?: string;
  title: string;
  value?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface ContentCollectionInput {
  key: string;
  label: string;
  description?: string;
  items?: ContentItemInput[];
  status?: string;
  sortOrder?: number;
}

export function useCreateContentCollection() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ContentCollectionInput) =>
      api.post<ContentCollection>(`/tenants/${tenantId}/content-collections`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'content-collections'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
    },
  });
}

export function useUpdateContentCollection(collectionId: string) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<ContentCollectionInput>) =>
      api.patch<ContentCollection>(
        `/tenants/${tenantId}/content-collections/${collectionId}`,
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'content-collections'] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.contentCollection(tenantId, collectionId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
    },
  });
}

export function useDeleteContentCollection() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) =>
      api.delete<void>(`/tenants/${tenantId}/content-collections/${collectionId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'content-collections'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
    },
  });
}

export type { ContentItem };
