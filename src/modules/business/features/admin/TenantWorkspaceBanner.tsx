import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
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
    <Alert className="border-primary/20 bg-primary/5 sm:flex-row sm:items-center sm:justify-between">
      <Shield className="size-4 text-primary" />
      <div className="min-w-0 flex-1 space-y-1">
        <AlertTitle className="flex flex-wrap items-center gap-2">
          {t('admin.tenants.detail.managingTenant', { name: tenant.name })}
          <Badge variant="secondary">{t('admin.tenants.detail.managingShort')}</Badge>
        </AlertTitle>
        <AlertDescription>{t('admin.tenants.detail.managingTenantHint')}</AlertDescription>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" asChild>
        <Link to={`/admin/tenants/${tenantId}`}>
          <ArrowLeft className="size-4" />
          {t('admin.tenants.detail.backToTenant')}
        </Link>
      </Button>
    </Alert>
  );
}
