import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { companiesApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { usePermissions } from '@/core/permissions/use-permissions';
import { queryKeys } from '@/modules/marketing/hooks/query-client';
import type { ProjectResponse } from '@/modules/marketing/types/api';

export function useSidebarNav() {
  const { getToken } = useAuth();
  const { isPlatformAdmin, isSuperAdmin } = usePermissions();
  const isPlatformOperator = isPlatformAdmin || isSuperAdmin;
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const companiesQuery = useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => {
      const res = await apiFetchWithRetry(
        (token) => companiesApi.list(token, 0, 100),
        getToken
      );
      return res.items;
    },
  });

  const expandedList = useMemo(() => Array.from(expandedCompanies), [expandedCompanies]);

  const projectQueries = useQueries({
    queries: expandedList.map((companyId) => ({
      queryKey: queryKeys.projects(companyId),
      queryFn: () =>
        apiFetchWithRetry(
          (token) => projectsApi.listByCompany(token, companyId),
          getToken
        ),
      enabled: !!companyId,
    })),
  });

  const projectsByCompany = useMemo(() => {
    const map: Record<string, ProjectResponse[]> = {};
    expandedList.forEach((companyId, index) => {
      const data = projectQueries[index]?.data;
      if (data) {
        map[companyId] = data;
      }
    });
    return map;
  }, [expandedList, projectQueries]);

  const companies = companiesQuery.data ?? [];

  useEffect(() => {
    if (!isPlatformOperator || companies.length === 0) return;
    setExpandedCompanies(new Set(companies.map((company) => company.companyId)));
  }, [companies, isPlatformOperator]);

  const toggleCompany = useCallback((companyId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  }, []);

  const expandCompany = useCallback((companyId: string) => {
    setExpandedCompanies((prev) => new Set(prev).add(companyId));
  }, []);

  const getCompanyName = useCallback(
    (companyId: string) => companies.find((c) => c.companyId === companyId)?.name,
    [companies]
  );

  const getProjectName = useCallback(
    (projectId: string) => {
      for (const projects of Object.values(projectsByCompany)) {
        const match = projects.find((p) => p.projectId === projectId);
        if (match) return match.name;
      }
      return undefined;
    },
    [projectsByCompany]
  );

  const getProjectCompanyId = useCallback(
    (projectId: string) => {
      for (const [companyId, projects] of Object.entries(projectsByCompany)) {
        if (projects.some((p) => p.projectId === projectId)) return companyId;
      }
      return undefined;
    },
    [projectsByCompany]
  );

  return {
    companies,
    projectsByCompany,
    expandedCompanies,
    loading: companiesQuery.isLoading,
    toggleCompany,
    expandCompany,
    loadCompanies: companiesQuery.refetch,
    getCompanyName,
    getProjectName,
    getProjectCompanyId,
  };
}
