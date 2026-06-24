import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/core/api/client';

export interface BrandPerception {
  projectId: string;
  contentMarkdown: string;
}

export const brandPerceptionKeys = {
  preview: (projectId: string) => ['marketing', 'brand-perception', 'preview', projectId] as const,
};

export function useBrandPerceptionPreview(projectId: string | undefined) {
  return useQuery({
    queryKey: brandPerceptionKeys.preview(projectId ?? ''),
    queryFn: async () => {
      try {
        return await api.get<BrandPerception>(`/projects/${projectId!}/brand-perception`);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 204)) {
          return { projectId: projectId!, contentMarkdown: '' };
        }
        throw e;
      }
    },
    enabled: !!projectId,
  });
}

export function useGenerateBrandPerception(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<BrandPerception>(`/projects/${projectId}/brand-perception`),
    onSuccess: (data) => {
      qc.setQueryData(brandPerceptionKeys.preview(projectId), data);
      void qc.invalidateQueries({ queryKey: ['marketing', 'brand-memory', projectId] });
    },
  });
}
