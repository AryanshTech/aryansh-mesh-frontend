import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenants } from '@/modules/business/features/admin/use-tenants';
import { useSidebarNavContext } from '@/modules/marketing/contexts/sidebar-nav-context';
import { companyDisplayName } from '@/modules/marketing/hooks/company-display';
import { ADMIN_NAV, MARKETING_NAV, SETTINGS_NAV } from '@/shell/navigation';

const HUB_TENANT_PAGE_SIZE = 100;

type AdminHubNavProps = {
  isCollapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
};

function HubSectionLabel({
  label,
  isCollapsed,
}: {
  label: string;
  isCollapsed: boolean;
}) {
  if (isCollapsed) return null;
  return <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1.5')}>{label}</p>;
}

function HubEntityButton({
  to,
  label,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  to: string;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const c = layout.sidebar;

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        'h-auto min-h-9 w-full justify-start rounded-md px-2 py-2 text-sm',
        isActive ? c.itemActive : c.item,
        isCollapsed && 'justify-center px-2',
      )}
      title={isCollapsed ? label : undefined}
    >
      <Link to={to} onClick={onNavigate} aria-current={isActive ? 'page' : undefined}>
        <span className="truncate">{isCollapsed ? label.charAt(0) : label}</span>
      </Link>
    </Button>
  );
}

function HubNavLink({
  path,
  labelKey,
  icon: Icon,
  pathname,
  isCollapsed,
  onNavigate,
}: {
  path: string;
  labelKey: string;
  icon: (typeof ADMIN_NAV)[number]['icon'];
  pathname: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const label = t(labelKey);
  const isActive = pathname === path || pathname.startsWith(`${path}/`);
  const c = layout.sidebar;

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        'h-auto min-h-9 w-full justify-start gap-2 rounded-md px-2 py-2 text-sm',
        isActive ? c.itemActive : c.item,
        isCollapsed && 'justify-center px-2',
      )}
      title={isCollapsed ? label : undefined}
    >
      <Link to={path} onClick={onNavigate} aria-current={isActive ? 'page' : undefined}>
        <Icon className="size-4 shrink-0" />
        {!isCollapsed ? <span className="truncate">{label}</span> : null}
      </Link>
    </Button>
  );
}

export function AdminHubNav({ isCollapsed, pathname, onNavigate }: AdminHubNavProps) {
  const { t } = useTranslation();
  const { canManageTeam } = usePermissions();
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants(0, HUB_TENANT_PAGE_SIZE);
  const { companies, loading: companiesLoading } = useSidebarNavContext();
  const tenants = tenantsData?.items ?? [];

  const activeTenantId = pathname.match(/^\/admin\/tenants\/([^/]+)/)?.[1] ?? null;
  const activeCompanyId = pathname.match(/^\/marketing\/companies\/([^/]+)/)?.[1] ?? null;

  const settingsItems = SETTINGS_NAV.filter(
    (item) => !item.requires?.includes('manage_team') || canManageTeam,
  );

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2 px-2">
          <HubSectionLabel label={t('shell.adminHub.businesses')} isCollapsed={isCollapsed} />
          {!isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              asChild
              title={t('admin.tenants.create')}
            >
              <Link to="/admin/tenants/new" onClick={onNavigate}>
                <Plus className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>
        {!isCollapsed && !tenantsLoading && tenants.length === 0 ? (
          <p className="px-2 py-1 text-xs text-muted-foreground">{t('shell.adminHub.noBusinesses')}</p>
        ) : null}
        {tenantsLoading ? (
          <Skeleton className="mx-2 h-8 rounded-md" />
        ) : (
          tenants.map((tenant) => (
            <HubEntityButton
              key={tenant.id}
              to={`/admin/tenants/${tenant.id}/workspace/dashboard`}
              label={tenant.name}
              isActive={
                activeTenantId === tenant.id &&
                (pathname.includes(`/admin/tenants/${tenant.id}/workspace`) ||
                  pathname === `/admin/tenants/${tenant.id}`)
              }
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ))
        )}
      </section>

      <section className="flex flex-col gap-0.5 border-t border-border pt-3">
        <HubSectionLabel label={t('shell.adminHub.marketing')} isCollapsed={isCollapsed} />
        <HubNavLink
          path="/marketing"
          labelKey="nav.marketingOverview"
          icon={MARKETING_NAV[0]!.icon}
          pathname={pathname}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
        {companiesLoading ? (
          <Skeleton className="mx-2 h-8 rounded-md" />
        ) : (
          companies.map((company) => (
            <HubEntityButton
              key={company.companyId}
              to={`/marketing/companies/${company.companyId}`}
              label={companyDisplayName(company)}
              isActive={activeCompanyId === company.companyId}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ))
        )}
        {!isCollapsed && !companiesLoading && companies.length === 0 ? (
          <p className="px-2 py-1 text-xs text-muted-foreground">{t('shell.adminHub.noCompanies')}</p>
        ) : null}
      </section>

      <section className="flex flex-col gap-0.5 border-t border-border pt-3">
        <HubSectionLabel label={t('nav.sections.admin')} isCollapsed={isCollapsed} />
        {ADMIN_NAV.map((item) => (
          <HubNavLink
            key={item.id}
            path={item.path}
            labelKey={item.labelKey}
            icon={item.icon}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </section>

      <section className="flex flex-col gap-0.5 border-t border-border pt-3">
        <HubSectionLabel label={t('nav.sections.settings')} isCollapsed={isCollapsed} />
        {settingsItems.map((item) => (
          <HubNavLink
            key={item.id}
            path={item.path}
            labelKey={item.labelKey}
            icon={item.icon}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </section>
    </div>
  );
}
