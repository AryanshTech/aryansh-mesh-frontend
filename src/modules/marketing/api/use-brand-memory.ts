import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface BrandMemory {
  id: string;
  content: string;
  updatedAt: string;
}

export function useBrandMemory(projectId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'brand-memory', projectId],
    queryFn: () =>
      api.get<BrandMemory>(`/projects/${projectId!}/brand-memories/current`),
    enabled: !!projectId,
  });
}

export function useSaveBrandMemory(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post<BrandMemory>(`/projects/${projectId}/brand-memories`, { content }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'brand-memory', projectId] });
    },
  });
}
