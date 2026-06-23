import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Eye, FlaskConical, PlayCircle, Image as ImageIcon, Building2 } from 'lucide-react';
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
} from '@/modules/marketing/api/use-marketing-workspace';
import { BrandIdentityTab } from '@/modules/marketing/components/BrandIdentityTab';
import { BrandPerceptionTab } from '@/modules/marketing/components/BrandPerceptionTab';
import { CreativeRecipesTab } from '@/modules/marketing/components/CreativeRecipesTab';
import { CreativeRunsTab } from '@/modules/marketing/components/CreativeRunsTab';
import { CreativeAssetsTab } from '@/modules/marketing/components/CreativeAssetsTab';

export default function MarketingWorkspacePage() {
  const { t } = useTranslation();
  const { tenantId, hasTenant } = useTenantPath();
  const { data, isLoading, isError, error, refetch } = useMarketingWorkspace(hasTenant ? tenantId : undefined);
  const ensureMutation = useEnsureMarketingWorkspace();

  // If GET returns 404/no project, try POST once to create it.
  useEffect(() => {
    if (!hasTenant || !tenantId || data || isLoading) return;
    const status = (error as { status?: number } | null)?.status;
    if (isError && (status === 404 || status === 400)) {
      ensureMutation.mutate(tenantId);
    }
  }, [hasTenant, tenantId, data, isLoading, isError, error, ensureMutation]);

  const project = data?.project;

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

  if (isError && !ensureMutation.data) {
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

  const resolvedProject = project ?? ensureMutation.data?.project;
  if (!resolvedProject) {
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

  const projectId = resolvedProject.projectId;

  return (
    <PageShell>
      <PageHeader
        title={resolvedProject.name ?? t('marketing.workspace.title')}
        description={t('marketing.workspace.subtitle')}
      />
      <Tabs defaultValue="brand-identity" className="flex flex-col gap-4">
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

        <TabsContent value="brand-identity"><BrandIdentityTab projectId={projectId} /></TabsContent>
        <TabsContent value="brand-perception"><BrandPerceptionTab projectId={projectId} /></TabsContent>
        <TabsContent value="recipes"><CreativeRecipesTab projectId={projectId} /></TabsContent>
        <TabsContent value="runs"><CreativeRunsTab projectId={projectId} /></TabsContent>
        <TabsContent value="assets"><CreativeAssetsTab projectId={projectId} /></TabsContent>
      </Tabs>
    </PageShell>
  );
}
