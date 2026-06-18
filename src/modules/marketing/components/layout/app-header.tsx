import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { t } from '@/core/i18n';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/design-system/components/ui/breadcrumb';
import { Separator } from '@/design-system/components/ui/separator';
import { SidebarTrigger } from '@/design-system/components/ui/sidebar';

interface AppHeaderProps {
  actions?: ReactNode;
}

export function AppHeader({ actions }: AppHeaderProps) {
  const { companyId: routeCompanyId, projectId } = useParams();
  const { getCompanyName, getProjectName, getProjectCompanyId } =
    useSidebarNavContext();

  const companyId = routeCompanyId ?? (projectId ? getProjectCompanyId(projectId) : undefined);
  const companyName = companyId ? getCompanyName(companyId) : undefined;
  const projectName = projectId ? getProjectName(projectId) : undefined;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('nav.agencyOverview')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {(companyId || projectId) && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {companyId ? (
                  projectId ? (
                    <BreadcrumbLink asChild>
                      <Link to={`/marketing/companies/${companyId}`}>
                        {companyName ?? t('nav.companies')}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>
                      {companyName ?? t('nav.companies')}
                    </BreadcrumbPage>
                  )
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to="/marketing/companies">{t('nav.companies')}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )}
          {projectId && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {projectName ?? t('nav.dashboard')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}
