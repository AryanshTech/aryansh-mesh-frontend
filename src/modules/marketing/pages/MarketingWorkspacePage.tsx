import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  type MarketingWorkspace,
} from '@/modules/marketing/api/use-marketing-workspace';
import { SocialHubTab } from '@/modules/marketing/components/SocialHubTab';
import { SocialCalendarTab } from '@/modules/marketing/components/SocialCalendarTab';
import { BrandHubTab, type BrandSection } from '@/modules/marketing/components/BrandHubTab';
import { CreativeAssetsTab } from '@/modules/marketing/components/CreativeAssetsTab';
import type { ProfilePlatform } from '@/modules/marketing/lib/platform-profile';
import {
  Building2,
  Palette,
  CalendarDays,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';

type WorkspaceTab = 'brand' | 'social' | 'calendar' | 'assets';

const TAB_VALUES: WorkspaceTab[] = ['brand', 'social', 'calendar', 'assets'];
const PLATFORMS: ProfilePlatform[] = ['LINKEDIN', 'INSTAGRAM', 'X'];

function isWorkspaceTab(value: string | null): value is WorkspaceTab {
  return !!value && (TAB_VALUES as string[]).includes(value);
}

function resolveTab(raw: string | null): WorkspaceTab {
  if (isWorkspaceTab(raw)) return raw;
  if (
    raw === 'posts' ||
    raw === 'desk' ||
    raw === 'create' ||
    raw === 'execute'
  ) {
    return 'social';
  }
  if (raw === 'foundation' || raw === 'voice' || raw === 'spy' || raw === 'perception') {
    return 'brand';
  }
  if (raw === 'library') return 'assets';
  return 'brand';
}

function resolveBrandSection(raw: string | null): BrandSection | undefined {
  if (raw === 'look' || raw === 'voice' || raw === 'spy') return raw;
  if (raw === 'linkedin') return 'voice';
  if (raw === 'perception') return 'spy';
  if (raw === 'kit' || raw === 'identity') return 'look';
  return undefined;
}

function resolvePlatform(raw: string | null): ProfilePlatform {
  if (raw && (PLATFORMS as string[]).includes(raw)) return raw as ProfilePlatform;
  return 'LINKEDIN';
}

interface MarketingWorkspaceLoadedProps {
  workspace: MarketingWorkspace;
  tenantId: string;
}

function MarketingWorkspaceLoaded({ workspace, tenantId }: MarketingWorkspaceLoadedProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = resolveMarketingProjectId(workspace.project);

  const activeTab = resolveTab(searchParams.get('tab'));
  const selectedRunId = searchParams.get('runId') ?? undefined;
  const autoGenerate = searchParams.get('generate') === '1';
  const brandSection = resolveBrandSection(searchParams.get('section'));
  const platform = resolvePlatform(searchParams.get('platform'));

  const setActiveTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    const resolved = resolveTab(tab);
    next.set('tab', resolved);
    if (resolved !== 'social') {
      next.delete('runId');
      next.delete('generate');
      if (resolved !== 'calendar') next.delete('platform');
    } else if (!next.get('platform')) {
      next.set('platform', 'LINKEDIN');
    }
    if (resolved !== 'calendar') next.delete('compose');
    if (resolved !== 'brand') next.delete('section');
    setSearchParams(next, { replace: true });
  };

  const openSocialRun = (runId: string, generate = false, plat?: ProfilePlatform) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'social');
    next.set('platform', plat ?? platform);
    next.set('runId', runId);
    if (generate) next.set('generate', '1');
    else next.delete('generate');
    setSearchParams(next, { replace: true });
  };

  const clearAutoGenerate = () => {
    if (!searchParams.has('generate')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('generate');
    setSearchParams(next, { replace: true });
  };

  const tabTriggers = useMemo(
    () => [
      { value: 'brand' as const, icon: Palette, label: t('marketing.workspace.tabs.brand') },
      { value: 'social' as const, icon: Share2, label: t('marketing.workspace.tabs.social') },
      {
        value: 'calendar' as const,
        icon: CalendarDays,
        label: t('marketing.workspace.tabs.calendar'),
      },
      { value: 'assets' as const, icon: ImageIcon, label: t('marketing.workspace.tabs.assets') },
    ],
    [t],
  );

  return (
    <PageShell>
      <PageHeader
        title={workspace.project.name ?? t('marketing.workspace.title')}
        description={t('marketing.workspace.subtitle')}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2 flex flex-col gap-5">
        <TabsList className="self-start h-auto flex-wrap">
          {tabTriggers.map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} id={`tab-${value}`} className="gap-1.5">
              <Icon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="brand" className="mt-0">
          <BrandHubTab
            projectId={projectId}
            tenantId={tenantId}
            initialSection={brandSection}
          />
        </TabsContent>
        <TabsContent value="social" className="mt-0">
          <SocialHubTab
            projectId={projectId}
            tenantId={tenantId}
            platform={platform}
            initialRunId={selectedRunId}
            autoGenerate={autoGenerate}
            onRunSelected={(runId) => openSocialRun(runId, false)}
            onStartRecipeRun={(runId) => openSocialRun(runId, true)}
            onClearAutoGenerate={clearAutoGenerate}
            onOpenBrand={() => {
              const next = new URLSearchParams(searchParams);
              next.set('tab', 'brand');
              next.set('section', 'look');
              setSearchParams(next, { replace: true });
            }}
            onOpenCalendar={(plat) => {
              const next = new URLSearchParams(searchParams);
              next.set('tab', 'calendar');
              if (plat) next.set('platform', plat);
              else next.delete('platform');
              setSearchParams(next, { replace: true });
            }}
          />
        </TabsContent>
        <TabsContent value="calendar" className="mt-0">
          <SocialCalendarTab projectId={projectId} tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="assets" className="mt-0">
          <CreativeAssetsTab
            projectId={projectId}
            tenantId={tenantId}
            initialRunId={selectedRunId}
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

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

  if (isError) {
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

  const workspace = data ?? ensureMutation.data;

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

  return <MarketingWorkspaceLoaded key={tenantId} workspace={workspace} tenantId={tenantId} />;
}
