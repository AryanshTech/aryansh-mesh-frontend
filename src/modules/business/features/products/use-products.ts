import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { Product, ProductListResponse } from '@/modules/business/types/tenant-api';

export function useProducts(page: number, size: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.products(tenantId, page, size),
    queryFn: () =>
      api.get<ProductListResponse>(
        `/tenants/${tenantId}/products?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}

export function useProduct(productId: string) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.product(tenantId, productId),
    queryFn: () => api.get<Product>(`/tenants/${tenantId}/products/${productId}`),
    enabled: Boolean(tenantId) && Boolean(productId) && productId !== 'new',
  });
}

export interface ProductInput {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  category?: string;
  status?: string;
}

export function useCreateProduct() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      api.post<Product>(`/tenants/${tenantId}/products`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tenant', tenantId, 'products'],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.dashboard(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.publish.status(tenantId),
      });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<ProductInput>) =>
      api.patch<Product>(`/tenants/${tenantId}/products/${productId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tenant', tenantId, 'products'],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.product(tenantId, productId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.dashboard(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.publish.status(tenantId),
      });
    },
  });
}

export function useDeleteProduct() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      api.delete<void>(`/tenants/${tenantId}/products/${productId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tenant', tenantId, 'products'],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.dashboard(tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.publish.status(tenantId),
      });
    },
  });
}
