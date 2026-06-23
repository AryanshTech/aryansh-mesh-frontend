import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface Project {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
}

export interface ProjectInput {
  name: string;
}

export function useProjects(companyId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'projects', companyId],
    queryFn: () =>
      api.get<{ items: Project[]; total: number } | Project[]>(
        `/companies/${companyId!}/projects`,
      ),
    enabled: !!companyId,
    select: (data) => (Array.isArray(data) ? { items: data, total: data.length } : data),
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'project', projectId],
    queryFn: () => api.get<Project>(`/projects/${projectId!}`),
    enabled: !!projectId,
  });
}

export function useCreateProject(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) =>
      api.post<Project>(`/companies/${companyId}/projects`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'projects', companyId] });
    },
  });
}
