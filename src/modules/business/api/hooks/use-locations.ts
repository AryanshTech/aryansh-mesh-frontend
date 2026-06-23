import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { Location } from '@/modules/business/types/entities';

interface LocationApi {
  id: string;
  tenantId?: string;
  name: string;
  slug?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  hours?: Array<Record<string, unknown>> | null;
  images?: Array<Record<string, unknown>> | null;
  primary?: boolean;
  sortOrder?: number;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface LocationListApi {
  items: LocationApi[];
  total?: number;
  totalElements?: number;
}

export interface LocationView extends Location {
  addressLine: string;
}

function buildAddressLine(l: LocationApi): string {
  return [l.street, l.city, l.state, l.postalCode, l.country].filter(Boolean).join(', ');
}

function mapLocation(l: LocationApi): LocationView {
  return {
    id: l.id,
    tenantId: l.tenantId,
    name: l.name,
    slug: l.slug ?? null,
    street: l.street ?? null,
    city: l.city ?? null,
    state: l.state ?? null,
    postalCode: l.postalCode ?? null,
    country: l.country ?? null,
    latitude: l.latitude ?? null,
    longitude: l.longitude ?? null,
    phone: l.phone ?? null,
    hours: l.hours ?? null,
    images: l.images ?? null,
    primary: l.primary ?? false,
    sortOrder: l.sortOrder ?? 0,
    status: l.status ?? 'draft',
    addressLine: buildAddressLine(l),
  };
}

function mapList(raw: LocationListApi | LocationApi[]): { items: LocationView[]; total: number } {
  if (Array.isArray(raw)) return { items: raw.map(mapLocation), total: raw.length };
  return {
    items: (raw.items ?? []).map(mapLocation),
    total: raw.total ?? raw.totalElements ?? raw.items?.length ?? 0,
  };
}

export interface LocationInput {
  name: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export function useLocations() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.locations(tenantId),
    queryFn: () => api.get<LocationListApi | LocationApi[]>(`${path}/locations`),
    enabled: hasTenant,
    select: mapList,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: LocationInput) => api.post<LocationApi>(`${path}/locations`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'locations'] });
    },
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<LocationInput> }) =>
      api.patch<LocationApi>(`${path}/locations/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'locations'] });
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`${path}/locations/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'locations'] });
    },
  });
}
