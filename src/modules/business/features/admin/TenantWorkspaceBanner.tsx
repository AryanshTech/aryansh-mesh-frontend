import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
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
    <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Shield className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">
              {t('admin.tenants.detail.managingTenant', { name: tenant.name })}
            </p>
            <Badge variant="secondary">{t('admin.tenants.detail.managingShort')}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('admin.tenants.detail.managingTenantHint')}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" asChild>
        <Link to={`/admin/tenants/${tenantId}`}>
          <ArrowLeft className="size-4" />
          {t('admin.tenants.detail.backToTenant')}
        </Link>
      </Button>
    </div>
  );
}
