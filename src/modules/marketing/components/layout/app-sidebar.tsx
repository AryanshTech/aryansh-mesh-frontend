import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Building2Icon,
  CalendarIcon,
  ChevronRightIcon,
  EyeIcon,
  FileTextIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  PaletteIcon,
  PenLineIcon,
  UsersIcon,
} from 'lucide-react';
import { useAuth } from '@/core/auth/auth-context';
import { useLocale } from '@/modules/marketing/contexts/locale-context';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { UserNav } from '@/modules/marketing/components/layout/user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/design-system/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design-system/components/ui/collapsible';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { companyDisplayName, companyDisplayTitle } from '@/modules/marketing/hooks/company-display';
import { ProductSwitcher } from '@/shell/ProductSwitcher';
import { useEffect } from 'react';

const GTM_NAV = [
  { key: 'studio', path: 'studio', icon: FolderKanbanIcon },
  { key: 'dashboard', path: '', icon: LayoutDashboardIcon },
  { key: 'onboarding', path: 'onboarding', icon: PenLineIcon },
  { key: 'spy', path: 'spy', icon: EyeIcon },
  { key: 'brandMemory', path: 'brand-memory', icon: FileTextIcon },
  { key: 'content', path: 'content', icon: MessageSquareIcon },
  { key: 'creative', path: 'creative', icon: PaletteIcon },
  { key: 'social', path: 'social', icon: CalendarIcon },
  { key: 'crm', path: 'crm', icon: UsersIcon },
] as const;

export function MarketingAppSidebar() {
  const { pathname } = useLocation();
  const { companyId, projectId } = useParams();
  const { isAdmin } = useAuth();
  const { t } = useLocale();
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

  const inProject = Boolean(projectId);
  const projectBase = projectId ? `/marketing/projects/${projectId}` : '';

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <ProductSwitcher />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/marketing">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboardIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('app.name')}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t('app.tagline')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.workspace')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/marketing'}>
                  <Link to="/marketing">
                    <LayoutDashboardIcon />
                    <span>{t('nav.agencyOverview')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/marketing/companies'}>
                  <Link to="/marketing/companies">
                    <Building2Icon />
                    <span>{t('nav.companies')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <Skeleton className="mx-2 h-8 w-full" />
                    </SidebarMenuItem>
                  ))
                : companies.map((company) => {
                    const isExpanded = expandedCompanies.has(company.companyId);
                    const projects = projectsByCompany[company.companyId] ?? [];
                    const isCompanyActive = companyId === company.companyId;

                    return (
                      <Collapsible
                        key={company.companyId}
                        open={isExpanded}
                        onOpenChange={() => toggleCompany(company.companyId)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={isCompanyActive && !projectId}
                            >
                              <ChevronRightIcon
                                className={`transition-transform duration-200 ease-[var(--ease-out)] ${isExpanded ? 'rotate-90' : ''}`}
                              />
                              <span
                                className="truncate"
                                title={companyDisplayTitle(company)}
                              >
                                {companyDisplayName(company)}
                              </span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link to={`/marketing/companies/${company.companyId}`}>
                                    <FolderKanbanIcon />
                                    <span>{t('breadcrumb.projects')}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              {projects.map((project) => (
                                <SidebarMenuSubItem key={project.projectId}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={
                                      projectId === project.projectId &&
                                      !pathname.includes('/workspace')
                                    }
                                  >
                                    <Link to={`/marketing/projects/${project.projectId}`}>
                                      <span className="truncate">
                                        {project.name}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {inProject && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('nav.gtmModules')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {GTM_NAV.map(({ key, path, icon: Icon }) => {
                  const href = path ? `${projectBase}/${path}` : projectBase;
                  const isActive =
                    path === ''
                      ? pathname === projectBase
                      : pathname.startsWith(`${projectBase}/${path}`);
                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={href}>
                          <Icon />
                          <span>{t(`nav.${key}`)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('nav.administration')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/marketing/admin')}
                  >
                    <Link to="/marketing/admin/users">
                      <UsersIcon />
                      <span>{t('nav.users')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
