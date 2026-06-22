import { Link } from 'react-router-dom';
import { Globe, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { LinearStatusBadge } from '@/shared/components/linear';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import type { DashboardStats } from '@/modules/business/types/tenant-api';

const COMPANY_SITE_URL =
  import.meta.env.VITE_COMPANY_SITE_URL?.replace(/\/$/, '') ?? 'https://aryansh.tech';

type DashboardPublishWidgetProps = {
  stats: DashboardStats;
  publishPath: string;
};

export function DashboardPublishWidget({ stats, publishPath }: DashboardPublishWidgetProps) {
  const { t } = useTranslation();

  return (
    <Card className={cn(layout.linear.hairlineCard, 'flex h-full flex-col')}>
      <CardHeader dense className="flex-row items-center justify-between">
        <CardTitle className="text-sm">{t('linear.publish.statusTitle')}</CardTitle>
        <Globe className="text-primary" />
      </CardHeader>
      <CardContent dense className="flex flex-1 flex-col gap-4">
        <div className="group relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="sm" variant="default" asChild>
              <Link to={publishPath}>{t('linear.publish.previewLive')}</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('linear.publish.domain')}</span>
            <span className="truncate font-mono text-xs">{COMPANY_SITE_URL.replace('https://', '')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('linear.publish.health')}</span>
            <LinearStatusBadge label="100%" variant="active" />
          </div>
        </div>
        <Button className="mt-auto w-full" asChild>
          <Link to={publishPath}>
            <Rocket data-icon="inline-start" />
            {t('linear.publish.deploySnapshot')}
          </Link>
        </Button>
        {stats.lastPublishedAt ? (
          <p className={typographyClasses.caption}>
            {t('publish.status.lastPublished')}: {new Date(stats.lastPublishedAt).toLocaleString()}
          </p>
        ) : (
          <p className={typographyClasses.caption}>{t('dashboard.publish.neverPublished')}</p>
        )}
      </CardContent>
    </Card>
  );
}
