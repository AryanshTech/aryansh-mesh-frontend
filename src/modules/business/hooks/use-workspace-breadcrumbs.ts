import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { BreadcrumbItemConfig } from '@/shared/components/crm/PageHeader';

export function useWorkspaceBreadcrumbs(
  currentLabel: string,
  currentHref?: string,
): BreadcrumbItemConfig[] | undefined {
  const { t } = useTranslation();
  const { isWorkspace, tenantId, basePath } = useTenantScope();
  const { data: tenant } = useTenant(isWorkspace ? tenantId : '');

  return useMemo(() => {
    if (!isWorkspace) return undefined;

    const crumbs: BreadcrumbItemConfig[] = [
      { label: t('shell.adminHub.backToBusinesses'), href: '/admin/tenants' },
    ];

    if (tenant) {
      crumbs.push({ label: tenant.name, href: `${basePath}/dashboard` });
    }

    if (currentHref) {
      crumbs.push({ label: currentLabel, href: currentHref });
    } else {
      crumbs.push({ label: currentLabel });
    }

    return crumbs;
  }, [isWorkspace, tenant, basePath, currentLabel, currentHref, t]);
}
