import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { BusinessProfile } from '@/modules/business/types/entities';

interface BusinessProfileApi {
  legalName?: string | null;
  tagline?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: Record<string, string> | null;
  websiteUrl?: string | null;
  allowedWebsiteOrigins?: string[] | null;
  social?: Record<string, string> | null;
  logoUrl?: string | null;
  hours?: Array<Record<string, unknown>> | null;
  bookingSettings?: Record<string, unknown> | null;
  publicExtras?: Record<string, unknown> | null;
  status?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export type BusinessProfileView = BusinessProfile;

function mapProfile(p: BusinessProfileApi): BusinessProfileView {
  return {
    legalName: p.legalName ?? '',
    tagline: p.tagline ?? null,
    description: p.description ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    address: p.address ?? null,
    websiteUrl: p.websiteUrl ?? null,
    allowedWebsiteOrigins: p.allowedWebsiteOrigins ?? null,
    social: p.social ?? null,
    logoUrl: p.logoUrl ?? null,
    hours: p.hours ?? null,
    bookingSettings: p.bookingSettings ?? null,
    publicExtras: p.publicExtras ?? null,
    status: (p.status ?? 'draft').toUpperCase(),
    updatedAt: p.updatedAt ?? null,
    updatedBy: p.updatedBy ?? null,
  };
}

export interface BusinessProfileInput {
  legalName?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  allowedWebsiteOrigins?: string[];
  address?: Record<string, string>;
  social?: Record<string, string>;
  logoUrl?: string;
}

export function useBusinessProfile() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.business(tenantId),
    queryFn: () => api.get<BusinessProfileApi>(`${path}/business`),
    enabled: hasTenant,
    select: mapProfile,
  });
}

export function useUpdateBusinessProfile() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: Partial<BusinessProfileInput>) =>
      api.patch<BusinessProfileApi>(`${path}/business`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: businessKeys.business(tenantId) });
    },
  });
}
