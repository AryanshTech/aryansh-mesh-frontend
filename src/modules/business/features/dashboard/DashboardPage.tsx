import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';
import { layout } from '@/design-system/tokens/layout';
import { usePermissions } from '@/core/permissions/use-permissions';
import { DashboardActivityFeed } from '@/modules/business/features/dashboard/DashboardActivityFeed';
import { DashboardInsightCard } from '@/modules/business/features/dashboard/DashboardInsightCard';
import { DashboardPublishWidget } from '@/modules/business/features/dashboard/DashboardPublishWidget';
import { DashboardSelectBusiness } from '@/modules/business/features/dashboard/DashboardSelectBusiness';
import { DashboardStatGrid } from '@/modules/business/features/dashboard/DashboardStatGrid';
import { DashboardWelcomeHeader } from '@/modules/business/features/dashboard/DashboardWelcomeHeader';
import { useDashboardActivity } from '@/modules/business/features/dashboard/use-dashboard-activity';
import { useDashboard } from '@/modules/business/features/dashboard/use-dashboard';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { LinearFab } from '@/shared/components/linear';
import { cn } from '@/design-system/lib/utils';
import { BarChart3 } from 'lucide-react';

export function DashboardPage() {
  const { t } = useTranslation();
  const { hasTenantContext, path } = useTenantScope();
  const { isPlatformOperator } = usePermissions();
  const { data, isLoading, isError, isFetching } = useDashboard();
  const activity = useDashboardActivity();

  if (!hasTenantContext) {
    return (
      <CrmPageShell>
        {isPlatformOperator ? (
          <DashboardSelectBusiness />
        ) : (
          <Alert variant="destructive">
            <AlertTitle>{t('dashboard.missingTenant.title')}</AlertTitle>
            <AlertDescription>{t('dashboard.missingTenant.description')}</AlertDescription>
          </Alert>
        )}
      </CrmPageShell>
    );
  }

  if (isLoading && !data) {
    return (
      <CrmPageShell>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-lg lg:col-span-2" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </CrmPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('dashboard.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  return (
    <CrmPageShell>
      <DashboardWelcomeHeader hasLiveSignals={data.hasUnpublishedChanges} />

      {isFetching ? (
        <p className={typographyClasses.caption}>{t('dashboard.refreshing')}</p>
      ) : null}

      <DashboardStatGrid stats={data} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardActivityFeed
            items={activity.items}
            isLoading={activity.isLoading}
            viewAllHref={path('/clients')}
          />
        </div>
        <div className="space-y-6">
          <DashboardPublishWidget stats={data} publishPath={path('/publish')} />
          <DashboardInsightCard
            stats={data}
            publishPath={path('/publish')}
            productsPath={path('/products')}
            clientsPath={path('/clients')}
          />
        </div>
      </div>

      <section className={cn(layout.linear.hairlineCard, 'p-12 text-center')}>
        <div className="mx-auto max-w-md">
          <BarChart3 className="mx-auto mb-4 size-8 text-muted-foreground" />
          <h3 className={cn('mb-2', typographyClasses.subhead, 'text-foreground')}>
            {t('linear.dashboard.visualizationTitle')}
          </h3>
          <p className={mutedBodySm}>{t('linear.dashboard.visualizationDescription')}</p>
        </div>
      </section>

      <LinearFab ariaLabel={t('linear.dashboard.fabLabel')} />
    </CrmPageShell>
  );
}
