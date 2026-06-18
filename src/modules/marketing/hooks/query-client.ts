import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
    },
  },
});

export const queryKeys = {
  companies: ['companies'] as const,
  projects: (companyId: string) => ['projects', companyId] as const,
  feed: (projectId: string) => ['feed', projectId] as const,
  postIdeas: (projectId: string) => ['postIdeas', projectId] as const,
  contentFeedback: (projectId: string) => ['contentFeedback', projectId] as const,
  content: (projectId: string) => ['content', projectId] as const,
  styleReferences: (projectId: string) => ['styleReferences', projectId] as const,
  styleCaptures: (projectId: string) => ['styleCaptures', projectId] as const,
  contentAudits: (projectId: string) => ['contentAudits', projectId] as const,
  contentAuditRows: (projectId: string, auditId: string) =>
    ['contentAuditRows', projectId, auditId] as const,
  styleProfile: (projectId: string) => ['styleProfile', projectId] as const,
  mindmap: (projectId: string) => ['mindmap', projectId] as const,
  agentJobs: (projectId: string) => ['agentJobs', projectId] as const,
  deals: (companyId: string) => ['deals', companyId] as const,
};

export function invalidateCompanies() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.companies });
}

export function invalidateProjects(companyId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.projects(companyId) });
}

export function invalidateProjectStudio(projectId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.feed(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.postIdeas(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.contentFeedback(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.content(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.styleReferences(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.styleCaptures(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.contentAudits(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.styleProfile(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.mindmap(projectId) });
}
