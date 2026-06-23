import { useTranslation } from 'react-i18next';
import { useDashboard } from '@/modules/business/api/hooks/use-dashboard';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Card } from '@/design-system/components/ui/card';
import { Package, Users, Calendar, Sparkles, MessageSquare, Receipt } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  return (
    <PageShell>
      <PageHeader title={t('dashboard.title')} description={t('dashboard.subtitle')} />

      {showSkeleton ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState
          title={t('dashboard.errorTitle')}
          message={t('dashboard.errorMessage')}
          onRetry={() => void refetch()}
        />
      ) : !data ? (
        <EmptyState
          icon={<Sparkles />}
          title={t('dashboard.emptyTitle')}
          description={t('dashboard.emptyDescription')}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              label={t('nav.products')}
              value={data.productCount}
              icon={<Package className="size-4" />}
            />
            <StatCard
              label={t('nav.clients')}
              value={data.clientCount}
              icon={<Users className="size-4" />}
            />
            <StatCard
              label={t('nav.bookings')}
              value={data.bookingCount}
              icon={<Calendar className="size-4" />}
              accent
            />
            <StatCard
              label={t('nav.testimonials')}
              value={data.testimonialCount}
              icon={<MessageSquare className="size-4" />}
            />
            <StatCard
              label={t('nav.costs')}
              value={data.costCount}
              icon={<Receipt className="size-4" />}
            />
            <StatCard
              label={t('dashboard.publishStatus')}
              value={data.publishStatus}
              icon={<Sparkles className="size-4" />}
            />
          </div>

          <Card className="p-0 overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="typo-card-title text-foreground">
                {t('dashboard.recentActivity')}
              </h2>
            </header>
            {data.recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="typo-body-sm text-muted-foreground">
                  {t('dashboard.noActivity')}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="grid size-7 place-items-center rounded-full bg-muted typo-eyebrow-upper text-muted-foreground">
                      {item.type.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate typo-body-sm text-foreground">
                        {item.title}
                      </p>
                      <p className="typo-eyebrow text-faint">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3 p-5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-2 w-1/4" />
          </Card>
        ))}
      </div>
      <Card className="p-0">
        <div className="border-b border-border px-5 py-3">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="px-5 py-10">
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5 shadow-whisper">
      <div className="flex items-center justify-between">
        <span className="typo-eyebrow-upper text-faint">{label}</span>
        <span className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
      </div>
      <div
        className={`typo-display-lg ${accent ? 'text-primary' : 'text-foreground'} tracking-tight`}
      >
        {value}
      </div>
    </Card>
  );
}
