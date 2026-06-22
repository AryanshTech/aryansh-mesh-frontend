import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Command, LayersIcon, Bell, Settings } from 'lucide-react';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design-system/components/ui/collapsible';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { companyDisplayName } from '@/modules/marketing/hooks/company-display';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import {
  buildProjectNavPath,
  type NavItemDef,
  type NavSectionDef,
} from '@/shell/navigation';
import { useFilteredNavSections } from '@/shell/use-filtered-nav';
import { useShellNavContext } from '@/shell/use-shell-nav-context';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useProductZone } from '@/shell/use-product-zone';
import { ProductSwitcher } from '@/shell/ProductSwitcher';
import { AdminHubNav } from '@/shell/sidebar/AdminHubNav';
import { BusinessWorkspaceNav } from '@/shell/sidebar/BusinessWorkspaceNav';
import { MarketingCompanyNav } from '@/shell/sidebar/MarketingContextNav';
import { MarketingProjectNav } from '@/shell/sidebar/MarketingProjectNav';
import { SidebarContextHeader } from '@/shell/sidebar/SidebarContextHeader';
import { WorkspaceNavLink } from '@/shell/sidebar/WorkspaceNavLink';
import { recordRecentCompany } from '@/shell/recent-workspaces';

const SIDEBAR_STORAGE_KEY = 'aryansh_mesh_sidebar_collapsed';

type ShellSidebarProps = {
  isCollapsed: boolean;
  forceExpanded?: boolean;
  hideBrand?: boolean;
  onNavigate?: () => void;
  onOpenCommand?: () => void;
  className?: string;
};

function NavLinkItem({
  item,
  isCollapsed,
  currentPath,
  basePath = '',
  onNavigate,
}: {
  item: NavItemDef;
  isCollapsed: boolean;
  currentPath: string;
  basePath?: string;
  onNavigate?: () => void;
}) {
  return (
    <WorkspaceNavLink
      item={item}
      basePath={basePath}
      currentPath={currentPath}
      isCollapsed={isCollapsed}
      onNavigate={onNavigate}
    />
  );
}

