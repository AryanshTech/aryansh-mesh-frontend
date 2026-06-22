import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { useShellNavContext } from '@/shell/use-shell-nav-context';

export function useShellNavHint(): string | undefined {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { mode, workspaceTenantId, projectId, companyId } = useShellNavContext();
  const { data: tenant } = useTenant(workspaceTenantId ?? '');
  const { getProjectName, getCompanyName } = useSidebarNavContext();

  return useMemo(() => {
    if (mode === 'business-workspace' && tenant?.name) {
      return t('shell.contextHint.workspaceNamed', { name: tenant.name });
    }
    if (mode === 'marketing-project' && projectId) {
      const projectName = getProjectName(projectId);
      if (projectName) {
        return t('shell.contextHint.projectNamed', { name: projectName });
      }
    }
    if (mode === 'marketing-company' && companyId) {
      const companyName = getCompanyName(companyId);
      if (companyName) {
        return t('shell.contextHint.companyNamed', { name: companyName });
      }
    }
    if (pathname.startsWith('/admin/tenants') && !pathname.includes('/workspace')) {
      return t('shell.contextHint.platform');
    }
    return undefined;
  }, [mode, tenant?.name, projectId, companyId, getProjectName, getCompanyName, pathname, t]);
}
