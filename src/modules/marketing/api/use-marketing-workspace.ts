import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface MarketingCompany {
  companyId: string;
  companyCode: string;
  name: string;
  tenantId: string;
  tenantSlug: string;
  createdAt: string;
  createdBy: string;
}

export interface MarketingProject {
  projectId: string;
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

export const workspaceKeys = {
  byTenant: (tenantId: string) => ['marketing', 'workspace', tenantId] as const,
};

export function useMarketingWorkspace(tenantId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.byTenant(tenantId ?? ''),
    queryFn: () =>
      api.get<MarketingWorkspace>(`/tenants/${tenantId!}/marketing/workspace`),
    enabled: !!tenantId,
  });
}

export function useEnsureMarketingWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) =>
      api.post<MarketingWorkspace>(`/tenants/${tenantId}/marketing/workspace`),
    onSuccess: (data, tenantId) => {
      qc.setQueryData(workspaceKeys.byTenant(tenantId), data);
    },
  });
}
