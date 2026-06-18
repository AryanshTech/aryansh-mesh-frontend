import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { useTenant } from '@/modules/business/features/admin/use-tenants';

export function TenantWorkspaceBanner() {
  const { tenantId = '' } = useParams();
  const { t } = useTranslation();
  const { data: tenant } = useTenant(tenantId);

  if (!tenant) {
    return null;
  }

  return (
    <Alert>
      <AlertTitle>{t('admin.tenants.detail.managingTenant', { name: tenant.name })}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-2">
        <span>{t('admin.tenants.detail.managingTenantHint')}</span>
        <Button variant="link" className="h-auto p-0" asChild>
          <Link to={`/business/admin/tenants/${tenantId}`}>{t('admin.tenants.detail.backToTenant')}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
