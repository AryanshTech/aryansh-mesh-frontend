import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import { LinearInsightBanner } from '@/shared/components/linear';
import type { DashboardStats } from '@/modules/business/types/tenant-api';

type DashboardInsightCardProps = {
  stats: DashboardStats;
  publishPath: string;
  productsPath: string;
  clientsPath: string;
};

export function DashboardInsightCard({
  stats,
  publishPath,
  productsPath,
  clientsPath,
}: DashboardInsightCardProps) {
  const { t } = useTranslation();

  const isEmpty =
    stats.products === 0 &&
    stats.clients === 0 &&
    stats.testimonials === 0 &&
    stats.costs === 0;

  if (!stats.hasUnpublishedChanges && !isEmpty) {
    return (
      <LinearInsightBanner
        variant="compact"
        title={t('linear.dashboard.aiRecommendation')}
        icon={Brain}
        description={t('linear.dashboard.aiRecommendationDescription')}
      />
    );
  }

  const message = stats.hasUnpublishedChanges
    ? t('dashboard.insight.unpublished')
    : t('dashboard.gettingStarted.description');

  const actionHref = stats.hasUnpublishedChanges
    ? publishPath
    : stats.products === 0
      ? productsPath
      : clientsPath;

  const actionLabel = stats.hasUnpublishedChanges
    ? t('pages.publish')
    : stats.products === 0
      ? t('dashboard.gettingStarted.addProduct')
      : t('dashboard.gettingStarted.addClient');

  return (
    <LinearInsightBanner
      variant="compact"
      title={
        stats.hasUnpublishedChanges
          ? t('linear.dashboard.aiRecommendation')
          : t('dashboard.gettingStarted.title')
      }
      icon={Brain}
      description={message}
      actions={
        <Button size="sm" variant="outline" asChild>
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      }
    />
  );
}
