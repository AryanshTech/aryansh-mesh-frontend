import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { appColors } from '@/design-system/tokens/colors';
import { cn } from '@/design-system/lib/utils';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design-system/components/ui/collapsible';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { companyDisplayName } from '@/modules/marketing/hooks/company-display';
import {
  buildProjectNavPath,
  isNavItemActive,
  MARKETING_PROJECT_NAV,
  type NavItemDef,
  type NavSectionDef,
} from '@/shell/navigation';
import { useFilteredNavSections } from '@/shell/use-filtered-nav';
import { usePermissions } from '@/core/permissions/use-permissions';

const SIDEBAR_STORAGE_KEY = 'aryansh_mesh_sidebar_collapsed';

type ShellSidebarProps = {
  isCollapsed: boolean;
};

function NavLinkItem({
  item,
  isCollapsed,
  currentPath,
  basePath = '',
}: {
  item: NavItemDef;
  isCollapsed: boolean;
  currentPath: string;
  basePath?: string;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const href = basePath
    ? item.path
      ? `${basePath}/${item.path.replace(/^\//, '')}`
      : basePath
    : item.path;
  const isActive = isNavItemActive(currentPath, item, basePath);
  const c = appColors.sidebar;
  const label = t(item.labelKey);

  return (
    <Link
      to={href}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? label : undefined}
      className={cn(
        'group relative flex items-center rounded-md border border-transparent px-2 py-2 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-focus/50',
        isActive ? c.itemActive : c.item,
        isCollapsed && 'justify-center px-2',
      )}
    >
      {isActive && !isCollapsed ? (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
      ) : null}
      <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
        <Icon
          className={cn(
            'size-4 shrink-0',
            isActive ? 'text-primary' : 'text-ink-subtle group-hover:text-ink',
          )}
        />
        {!isCollapsed ? (
          <span className={cn('text-sm font-medium', isActive && 'text-primary')}>{label}</span>
        ) : null}
      </div>
    </Link>
  );
}

function MarketingTree({ isCollapsed }: { isCollapsed: boolean }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { companyId, projectId } = useParams();
  const { canAccessMarketing } = usePermissions();
  const {
    companies,
    projectsByCompany,
    expandedCompanies,
    loading,
    toggleCompany,
    expandCompany,
    getProjectCompanyId,
  } = useSidebarNavContext();

  useEffect(() => {
    if (companyId) expandCompany(companyId);
  }, [companyId, expandCompany]);

  useEffect(() => {
    if (projectId) {
      const pid = getProjectCompanyId(projectId);
      if (pid) expandCompany(pid);
    }
  }, [projectId, getProjectCompanyId, expandCompany]);

  if (!canAccessMarketing || isCollapsed) return null;

  const projectBase = projectId ? `/marketing/projects/${projectId}` : '';

  return (
    <div className="flex flex-col gap-1 pl-1">
      {loading ? (
        <Skeleton className="mx-2 h-8 rounded-md" />
      ) : (
        companies.map((company) => {
          const isExpanded = expandedCompanies.has(company.companyId);
          const projects = projectsByCompany[company.companyId] ?? [];
          return (
            <Collapsible
              key={company.companyId}
              open={isExpanded}
              onOpenChange={() => toggleCompany(company.companyId)}
            >
              <CollapsibleTrigger className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm text-ink-subtle hover:bg-surface-1 hover:text-ink">
                <ChevronRight
                  className={cn('size-3.5 shrink-0 transition-transform', isExpanded && 'rotate-90')}
                />
                <span className="truncate">{companyDisplayName(company)}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-0.5 pl-4">
                <Link
                  to={`/marketing/companies/${company.companyId}`}
                  className={cn(
                    'rounded-md px-2 py-1.5 text-xs text-ink-subtle hover:bg-surface-1 hover:text-ink',
                    pathname === `/marketing/companies/${company.companyId}` && 'bg-primary/10 text-primary',
                  )}
                >
                  {t('nav.projects')}
                </Link>
                {projects.map((project) => (
                  <Link
                    key={project.projectId}
                    to={buildProjectNavPath(project.projectId, '')}
                    className={cn(
                      'truncate rounded-md px-2 py-1.5 text-xs text-ink-subtle hover:bg-surface-1 hover:text-ink',
                      projectId === project.projectId && 'bg-primary/10 text-primary',
                    )}
                  >
                    {project.name}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}

      {projectId ? (
        <div className="mt-2 flex flex-col gap-0.5 border-t border-hairline pt-2">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">
            {t('nav.sections.project')}
          </p>
          {MARKETING_PROJECT_NAV.map((item) => (
            <NavLinkItem
              key={item.id}
              item={item}
              isCollapsed={false}
              currentPath={pathname}
              basePath={projectBase}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavSection({
  section,
  isCollapsed,
  currentPath,
}: {
  section: NavSectionDef;
  isCollapsed: boolean;
  currentPath: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-0.5">
      {!isCollapsed ? (
        <p className={cn(appColors.sidebar.sectionLabel, 'px-2 py-1.5')}>{t(section.labelKey)}</p>
      ) : null}
      {section.items.map((item) => (
        <NavLinkItem key={item.id} item={item} isCollapsed={isCollapsed} currentPath={currentPath} />
      ))}
      {section.id === 'marketing' ? <MarketingTree isCollapsed={isCollapsed} /> : null}
    </div>
  );
}

export function ShellSidebar({ isCollapsed }: ShellSidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const sections = useFilteredNavSections();
  const c = appColors.sidebar;

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col',
        c.container,
        isCollapsed ? 'w-[68px] px-2 py-4' : 'w-[228px] px-3 py-4',
      )}
    >
      <Link
        to="/dashboard"
        className={cn(
          'mb-4 flex items-center gap-2 rounded-md px-2 py-2 font-semibold text-ink hover:bg-surface-1',
          isCollapsed && 'justify-center',
        )}
        title={t('nav.appName')}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
          A
        </span>
        {!isCollapsed ? <span className="truncate text-sm">{t('nav.appName')}</span> : null}
      </Link>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {sections.map((section) => (
          <NavSection
            key={section.id}
            section={section}
            isCollapsed={isCollapsed}
            currentPath={pathname}
          />
        ))}
      </nav>

      <footer className={c.footer}>
        <p className={cn('px-2 text-xs text-ink-subtle', isCollapsed && 'sr-only')}>
          {t('shell.footerCopyright', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </aside>
  );
}

export function readSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
}
