import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/core/api/client';

export interface BrandPerception {
  projectId: string;
  contentMarkdown: string;
}

export const brandPerceptionKeys = {
  preview: (scopeKey: string) => ['marketing', 'brand-perception', 'preview', scopeKey] as const,
};

function perceptionPath(projectId: string, tenantId?: string): string {
  return tenantId
    ? `/tenants/${tenantId}/marketing/brand-perception`
    : `/projects/${projectId}/brand-perception`;
}

function scopeKey(projectId: string, tenantId?: string): string {
  return tenantId ? `tenant:${tenantId}` : `project:${projectId}`;
}

export function useBrandPerceptionPreview(projectId: string | undefined, tenantId?: string) {
  const key = scopeKey(projectId ?? '', tenantId);
  return useQuery({
    queryKey: brandPerceptionKeys.preview(key),
    queryFn: async () => {
      try {
        return await api.get<BrandPerception>(perceptionPath(projectId!, tenantId));
      } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 204)) {
          return { projectId: projectId!, contentMarkdown: '' };
        }
        throw e;
      }
    },
    enabled: !!projectId || !!tenantId,
  });
}

export function useGenerateBrandPerception(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: () => api.post<BrandPerception>(perceptionPath(projectId, tenantId)),
    onSuccess: (data) => {
      qc.setQueryData(brandPerceptionKeys.preview(key), data);
      void qc.invalidateQueries({ queryKey: ['marketing', 'brand-memory', 'current', key] });
    },
  });
}
