import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useMarketingWorkspace,
  useEnsureMarketingWorkspace,
  resolveMarketingProjectId,
} from '@/modules/marketing/api/use-marketing-workspace';
import { BrandContentStudio } from '@/modules/marketing/components/BrandContentStudio';
import { BrandIdentityTab } from '@/modules/marketing/components/BrandIdentityTab';
import { BrandPerceptionTab } from '@/modules/marketing/components/BrandPerceptionTab';
import { CreativeRecipesTab } from '@/modules/marketing/components/CreativeRecipesTab';
import { CreativeRunsTab } from '@/modules/marketing/components/CreativeRunsTab';
import { CreativeAssetsTab } from '@/modules/marketing/components/CreativeAssetsTab';
import { Building2, Palette, Eye, FlaskConical, PlayCircle, Image as ImageIcon } from 'lucide-react';

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

      <BrandContentStudio projectId={projectId} tenantId={tenantId} />

      <Tabs defaultValue="brand-identity" className="mt-8 flex flex-col gap-4">
        <TabsList className="self-start h-auto flex-wrap">
          <TabsTrigger value="brand-identity" id="tab-brand-identity" className="gap-1.5">
            <Palette className="size-3.5" />{t('marketing.brandIdentity.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="brand-perception" id="tab-brand-perception" className="gap-1.5">
            <Eye className="size-3.5" />{t('marketing.brandPerception.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="recipes" id="tab-recipes" className="gap-1.5">
            <FlaskConical className="size-3.5" />{t('marketing.recipes.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="runs" id="tab-runs" className="gap-1.5">
            <PlayCircle className="size-3.5" />{t('marketing.runs.tabTitle')}
          </TabsTrigger>
          <TabsTrigger value="assets" id="tab-assets" className="gap-1.5">
            <ImageIcon className="size-3.5" />{t('marketing.assets.tabTitle')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand-identity">
          <BrandIdentityTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="brand-perception">
          <BrandPerceptionTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="recipes">
          <CreativeRecipesTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="runs">
          <CreativeRunsTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="assets">
          <CreativeAssetsTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
