import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { Location, LocationListResponse } from '@/modules/business/types/tenant-api';

export function useLocations(page: number, size: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.locations(tenantId, page, size),
    queryFn: () =>
      api.get<LocationListResponse>(
        `/tenants/${tenantId}/locations?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}

export function useLocation(locationId: string) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.location(tenantId, locationId),
    queryFn: () => api.get<Location>(`/tenants/${tenantId}/locations/${locationId}`),
    enabled: Boolean(tenantId) && Boolean(locationId) && locationId !== 'new',
  });
}

export interface LocationInput {
  name: string;
  slug?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  primary?: boolean;
  sortOrder?: number;
  status?: string;
}

export function useCreateLocation() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LocationInput) =>
      api.post<Location>(`/tenants/${tenantId}/locations`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'locations'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}

export function useUpdateLocation(locationId: string) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<LocationInput>) =>
      api.patch<Location>(`/tenants/${tenantId}/locations/${locationId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'locations'] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.location(tenantId, locationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}

export function useDeleteLocation() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) =>
      api.delete<void>(`/tenants/${tenantId}/locations/${locationId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'locations'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
    },
  });
}
