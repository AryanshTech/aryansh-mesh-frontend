import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/core/api/client';

export interface BrandMemory {
  id: string;
  projectId: string;
  version: number;
  contentMarkdown: string;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
}

export const brandMemoryKeys = {
  list: (scopeKey: string) => ['marketing', 'brand-memory', 'list', scopeKey] as const,
  current: (scopeKey: string) => ['marketing', 'brand-memory', 'current', scopeKey] as const,
};

function scopeKey(projectId: string, tenantId?: string): string {
  return tenantId ? `tenant:${tenantId}` : `project:${projectId}`;
}

function basePath(projectId: string, tenantId?: string): string {
  return tenantId
    ? `/tenants/${tenantId}/marketing/brand-memories`
    : `/projects/${projectId}/brand-memories`;
}

async function fetchCurrent(path: string): Promise<BrandMemory | null> {
  try {
    return await api.get<BrandMemory>(`${path}/current`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 204)) return null;
    throw e;
  }
}

export function useBrandMemoryVersions(projectId: string | undefined, tenantId?: string) {
  const key = scopeKey(projectId ?? '', tenantId);
  return useQuery({
    queryKey: brandMemoryKeys.list(key),
    queryFn: () => api.get<BrandMemory[]>(basePath(projectId!, tenantId)),
    enabled: !!projectId || !!tenantId,
    select: (raw) => raw ?? [],
  });
}

export function useBrandMemory(projectId: string | undefined, tenantId?: string) {
  const key = scopeKey(projectId ?? '', tenantId);
  return useQuery({
    queryKey: brandMemoryKeys.current(key),
    queryFn: () => fetchCurrent(basePath(projectId!, tenantId)),
    enabled: !!projectId || !!tenantId,
  });
}

export function useSaveBrandMemory(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  const path = basePath(projectId, tenantId);
  return useMutation({
    mutationFn: (contentMarkdown: string) =>
      api.post<BrandMemory>(path, { contentMarkdown }),
    onSuccess: (data) => {
      qc.setQueryData(brandMemoryKeys.current(key), data);
      void qc.invalidateQueries({ queryKey: brandMemoryKeys.list(key) });
    },
  });
}

export function useSetCurrentBrandMemory(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  const path = basePath(projectId, tenantId);
  return useMutation({
    mutationFn: (memoryId: string) =>
      api.put<BrandMemory>(`${path}/${memoryId}/current`),
    onSuccess: (data) => {
      qc.setQueryData(brandMemoryKeys.current(key), data);
      void qc.invalidateQueries({ queryKey: brandMemoryKeys.list(key) });
    },
  });
}
