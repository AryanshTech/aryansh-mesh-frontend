import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { normalizeList, resolveEntityId } from '@/modules/marketing/api/marketing-utils';

export interface Project {
  id: string;
  projectId: string;
  name: string;
  companyId: string;
  createdAt: string;
}

export interface ProjectInput {
  name: string;
}

interface ProjectApi {
  id?: string;
  projectId?: string;
  name: string;
  companyId?: string;
  createdAt: string;
}

function mapProject(raw: ProjectApi, fallbackCompanyId?: string): Project {
  const projectId = resolveEntityId(raw, 'projectId');
  return {
    id: projectId,
    projectId,
    name: raw.name,
    companyId: raw.companyId ?? fallbackCompanyId ?? '',
    createdAt: raw.createdAt,
  };
}

export function useProjects(companyId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'projects', companyId],
    queryFn: () =>
      api.get<{ items: ProjectApi[]; total: number } | ProjectApi[]>(
        `/companies/${companyId!}/projects`,
      ),
    enabled: !!companyId,
    select: (data) => {
      const items = normalizeList(data).map((item) => mapProject(item, companyId));
      return { items, total: items.length };
    },
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'project', projectId],
    queryFn: async () => {
      const raw = await api.get<ProjectApi>(`/projects/${projectId!}`);
      return mapProject(raw);
    },
    enabled: !!projectId,
  });
}

export function useCreateProject(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const raw = await api.post<ProjectApi>(`/companies/${companyId}/projects`, input);
      return mapProject(raw, companyId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'projects', companyId] });
    },
  });
}