function MarketingTree({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { companyId, projectId } = useShellNavContext();
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

  if (!canAccessMarketing) return null;

  const projectBase = projectId ? `/marketing/projects/${projectId}` : '';

  if (isCollapsed && projectId) {
    return (
      <div className="mt-2 flex flex-col gap-0.5 border-t border-border pt-2">
        <MarketingProjectNav
          basePath={projectBase}
          currentPath={pathname}
          isCollapsed
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 pl-1">
      {!isCollapsed ? (
        <Button variant="ghost" asChild className="h-auto justify-start rounded-sm px-2 py-1.5 text-xs text-primary">
          <Link to="/marketing/companies" onClick={onNavigate}>
            {t('nav.companies')}
          </Link>
        </Button>
      ) : null}

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
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-1 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight
                    className={cn('size-3.5 shrink-0 transition-transform', isExpanded && 'rotate-90')}
                  />
                  <span className="truncate">{companyDisplayName(company)}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-0.5 pl-4">
                <Button variant="ghost" asChild className="h-auto justify-start rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Link
                    to={`/marketing/companies/${company.companyId}`}
                    onClick={() => {
                      recordRecentCompany({
                        id: company.companyId,
                        name: companyDisplayName(company),
                      });
                      onNavigate?.();
                    }}
                    className={cn(
                      pathname === `/marketing/companies/${company.companyId}` && layout.sidebar.itemActive,
                    )}
                  >
                    {t('nav.projects')}
                  </Link>
                </Button>
                {projects.map((project) => (
                  <Button
                    key={project.projectId}
                    variant="ghost"
                    asChild
                    className="h-auto justify-start rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Link
                      to={buildProjectNavPath(project.projectId, '')}
                      onClick={onNavigate}
                      className={cn(
                        'truncate',
                        projectId === project.projectId && layout.sidebar.itemActive,
                      )}
                    >
                      {project.name}
                    </Link>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}

      {projectId ? (
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
          {!isCollapsed ? (
            <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1')}>{t('nav.sections.project')}</p>
          ) : null}
          <MarketingProjectNav
            basePath={projectBase}
            currentPath={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </div>
      ) : null}
    </div>
  );
}

function NavSection({
  section,
  isCollapsed,
  currentPath,
  onNavigate,
}: {
  section: NavSectionDef;
  isCollapsed: boolean;
  currentPath: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-0.5">
      {!isCollapsed ? (
        <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1.5')}>{t(section.labelKey)}</p>
      ) : null}
      {section.items.map((item) => (
        <NavLinkItem
          key={item.id}
          item={item}
          isCollapsed={isCollapsed}
          currentPath={currentPath}
          onNavigate={onNavigate}
        />
      ))}
      {section.id === 'marketing' ? (
        <MarketingTree isCollapsed={isCollapsed} onNavigate={onNavigate} />
      ) : null}
    </div>
  );
}

function DefaultSidebarNav({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const sections = useFilteredNavSections();

  return (
    <nav className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-linear">
      {sections.map((section) => (
        <NavSection
          key={section.id}
          section={section}
          isCollapsed={isCollapsed}
          currentPath={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function ContextSidebarNav({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const {
    mode,
    workspaceTenantId,
    workspaceBase,
    projectId,
    companyId,
    pathname,
  } = useShellNavContext();
  const { data: tenant } = useTenant(workspaceTenantId ?? '');
  const {
    companies,
    getProjectName,
    getCompanyName,
    getProjectCompanyId,
    expandCompany,
  } = useSidebarNavContext();

  useEffect(() => {
    if (companyId) expandCompany(companyId);
    if (projectId) {
      const resolved = getProjectCompanyId(projectId);
      if (resolved) expandCompany(resolved);
    }
  }, [companyId, projectId, expandCompany, getProjectCompanyId]);

  if (mode === 'business-workspace' && workspaceBase && workspaceTenantId) {
    return (
      <>
        <SidebarContextHeader
          backTo="/admin/tenants"
          backLabelKey="shell.adminHub.backToBusinesses"
          title={tenant?.name ?? t('shell.adminHub.loadingBusiness')}
          subtitle={t('shell.adminHub.businessWorkspace')}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-linear">
          <BusinessWorkspaceNav
            basePath={workspaceBase}
            currentPath={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </nav>
      </>
    );
  }

  if (mode === 'marketing-project' && projectId) {
    const resolvedCompanyId = companyId ?? getProjectCompanyId(projectId) ?? '';
    const projectName = getProjectName(projectId) ?? t('shell.adminHub.loadingProject');
    const companyLabel = resolvedCompanyId ? getCompanyName(resolvedCompanyId) : undefined;

    return (
      <>
        <SidebarContextHeader
          backTo={resolvedCompanyId ? `/marketing/companies/${resolvedCompanyId}` : '/marketing/companies'}
          backLabelKey="shell.adminHub.backToCompanyProjects"
          title={projectName}
          subtitle={companyLabel}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-linear">
          <MarketingCompanyNav
            companyId={resolvedCompanyId}
            projectId={projectId}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </nav>
      </>
    );
  }

  if (mode === 'marketing-company' && companyId) {
    const company = companies.find((c) => c.companyId === companyId);

    return (
      <>
        <SidebarContextHeader
          backTo="/marketing/companies"
          backLabelKey="shell.adminHub.backToAgency"
          title={company ? companyDisplayName(company) : t('shell.adminHub.loadingCompany')}
          subtitle={t('shell.adminHub.marketingCompany')}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-linear">
          <MarketingCompanyNav
            companyId={companyId}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </nav>
      </>
    );
  }

  return null;
}

export function ShellSidebar({
  isCollapsed,
  forceExpanded = false,
  hideBrand = false,
  onNavigate,
  onOpenCommand,
  className,
}: ShellSidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { mode, isPlatformOperator } = useShellNavContext();
  const { zoneLabelKey, showProductSwitcher } = useProductZone();
  const c = layout.sidebar;
  const navCollapsed = forceExpanded ? false : isCollapsed;
  const homePath = isPlatformOperator ? '/admin/tenants' : '/dashboard';
  const useContextNav =
    mode === 'business-workspace' ||
    mode === 'marketing-project' ||
    mode === 'marketing-company';

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col',
        c.container,
        navCollapsed ? 'w-[68px] px-2 py-4' : 'w-60 px-3 py-6',
        className,
      )}
    >
      {!hideBrand ? (
        <Link
          to={homePath}
          onClick={onNavigate}
          className={cn(
            'mb-2 flex items-center gap-2 rounded-md px-2 py-2 font-semibold text-foreground hover:bg-muted',
            navCollapsed && 'justify-center',
          )}
          title={navCollapsed ? t('nav.appName') : undefined}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <LayersIcon className="size-4" aria-hidden />
          </span>
          {!navCollapsed ? (
            <div className="min-w-0">
              <span className={cn('block truncate', typographyClasses.button, 'text-foreground')}>{t('nav.appName')}</span>
              <span className={c.brandSubtitle}>{t(zoneLabelKey)}</span>
            </div>
          ) : null}
        </Link>
      ) : null}

      {showProductSwitcher && !hideBrand ? <ProductSwitcher isCollapsed={navCollapsed} /> : null}

      {isPlatformOperator && !useContextNav ? (
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-linear">
          <AdminHubNav
            isCollapsed={navCollapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        </nav>
      ) : null}

      {isPlatformOperator && useContextNav ? (
        <ContextSidebarNav isCollapsed={navCollapsed} onNavigate={onNavigate} />
      ) : null}

      {!isPlatformOperator ? (
        <DefaultSidebarNav isCollapsed={navCollapsed} onNavigate={onNavigate} />
      ) : null}

      <footer className={c.footer}>
        {onOpenCommand ? (
          <Button
            type="button"
            variant="outline"
            className={cn(
              'glass-card mb-2 h-9 w-full justify-start gap-2 text-muted-foreground hover:text-foreground',
              navCollapsed && 'justify-center px-2',
            )}
            onClick={onOpenCommand}
            aria-label={t('shell.commandPalette.open')}
          >
            <Command className="size-4 shrink-0" />
            {!navCollapsed ? (
              <>
                <span className={cn('flex-1 truncate text-left', typographyClasses.bodySm)}>
                  {t('shell.commandPalette.placeholder')}
                </span>
                <kbd className={cn('hidden rounded border border-border bg-muted px-1.5 py-0.5 sm:inline', typographyClasses.mono)}>
                  ⌘K
                </kbd>
              </>
            ) : null}
          </Button>
        ) : null}
        <div className={cn('flex flex-col gap-0.5 px-2', navCollapsed && 'items-center')}>
          <Button
            type="button"
            variant="ghost"
            className={cn('h-8 w-full justify-start gap-2 text-muted-foreground', navCollapsed && 'size-8 justify-center px-0')}
            aria-label={t('nav.sections.settings')}
          >
            <Settings className="size-4 shrink-0" />
            {!navCollapsed ? <span className={typographyClasses.bodySm}>{t('nav.sections.settings')}</span> : null}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn('h-8 w-full justify-start gap-2 text-muted-foreground', navCollapsed && 'size-8 justify-center px-0')}
            aria-label={t('shell.notifications')}
          >
            <Bell className="size-4 shrink-0" />
            {!navCollapsed ? <span className={typographyClasses.bodySm}>{t('shell.notifications')}</span> : null}
          </Button>
        </div>
        <p className={cn('px-2 text-xs text-muted-foreground', navCollapsed && 'sr-only')}>
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
