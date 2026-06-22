import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useTenants } from '@/modules/business/features/admin/use-tenants';
import { getRecentTenantPath, readRecentTenants } from '@/shell/recent-workspaces';

export function DashboardSelectBusiness() {
  const { t } = useTranslation();
  const { data, isLoading } = useTenants(0, 100);
  const recentTenants = readRecentTenants();
  const tenantNameById = new Map((data?.items ?? []).map((tenant) => [tenant.id, tenant.name]));

  const recentEntries = recentTenants.map((entry) => ({
    id: entry.id,
    name: tenantNameById.get(entry.id) ?? entry.name,
    path: getRecentTenantPath(entry.id),
  }));

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-card" />;
  }

  return (
    <Empty className="rounded-card border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Building2 className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{t('dashboard.selectBusiness.title')}</EmptyTitle>
        <EmptyDescription>{t('dashboard.selectBusiness.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex flex-col items-center gap-3">
        {recentEntries.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {recentEntries.map((tenant) => (
              <Button key={tenant.id} variant="outline" size="sm" asChild>
                <Link to={tenant.path}>{tenant.name}</Link>
              </Button>
            ))}
          </div>
        ) : null}
        <Button asChild>
          <Link to="/admin/tenants">{t('shell.adminHub.viewAllBusinesses')}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
