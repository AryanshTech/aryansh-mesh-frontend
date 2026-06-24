import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { resolveEntityId } from '@/modules/marketing/api/marketing-utils';

export interface MarketingCompany {
  companyId: string;
  id: string;
  companyCode: string;
  name: string;
  tenantId: string;
  tenantSlug: string;
  createdAt: string;
  createdBy: string;
}

export interface MarketingProject {
  projectId: string;
  id: string;
  companyId: string;
  tenantId: string;
  tenantSlug: string;
  name: string;
  brief: string | null;
  createdAt: string;
  createdBy: string;
  onboardingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | string;
  typefullySocialSetId: string | null;
}

export interface MarketingWorkspace {
  tenantId: string;
  tenantSlug: string;
  company: MarketingCompany;
  project: MarketingProject;
}

interface MarketingWorkspaceApi {
  tenantId: string;
  tenantSlug: string;
  company: MarketingCompany & { id?: string; companyId?: string };
  project: MarketingProject & { id?: string; projectId?: string };
}

function normalizeWorkspace(raw: MarketingWorkspaceApi): MarketingWorkspace {
  const companyId = resolveEntityId(raw.company, 'companyId');
  const projectId = resolveEntityId(raw.project, 'projectId');
  return {
    tenantId: raw.tenantId,
    tenantSlug: raw.tenantSlug,
    company: {
      ...raw.company,
      id: companyId,
      companyId,
    },
    project: {
      ...raw.project,
      id: projectId,
      projectId,
      companyId: raw.project.companyId ?? companyId,
    },
  };
}

export function resolveMarketingProjectId(
  project: Pick<MarketingProject, 'projectId' | 'id'> | null | undefined,
): string {
  return resolveEntityId(project, 'projectId');
}

export const workspaceKeys = {
  byTenant: (tenantId: string) => ['marketing', 'workspace', tenantId] as const,
};

export function useMarketingWorkspace(tenantId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.byTenant(tenantId ?? ''),
    queryFn: async () => {
      const raw = await api.get<MarketingWorkspaceApi>(
        `/tenants/${tenantId!}/marketing/workspace`,
      );
      return normalizeWorkspace(raw);
    },
    enabled: !!tenantId,
  });
}

export function useEnsureMarketingWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const raw = await api.post<MarketingWorkspaceApi>(
        `/tenants/${tenantId}/marketing/workspace`,
      );
      return normalizeWorkspace(raw);
    },
    onSuccess: (data, tenantId) => {
      qc.setQueryData(workspaceKeys.byTenant(tenantId), data);
    },
  });
}
