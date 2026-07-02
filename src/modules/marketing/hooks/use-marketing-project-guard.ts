import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  resolveMarketingProjectId,
  useMarketingWorkspace,
} from '@/modules/marketing/api/use-marketing-workspace';

export function useMarketingProjectGuard(
  tenantId: string | undefined,
  urlProjectId: string | undefined,
) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: workspace, isLoading, isError } = useMarketingWorkspace(tenantId);
  const canonicalProjectId = workspace ? resolveMarketingProjectId(workspace.project) : undefined;
  const projectMismatch =
    !!urlProjectId && !!canonicalProjectId && urlProjectId !== canonicalProjectId;
  const projectId = canonicalProjectId ?? urlProjectId;
  const isResolving = Boolean(tenantId && isLoading && !canonicalProjectId);

  useEffect(() => {
    if (!projectMismatch || !canonicalProjectId || !urlProjectId) return;

    const from = `/marketing/projects/${urlProjectId}`;
    const to = `/marketing/projects/${canonicalProjectId}`;
    const corrected = location.pathname.startsWith(from)
      ? `${to}${location.pathname.slice(from.length)}`
      : to;

    navigate(`${corrected}${location.search}`, {
      replace: true,
      state: location.state,
    });
  }, [
    canonicalProjectId,
    location.pathname,
    location.search,
    location.state,
    navigate,
    projectMismatch,
    urlProjectId,
  ]);

  return {
    workspace,
    isLoading,
    isError,
    canonicalProjectId,
    projectId,
    projectMismatch,
    isResolving,
    queriesEnabled: !projectMismatch && !isResolving && !!tenantId && !!projectId,
  };
}
