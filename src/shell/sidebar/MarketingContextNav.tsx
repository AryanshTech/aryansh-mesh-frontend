import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { companyDisplayName } from '@/modules/marketing/hooks/company-display';
import {
  buildProjectNavPath,
  isNavItemActive,
  MARKETING_PROJECT_NAV,
  type NavItemDef,
} from '@/shell/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';

function ProjectNavLink({
  item,
  basePath,
  currentPath,
  isCollapsed,
  onNavigate,
}: {
  item: NavItemDef;
  basePath: string;
  currentPath: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const isActive = isNavItemActive(currentPath, item, basePath);
  const c = layout.sidebar;
  const label = t(item.labelKey);
  const href = item.path ? `${basePath}/${item.path}` : basePath;

  const linkButton = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        'group relative h-auto min-h-10 w-full justify-start rounded-md border border-transparent px-2 py-2',
        isActive ? (isCollapsed ? c.itemActiveCollapsed : c.itemActive) : c.item,
        isCollapsed && 'justify-center px-2',
      )}
    >
      <Link
        to={href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? label : undefined}
        onClick={onNavigate}
      >
        {isActive && !isCollapsed ? (
          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
        ) : null}
        <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
          <Icon
            className={cn(
              'size-4 shrink-0',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
            )}
          />
          {!isCollapsed ? (
            <span className={cn('text-sm font-medium', isActive && 'text-primary')}>{label}</span>
          ) : null}
        </div>
      </Link>
    </Button>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkButton}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkButton;
}

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
      <div className="flex flex-col gap-0.5">
        {!isCollapsed ? (
          <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1.5')}>
            {t('nav.sections.project')}
          </p>
        ) : null}
        {MARKETING_PROJECT_NAV.map((item) => (
          <ProjectNavLink
            key={item.id}
            item={item}
            basePath={projectBase}
            currentPath={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
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
