import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { ApiError } from '@/core/api/client';

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

export const brandIdentityKeys = {
  list: (projectId: string) => ['marketing', 'brand-identity', 'list', projectId] as const,
  current: (projectId: string) => ['marketing', 'brand-identity', 'current', projectId] as const,
};

export function useBrandIdentityVersions(projectId: string | undefined) {
  return useQuery({
    queryKey: brandIdentityKeys.list(projectId ?? ''),
    queryFn: () =>
      api.get<BrandIdentity[]>(`/projects/${projectId!}/brand-identity`),
    enabled: !!projectId,
    select: (raw) => raw ?? [],
  });
}

export function useCurrentBrandIdentity(projectId: string | undefined) {
  return useQuery({
    queryKey: brandIdentityKeys.current(projectId ?? ''),
    queryFn: async () => {
      try {
        return await api.get<BrandIdentity | undefined>(
          `/projects/${projectId!}/brand-identity/current`,
        );
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: !!projectId,
  });
}

export function useSaveBrandIdentity(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BrandIdentityInput) =>
      api.post<BrandIdentity>(`/projects/${projectId}/brand-identity`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: brandIdentityKeys.list(projectId) });
      void qc.invalidateQueries({ queryKey: brandIdentityKeys.current(projectId) });
    },
  });
}

export function useGenerateBrandIdentity(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<BrandIdentity>(`/projects/${projectId}/brand-identity/generate`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: brandIdentityKeys.list(projectId) });
      void qc.invalidateQueries({ queryKey: brandIdentityKeys.current(projectId) });
    },
  });
}
