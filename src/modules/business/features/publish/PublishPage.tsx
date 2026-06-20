import { useTranslation } from 'react-i18next';
import { ExternalLink, Globe, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { appColors } from '@/design-system/tokens/colors';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import {
  usePublish,
  usePublishLatest,
  usePublishStatus,
} from '@/modules/business/features/publish/use-publish';
import { ConnectorGuideCard } from '@/modules/business/features/publish/ConnectorGuideCard';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import { useAuth } from '@/core/auth/use-auth';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const EMBED_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');
const COMPANY_SITE_URL =
  import.meta.env.VITE_COMPANY_SITE_URL?.replace(/\/$/, '') ?? 'https://aryansh.tech';

export function PublishPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { isWorkspace, tenantId } = useTenantScope();
  const { data: workspaceTenant } = useTenant(isWorkspace ? tenantId : '');
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
  const tenantSlug = isWorkspace ? workspaceTenant?.slug : session?.tenantSlug;
  const tenantName =
    (isWorkspace ? workspaceTenant?.name : session?.tenantName) ?? tenantSlug ?? '';
  const embedScript = tenantSlug
    ? `<script src="${EMBED_ORIGIN}/embed.js" data-slug="${tenantSlug}" data-api="${API_BASE}"></script>`
    : '';

  async function copyEmbedScript() {
    if (!embedScript) return;
    await navigator.clipboard.writeText(embedScript);
    toast.success(t('publish.embed.copied'));
  }

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.publish')}
        description={t('publish.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/admin/tenants' },
                { label: t('pages.publish') },
              ]
            : undefined
        }
        action={
          canPublish ? (
            <Button
              onClick={() => void handlePublish()}
              disabled={publish.isPending || !status?.hasUnpublishedChanges}
            >
              {publish.isPending ? t('common.loading') : t('publish.action')}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={appColors.publish.hubCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              {t('publish.hub.publicSiteTitle')}
            </CardTitle>
            <CardDescription>{t('publish.hub.publicSiteDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="type-body-sm text-ink-subtle">{t('publish.hub.publicSiteHint')}</p>
            {tenantSlug ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={appColors.publish.statusBadge}>
                  {t('publish.hub.slugLabel', { slug: tenantSlug })}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`${API_BASE}/public/tenants/${tenantSlug}/snapshot`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" data-icon="inline-start" />
                    {t('publish.hub.viewApiSnapshot')}
                  </a>
                </Button>
              </div>
            ) : (
              <p className="type-body-sm text-ink-subtle">{t('publish.hub.noSlug')}</p>
            )}
          </CardContent>
        </Card>

        <Card className={appColors.publish.hubCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="size-4 text-primary" />
              {t('publish.hub.landingTitle')}
            </CardTitle>
            <CardDescription>{t('publish.hub.landingDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="type-body-sm text-ink-subtle">{t('publish.hub.landingHint')}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={COMPANY_SITE_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" data-icon="inline-start" />
                  {t('publish.hub.openCompanySite')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {tenantSlug ? (
        <ConnectorGuideCard
          tenantName={tenantName}
          tenantSlug={tenantSlug}
          apiBase={API_BASE}
          embedOrigin={EMBED_ORIGIN}
        />
      ) : null}

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

      <Card>
        <CardHeader>
          <CardTitle>{t('publish.embed.title')}</CardTitle>
          <CardDescription>{t('publish.embed.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{t('publish.embed.hint')}</p>
          {embedScript ? (
            <div className="flex gap-2">
              <Input readOnly value={embedScript} className="font-mono text-xs" />
              <Button type="button" variant="outline" size="icon" onClick={() => void copyEmbedScript()}>
                <Copy className="size-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('publish.embed.unavailable')}</p>
          )}
          {tenantSlug && (
            <p className="text-xs text-muted-foreground">
              {t('publish.embed.apiUrl', {
                url: `${API_BASE}/public/tenants/${tenantSlug}/snapshot`,
              })}
            </p>
          )}
        </CardContent>
      </Card>

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

      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">{t('nav.profile')}</TabsTrigger>
          <TabsTrigger value="products">{t('nav.products')}</TabsTrigger>
          <TabsTrigger value="locations">{t('nav.locations')}</TabsTrigger>
          <TabsTrigger value="testimonials">{t('nav.testimonials')}</TabsTrigger>
          <TabsTrigger value="content">{t('nav.content')}</TabsTrigger>
        </TabsList>
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>{t('nav.profile')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(latest?.business ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>{t('nav.products')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(latest?.products ?? [], null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>{t('nav.locations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(latest?.locations ?? [], null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>{t('nav.testimonials')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(latest?.testimonials ?? [], null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{t('nav.content')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(latest?.content ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CrmPageShell>
  );
}
