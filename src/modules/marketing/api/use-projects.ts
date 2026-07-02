import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { resolveEntityId } from '@/modules/marketing/api/marketing-utils';

export interface Project {
  id: string;
  projectId: string;
  name: string;
  companyId: string;
  createdAt: string;
}

interface ProjectApi {
  id?: string;
  projectId?: string;
  name: string;
  companyId?: string;
  createdAt: string;
}

function mapProject(raw: ProjectApi): Project {
  const projectId = resolveEntityId(raw, 'projectId');
  return {
    id: projectId,
    projectId,
    name: raw.name,
    companyId: raw.companyId ?? '',
    createdAt: raw.createdAt,
  };
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
