import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { companyDisplayName } from '@/modules/marketing/hooks/company-display';
import { buildProjectNavPath } from '@/shell/navigation';
import { MarketingProjectNav } from '@/shell/sidebar/MarketingProjectNav';

type MarketingCompanyNavProps = {
  companyId: string;
  projectId?: string | null;
  pathname: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export function MarketingCompanyNav({
  companyId,
  projectId,
  pathname,
  isCollapsed,
  onNavigate,
}: MarketingCompanyNavProps) {
  const { t } = useTranslation();
  const {
    companies,
    projectsByCompany,
    loading,
    expandCompany,
  } = useSidebarNavContext();

  useEffect(() => {
    expandCompany(companyId);
  }, [companyId, expandCompany]);

  const company = companies.find((c) => c.companyId === companyId);
  const projects = projectsByCompany[companyId] ?? [];
  const projectBase = projectId ? `/marketing/projects/${projectId}` : '';

  if (projectId) {
    return (
      <MarketingProjectNav
        basePath={projectBase}
        currentPath={pathname}
        isCollapsed={isCollapsed}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {!isCollapsed ? (
        <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1.5')}>{t('nav.projects')}</p>
      ) : null}
      {loading ? <Skeleton className="mx-2 h-8 rounded-md" /> : null}
      {projects.map((project) => (
        <Button
          key={project.projectId}
          variant="ghost"
          asChild
          className={cn(
            'h-auto min-h-9 w-full justify-start rounded-md px-2 py-2 text-sm',
            pathname.includes(`/marketing/projects/${project.projectId}`)
              ? layout.sidebar.itemActive
              : layout.sidebar.item,
            isCollapsed && 'justify-center px-2',
          )}
          title={isCollapsed ? project.name : undefined}
        >
          <Link to={buildProjectNavPath(project.projectId, '')} onClick={onNavigate}>
            <span className="truncate">{isCollapsed ? project.name.charAt(0) : project.name}</span>
          </Link>
        </Button>
      ))}
      {!loading && projects.length === 0 && !isCollapsed ? (
        <p className="px-2 py-1 text-xs text-muted-foreground">
          {t('shell.adminHub.noProjects', { company: company ? companyDisplayName(company) : '' })}
        </p>
      ) : null}
    </div>
  );
}
