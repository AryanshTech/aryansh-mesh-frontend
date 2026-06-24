import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/core/api/client';

export interface BrandIdentityColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  mutedText?: string;
  [key: string]: string | undefined;
}

export interface BrandIdentityTypography {
  heading?: string;
  body?: string;
  caption?: string;
  rules?: string;
  [key: string]: string | undefined;
}

export interface BrandIdentity {
  id: string;
  projectId: string;
  version: number;
  colors: BrandIdentityColors;
  typography: BrandIdentityTypography;
  visualStyle: string | null;
  motionStyle: string | null;
  voiceTone: string | null;
  mission: string | null;
  vision: string | null;
  values: string[];
  audience: string | null;
  contentPillars: string[];
  doRules: string[];
  dontRules: string[];
  evidenceLinks: string[];
  sourceMarkdown: string | null;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandIdentityInput {
  colors?: BrandIdentityColors;
  typography?: BrandIdentityTypography;
  visualStyle?: string;
  motionStyle?: string;
  voiceTone?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  audience?: string;
  contentPillars?: string[];
  doRules?: string[];
  dontRules?: string[];
  evidenceLinks?: string[];
  sourceMarkdown?: string;
}

interface CurrentBrandIdentityEnvelope {
  identity: BrandIdentity | null;
  projectId: string;
}

export const brandIdentityKeys = {
  list: (projectId: string) => ['marketing', 'brand-identity', 'list', projectId] as const,
  current: (projectId: string) => ['marketing', 'brand-identity', 'current', projectId] as const,
  currentByTenant: (tenantId: string) =>
    ['marketing', 'brand-identity', 'current', 'tenant', tenantId] as const,
};

function parseCurrentIdentity(
  raw: BrandIdentity | CurrentBrandIdentityEnvelope | null | undefined,
): BrandIdentity | null {
  if (!raw) return null;
  if ('identity' in raw) return raw.identity ?? null;
  return raw;
}

async function fetchCurrentBrandIdentity(path: string): Promise<BrandIdentity | null> {
  try {
    const raw = await api.get<BrandIdentity | CurrentBrandIdentityEnvelope>(path);
    return parseCurrentIdentity(raw);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 204)) return null;
    throw e;
  }
}

export function useBrandIdentityVersions(projectId: string | undefined) {
  return useQuery({
    queryKey: brandIdentityKeys.list(projectId ?? ''),
    queryFn: () =>
      api.get<BrandIdentity[]>(`/projects/${projectId!}/brand-identity`),
    enabled: !!projectId,
    select: (raw) => raw ?? [],
  });
}

export function useCurrentBrandIdentity(
  projectId: string | undefined,
  tenantId?: string,
) {
  const useTenantScope = !!tenantId;
  return useQuery({
    queryKey: useTenantScope
      ? brandIdentityKeys.currentByTenant(tenantId!)
      : brandIdentityKeys.current(projectId ?? ''),
    queryFn: () =>
      useTenantScope
        ? fetchCurrentBrandIdentity(
            `/tenants/${tenantId!}/marketing/brand-identity/current`,
          )
        : fetchCurrentBrandIdentity(`/projects/${projectId!}/brand-identity/current`),
    enabled: useTenantScope ? !!tenantId : !!projectId,
  });
}

export function useSaveBrandIdentity(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BrandIdentityInput) =>
      api.post<BrandIdentity>(`/projects/${projectId}/brand-identity`, input),
    onSuccess: (data) => {
      qc.setQueryData(brandIdentityKeys.current(projectId), data);
      if (tenantId) {
        qc.setQueryData(brandIdentityKeys.currentByTenant(tenantId), data);
      }
      void qc.invalidateQueries({ queryKey: brandIdentityKeys.list(projectId) });
    },
  });
}

export function useGenerateBrandIdentity(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<BrandIdentity>(`/projects/${projectId}/brand-identity/generate`),
    onSuccess: (data) => {
      qc.setQueryData(brandIdentityKeys.current(projectId), data);
      if (tenantId) {
        qc.setQueryData(brandIdentityKeys.currentByTenant(tenantId), data);
      }
      void qc.invalidateQueries({ queryKey: brandIdentityKeys.list(projectId) });
    },
  });
}
