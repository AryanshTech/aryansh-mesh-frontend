import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Palette, Eye, FlaskConical, PlayCircle, Image as ImageIcon, Building2, Brain, CalendarDays } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { Card } from '@/design-system/components/ui/card';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useMarketingWorkspace,
  useEnsureMarketingWorkspace,
  resolveMarketingProjectId,
} from '@/modules/marketing/api/use-marketing-workspace';
import { BrandIdentityTab } from '@/modules/marketing/components/BrandIdentityTab';
import { BrandPerceptionTab } from '@/modules/marketing/components/BrandPerceptionTab';
import { CreativeRecipesTab } from '@/modules/marketing/components/CreativeRecipesTab';
import { CreativeRunsTab } from '@/modules/marketing/components/CreativeRunsTab';
import { CreativeAssetsTab } from '@/modules/marketing/components/CreativeAssetsTab';

export default function MarketingWorkspacePage() {
  const { t } = useTranslation();
  const { tenantId, hasTenant } = useTenantPath();
  const { data, isLoading, isError, error, refetch } = useMarketingWorkspace(
    hasTenant ? tenantId : undefined,
  );
  const ensureMutation = useEnsureMarketingWorkspace();

  useEffect(() => {
    if (!hasTenant || !tenantId || data || isLoading || ensureMutation.isPending) return;
    const status = (error as { status?: number } | null)?.status;
    if (isError && status && status !== 401 && status !== 403) {
      ensureMutation.mutate(tenantId);
    }
  }, [hasTenant, tenantId, data, isLoading, isError, error, ensureMutation]);

  const workspace = data ?? ensureMutation.data;

  if (!hasTenant) {
    return (
      <PageShell>
        <PageHeader
          title={t('marketing.workspace.title')}
          description={t('marketing.workspace.subtitle')}
        />
        <EmptyState
          icon={<Building2 />}
          title={t('marketing.workspace.noTenantTitle')}
          description={t('marketing.workspace.noTenantDescription')}
        />
      </PageShell>
    );
  }

  if (isLoading || ensureMutation.isPending) {
    return (
      <PageShell>
        <PageHeader
          title={t('marketing.workspace.title')}
          description={t('marketing.workspace.subtitle')}
        />
        <Skeleton className="h-96 w-full rounded-xl" />
      </PageShell>
    );
  }

  if (isError && !workspace) {
    return (
      <PageShell>
        <PageHeader
          title={t('marketing.workspace.title')}
          description={t('marketing.workspace.subtitle')}
        />
        <ErrorState title={t('marketing.workspace.errorTitle')} onRetry={() => void refetch()} />
      </PageShell>
    );
  }

  if (!workspace?.project) {
    return (
      <PageShell>
        <PageHeader
          title={t('marketing.workspace.title')}
          description={t('marketing.workspace.subtitle')}
        />
        <Skeleton className="h-96 w-full rounded-xl" />
      </PageShell>
    );
  }

  const projectId = resolveMarketingProjectId(workspace.project);

  return (
    <PageShell>
      <PageHeader
        title={workspace.project.name ?? t('marketing.workspace.title')}
        description={t('marketing.workspace.subtitle')}
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        <Link
          to={`/marketing/projects/${projectId}/brand-memory`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-hairline-strong hover:shadow-card"
        >
          <Brain className="size-5 text-muted-foreground" />
          <span className="typo-card-title text-foreground">{t('marketing.brandMemoryTitle')}</span>
        </Link>
        <Link
          to={`/marketing/projects/${projectId}/social`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-hairline-strong hover:shadow-card"
        >
          <CalendarDays className="size-5 text-muted-foreground" />
          <span className="typo-card-title text-foreground">{t('marketing.socialCalendarTitle')}</span>
        </Link>
      </div>

      <Tabs defaultValue="brand-identity" className="mt-6 flex flex-col gap-4">
        <TabsList className="self-start h-auto flex-wrap">
          <TabsTrigger value="brand-identity" className="gap-1.5">
            <Palette className="size-3.5" />{t('marketing.brandIdentity.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="brand-perception" className="gap-1.5">
            <Eye className="size-3.5" />{t('marketing.brandPerception.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="recipes" className="gap-1.5">
            <FlaskConical className="size-3.5" />{t('marketing.recipes.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="runs" className="gap-1.5">
            <PlayCircle className="size-3.5" />{t('marketing.runs.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-1.5">
            <ImageIcon className="size-3.5" />{t('marketing.assets.tabTitle')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand-identity">
          <BrandIdentityTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="brand-perception">
          <BrandPerceptionTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="recipes">
          <CreativeRecipesTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="runs">
          <CreativeRunsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="assets">
          <CreativeAssetsTab projectId={projectId} />
        </TabsContent>
      </Tabs>

      <Card className="mt-2 p-4">
        <p className="typo-body-sm text-muted-foreground">{t('marketing.workspace.linkedTenant')}</p>
        <p className="typo-body text-foreground">{workspace.company.name}</p>
      </Card>
    </PageShell>
  );
}
