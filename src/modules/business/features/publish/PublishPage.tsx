import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Globe, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { ShellPageActions } from '@/shared/components/layout/ShellPageActions';
import {
  usePublish,
  usePublishLatest,
  usePublishStatus,
} from '@/modules/business/features/publish/use-publish';
import { useWebsiteIntegrationContext } from '@/modules/business/hooks/use-website-integration';
import { useWorkspaceBreadcrumbs } from '@/modules/business/hooks/use-workspace-breadcrumbs';
import { usePermissions } from '@/core/permissions/use-permissions';
import { resolveApiV1BaseUrl } from '@/core/api/config';
import { ApiError } from '@/modules/business/types/api';

const API_V1_BASE = resolveApiV1BaseUrl();
const COMPANY_SITE_URL =
  import.meta.env.VITE_COMPANY_SITE_URL?.replace(/\/$/, '') ?? 'https://aryansh.tech';

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
        <Skeleton className="h-8 w-48" />
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

  return (
    <CrmPageShell>
      <PageHeader
        description={t('publish.subtitle')}
        breadcrumbs={breadcrumbs}
        action={
          canPublish ? (
            <ShellPageActions>
              <Button
                onClick={() => void handlePublish()}
                disabled={publish.isPending || !status?.hasUnpublishedChanges}
              >
                {publish.isPending ? t('common.loading') : t('publish.action')}
              </Button>
            </ShellPageActions>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              {t('publish.hub.publicSiteTitle')}
            </CardTitle>
            <CardDescription>{t('publish.hub.publicSiteDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t('publish.hub.publicSiteHint')}</p>
            {tenantSlug ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {t('publish.hub.slugLabel', { slug: tenantSlug })}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`${API_V1_BASE}/public/tenants/${tenantSlug}/snapshot`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" data-icon="inline-start" />
                    {t('publish.hub.viewApiSnapshot')}
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('publish.hub.noSlug')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4 text-primary" />
              {t('publish.connectLink.title')}
            </CardTitle>
            <CardDescription>{t('publish.connectLink.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t('publish.connectLink.hint')}</p>
            {tenantSlug ? (
              <Button variant="outline" size="sm" asChild>
                <Link to={connectPath}>
                  <Link2 className="size-4" data-icon="inline-start" />
                  {t('publish.connectLink.action')}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('publish.status.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status?.hasUnpublishedChanges ? 'default' : 'secondary'}>
              {status?.hasUnpublishedChanges
                ? t('publish.status.pending')
                : t('publish.status.upToDate')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('publish.status.version')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{status?.lastVersion ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('publish.status.lastPublished')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {status?.lastPublishedAt
                ? new Date(status.lastPublishedAt).toLocaleString()
                : t('publish.status.never')}
            </p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(draftCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('publish.draftCounts')}</CardTitle>
            <CardDescription>{t('publish.draftCountsHint')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(draftCounts).map(([key, count]) => (
              <Badge key={key} variant="outline">
                {key}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('publish.snapshot.title')}</CardTitle>
          <CardDescription>{t('publish.snapshot.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('publish.snapshot.business')}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {(latest?.business as { name?: string } | undefined)?.name ??
                t('publish.snapshot.notPublished')}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('publish.snapshot.products')}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground font-tabular">
              {Array.isArray(latest?.products) ? latest.products.length : 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('publish.snapshot.locations')}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground font-tabular">
              {Array.isArray(latest?.locations) ? latest.locations.length : 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('publish.snapshot.testimonials')}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground font-tabular">
              {Array.isArray(latest?.testimonials) ? latest.testimonials.length : 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('publish.snapshot.contentBlocks')}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {latest?.content && typeof latest.content === 'object'
                ? t('publish.snapshot.configured')
                : t('publish.snapshot.notPublished')}
            </p>
          </div>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
