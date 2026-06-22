import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Link2, Rocket, Shield, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { ShellPageActions } from '@/shared/components/layout/ShellPageActions';
import { LinearPageHeader, LinearStatusBadge, LinearTimeline } from '@/shared/components/linear';
import {
  usePublish,
  usePublishLatest,
  usePublishStatus,
} from '@/modules/business/features/publish/use-publish';
import { useWebsiteIntegrationContext } from '@/modules/business/hooks/use-website-integration';
import { useWorkspaceBreadcrumbs } from '@/modules/business/hooks/use-workspace-breadcrumbs';
import { usePermissions } from '@/core/permissions/use-permissions';
import { typographyClasses } from '@/design-system/tokens/typography';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { ApiError } from '@/modules/business/types/api';
import { safeT } from '@/core/i18n';

const COMPANY_SITE_URL =
  import.meta.env.VITE_COMPANY_SITE_URL?.replace(/\/$/, '') ?? 'https://aryansh.tech';

function humanizeEntityKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PublishPage() {
  const { t } = useTranslation();
  const breadcrumbs = useWorkspaceBreadcrumbs(t('pages.publish'));
  const { tenantSlug, connectPath } = useWebsiteIntegrationContext();
  const { canPublish } = usePermissions();
  const { data: status, isLoading, isError } = usePublishStatus();
  const { data: latest } = usePublishLatest();
  const publish = usePublish();

  async function handlePublish() {
    try {
      const result = await publish.mutateAsync();
      toast.success(t('publish.success', { version: result.version }));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  if (isLoading) {
    return (
      <CrmPageShell>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  if (isError) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('publish.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const draftCounts = status?.draftCounts ?? {};
  const draftTotal = Object.values(draftCounts).reduce((a, b) => a + b, 0);
  const businessName = (latest?.business as { name?: string } | undefined)?.name ?? tenantSlug ?? COMPANY_SITE_URL;
  const breadcrumbItems = breadcrumbs ?? [];

  const snapshots = [
    {
      id: 'live',
      title: t('linear.publish.snapshotLive', { number: status?.lastVersion ?? 0 }),
      subtitle: status?.lastPublishedAt
        ? new Date(status.lastPublishedAt).toLocaleString()
        : t('publish.status.never'),
      active: true,
    },
    {
      id: 'prev',
      title: t('linear.publish.snapshotPrevious', { number: Math.max(0, (status?.lastVersion ?? 1) - 1) }),
      subtitle: t('linear.publish.snapshotOlder'),
    },
  ];

  return (
    <CrmPageShell className="mx-auto max-w-6xl">
      <LinearPageHeader
        title={t('linear.publish.title')}
        description={t('publish.subtitle')}
        actions={
          canPublish ? (
            <ShellPageActions>
              <Button
                onClick={() => void handlePublish()}
                disabled={publish.isPending || !status?.hasUnpublishedChanges}
              >
                <Rocket data-icon="inline-start" />
                {publish.isPending ? t('common.loading') : t('linear.publish.publishToWebsite')}
              </Button>
            </ShellPageActions>
          ) : undefined
        }
      />

      {breadcrumbItems.length > 0 ? (
        <p className={typographyClasses.caption}>
          {breadcrumbItems.map((b) => b.label).join(' / ')}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className={cn(layout.linear.hairlineCard, 'lg:col-span-5')}>
          <CardHeader dense>
            <Badge variant="outline" className="w-fit uppercase tracking-wider">
              {t('linear.publish.liveProduction')}
            </Badge>
            <div className="flex items-start justify-between">
              <CardTitle>{t('linear.publish.currentVersion')}</CardTitle>
              <div className="text-right">
                <p className="font-mono text-sm text-primary">v{status?.lastVersion ?? 0}</p>
                {status?.lastPublishedAt ? (
                  <p className={typographyClasses.caption}>
                    {new Date(status.lastPublishedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent dense>
            <div className="flex items-center gap-4 border-t border-border pt-6">
              <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted" />
              <div className="min-w-0">
                <p className="truncate font-medium">{businessName}</p>
                <p className={typographyClasses.caption}>{t('linear.publish.visitorsToday')}</p>
              </div>
            </div>
            {tenantSlug ? (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to={connectPath}>
                  <Link2 data-icon="inline-start" />
                  {t('publish.connectLink.action')}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className={cn(layout.linear.hairlineCard, 'lg:col-span-7')}>
          <CardHeader dense className="flex-row items-center justify-between border-b border-border bg-muted/30">
            <CardTitle className="text-sm">{t('linear.publish.stagedChanges')}</CardTitle>
            <span className={typographyClasses.eyebrowUpper}>
              {t('linear.publish.updatesPending', { count: draftTotal })}
            </span>
          </CardHeader>
          <CardContent dense className="p-0">
            {Object.entries(draftCounts).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t('publish.status.upToDate')}</p>
            ) : (
              Object.entries(draftCounts).map(([key, count]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border p-4 last:border-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-success" />
                    <div>
                      <p className={typographyClasses.bodySm}>
                        {safeT(`linear.publish.entities.${key}`, humanizeEntityKey(key))}
                      </p>
                      <p className={typographyClasses.caption}>{t('linear.publish.modifiedBy')}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={cn(layout.linear.hairlineCard, 'lg:col-span-8')}>
          <CardHeader dense>
            <div className="flex items-center gap-2">
              <Terminal className="text-muted-foreground" />
              <CardTitle className={typographyClasses.eyebrowUpper}>
                {t('linear.publish.manifestPreview')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent dense>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div>
                  <Label className={typographyClasses.eyebrowUpper}>{t('linear.publish.pageTitle')}</Label>
                  <Input
                    readOnly
                    className="mt-2 font-mono text-xs"
                    value={businessName}
                  />
                </div>
                <div>
                  <Label className={typographyClasses.eyebrowUpper}>{t('linear.publish.ogDescription')}</Label>
                  <p className="mt-2 text-sm text-muted-foreground">{t('linear.publish.ogDescriptionDefault')}</p>
                </div>
              </div>
              <div>
                <Label className={typographyClasses.eyebrowUpper}>{t('linear.publish.ogImage')}</Label>
                <div className="mt-2 aspect-video overflow-hidden rounded-md border border-border bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(layout.linear.hairlineCard, 'lg:col-span-4')}>
          <CardHeader dense className="flex-row items-center justify-between border-b border-border">
            <CardTitle className={typographyClasses.eyebrowUpper}>{t('linear.publish.snapshotHistory')}</CardTitle>
          </CardHeader>
          <CardContent dense>
            <LinearTimeline items={snapshots} />
            <Button variant="ghost" size="sm" className="mt-6 w-full">
              {t('linear.publish.viewAuditLogs')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center gap-6">
          <LinearStatusBadge label={t('linear.publish.apiConnected')} variant="active" />
          <LinearStatusBadge label={t('linear.publish.cdnOptimized')} variant="active" />
        </div>
        <div className="flex items-center gap-4">
          <span className={cn('font-mono', typographyClasses.caption)}>{t('linear.publish.cluster')}</span>
          <Badge variant="outline" className="gap-1.5">
            <Shield className="text-primary" />
            {t('linear.publish.secure')}
          </Badge>
        </div>
      </footer>
    </CrmPageShell>
  );
}
