import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { appColors } from '@/design-system/tokens/colors';
import { useDashboard } from '@/modules/business/features/dashboard/use-dashboard';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';

export function DashboardPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { data, isLoading, isError, isFetching } = useDashboard();

  if (isLoading && !data) {
    return (
      <CrmPageShell>
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </CrmPageShell>
    );
  }

  if (isError) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('dashboard.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const stats = [
    { key: 'products', value: data?.products ?? 0, href: path('/products') },
    { key: 'clients', value: data?.clients ?? 0, href: path('/clients') },
    { key: 'testimonials', value: data?.testimonials ?? 0, href: path('/testimonials') },
    { key: 'costs', value: data?.costs ?? 0, href: path('/costs') },
  ] as const;

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.dashboard')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/admin/tenants' },
                { label: t('pages.dashboard') },
              ]
            : undefined
        }
      />

      {isFetching && (
        <p className="text-xs text-muted-foreground">{t('dashboard.refreshing')}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ key, value, href }, index) => (
          <Card
            key={key}
            className={appColors.dashboard.metricCard}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardHeader className="pb-2">
              <CardTitle className={appColors.dashboard.metricLabel}>
                {t(`dashboard.stats.${key}`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className={appColors.dashboard.metricValue}>{value}</p>
              <Button variant="ghost" size="sm" asChild>
                <Link to={href}>{t('common.edit')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.stats.publish')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Badge variant={data?.hasUnpublishedChanges ? 'default' : 'secondary'}>
            {data?.hasUnpublishedChanges
              ? t('publish.status.pending')
              : t('publish.status.upToDate')}
          </Badge>
          {data?.lastPublishedAt && (
            <p className="text-sm text-muted-foreground">
              {t('publish.status.lastPublished')}:{' '}
              {new Date(data.lastPublishedAt).toLocaleString()}
            </p>
          )}
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <Link to={path('/publish')}>{t('pages.publish')}</Link>
          </Button>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
