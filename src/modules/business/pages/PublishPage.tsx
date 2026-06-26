import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Rocket, CheckCircle2, Clock, AlertCircle, Link2 } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { usePublishStatus, usePublish } from '@/modules/business/api/hooks/use-publish';
import { WebsiteIntegrationPanel } from '@/modules/business/components/website/WebsiteIntegrationPanel';
import { useWebsiteIntegration } from '@/modules/business/hooks/use-website-integration';

function publishTone(status: 'PUBLISHED' | 'DRAFT' | 'PUBLISHING') {
  if (status === 'PUBLISHED') return 'success' as const;
  if (status === 'PUBLISHING') return 'info' as const;
  return 'default' as const;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function PublishPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const integration = useWebsiteIntegration();
  const { data, isLoading, isError, refetch, isFetching } = usePublishStatus();
  const publishMutation = usePublish();
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  const onPublish = async () => {
    try {
      await publishMutation.mutateAsync();
      toast.success(t('publish.publishStarted'));
    } catch (e) {
      toast.error((e as Error).message || t('publish.publishFailed'));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('publish.title')}
        description={t('publish.subtitle')}
      />
      {isError ? (
        <ErrorState title={t('publish.errorTitle')} onRetry={() => void refetch()} />
      ) : showSkeleton ? (
        <div className="flex flex-col gap-4 max-w-md">
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : data ? (
        <div className="flex max-w-5xl flex-col gap-6">
          <Card className="flex max-w-md flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <p className="typo-card-title text-foreground">{t('publish.publishStatus')}</p>
              <StatusBadge label={data.status} tone={publishTone(data.status)} />
            </div>

            {data.status === 'PUBLISHING' ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 animate-spin" />
                {t('publish.publishingMessage')}
              </div>
            ) : data.status === 'PUBLISHED' ? (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" />
                {t('publish.publishedMessage')}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="size-4" />
                {t('publish.unpublishedMessage')}
              </div>
            )}

            {data.lastPublishedAt ? (
              <p className="text-xs text-muted-foreground">
                {t('publish.lastPublished')}: {formatDate(data.lastPublishedAt)}
              </p>
            ) : null}

            {data.pendingChanges > 0 ? (
              <p className="text-xs text-muted-foreground">
                {t('publish.pendingChanges', { count: data.pendingChanges })}
              </p>
            ) : null}

            <Button
              onClick={() => void onPublish()}
              disabled={data.status === 'PUBLISHING' || publishMutation.isPending}
              className="self-start"
            >
              <Rocket className="size-4" />
              {data.status === 'PUBLISHING' ? t('publish.publishing') : t('publish.publishNow')}
            </Button>

            {integration.hasSlug ? (
              <Button variant="outline" size="sm" className="self-start" asChild>
                <Link to={integration.connectPath}>
                  <Link2 className="size-4" />
                  {t('publish.connectLink.action')}
                </Link>
              </Button>
            ) : null}
          </Card>

          {integration.hasSlug ? (
            <WebsiteIntegrationPanel
              tenantName={integration.tenantName}
              tenantSlug={integration.tenantSlug}
              apiBase={integration.apiBase}
              embedOrigin={integration.embedOrigin}
              profilePath={integration.profilePath}
              allowedOrigins={integration.allowedOrigins}
            />
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
